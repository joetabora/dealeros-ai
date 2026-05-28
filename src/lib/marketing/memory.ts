import { upsertDealershipMemory } from "@/lib/campaigns/memory/repository";
import { getMarketingTypeProfile } from "@/lib/marketing/validation";
import type { MarketingCampaignInput } from "@/types/marketing";
import type { FullMarketingCampaignOutput } from "@/types/marketing";

export async function syncMarketingMemory({
  userId,
  dealershipName,
  input,
  output,
}: {
  userId: string;
  dealershipName: string;
  input: MarketingCampaignInput;
  output: FullMarketingCampaignOutput;
}) {
  const profile = getMarketingTypeProfile(input.campaignType);

  await Promise.all([
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "preferred_tone",
      memoryValue: {
        tone: profile.tone,
        count: 1,
        confidence: 0.8,
        source: "marketing_engine",
        insight: `${profile.suggestedAngle} — urgency ${output.strategy.urgencyLevel}`,
      },
    }),
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "successful_campaign_style",
      memoryValue: {
        campaignType: profile.campaignType,
        count: 1,
        confidence: 0.8,
        source: "marketing_engine",
      },
    }),
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "audience_insight",
      memoryValue: {
        topAudiences: [input.targetAudience],
        lastAudience: input.targetAudience,
        source: "marketing_engine",
      },
    }),
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "generation_weights",
      memoryValue: {
        urgencyBoost:
          output.strategy.urgencyLevel === "critical"
            ? 2
            : output.strategy.urgencyLevel === "high"
              ? 1
              : 0,
        hypeBoost: input.campaignType === "event" ? 2 : input.campaignType === "sale" ? 1 : 0,
        professionalismBoost: input.campaignType === "service" ? 2 : input.campaignType === "reactivation" ? 1 : 0,
        ctaStyle:
          input.campaignType === "sale"
            ? "direct"
            : input.campaignType === "reactivation"
              ? "premium"
              : "community",
        preferredStructure:
          input.campaignType === "sale" || input.campaignType === "event"
            ? "hype"
            : "story",
        eventPatternStrength: input.campaignType === "event" ? 1 : 0.5,
        source: "marketing_engine",
        performanceInsight: output.strategy.suggestedAngle,
      },
    }),
  ]);
}
