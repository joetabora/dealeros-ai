import { createClient } from "@/lib/supabase/server";
import { clampPageSize } from "@/lib/tenant/scoped-query";
import type {
  Campaign,
  CampaignGeneratorInput,
  CampaignGeneratorOutputs,
} from "@/types/campaign";

type CampaignRow = {
  id: string;
  user_id: string;
  dealership_id: string | null;
  dealership_name: string;
  campaign_type: string;
  inputs_json: CampaignGeneratorInput;
  outputs_json: CampaignGeneratorOutputs;
  created_at: string;
};

function mapRow(row: CampaignRow): Campaign {
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    campaignType: row.campaign_type as Campaign["campaignType"],
    inputsJson: row.inputs_json,
    outputsJson: row.outputs_json,
    createdAt: row.created_at,
  };
}

export async function listCampaigns(
  limit = 50,
  dealershipId?: string,
): Promise<Campaign[]> {
  const supabase = await createClient();
  const pageSize = clampPageSize(limit);

  let query = supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(pageSize);

  if (dealershipId) {
    query = query.eq("dealership_id", dealershipId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as CampaignRow[]).map(mapRow);
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRow(data as CampaignRow) : null;
}

export async function createCampaign({
  userId,
  dealershipId,
  input,
  outputs,
}: {
  userId: string;
  dealershipId?: string;
  input: CampaignGeneratorInput;
  outputs: CampaignGeneratorOutputs;
}): Promise<Campaign> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: userId,
      dealership_id: dealershipId ?? null,
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

  return mapRow(data as CampaignRow);
}

export async function updateCampaign({
  id,
  outputs,
}: {
  id: string;
  outputs: CampaignGeneratorOutputs;
}): Promise<Campaign> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .update({ outputs_json: outputs })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as CampaignRow);
}

export async function deleteCampaign(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("campaigns").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

/** @deprecated Use listCampaigns */
export const listAiGenerations = listCampaigns;

/** @deprecated Use getCampaign */
export const getAiGeneration = getCampaign;

/** @deprecated Use createCampaign */
export const createAiGeneration = createCampaign;

/** @deprecated Use updateCampaign */
export const updateAiGeneration = updateCampaign;
