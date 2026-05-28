import { createClient } from "@/lib/supabase/server";
import {
  EMPTY_MEMORY_PROFILE,
  type DealershipMemoryProfile,
  type DealershipMemoryRecord,
  type DealershipMemoryType,
} from "@/types/memory";

type MemoryRow = {
  id: string;
  user_id: string;
  dealership_name: string;
  memory_type: string;
  memory_value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function mapRow(row: MemoryRow): DealershipMemoryRecord {
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    memoryType: row.memory_type as DealershipMemoryType,
    memoryValue: row.memory_value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildMemoryProfile(
  dealershipName: string,
  records: DealershipMemoryRecord[],
): DealershipMemoryProfile {
  const profile: DealershipMemoryProfile = {
    ...EMPTY_MEMORY_PROFILE,
    dealershipName,
  };

  for (const record of records) {
    switch (record.memoryType) {
      case "preferred_tone": {
        profile.preferredTone = record.memoryValue.tone as string | undefined;
        break;
      }
      case "successful_campaign_style": {
        profile.preferredCampaignType = record.memoryValue.campaignType as
          | string
          | undefined;
        break;
      }
      case "audience_insight": {
        profile.audienceInsights =
          (record.memoryValue.topAudiences as string[] | undefined) ?? [];
        break;
      }
      case "event_patterns": {
        const hypeBoost = (record.memoryValue.hypeBoost as number | undefined) ?? 0;
        profile.eventPatternStrength = hypeBoost;
        profile.hypeBoost += hypeBoost;
        break;
      }
      case "generation_weights": {
        profile.urgencyBoost =
          (record.memoryValue.urgencyBoost as number | undefined) ??
          profile.urgencyBoost;
        profile.hypeBoost =
          (record.memoryValue.hypeBoost as number | undefined) ??
          profile.hypeBoost;
        profile.professionalismBoost =
          (record.memoryValue.professionalismBoost as number | undefined) ??
          profile.professionalismBoost;
        profile.ctaStyle =
          (record.memoryValue.ctaStyle as DealershipMemoryProfile["ctaStyle"]) ??
          profile.ctaStyle;
        profile.preferredStructure =
          (record.memoryValue
            .preferredStructure as DealershipMemoryProfile["preferredStructure"]) ??
          profile.preferredStructure;
        break;
      }
    }
  }

  return profile;
}

export async function listDealershipMemory(
  userId: string,
  dealershipName: string,
): Promise<DealershipMemoryRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dealership_memory")
    .select("*")
    .eq("user_id", userId)
    .eq("dealership_name", dealershipName);

  if (error) {
    throw new Error(error.message);
  }

  return (data as MemoryRow[]).map(mapRow);
}

export async function upsertDealershipMemory({
  userId,
  dealershipName,
  memoryType,
  memoryValue,
}: {
  userId: string;
  dealershipName: string;
  memoryType: DealershipMemoryType;
  memoryValue: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("dealership_memory").upsert(
    {
      user_id: userId,
      dealership_name: dealershipName,
      memory_type: memoryType,
      memory_value: memoryValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,dealership_name,memory_type" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getDealershipMemoryProfile(
  userId: string,
  dealershipName: string,
): Promise<DealershipMemoryProfile> {
  try {
    const records = await listDealershipMemory(userId, dealershipName);
    return buildMemoryProfile(dealershipName, records);
  } catch {
    return { ...EMPTY_MEMORY_PROFILE, dealershipName };
  }
}
