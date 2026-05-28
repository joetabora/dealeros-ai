import {
  CAMPAIGN_PLATFORMS,
  CAMPAIGN_TONES,
  CAMPAIGN_TYPES,
  type CampaignGeneratorInput,
  type CampaignPlatform,
  type CampaignTone,
  type CampaignType,
} from "@/types/campaign";

const CAMPAIGN_TYPE_SET = new Set(CAMPAIGN_TYPES.map((item) => item.value));
const CAMPAIGN_TONE_SET = new Set(CAMPAIGN_TONES.map((item) => item.value));
const CAMPAIGN_PLATFORM_SET = new Set(CAMPAIGN_PLATFORMS.map((item) => item.value));

export function parseCampaignInput(formData: FormData): CampaignGeneratorInput {
  const dealershipName = String(formData.get("dealershipName") ?? "").trim();
  const campaignType = String(formData.get("campaignType") ?? "") as CampaignType;
  const targetAudience = String(formData.get("targetAudience") ?? "").trim();
  const tone = String(formData.get("tone") ?? "") as CampaignTone;
  const platform = String(formData.get("platform") ?? "") as CampaignPlatform;

  if (!dealershipName) {
    throw new Error("Dealership name is required.");
  }

  if (!CAMPAIGN_TYPE_SET.has(campaignType)) {
    throw new Error("Select a valid campaign type.");
  }

  if (!targetAudience) {
    throw new Error("Target audience is required.");
  }

  if (!CAMPAIGN_TONE_SET.has(tone)) {
    throw new Error("Select a valid tone.");
  }

  if (!CAMPAIGN_PLATFORM_SET.has(platform)) {
    throw new Error("Select a valid platform.");
  }

  return {
    dealershipName,
    campaignType,
    targetAudience,
    tone,
    platform,
  };
}

export function getCampaignTypeLabel(value: CampaignType) {
  return CAMPAIGN_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function getCampaignToneLabel(value: CampaignTone) {
  return CAMPAIGN_TONES.find((item) => item.value === value)?.label ?? value;
}

export function getCampaignPlatformLabel(value: CampaignPlatform) {
  return CAMPAIGN_PLATFORMS.find((item) => item.value === value)?.label ?? value;
}
