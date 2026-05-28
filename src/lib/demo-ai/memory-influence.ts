import type { CampaignContext, GenerationRuntime } from "@/lib/demo-ai/types";
import type { DealershipMemoryProfile } from "@/types/memory";

function clampLevel(value: number): number {
  return Math.min(5, Math.max(1, value));
}

export function applyMemoryToContext(
  context: CampaignContext,
  memory?: DealershipMemoryProfile,
): CampaignContext {
  if (!memory) return context;

  const adjusted: CampaignContext = {
    ...context,
    urgencyLevel: clampLevel(context.urgencyLevel + memory.urgencyBoost),
    hypeLevel: clampLevel(context.hypeLevel + memory.hypeBoost),
    professionalismLevel: clampLevel(
      context.professionalismLevel + memory.professionalismBoost,
    ),
  };

  if (memory.preferredTone === "community") {
    adjusted.emotionalTone = "warm, local, and rider-first";
  }

  if (memory.preferredTone === "premium") {
    adjusted.emotionalTone = "polished, refined, and high-trust";
  }

  if (memory.preferredTone === "aggressive_sales") {
    adjusted.emotionalTone = "urgent, bold, and conversion-focused";
  }

  if (memory.audienceInsights.length > 0 && memory.audienceInsights[0]) {
    adjusted.audienceTypeModifier = memory.audienceInsights[0];
  }

  return adjusted;
}

export function pickMemoryFacebookFormat(
  runtime: GenerationRuntime,
  memory?: DealershipMemoryProfile,
):
  | "hook-details-cta"
  | "hook-emotional-details-cta"
  | "question-hook-details-cta"
  | "short-hype" {
  if (!memory) {
    return runtime.rng.pick([
      "hook-details-cta",
      "hook-emotional-details-cta",
      "question-hook-details-cta",
      "short-hype",
    ] as const);
  }

  if (memory.preferredStructure === "hype") {
    return runtime.rng.pick(["short-hype", "hook-details-cta"] as const);
  }

  if (memory.preferredStructure === "story") {
    return runtime.rng.pick([
      "hook-emotional-details-cta",
      "question-hook-details-cta",
    ] as const);
  }

  return runtime.rng.pick([
    "hook-details-cta",
    "hook-emotional-details-cta",
    "question-hook-details-cta",
    "short-hype",
  ] as const);
}

export function applyMemoryToCtaChance(
  baseChance: number,
  memory?: DealershipMemoryProfile,
): number {
  if (!memory) return baseChance;

  if (memory.ctaStyle === "direct") {
    return Math.min(0.85, baseChance + 0.15);
  }

  if (memory.ctaStyle === "premium") {
    return Math.max(0.25, baseChance - 0.1);
  }

  return baseChance;
}
