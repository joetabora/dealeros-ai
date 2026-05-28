import { createClient } from "@/lib/supabase/server";
import type {
  AiGeneration,
  CampaignGeneratorInput,
  CampaignGeneratorOutputs,
  CampaignType,
} from "@/types/campaign";

type AiGenerationRow = {
  id: string;
  user_id: string;
  dealership_name: string;
  campaign_type: string;
  inputs_json: CampaignGeneratorInput;
  outputs_json: CampaignGeneratorOutputs;
  created_at: string;
};

function mapRow(row: AiGenerationRow): AiGeneration {
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    campaignType: row.campaign_type as CampaignType,
    inputsJson: row.inputs_json,
    outputsJson: row.outputs_json,
    createdAt: row.created_at,
  };
}

export async function listAiGenerations(limit = 20): Promise<AiGeneration[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as AiGenerationRow[]).map(mapRow);
}

export async function getAiGeneration(id: string): Promise<AiGeneration | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_generations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRow(data as AiGenerationRow) : null;
}

export async function createAiGeneration({
  userId,
  input,
  outputs,
}: {
  userId: string;
  input: CampaignGeneratorInput;
  outputs: CampaignGeneratorOutputs;
}): Promise<AiGeneration> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_generations")
    .insert({
      user_id: userId,
      dealership_name: input.dealershipName,
      campaign_type: input.campaignType,
      inputs_json: input,
      outputs_json: outputs,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as AiGenerationRow);
}

export async function updateAiGeneration({
  id,
  outputs,
}: {
  id: string;
  outputs: CampaignGeneratorOutputs;
}): Promise<AiGeneration> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_generations")
    .update({ outputs_json: outputs })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as AiGenerationRow);
}
