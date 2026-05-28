import type { MarketingCampaignType } from "@/types/marketing";
import type { LeadCaptureLayer, LeadInterestType } from "@/types/leads";

export const SMS_RESPONSE_KEYWORDS = ["YES", "INFO", "BOOK"] as const;

export const LEAD_CTA_BY_TYPE: Record<
  MarketingCampaignType,
  { primary: string; triggers: string[] }
> = {
  event: {
    primary: "Reply YES to RSVP or pull up to the lot this weekend.",
    triggers: [
      "Schedule a test ride",
      "Visit the dealership",
      "RSVP — reply YES",
    ],
  },
  sale: {
    primary: "Reply BOOK to lock in your offer or visit the showroom today.",
    triggers: [
      "Book your deal appointment",
      "Visit dealership for limited-time pricing",
      "Schedule a test ride",
    ],
  },
  service: {
    primary: "Reply BOOK to schedule your service appointment.",
    triggers: [
      "Book service appointment",
      "Schedule maintenance today",
      "Call to reserve a bay",
    ],
  },
  reactivation: {
    primary: "Reply INFO for your exclusive comeback offer.",
    triggers: [
      "Visit dealership this week",
      "Schedule a test ride",
      "Book service appointment",
    ],
  },
};

export function buildLeadCaptureLayer(
  campaignType: MarketingCampaignType,
  dealershipName: string,
  offerName: string,
): LeadCaptureLayer {
  const config = LEAD_CTA_BY_TYPE[campaignType];
  const baseEstimate =
    campaignType === "sale" ? 14 : campaignType === "service" ? 10 : campaignType === "event" ? 18 : 8;

  return {
    primaryCta: `${config.primary} — ${offerName} at ${dealershipName}.`,
    trackingTriggers: config.triggers,
    smsKeywords: [...SMS_RESPONSE_KEYWORDS],
    estimatedLeads: baseEstimate,
    conversionPotentialScore:
      campaignType === "sale" ? 82 : campaignType === "event" ? 78 : campaignType === "service" ? 74 : 68,
  };
}

export function appendLeadCaptureCta(content: string, cta: string) {
  if (content.toLowerCase().includes(cta.toLowerCase().slice(0, 12))) {
    return content;
  }

  return `${content.trim()}\n\n→ ${cta}`;
}

export function enrichContentWithLeadTracking(
  content: string,
  layer: LeadCaptureLayer,
) {
  return appendLeadCaptureCta(content, layer.primaryCta);
}

export function mapCampaignTypeToInterest(
  campaignType: MarketingCampaignType | string,
): LeadInterestType {
  if (campaignType === "service" || campaignType === "service_promo") {
    return "service";
  }
  if (campaignType === "sale" || campaignType === "seasonal_sale") {
    return "sales";
  }
  if (
    campaignType === "event" ||
    campaignType === "bike_night" ||
    campaignType === "community_event"
  ) {
    return "event";
  }
  return "general";
}
