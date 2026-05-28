import type { CampaignGeneratorInput, CampaignGeneratorOutputs } from "@/types/campaign";
import type {
  FullMarketingCampaignOutput,
  MarketingCampaignInput,
} from "@/types/marketing";
import { getMarketingTypeProfile } from "@/lib/marketing/validation";

export function toCampaignGeneratorInput(
  input: MarketingCampaignInput,
): CampaignGeneratorInput {
  const profile = getMarketingTypeProfile(input.campaignType);

  return {
    dealershipName: input.dealershipName,
    campaignType: profile.campaignType,
    targetAudience: input.targetAudience,
    tone: profile.campaignTone,
    platform: "facebook",
  };
}

export function toCampaignGeneratorOutputs(
  outputs: FullMarketingCampaignOutput,
): CampaignGeneratorOutputs {
  return {
    facebookPost: outputs.socialMedia.facebookPosts[0],
    instagramCaption: outputs.socialMedia.instagramCaptions[0],
    smsMessage: outputs.sms.announcement,
    emailCampaign: `${outputs.email.subjectLines[0]}\n\n${outputs.email.body}\n\n${outputs.email.ctaSection}`,
    adHeadline: outputs.email.subjectLines[1],
    callToActionSuggestions: [
      outputs.revenueLayer.salesCta,
      outputs.revenueLayer.serviceUpsell,
      outputs.revenueLayer.inventoryMention,
      ...(outputs.revenueLayer.testRideCta ? [outputs.revenueLayer.testRideCta] : []),
    ],
  };
}
