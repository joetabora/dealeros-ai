import { runAutopilotCycle } from "@/lib/autopilot/service";
import { syncAnalyticsMemory } from "@/lib/analytics/memory";
import { insertCampaignAnalytics } from "@/lib/analytics/repository";
import {
  analyzeCampaignPerformance,
  buildEventAnalyticsContext,
  buildLegacyCampaignAnalyticsContext,
  buildMarketingAnalyticsContext,
  type AnalyticsContext,
} from "@/lib/analytics/revenue-engine";
import { getDealershipMemoryProfile } from "@/lib/campaigns/memory/repository";
import type { CampaignGeneratorInput } from "@/types/campaign";
import type { DealershipEvent } from "@/types/event";
import type { DealershipMemoryProfile } from "@/types/memory";
import type {
  FullMarketingCampaignOutput,
  MarketingCampaignInput,
} from "@/types/marketing";
import type { ScheduledMarketingAction } from "@/types/scheduling";
import type { CampaignAnalyticsRecord } from "@/types/analytics";

type ScheduledActionSnapshot = Pick<
  ScheduledMarketingAction,
  "platform" | "contentType" | "content"
>;

async function persistAnalysis({
  userId,
  dealershipId,
  campaignId,
  eventId,
  context,
  memory,
}: {
  userId: string;
  dealershipId?: string;
  campaignId?: string | null;
  eventId?: string | null;
  context: AnalyticsContext;
  memory: DealershipMemoryProfile;
}): Promise<CampaignAnalyticsRecord | null> {
  try {
    const metrics = analyzeCampaignPerformance(context);

    const record = await insertCampaignAnalytics({
      userId,
      dealershipId,
      campaignId,
      eventId,
      dealershipName: context.dealershipName,
      campaignLabel: context.campaignLabel,
      campaignType: context.campaignType,
      estimatedReach: metrics.estimatedReach,
      estimatedEngagement: metrics.estimatedEngagement,
      estimatedTrafficLift: metrics.estimatedTrafficLift,
      estimatedLeads: metrics.estimatedLeads,
      estimatedRevenueImpact: metrics.estimatedRevenueImpact,
      performanceScore: metrics.performanceScore,
    });

    await syncAnalyticsMemory({
      userId,
      dealershipName: context.dealershipName,
      context,
      metrics,
    });

    await runAutopilotCycle({
      userId,
      dealershipName: context.dealershipName,
      softUpdate: true,
    });

    return record;
  } catch {
    return null;
  }
}

export async function recordMarketingCampaignAnalytics({
  userId,
  dealershipId,
  input,
  output,
  campaignId,
  scheduledActions,
  memory,
}: {
  userId: string;
  dealershipId?: string;
  input: MarketingCampaignInput;
  output: FullMarketingCampaignOutput;
  campaignId: string;
  scheduledActions: ScheduledActionSnapshot[];
  memory?: DealershipMemoryProfile;
}) {
  const resolvedMemory =
    memory ??
    (await getDealershipMemoryProfile(userId, input.dealershipName));

  const context = buildMarketingAnalyticsContext({
    input,
    output,
    memory: resolvedMemory,
    scheduledActions,
  });

  return persistAnalysis({
    userId,
    dealershipId,
    campaignId,
    context,
    memory: resolvedMemory,
  });
}

export async function recordEventCampaignAnalytics({
  userId,
  dealershipId,
  event,
  scheduledActions,
  memory,
}: {
  userId: string;
  dealershipId?: string;
  event: DealershipEvent;
  scheduledActions: ScheduledActionSnapshot[];
  memory?: DealershipMemoryProfile;
}) {
  const resolvedMemory =
    memory ??
    (await getDealershipMemoryProfile(userId, event.dealershipName));

  const context = buildEventAnalyticsContext({
    event,
    memory: resolvedMemory,
    scheduledActions,
  });

  return persistAnalysis({
    userId,
    dealershipId,
    eventId: event.id,
    context,
    memory: resolvedMemory,
  });
}

export async function recordLegacyCampaignAnalytics({
  userId,
  dealershipId,
  input,
  campaignId,
  scheduledActions,
  memory,
}: {
  userId: string;
  dealershipId?: string;
  input: CampaignGeneratorInput;
  campaignId: string;
  scheduledActions: ScheduledActionSnapshot[];
  memory?: DealershipMemoryProfile;
}) {
  const resolvedMemory =
    memory ??
    (await getDealershipMemoryProfile(userId, input.dealershipName));

  const context = buildLegacyCampaignAnalyticsContext({
    input,
    memory: resolvedMemory,
    scheduledActions,
  });

  return persistAnalysis({
    userId,
    dealershipId,
    campaignId,
    context,
    memory: resolvedMemory,
  });
}
