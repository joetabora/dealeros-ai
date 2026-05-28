import { getDealershipMemoryProfile } from "@/lib/campaigns/memory/repository";
import { generateCampaign } from "@/lib/demo-ai";
import {
  buildLeadCaptureLayer,
  enrichContentWithLeadTracking,
} from "@/lib/leads/cta-tracking";
import type {
  CampaignGeneratorInput,
  CampaignGeneratorOutputs,
  CampaignType,
} from "@/types/campaign";
import type {
  DemoCampaignInput,
  DemoCampaignOutput,
  DemoCampaignType,
} from "@/lib/demo-ai";

const DEMO_GENERATION_DELAY_MS = 650;

function mapCampaignType(campaignType: CampaignType): DemoCampaignType {
  if (campaignType === "service_promo") {
    return "service";
  }

  return campaignType;
}

function toDemoInput(input: CampaignGeneratorInput): DemoCampaignInput {
  return {
    dealership_name: input.dealershipName,
    campaign_type: mapCampaignType(input.campaignType),
    target_audience: input.targetAudience,
    tone: input.tone,
    platform: input.platform,
  };
}

function simulateGenerationDelay() {
  return new Promise((resolve) => {
    setTimeout(resolve, DEMO_GENERATION_DELAY_MS);
  });
}

function mapMarketingType(campaignType: CampaignType) {
  if (campaignType === "service_promo") return "service" as const;
  if (campaignType === "seasonal_sale") return "sale" as const;
  if (campaignType === "reactivation") return "reactivation" as const;
  return "event" as const;
}

function enrichCampaignOutputs(
  input: CampaignGeneratorInput,
  output: DemoCampaignOutput,
): CampaignGeneratorOutputs {
  const layer = buildLeadCaptureLayer(
    mapMarketingType(input.campaignType),
    input.dealershipName,
    `${input.campaignType.replace(/_/g, " ")} campaign`,
  );
  const enrich = (value: string) => enrichContentWithLeadTracking(value, layer);

  return {
    facebookPost: enrich(output.facebook_post),
    instagramCaption: enrich(output.instagram_caption),
    smsMessage: enrich(output.sms_message),
    emailCampaign: enrich(output.email_campaign),
    adHeadline: output.ad_headline,
    callToActionSuggestions: [
      ...output.cta_suggestions,
      layer.primaryCta,
      ...layer.trackingTriggers,
    ],
  };
}

export async function generateCampaignContent(
  input: CampaignGeneratorInput,
  userId?: string,
): Promise<CampaignGeneratorOutputs> {
  const memory =
    userId && input.dealershipName
      ? await getDealershipMemoryProfile(userId, input.dealershipName)
      : undefined;

  await simulateGenerationDelay();
  const output = generateCampaign(toDemoInput(input), memory);
  return enrichCampaignOutputs(input, output);
}
