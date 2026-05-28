import { getDealershipMemoryProfile } from "@/lib/campaigns/memory/repository";
import { generateCampaign } from "@/lib/demo-ai";
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

function fromDemoOutput(output: DemoCampaignOutput): CampaignGeneratorOutputs {
  return {
    facebookPost: output.facebook_post,
    instagramCaption: output.instagram_caption,
    smsMessage: output.sms_message,
    emailCampaign: output.email_campaign,
    adHeadline: output.ad_headline,
    callToActionSuggestions: output.cta_suggestions,
  };
}

function simulateGenerationDelay() {
  return new Promise((resolve) => {
    setTimeout(resolve, DEMO_GENERATION_DELAY_MS);
  });
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
  return fromDemoOutput(generateCampaign(toDemoInput(input), memory));
}
