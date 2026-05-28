import { upsertDealershipMemory } from "@/lib/campaigns/memory/repository";
import type { CampaignPerformanceMetrics } from "@/types/analytics";
import type { AnalyticsContext } from "@/lib/analytics/revenue-engine";

export async function syncAnalyticsMemory({
  userId,
  dealershipName,
  context,
  metrics,
}: {
  userId: string;
  dealershipName: string;
  context: AnalyticsContext;
  metrics: CampaignPerformanceMetrics;
}) {
  const topInsight = metrics.insights[0] ?? null;

  await upsertDealershipMemory({
    userId,
    dealershipName,
    memoryType: "performance_insights",
    memoryValue: {
      lastCampaignType: context.campaignType,
      lastCampaignLabel: context.campaignLabel,
      lastPerformanceScore: metrics.performanceScore,
      lastEstimatedRevenue: metrics.estimatedRevenueImpact,
      lastTrafficLift: metrics.estimatedTrafficLift,
      preferredToneInsight:
        context.memory.preferredTone === context.tone
          ? `${context.tone} tone continues to perform well`
          : `${context.tone} tone tested on ${context.campaignLabel}`,
      channelInsight:
        context.platformCounts.sms >= 2
          ? "SMS boosts traffic lift significantly"
          : "Social-first mix driving reach",
      campaignTypeInsight:
        context.campaignType === "service" ||
        context.campaignType === "service_promo" ||
        context.campaignType === "service_clinic"
          ? "Service campaigns generate higher lead conversion"
          : context.campaignType === "event" || context.campaignType === "bike_night"
            ? "Event campaigns perform best with energetic tone"
            : "Sales campaigns convert with urgency-driven CTAs",
      summaryInsight: topInsight,
      insights: metrics.insights,
      source: "revenue_intelligence",
      updatedAt: new Date().toISOString(),
    },
  });
}
