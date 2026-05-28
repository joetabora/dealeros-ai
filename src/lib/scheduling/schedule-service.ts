import { getControlMode } from "@/lib/approval-system/repository";
import {
  processScheduledActionsWithApproval,
  queueItemsForManualApproval,
} from "@/lib/approval-system/workflow";
import { shouldScheduleOnGenerate } from "@/lib/approval-system/gates";
import { revalidatePath } from "next/cache";

import {
  recordEventCampaignAnalytics,
  recordLegacyCampaignAnalytics,
  recordMarketingCampaignAnalytics,
} from "@/lib/analytics/service";
import {
  buildCampaignScheduleItems,
  resolveCampaignAnchorDate,
} from "@/lib/scheduling/adapters/campaign";
import {
  buildEventScheduleItems,
  resolveEventAnchorDate,
} from "@/lib/scheduling/adapters/event";
import {
  buildMarketingScheduleItems,
  resolveMarketingAnchorDate,
} from "@/lib/scheduling/adapters/marketing";
import { insertScheduledActions } from "@/lib/scheduling/repository";
import { assignScheduleTimestamps } from "@/lib/scheduling/timing-engine";
import type { CampaignGeneratorInput, CampaignGeneratorOutputs } from "@/types/campaign";
import type { DealershipEvent } from "@/types/event";
import type {
  FullMarketingCampaignOutput,
  MarketingCampaignInput,
} from "@/types/marketing";
import type { ScheduledMarketingAction } from "@/types/scheduling";

function revalidateCalendarRoutes() {
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/calendar/preview");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/autopilot");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/marketing");
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard/campaigns");
}

async function finalizeScheduledBatch({
  userId,
  dealershipId,
  dealershipName,
  resolved,
  controlMode,
  context,
}: {
  userId: string;
  dealershipId?: string;
  dealershipName: string;
  resolved: Array<{
    dealershipName: string;
    campaignId: string | null;
    eventId?: string | null;
    platform: ScheduledMarketingAction["platform"];
    contentType: ScheduledMarketingAction["contentType"];
    content: string;
    scheduledFor: string;
    status: "pending";
  }>;
  controlMode: Awaited<ReturnType<typeof getControlMode>>;
  context?: { campaignLabel?: string; eventName?: string };
}): Promise<ScheduledMarketingAction[]> {
  if (!shouldScheduleOnGenerate(controlMode)) {
    await queueItemsForManualApproval({
      userId,
      items: resolved.map((item) => ({
        dealershipName: item.dealershipName,
        campaignId: item.campaignId,
        eventId: item.eventId ?? null,
        platform: item.platform,
        contentType: item.contentType,
        content: item.content,
        scheduledFor: item.scheduledFor,
      })),
      controlMode,
      context,
    });
    revalidateCalendarRoutes();
    return [];
  }

  const saved = await insertScheduledActions({ userId, dealershipId, actions: resolved });
  await processScheduledActionsWithApproval({
    userId,
    savedActions: saved,
    controlMode,
    context,
  });
  revalidateCalendarRoutes();
  return saved;
}

export async function scheduleFromMarketingCampaign({
  userId,
  dealershipId,
  input,
  outputs,
  campaignId,
}: {
  userId: string;
  dealershipId?: string;
  input: MarketingCampaignInput;
  outputs: FullMarketingCampaignOutput;
  campaignId: string;
}): Promise<ScheduledMarketingAction[]> {
  const controlMode = await getControlMode(userId, input.dealershipName);
  const items = buildMarketingScheduleItems(outputs);
  const resolved = assignScheduleTimestamps(items, {
    anchorDate: resolveMarketingAnchorDate(input),
    dealershipName: input.dealershipName,
    campaignId,
  });

  const saved = await finalizeScheduledBatch({
    userId,
    dealershipId,
    dealershipName: input.dealershipName,
    resolved,
    controlMode,
    context: { campaignLabel: input.eventOrOfferName },
  });

  if (saved.length > 0) {
    await recordMarketingCampaignAnalytics({
      userId,
      dealershipId,
      input,
      output: outputs,
      campaignId,
      scheduledActions: saved,
    });
  }

  return saved;
}

export async function scheduleFromEvent({
  userId,
  dealershipId,
  event,
  campaignId,
}: {
  userId: string;
  dealershipId?: string;
  event: DealershipEvent;
  campaignId?: string | null;
}): Promise<ScheduledMarketingAction[]> {
  if (!event.promotionPack) return [];

  const controlMode = await getControlMode(userId, event.dealershipName);
  const items = buildEventScheduleItems(event.promotionPack);
  const resolved = assignScheduleTimestamps(items, {
    anchorDate: resolveEventAnchorDate(event),
    dealershipName: event.dealershipName,
    campaignId: campaignId ?? null,
    eventId: event.id,
  });

  const saved = await finalizeScheduledBatch({
    userId,
    dealershipId,
    dealershipName: event.dealershipName,
    resolved,
    controlMode,
    context: { eventName: event.eventName },
  });

  if (saved.length > 0) {
    await recordEventCampaignAnalytics({
      userId,
      dealershipId,
      event,
      scheduledActions: saved,
    });
  }

  return saved;
}

export async function scheduleFromCampaignGenerator({
  userId,
  dealershipId,
  dealershipName,
  campaignId,
  outputs,
  input,
}: {
  userId: string;
  dealershipId?: string;
  dealershipName: string;
  campaignId: string;
  outputs: CampaignGeneratorOutputs;
  input: CampaignGeneratorInput;
}): Promise<ScheduledMarketingAction[]> {
  const controlMode = await getControlMode(userId, dealershipName);
  const items = buildCampaignScheduleItems(outputs);
  const resolved = assignScheduleTimestamps(items, {
    anchorDate: resolveCampaignAnchorDate(),
    dealershipName,
    campaignId,
  });

  const saved = await finalizeScheduledBatch({
    userId,
    dealershipId,
    dealershipName,
    resolved,
    controlMode,
    context: { campaignLabel: `${input.campaignType.replace(/_/g, " ")} campaign` },
  });

  if (saved.length > 0) {
    await recordLegacyCampaignAnalytics({
      userId,
      dealershipId,
      input,
      campaignId,
      scheduledActions: saved,
    });
  }

  return saved;
}

export async function buildDemoPreviewSchedule({
  dealershipName,
  outputs,
  input,
}: {
  dealershipName: string;
  outputs: FullMarketingCampaignOutput;
  input: MarketingCampaignInput;
}): Promise<ScheduledMarketingAction[]> {
  const items = buildMarketingScheduleItems(outputs);
  const resolved = assignScheduleTimestamps(items, {
    anchorDate: resolveMarketingAnchorDate(input),
    dealershipName,
    campaignId: "demo-preview",
  });

  const now = new Date().toISOString();

  return resolved.map((action, index) => ({
    id: `demo-${index}`,
    userId: "demo",
    dealershipName: action.dealershipName,
    campaignId: action.campaignId,
    eventId: action.eventId,
    platform: action.platform,
    contentType: action.contentType,
    content: action.content,
    scheduledFor: action.scheduledFor,
    status: "pending" as const,
    executionStatus: "pending" as const,
    executedAt: null,
    providerResponse: null,
    createdAt: now,
  }));
}

export { buildMarketingScheduleItems, assignScheduleTimestamps };
