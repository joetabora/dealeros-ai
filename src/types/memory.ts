export type DealershipMemoryType =
  | "preferred_tone"
  | "successful_campaign_style"
  | "audience_insight"
  | "event_patterns"
  | "generation_weights";

export type PreferredToneMemory = {
  tone: string;
  count: number;
  confidence: number;
};

export type SuccessfulCampaignStyleMemory = {
  campaignType: string;
  count: number;
  confidence: number;
};

export type AudienceInsightMemory = {
  topAudiences: string[];
  lastAudience: string;
};

export type EventPatternMemory = {
  eventCampaignCount: number;
  totalCampaignCount: number;
  hypeBoost: number;
};

export type GenerationWeightsMemory = {
  urgencyBoost: number;
  hypeBoost: number;
  professionalismBoost: number;
  ctaStyle: "direct" | "community" | "premium";
  preferredStructure: "hype" | "story" | "balanced";
};

export type DealershipMemoryRecord = {
  id: string;
  userId: string;
  dealershipName: string;
  memoryType: DealershipMemoryType;
  memoryValue: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type DealershipMemoryProfile = {
  dealershipName: string;
  preferredTone?: string;
  preferredCampaignType?: string;
  audienceInsights: string[];
  urgencyBoost: number;
  hypeBoost: number;
  professionalismBoost: number;
  ctaStyle: "direct" | "community" | "premium";
  preferredStructure: "hype" | "story" | "balanced";
  eventPatternStrength: number;
};

export const EMPTY_MEMORY_PROFILE: DealershipMemoryProfile = {
  dealershipName: "",
  audienceInsights: [],
  urgencyBoost: 0,
  hypeBoost: 0,
  professionalismBoost: 0,
  ctaStyle: "community",
  preferredStructure: "balanced",
  eventPatternStrength: 0,
};
