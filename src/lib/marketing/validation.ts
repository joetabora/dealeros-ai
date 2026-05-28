import {
  MARKETING_CAMPAIGN_TYPES,
  type MarketingCampaignInput,
  type MarketingCampaignType,
  type MarketingUrgencyLevel,
} from "@/types/marketing";
import type { DemoCampaignTone, DemoCampaignType } from "@/lib/demo-ai/types";
import type { CampaignType, CampaignTone } from "@/types/campaign";

export type MarketingTypeProfile = {
  tone: DemoCampaignTone;
  demoCampaignType: DemoCampaignType;
  campaignType: CampaignType;
  campaignTone: CampaignTone;
  suggestedAngle: string;
  positioningTemplate: string;
  includeTestRide: boolean;
};

export const MARKETING_TYPE_PROFILES: Record<
  MarketingCampaignType,
  MarketingTypeProfile
> = {
  event: {
    tone: "energetic",
    demoCampaignType: "event",
    campaignType: "event",
    campaignTone: "energetic",
    suggestedAngle: "Community-driven lot energy with live event hype",
    positioningTemplate:
      "Position as a can't-miss dealership experience built for local riders and weekend traffic",
    includeTestRide: true,
  },
  sale: {
    tone: "aggressive_sales",
    demoCampaignType: "seasonal_sale",
    campaignType: "seasonal_sale",
    campaignTone: "aggressive_sales",
    suggestedAngle: "Limited-time inventory urgency with deal-first messaging",
    positioningTemplate:
      "Position as a high-intent sales window with clear financial upside and scarcity",
    includeTestRide: true,
  },
  service: {
    tone: "community",
    demoCampaignType: "service",
    campaignType: "service_promo",
    campaignTone: "community",
    suggestedAngle: "Trust-based maintenance urgency with practical value",
    positioningTemplate:
      "Position as a smart maintenance move before bays fill up and seasonal demand spikes",
    includeTestRide: false,
  },
  reactivation: {
    tone: "premium",
    demoCampaignType: "reactivation",
    campaignType: "reactivation",
    campaignTone: "premium",
    suggestedAngle: "Personal comeback offer with respectful premium tone",
    positioningTemplate:
      "Position as an exclusive invitation for past buyers and dormant leads to return",
    includeTestRide: true,
  },
};

const MARKETING_TYPE_SET = new Set(
  MARKETING_CAMPAIGN_TYPES.map((item) => item.value),
);

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function parseMarketingInput(formData: FormData): MarketingCampaignInput {
  const dealershipName = String(formData.get("dealershipName") ?? "").trim();
  const campaignType = String(
    formData.get("campaignType") ?? "",
  ) as MarketingCampaignType;
  const eventOrOfferName = String(formData.get("eventOrOfferName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const targetAudience = String(formData.get("targetAudience") ?? "").trim();
  const campaignDateRaw = String(formData.get("campaignDate") ?? "").trim();

  if (!dealershipName) {
    throw new Error("Dealership name is required.");
  }

  if (!MARKETING_TYPE_SET.has(campaignType)) {
    throw new Error("Select a valid campaign type.");
  }

  if (!eventOrOfferName) {
    throw new Error("Event or offer name is required.");
  }

  if (!targetAudience) {
    throw new Error("Target audience is required.");
  }

  if (campaignDateRaw && !isValidDate(campaignDateRaw)) {
    throw new Error("Select a valid campaign date.");
  }

  return {
    dealershipName,
    campaignType,
    eventOrOfferName,
    description: description || undefined,
    targetAudience,
    campaignDate: campaignDateRaw || undefined,
  };
}

export function getMarketingTypeLabel(value: MarketingCampaignType) {
  return MARKETING_CAMPAIGN_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function getDaysUntilCampaign(campaignDate?: string) {
  if (!campaignDate) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${campaignDate}T12:00:00`);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function resolveUrgencyLevel(daysUntil?: number): MarketingUrgencyLevel {
  if (daysUntil === undefined) return "medium";
  if (daysUntil <= 1) return "critical";
  if (daysUntil <= 3) return "high";
  if (daysUntil <= 7) return "medium";
  return "low";
}

export function formatMarketingDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function getMarketingTypeProfile(type: MarketingCampaignType) {
  return MARKETING_TYPE_PROFILES[type];
}
