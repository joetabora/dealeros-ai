import type {
  CampaignRecommendation,
  PerformanceAnalysis,
  PlatformMixStats,
} from "@/types/autopilot";
import type { DealershipMemoryProfile } from "@/types/memory";
import type { MarketingCampaignType, MarketingUrgencyLevel } from "@/types/marketing";

const TYPE_TO_MARKETING: Record<string, MarketingCampaignType> = {
  event: "event",
  bike_night: "event",
  community_event: "event",
  sale: "sale",
  seasonal_sale: "sale",
  service: "service",
  service_promo: "service",
  service_clinic: "service",
  reactivation: "reactivation",
};

const RECOMMENDATION_TEMPLATES: Record<
  MarketingCampaignType,
  {
    names: string[];
    audiences: string[];
    descriptions: string[];
  }
> = {
  event: {
    names: ["Weekend Bike Night", "Community Ride-In", "Lot Party Saturday"],
    audiences: [
      "Local riders, weekend regulars, and first-time visitors",
      "Bike night regulars and neighborhood enthusiasts",
    ],
    descriptions: [
      "Live music, test rides, and event-only offers to fill the lot.",
      "Community-focused event with food, demos, and showroom traffic.",
    ],
  },
  sale: {
    names: ["Limited-Time Inventory Event", "Season Kickoff Sale", "Weekend Deal Blitz"],
    audiences: [
      "High-intent buyers ready to finance this month",
      "Past leads and showroom visitors waiting on the right deal",
    ],
    descriptions: [
      "Urgency-driven pricing push with financing highlights and limited inventory.",
      "High-conversion sale window with aggressive CTAs across every channel.",
    ],
  },
  service: {
    names: ["Spring Service Reminder", "Maintenance Window Special", "Bay Booking Push"],
    audiences: [
      "Owners due for seasonal maintenance and service reminders",
      "Past service customers and warranty follow-ups",
    ],
    descriptions: [
      "Trust-based service urgency before bays fill up for the season.",
      "Maintenance reminder campaign focused on repeat service revenue.",
    ],
  },
  reactivation: {
    names: ["We Miss You Comeback Offer", "Past Buyer Reactivation", "VIP Return Invite"],
    audiences: [
      "Past buyers and dormant leads who haven't visited in 6+ months",
      "Previous customers ready for an upgrade or service visit",
    ],
    descriptions: [
      "Premium comeback invitation with exclusive return incentives.",
      "Personal re-engagement push for lapsed customers and old leads.",
    ],
  },
};

function formatTypeLabel(value: string) {
  return value.replace(/_/g, " ");
}

function pickMarketingType(analysis: PerformanceAnalysis): MarketingCampaignType {
  const topRaw = analysis.topPerformingTypes[0]?.campaignType;
  if (topRaw && TYPE_TO_MARKETING[topRaw]) {
    return TYPE_TO_MARKETING[topRaw]!;
  }

  if (analysis.engagementTrend === "declining") {
    return "event";
  }

  return "event";
}

function pickAlternateType(
  primary: MarketingCampaignType,
  analysis: PerformanceAnalysis,
): MarketingCampaignType {
  const underperforming = analysis.whatsDeclining.some((item) =>
    item.toLowerCase().includes("service"),
  );
  if (underperforming && primary !== "service") return "service";
  if (primary === "event") return "sale";
  if (primary === "sale") return "service";
  return "event";
}

function resolveUrgency(
  campaignType: MarketingCampaignType,
  analysis: PerformanceAnalysis,
): MarketingUrgencyLevel {
  if (analysis.engagementTrend === "declining") return "high";
  if (campaignType === "sale") return "high";
  if (campaignType === "service") return "medium";
  if (campaignType === "reactivation") return "medium";
  return analysis.averageTrafficLift >= 18 ? "medium" : "low";
}

function buildPlatformMix(
  analysis: PerformanceAnalysis,
  campaignType: MarketingCampaignType,
): PlatformMixStats {
  const base = { ...analysis.platformMix };

  if (campaignType === "event") {
    return {
      facebook: Math.max(base.facebook, 2),
      instagram: Math.max(base.instagram, 2),
      sms: Math.max(base.sms, 2),
      email: Math.max(base.email, 1),
    };
  }

  if (campaignType === "sale") {
    return {
      facebook: Math.max(base.facebook, 2),
      instagram: Math.max(base.instagram, 1),
      sms: Math.max(base.sms, 3),
      email: Math.max(base.email, 1),
    };
  }

  if (campaignType === "service") {
    return {
      facebook: Math.max(base.facebook, 1),
      instagram: Math.max(base.instagram, 1),
      sms: Math.max(base.sms, 2),
      email: Math.max(base.email, 2),
    };
  }

  return {
    facebook: 1,
    instagram: 1,
    sms: 1,
    email: 2,
  };
}

function buildReasoning(
  campaignType: MarketingCampaignType,
  analysis: PerformanceAnalysis,
  memory: DealershipMemoryProfile,
): string {
  const top = analysis.topPerformingTypes[0];
  const second = analysis.topPerformingTypes[1];

  if (top && second && top.campaignType !== second.campaignType) {
    const delta = top.averageScore - second.averageScore;
    if (delta >= 5) {
      return `${formatTypeLabel(top.campaignType)} campaigns outperform ${formatTypeLabel(second.campaignType)} by ${delta}% in engagement. Recommend another ${campaignType === "event" ? "community-focused event" : formatTypeLabel(campaignType) + " push"} this weekend.`;
    }
  }

  if (analysis.engagementTrend === "declining") {
    return "Engagement has dipped recently. A fresh community event with energetic tone should bring lot traffic back up.";
  }

  if (memory.preferredTone) {
    return `${formatTypeLabel(memory.preferredTone.replace("_", " "))} messaging has worked well for ${analysis.dealershipName}. A ${formatTypeLabel(campaignType)} campaign fits that pattern and should convert this week.`;
  }

  return `Based on your recent performance, a ${formatTypeLabel(campaignType)} campaign with ${analysis.bestPerformingTone.replace("_", " ")} tone is the strongest next move for ${analysis.dealershipName}.`;
}

function pickTemplate<T>(items: T[], seed: number) {
  return items[seed % items.length]!;
}

export function recommendNextCampaign({
  analysis,
  memory,
}: {
  analysis: PerformanceAnalysis;
  memory: DealershipMemoryProfile;
}): CampaignRecommendation {
  let campaignType = pickMarketingType(analysis);

  if (
    analysis.topPerformingTypes.length >= 2 &&
    analysis.topPerformingTypes[0]!.count >= 2 &&
    analysis.engagementTrend !== "declining"
  ) {
    campaignType = pickAlternateType(campaignType, analysis);
  }

  const templates = RECOMMENDATION_TEMPLATES[campaignType];
  const seed = analysis.totalCampaigns + analysis.averageScore;

  return {
    campaignType,
    recommendedTone: analysis.bestPerformingTone,
    platformMix: buildPlatformMix(analysis, campaignType),
    urgencyLevel: resolveUrgency(campaignType, analysis),
    eventOrOfferName: pickTemplate(templates.names, seed),
    targetAudience: pickTemplate(templates.audiences, seed + 1),
    description: pickTemplate(templates.descriptions, seed + 2),
    reasoning: buildReasoning(campaignType, analysis, memory),
  };
}
