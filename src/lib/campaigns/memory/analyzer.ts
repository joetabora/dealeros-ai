import { listCampaigns } from "@/lib/campaigns/repository";
import { upsertDealershipMemory } from "@/lib/campaigns/memory/repository";
import type { CampaignGeneratorInput, CampaignGeneratorOutputs } from "@/types/campaign";
import type { DealershipMemoryProfile } from "@/types/memory";

function countByKey<T extends string>(items: T[]): Map<T, number> {
  const counts = new Map<T, number>();

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  return counts;
}

function topKey<T extends string>(counts: Map<T, number>): T | undefined {
  let winner: T | undefined;
  let max = 0;

  for (const [key, count] of counts) {
    if (count > max) {
      max = count;
      winner = key;
    }
  }

  return winner;
}

function uniqueTopAudiences(audiences: string[], limit = 3): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const audience of audiences) {
    const normalized = audience.trim();
    if (!normalized || seen.has(normalized.toLowerCase())) continue;
    seen.add(normalized.toLowerCase());
    result.push(normalized);
    if (result.length >= limit) break;
  }

  return result;
}

function deriveGenerationWeights(
  campaigns: Array<{ inputsJson: CampaignGeneratorInput }>,
  preferredTone?: string,
  preferredCampaignType?: string,
) {
  const toneCounts = countByKey(campaigns.map((c) => c.inputsJson.tone));
  const typeCounts = countByKey(campaigns.map((c) => c.inputsJson.campaignType));

  const dominantTone = preferredTone ?? topKey(toneCounts);
  const dominantType = preferredCampaignType ?? topKey(typeCounts);

  let urgencyBoost = 0;
  let hypeBoost = 0;
  let professionalismBoost = 0;
  let ctaStyle: DealershipMemoryProfile["ctaStyle"] = "community";
  let preferredStructure: DealershipMemoryProfile["preferredStructure"] =
    "balanced";

  if (dominantTone === "energetic" || dominantTone === "aggressive_sales") {
    urgencyBoost += 1;
    hypeBoost += 1;
    ctaStyle = "direct";
    preferredStructure = "hype";
  }

  if (dominantTone === "premium") {
    professionalismBoost += 2;
    ctaStyle = "premium";
    preferredStructure = "story";
  }

  if (dominantTone === "community") {
    ctaStyle = "community";
    preferredStructure = "story";
  }

  if (dominantType === "event") {
    hypeBoost += 1;
    urgencyBoost += 1;
  }

  if (dominantType === "service_promo") {
    professionalismBoost += 1;
    hypeBoost -= 1;
  }

  if (dominantType === "seasonal_sale") {
    urgencyBoost += 2;
    ctaStyle = "direct";
  }

  if (dominantType === "reactivation") {
    preferredStructure = "story";
    ctaStyle = "community";
  }

  return {
    urgencyBoost,
    hypeBoost,
    professionalismBoost,
    ctaStyle,
    preferredStructure,
  };
}

export async function syncDealershipMemory({
  userId,
  dealershipName,
  input,
}: {
  userId: string;
  dealershipName: string;
  input: CampaignGeneratorInput;
  outputs: CampaignGeneratorOutputs;
}): Promise<void> {

  const campaigns = (await listCampaigns(100)).filter(
    (campaign) =>
      campaign.userId === userId &&
      campaign.dealershipName.toLowerCase() === dealershipName.toLowerCase(),
  );

  const allCampaigns = [
    ...campaigns.map((campaign) => ({ inputsJson: campaign.inputsJson })),
    { inputsJson: input },
  ];

  const toneCounts = countByKey(allCampaigns.map((c) => c.inputsJson.tone));
  const typeCounts = countByKey(allCampaigns.map((c) => c.inputsJson.campaignType));
  const preferredTone = topKey(toneCounts);
  const preferredCampaignType = topKey(typeCounts);
  const totalCount = allCampaigns.length;

  const audiences = uniqueTopAudiences([
    ...allCampaigns.map((c) => c.inputsJson.targetAudience),
    input.targetAudience,
  ]);

  const eventCount = allCampaigns.filter(
    (c) => c.inputsJson.campaignType === "event",
  ).length;
  const eventRatio = totalCount > 0 ? eventCount / totalCount : 0;
  const eventHypeBoost = eventRatio >= 0.4 ? 1 : eventRatio >= 0.25 ? 0.5 : 0;

  const weights = deriveGenerationWeights(
    allCampaigns,
    preferredTone,
    preferredCampaignType,
  );

  await Promise.all([
    preferredTone
      ? upsertDealershipMemory({
          userId,
          dealershipName,
          memoryType: "preferred_tone",
          memoryValue: {
            tone: preferredTone,
            count: toneCounts.get(preferredTone as CampaignGeneratorInput["tone"]) ?? 1,
            confidence: Math.min(
              1,
              (toneCounts.get(preferredTone as CampaignGeneratorInput["tone"]) ?? 1) /
                totalCount,
            ),
          },
        })
      : Promise.resolve(),
    preferredCampaignType
      ? upsertDealershipMemory({
          userId,
          dealershipName,
          memoryType: "successful_campaign_style",
          memoryValue: {
            campaignType: preferredCampaignType,
            count:
              typeCounts.get(
                preferredCampaignType as CampaignGeneratorInput["campaignType"],
              ) ?? 1,
            confidence: Math.min(
              1,
              (typeCounts.get(
                preferredCampaignType as CampaignGeneratorInput["campaignType"],
              ) ?? 1) / totalCount,
            ),
          },
        })
      : Promise.resolve(),
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "audience_insight",
      memoryValue: {
        topAudiences: audiences,
        lastAudience: input.targetAudience,
      },
    }),
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "event_patterns",
      memoryValue: {
        eventCampaignCount: eventCount,
        totalCampaignCount: totalCount,
        hypeBoost: eventHypeBoost,
      },
    }),
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "generation_weights",
      memoryValue: {
        ...weights,
        eventPatternStrength: eventHypeBoost,
      },
    }),
  ]);
}
