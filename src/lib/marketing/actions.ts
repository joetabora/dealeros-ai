"use server";

import { revalidatePath } from "next/cache";

import { syncDealershipMemory } from "@/lib/campaigns/memory/analyzer";
import { getDealershipMemoryProfile } from "@/lib/campaigns/memory/repository";
import { createCampaign } from "@/lib/campaigns/repository";
import {
  toCampaignGeneratorInput,
  toCampaignGeneratorOutputs,
} from "@/lib/marketing/campaign-bridge";
import { generateFullMarketingCampaign } from "@/lib/marketing/generate-full-campaign";
import { syncMarketingMemory } from "@/lib/marketing/memory";
import {
  createMarketingCampaign,
  updateMarketingCampaignOutputs,
} from "@/lib/marketing/repository";
import { parseMarketingInput } from "@/lib/marketing/validation";
import { scheduleFromMarketingCampaign } from "@/lib/scheduling/schedule-service";
import { requireSession } from "@/lib/auth/session";
import type {
  FullMarketingCampaignOutput,
  MarketingCampaignInput,
  MarketingFormState,
} from "@/types/marketing";

const GENERATION_DELAY_MS = 800;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.message.includes("marketing_campaigns") ||
      error.message.includes("campaigns")
    ) {
      return "Unable to save marketing campaign. Confirm Supabase migrations are applied.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function revalidateMarketingRoutes(campaignId?: string) {
  revalidatePath("/dashboard/marketing");
  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/autopilot");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/approvals");

  if (campaignId) {
    revalidatePath(`/dashboard/marketing/${campaignId}`);
  }
}

async function saveToCampaignHistory({
  userId,
  input,
  outputs,
}: {
  userId: string;
  input: MarketingCampaignInput;
  outputs: FullMarketingCampaignOutput;
}) {
  const campaignInput = toCampaignGeneratorInput(input);
  const campaignOutputs = toCampaignGeneratorOutputs(outputs);

  const savedCampaign = await createCampaign({
    userId,
    input: campaignInput,
    outputs: campaignOutputs,
  });

  await syncDealershipMemory({
    userId,
    dealershipName: input.dealershipName,
    input: campaignInput,
    outputs: campaignOutputs,
  });

  return savedCampaign;
}

export async function generateFullCampaignAction(
  _prevState: MarketingFormState,
  formData: FormData,
): Promise<MarketingFormState> {
  try {
    const session = await requireSession();
    const input = parseMarketingInput(formData);
    const memory = await getDealershipMemoryProfile(
      session.user.id,
      input.dealershipName,
    );

    await delay(GENERATION_DELAY_MS);

    const outputs = generateFullMarketingCampaign(input, memory);

    const campaign = await createMarketingCampaign({
      userId: session.user.id,
      input,
      outputs,
    });

    await syncMarketingMemory({
      userId: session.user.id,
      dealershipName: input.dealershipName,
      input,
      output: outputs,
    });

    const savedCampaign = await saveToCampaignHistory({
      userId: session.user.id,
      input,
      outputs,
    });

    await scheduleFromMarketingCampaign({
      userId: session.user.id,
      input,
      outputs,
      campaignId: savedCampaign.id,
    });

    revalidateMarketingRoutes(campaign.id);
    return { campaign };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}

export async function saveMarketingCampaignAction(
  _prevState: MarketingFormState,
  formData: FormData,
): Promise<MarketingFormState> {
  try {
    await requireSession();

    const campaignId = String(formData.get("campaignId") ?? "");
    const outputsJson = String(formData.get("outputsJson") ?? "");

    if (!campaignId) {
      return { error: "Generate a campaign before saving." };
    }

    const outputs = JSON.parse(outputsJson) as FullMarketingCampaignOutput;
    const campaign = await updateMarketingCampaignOutputs({
      id: campaignId,
      outputs,
    });

    revalidateMarketingRoutes(campaignId);
    return { campaign };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}
