import type { MarketingCampaignType, MarketingUrgencyLevel } from "@/types/marketing";
import type { ScheduledPlatform } from "@/types/scheduling";

export type CampaignTypePerformance = {
  campaignType: string;
  averageScore: number;
  averageEngagement: number;
  averageRevenue: number;
  count: number;
};

export type PlatformMixStats = {
  facebook: number;
  instagram: number;
  sms: number;
  email: number;
};

export type EngagementTrend = "rising" | "stable" | "declining" | "unknown";

export type PerformanceAnalysis = {
  dealershipName: string;
  totalCampaigns: number;
  totalScheduledActions: number;
  topPerformingTypes: CampaignTypePerformance[];
  bestPerformingTone: string;
  highestRoiPatterns: string[];
  engagementTrend: EngagementTrend;
  engagementTrendDetail: string;
  platformMix: PlatformMixStats;
  averageScore: number;
  averageTrafficLift: number;
  whatsWorking: string[];
  whatsDeclining: string[];
  shouldChange: string[];
  totalCapturedLeads: number;
  topLeadSource: string | null;
  leadConversionRate: number;
  crmActivePipeline: number;
  crmConversionRate: number;
  crmDropOffStage: string | null;
};

export type CampaignRecommendation = {
  campaignType: MarketingCampaignType;
  recommendedTone: string;
  platformMix: PlatformMixStats;
  urgencyLevel: MarketingUrgencyLevel;
  eventOrOfferName: string;
  targetAudience: string;
  description: string;
  reasoning: string;
};

export type WeeklyPlanPlatformBreakdown = PlatformMixStats;

export type WeeklyPlanDay = {
  id: string;
  dayLabel: string;
  dayIndex: number;
  campaignType: MarketingCampaignType | "rest";
  contentTheme: string;
  platforms: ScheduledPlatform[];
  urgencyLevel: MarketingUrgencyLevel;
  expectedOutcome: string;
};

export type WeeklyMarketingPlan = {
  dealershipName: string;
  weekStart: string;
  days: WeeklyPlanDay[];
  platformBreakdown: WeeklyPlanPlatformBreakdown;
  generatedAt: string;
};

export type AutopilotDashboard = {
  analysis: PerformanceAnalysis;
  recommendation: CampaignRecommendation;
  weeklyPlan: WeeklyMarketingPlan;
  lastUpdated: string;
};
