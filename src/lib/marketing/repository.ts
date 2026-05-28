import { createClient } from "@/lib/supabase/server";
import type {
  FullMarketingCampaignOutput,
  MarketingCampaign,
  MarketingCampaignInput,
  MarketingCampaignType,
} from "@/types/marketing";

type MarketingCampaignRow = {
  id: string;
  user_id: string;
  dealership_name: string;
  campaign_type: string;
  event_or_offer_name: string;
  inputs_json: MarketingCampaignInput;
  outputs_json: FullMarketingCampaignOutput;
  created_at: string;
};

function mapRow(row: MarketingCampaignRow): MarketingCampaign {
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    campaignType: row.campaign_type as MarketingCampaignType,
    eventOrOfferName: row.event_or_offer_name,
    inputsJson: row.inputs_json,
    outputsJson: row.outputs_json,
    createdAt: row.created_at,
  };
}

export async function listMarketingCampaigns(
  limit = 20,
): Promise<MarketingCampaign[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as MarketingCampaignRow[]).map(mapRow);
}

export async function getMarketingCampaign(
  id: string,
): Promise<MarketingCampaign | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRow(data as MarketingCampaignRow) : null;
}

export async function createMarketingCampaign({
  userId,
  input,
  outputs,
}: {
  userId: string;
  input: MarketingCampaignInput;
  outputs: FullMarketingCampaignOutput;
}): Promise<MarketingCampaign> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_campaigns")
    .insert({
      user_id: userId,
      dealership_name: input.dealershipName,
      campaign_type: input.campaignType,
      event_or_offer_name: input.eventOrOfferName,
      inputs_json: input,
      outputs_json: outputs,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as MarketingCampaignRow);
}

export async function updateMarketingCampaignOutputs({
  id,
  outputs,
}: {
  id: string;
  outputs: FullMarketingCampaignOutput;
}): Promise<MarketingCampaign> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_campaigns")
    .update({ outputs_json: outputs })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as MarketingCampaignRow);
}
