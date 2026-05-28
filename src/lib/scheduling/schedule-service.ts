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
}

export async function scheduleFromMarketingCampaign({
  userId,
  input,
  outputs,
  campaignId,
}: {
  userId: string;
  input: MarketingCampaignInput;
  outputs: FullMarketingCampaignOutput;
  campaignId: string;
}): Promise<ScheduledMarketingAction[]> {
  const items = buildMarketingScheduleItems(outputs);
  const resolved = assignScheduleTimestamps(items, {
    anchorDate: resolveMarketingAnchorDate(input),
    dealershipName: input.dealershipName,
    campaignId,
  });

  const saved = await insertScheduledActions({ userId, actions: resolved });
  revalidateCalendarRoutes();

  await recordMarketingCampaignAnalytics({
    userId,
    input,
    output: outputs,
    campaignId,
    scheduledActions: saved,
  });

  return saved;
}

export async function scheduleFromEvent({
  userId,
  event,
  campaignId,
}: {
  userId: string;
  event: DealershipEvent;
  campaignId?: string | null;
}): Promise<ScheduledMarketingAction[]> {
  if (!event.promotionPack) return [];

  const items = buildEventScheduleItems(event.promotionPack);
  const resolved = assignScheduleTimestamps(items, {
    anchorDate: resolveEventAnchorDate(event),
    dealershipName: event.dealershipName,
    campaignId: campaignId ?? null,
    eventId: event.id,
  });

  const saved = await insertScheduledActions({ userId, actions: resolved });
  revalidateCalendarRoutes();

  await recordEventCampaignAnalytics({
    userId,
    event,
    scheduledActions: saved,
  });

  return saved;
}

export async function scheduleFromCampaignGenerator({
  userId,
  dealershipName,
  campaignId,
  outputs,
  input,
}: {
  userId: string;
  dealershipName: string;
  campaignId: string;
  outputs: CampaignGeneratorOutputs;
  input: CampaignGeneratorInput;
}): Promise<ScheduledMarketingAction[]> {
  const items = buildCampaignScheduleItems(outputs);
  const resolved = assignScheduleTimestamps(items, {
    anchorDate: resolveCampaignAnchorDate(),
    dealershipName,
    campaignId,
  });

  const saved = await insertScheduledActions({ userId, actions: resolved });
  revalidateCalendarRoutes();

  await recordLegacyCampaignAnalytics({
    userId,
    input,
    campaignId,
    scheduledActions: saved,
  });

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
