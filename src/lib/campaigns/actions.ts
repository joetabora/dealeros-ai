"use server";

import { revalidatePath } from "next/cache";

import { generateCampaignContent } from "@/lib/campaigns/generate-content";
import { syncDealershipMemory } from "@/lib/campaigns/memory/analyzer";
import {
  createCampaign,
  deleteCampaign,
  updateCampaign,
} from "@/lib/campaigns/repository";
import { parseCampaignInput } from "@/lib/campaigns/validation";
import { scheduleFromCampaignGenerator } from "@/lib/scheduling/schedule-service";
import { requireSession } from "@/lib/auth/session";
import type {
  CampaignFormState,
  CampaignGeneratorOutputs,
} from "@/types/campaign";

function getActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.message.includes("campaigns") ||
      error.message.includes("dealership_memory")
    ) {
      return "Unable to save campaign. Confirm Supabase migrations are applied.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function revalidateCampaignRoutes() {
  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/campaigns/new");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/autopilot");
}

export async function generateCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  try {
    const session = await requireSession();
    const input = parseCampaignInput(formData);
    const outputs = await generateCampaignContent(input, session.user.id);
    const generation = await createCampaign({
      userId: session.user.id,
      input,
      outputs,
    });

    await syncDealershipMemory({
      userId: session.user.id,
      dealershipName: input.dealershipName,
      input,
      outputs,
    });

    await scheduleFromCampaignGenerator({
      userId: session.user.id,
      dealershipName: input.dealershipName,
      campaignId: generation.id,
      outputs,
      input,
    });

    revalidateCampaignRoutes();
    return { generation };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}

export async function saveCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  try {
    await requireSession();

    const generationId = String(formData.get("generationId") ?? "");
    const outputsJson = String(formData.get("outputsJson") ?? "");

    if (!generationId) {
      return { error: "Generate a campaign before saving." };
    }

    const outputs = JSON.parse(outputsJson) as CampaignGeneratorOutputs;
    const generation = await updateCampaign({
      id: generationId,
      outputs,
    });

    revalidateCampaignRoutes();
    return { generation };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}

export async function deleteCampaignAction(campaignId: string) {
  try {
    await requireSession();
    await deleteCampaign(campaignId);
    revalidateCampaignRoutes();
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: getActionErrorMessage(error),
    };
  }
}
