"use server";

import { generateCampaignContent } from "@/lib/campaigns/generate-content";
import {
  createAiGeneration,
  updateAiGeneration,
} from "@/lib/campaigns/repository";
import { parseCampaignInput } from "@/lib/campaigns/validation";
import { requireSession } from "@/lib/auth/session";
import type {
  CampaignFormState,
  CampaignGeneratorOutputs,
} from "@/types/campaign";

function getActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("ai_generations")) {
      return "Unable to save campaign. Confirm the ai_generations table exists in Supabase.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function generateCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  try {
    const session = await requireSession();
    const input = parseCampaignInput(formData);
    const outputs = await generateCampaignContent(input);
    const generation = await createAiGeneration({
      userId: session.user.id,
      input,
      outputs,
    });

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
    const generation = await updateAiGeneration({
      id: generationId,
      outputs,
    });

    return { generation };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}
