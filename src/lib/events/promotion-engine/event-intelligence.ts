import type { DemoCampaignTone, DemoCampaignType } from "@/lib/demo-ai/types";
import type { EventType } from "@/types/event";

export type EventIntelligenceProfile = {
  tone: DemoCampaignTone;
  campaignType: DemoCampaignType;
  targetAudience: string;
  memoryInsight: string;
  engagementAssumption: "high" | "medium" | "very_high";
};

export const EVENT_TYPE_INTELLIGENCE: Record<EventType, EventIntelligenceProfile> =
  {
    bike_night: {
      tone: "energetic",
      campaignType: "event",
      targetAudience: "local riders, bike night regulars, and weekend lot traffic",
      memoryInsight: "Bike Night performs well with energetic, community-driven tone",
      engagementAssumption: "high",
    },
    service_clinic: {
      tone: "community",
      campaignType: "service",
      targetAudience: "owners due for maintenance, seasonal checkups, and service reminders",
      memoryInsight: "Service events respond better to trust-based urgency messaging",
      engagementAssumption: "medium",
    },
    sale: {
      tone: "aggressive_sales",
      campaignType: "seasonal_sale",
      targetAudience: "high-intent buyers ready to finance and move on limited-time deals",
      memoryInsight: "Sales events convert best with aggressive urgency and deal framing",
      engagementAssumption: "very_high",
    },
    community_event: {
      tone: "community",
      campaignType: "event",
      targetAudience: "families, local neighbors, and community-first riders",
      memoryInsight: "Community events perform best with warm, local, emotional messaging",
      engagementAssumption: "high",
    },
  };

export function getEventIntelligence(eventType: EventType) {
  return EVENT_TYPE_INTELLIGENCE[eventType];
}

export function getDaysUntilEvent(eventDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${eventDate}T12:00:00`);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function scaleMemoryForProximity(
  memory: import("@/types/memory").DealershipMemoryProfile,
  daysUntil: number | undefined,
) {
  if (daysUntil === undefined) {
    return memory;
  }

  let urgencyBoost = memory.urgencyBoost;
  let hypeBoost = memory.hypeBoost;

  if (daysUntil <= 0) {
    urgencyBoost += 2;
    hypeBoost += 1;
  } else if (daysUntil <= 1) {
    urgencyBoost += 2;
    hypeBoost += 1;
  } else if (daysUntil <= 3) {
    urgencyBoost += 1;
  }

  return {
    ...memory,
    urgencyBoost,
    hypeBoost,
  };
}
