"use server";

import { cookies } from "next/headers";

import {
  getDemoDealership,
  type DemoDealershipProfile,
} from "@/config/demo-dealerships";
import { generateCampaign } from "@/lib/demo-ai";
import { DEMO_MODE_COOKIE } from "@/lib/demo/constants";
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

const DEMO_GENERATION_DELAY_MS = 500;

export type DemoCampaignPack = {
  outputs: CampaignGeneratorOutputs;
  eventPromoVariation: string;
  dealership: DemoDealershipProfile;
};

function mapCampaignType(campaignType: CampaignType): DemoCampaignType {
  if (campaignType === "service_promo") return "service";
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function enableDemoModeAction() {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_MODE_COOKIE, "active", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
}

export async function generateDemoCampaignPackAction(
  dealershipId: string,
): Promise<{ error?: string; pack?: DemoCampaignPack }> {
  const dealership = getDemoDealership(dealershipId);

  if (!dealership) {
    return { error: "Select a valid demo dealership." };
  }

  try {
    await delay(DEMO_GENERATION_DELAY_MS);

    const mainOutput = generateCampaign(
      toDemoInput(dealership.input),
      dealership.memory,
    );

    const eventOutput = generateCampaign(
      {
        ...toDemoInput(dealership.input),
        campaign_type: "event",
        platform: "facebook",
      },
      dealership.memory,
    );

    return {
      pack: {
        outputs: fromDemoOutput(mainOutput),
        eventPromoVariation: eventOutput.facebook_post,
        dealership,
      },
    };
  } catch {
    return { error: "Unable to generate demo campaign. Please try again." };
  }
}
