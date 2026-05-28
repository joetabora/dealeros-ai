export type CampaignAnalyticsRecord = {
  id: string;
  userId: string;
  campaignId: string | null;
  eventId: string | null;
  dealershipName: string;
  campaignLabel: string;
  campaignType: string;
  estimatedReach: number;
  estimatedEngagement: number;
  estimatedTrafficLift: number;
  estimatedLeads: number;
  estimatedRevenueImpact: number;
  performanceScore: number;
  createdAt: string;
};

export type CampaignPerformanceMetrics = {
  estimatedReach: number;
  estimatedEngagement: number;
  estimatedTrafficLift: number;
  estimatedLeads: number;
  estimatedRevenueImpact: number;
  performanceScore: number;
  engagementScore: number;
  trafficScore: number;
  leadsScore: number;
  memoryAlignmentScore: number;
  insights: string[];
};

export type DealershipPerformanceInsight = {
  text: string;
  category: "tone" | "channel" | "campaign_type" | "timing";
};

export type AnalyticsSummary = {
  totalCampaigns: number;
  averageScore: number;
  totalEstimatedRevenue: number;
  averageTrafficLift: number;
  topCampaigns: CampaignAnalyticsRecord[];
  insights: DealershipPerformanceInsight[];
};
