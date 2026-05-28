export const MARKETING_CAMPAIGN_TYPES = [
  { value: "event", label: "Event" },
  { value: "sale", label: "Sale" },
  { value: "service", label: "Service" },
  { value: "reactivation", label: "Reactivation" },
] as const;

export type MarketingCampaignType =
  (typeof MARKETING_CAMPAIGN_TYPES)[number]["value"];

export type MarketingCampaignInput = {
  dealershipName: string;
  campaignType: MarketingCampaignType;
  eventOrOfferName: string;
  description?: string;
  targetAudience: string;
  campaignDate?: string;
};

export type MarketingUrgencyLevel = "low" | "medium" | "high" | "critical";

export type MarketingStrategy = {
  positioning: string;
  suggestedAngle: string;
  urgencyLevel: MarketingUrgencyLevel;
  audienceTargeting: string;
};

export type MarketingTimelineItem = {
  id: string;
  timing: string;
  label: string;
  platform: string;
  content: string;
};

export type MarketingRevenueLayer = {
  serviceUpsell: string;
  salesCta: string;
  testRideCta?: string;
  inventoryMention: string;
};

export type FullMarketingCampaignOutput = {
  generatedAt: string;
  strategy: MarketingStrategy;
  socialMedia: {
    facebookPosts: [string, string, string];
    instagramCaptions: [string, string, string];
    reelScript: string;
  };
  sms: {
    announcement: string;
    reminder: string;
    finalUrgency: string;
  };
  email: {
    subjectLines: [string, string, string];
    body: string;
    ctaSection: string;
  };
  timeline: MarketingTimelineItem[];
  revenueLayer: MarketingRevenueLayer;
};

export type MarketingCampaign = {
  id: string;
  userId: string;
  dealershipName: string;
  campaignType: MarketingCampaignType;
  eventOrOfferName: string;
  inputsJson: MarketingCampaignInput;
  outputsJson: FullMarketingCampaignOutput;
  createdAt: string;
};

export type MarketingFormState = {
  error?: string;
  campaign?: MarketingCampaign;
};

export const MARKETING_SECTIONS = [
  { id: "strategy", label: "Event / Offer Strategy" },
  { id: "social", label: "Social Media" },
  { id: "sms", label: "SMS Campaign" },
  { id: "email", label: "Email Campaign" },
  { id: "timeline", label: "Timeline Engine" },
  { id: "revenue", label: "Revenue Injection Layer" },
] as const;
