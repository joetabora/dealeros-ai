import type {
  CampaignContext,
  DemoCampaignInput,
  DemoCampaignTone,
  DemoCampaignType,
  DealerPlacement,
  SeededRandom,
} from "@/lib/demo-ai/types";

const TONE_ADJUSTMENTS: Record<
  DemoCampaignTone,
  Partial<
    Pick<
      CampaignContext,
      "urgencyLevel" | "hypeLevel" | "professionalismLevel" | "emotionalTone"
    >
  >
> = {
  energetic: {
    hypeLevel: 1,
    urgencyLevel: 1,
    emotionalTone: "amped-up and ready to ride",
  },
  premium: {
    hypeLevel: -2,
    professionalismLevel: 2,
    emotionalTone: "polished and confident",
  },
  community: {
    hypeLevel: 0,
    professionalismLevel: 0,
    emotionalTone: "warm, local, and rider-first",
  },
  aggressive_sales: {
    urgencyLevel: 2,
    hypeLevel: 1,
    emotionalTone: "direct, bold, and action-driven",
  },
};

const CAMPAIGN_BASE_CONTEXT: Record<
  DemoCampaignType,
  Omit<CampaignContext, "audienceTypeModifier">
> = {
  event: {
    urgencyLevel: 4,
    hypeLevel: 5,
    professionalismLevel: 2,
    emotionalTone: "electric and community-driven",
  },
  service: {
    urgencyLevel: 2,
    hypeLevel: 1,
    professionalismLevel: 4,
    emotionalTone: "trustworthy and practical",
  },
  reactivation: {
    urgencyLevel: 3,
    hypeLevel: 2,
    professionalismLevel: 3,
    emotionalTone: "personal, nostalgic, and welcoming back",
  },
  seasonal_sale: {
    urgencyLevel: 5,
    hypeLevel: 4,
    professionalismLevel: 2,
    emotionalTone: "urgent, deal-focused, and high-stakes",
  },
};

function clampLevel(value: number): number {
  return Math.min(5, Math.max(1, value));
}

function inferAudienceModifier(audience: string, rng: SeededRandom): string {
  const normalized = audience.toLowerCase();

  if (normalized.includes("service") || normalized.includes("maintenance")) {
    return "riders who care about keeping their bike dialed in";
  }

  if (
    normalized.includes("past") ||
    normalized.includes("dormant") ||
    normalized.includes("haven't")
  ) {
    return "riders we've missed seeing on the lot";
  }

  if (normalized.includes("local") || normalized.includes("community")) {
    return "the local riding community";
  }

  if (normalized.includes("buyer") || normalized.includes("owner")) {
    return "past buyers who already know the brand";
  }

  const fallbacks = [
    "riders ready to show up",
    "people who live for the open road",
    "the crew that keeps our showroom alive",
    audience.trim() || "local riders",
  ];

  return rng.pick(fallbacks);
}

export function buildCampaignContext(
  input: DemoCampaignInput,
  rng: SeededRandom,
): CampaignContext {
  const base = CAMPAIGN_BASE_CONTEXT[input.campaign_type];
  const toneAdjust = TONE_ADJUSTMENTS[input.tone];

  return {
    urgencyLevel: clampLevel(
      base.urgencyLevel + (toneAdjust.urgencyLevel ?? 0),
    ),
    hypeLevel: clampLevel(base.hypeLevel + (toneAdjust.hypeLevel ?? 0)),
    professionalismLevel: clampLevel(
      base.professionalismLevel + (toneAdjust.professionalismLevel ?? 0),
    ),
    emotionalTone: toneAdjust.emotionalTone ?? base.emotionalTone,
    audienceTypeModifier: inferAudienceModifier(input.target_audience, rng),
  };
}

export function pickDealerPlacement(rng: SeededRandom): DealerPlacement {
  return rng.pick(["hook", "mid", "close"] as const);
}
