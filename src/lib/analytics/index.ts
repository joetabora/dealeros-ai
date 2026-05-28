export {
  analyzeCampaignPerformance,
  buildEventAnalyticsContext,
  buildLegacyCampaignAnalyticsContext,
  buildMarketingAnalyticsContext,
} from "@/lib/analytics/revenue-engine";
export type { AnalyticsContext } from "@/lib/analytics/revenue-engine";
export {
  buildAnalyticsSummary,
  buildDealershipInsights,
  insertCampaignAnalytics,
  listCampaignAnalytics,
  listTopPerformingCampaigns,
} from "@/lib/analytics/repository";
export {
  recordEventCampaignAnalytics,
  recordLegacyCampaignAnalytics,
  recordMarketingCampaignAnalytics,
} from "@/lib/analytics/service";
