export const CAMPAIGN_TYPES = [
  { value: "event", label: "Event" },
  { value: "service_promo", label: "Service Promo" },
  { value: "reactivation", label: "Reactivation" },
  { value: "seasonal_sale", label: "Seasonal Sale" },
] as const;

export const CAMPAIGN_TONES = [
  { value: "energetic", label: "Energetic" },
  { value: "premium", label: "Premium" },
  { value: "community", label: "Community" },
  { value: "aggressive_sales", label: "Aggressive Sales" },
] as const;

export const CAMPAIGN_PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
] as const;

export type CampaignType = (typeof CAMPAIGN_TYPES)[number]["value"];
export type CampaignTone = (typeof CAMPAIGN_TONES)[number]["value"];
export type CampaignPlatform = (typeof CAMPAIGN_PLATFORMS)[number]["value"];

export type CampaignGeneratorInput = {
  dealershipName: string;
  campaignType: CampaignType;
  targetAudience: string;
  tone: CampaignTone;
  platform: CampaignPlatform;
};

export type CampaignGeneratorOutputs = {
  facebookPost: string;
  instagramCaption: string;
  smsMessage: string;
  emailCampaign: string;
  adHeadline: string;
  callToActionSuggestions: string[];
};

export type AiGeneration = {
  id: string;
  userId: string;
  dealershipName: string;
  campaignType: CampaignType;
  inputsJson: CampaignGeneratorInput;
  outputsJson: CampaignGeneratorOutputs;
  createdAt: string;
};

export type CampaignFormState = {
  error?: string;
  generation?: AiGeneration;
};

export const OUTPUT_FIELDS: Array<{
  key: keyof CampaignGeneratorOutputs;
  label: string;
  description: string;
  multiline?: boolean;
}> = [
  {
    key: "facebookPost",
    label: "Facebook Post",
    description: "Scroll-stopping post built for local engagement.",
    multiline: true,
  },
  {
    key: "instagramCaption",
    label: "Instagram Caption",
    description: "Visual-first caption with hashtag-ready energy.",
    multiline: true,
  },
  {
    key: "smsMessage",
    label: "SMS Blast",
    description: "Short, punchy text that drives immediate action.",
    multiline: true,
  },
  {
    key: "emailCampaign",
    label: "Email Campaign",
    description: "Subject line and body formatted for inbox impact.",
    multiline: true,
  },
  {
    key: "adHeadline",
    label: "Ad Headline",
    description: "High-intent headline for paid social.",
  },
  {
    key: "callToActionSuggestions",
    label: "Call-to-Action Ideas",
    description: "Ready-to-use CTAs for buttons, texts, and posts.",
  },
];
