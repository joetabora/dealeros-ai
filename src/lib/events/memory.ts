import { upsertDealershipMemory } from "@/lib/campaigns/memory/repository";
import { getEventIntelligence } from "@/lib/events/promotion-engine/event-intelligence";
import type { DealershipEvent } from "@/types/event";

export async function syncEventMemory({
  userId,
  dealershipName,
  event,
}: {
  userId: string;
  dealershipName: string;
  event: DealershipEvent;
}) {
  const intelligence = getEventIntelligence(event.eventType);

  await Promise.all([
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "preferred_tone",
      memoryValue: {
        tone: intelligence.tone,
        count: 1,
        confidence: 0.75,
        source: "event_promotion",
        insight: intelligence.memoryInsight,
      },
    }),
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "event_patterns",
      memoryValue: {
        lastEventType: event.eventType,
        lastEventName: event.eventName,
        engagementAssumption: intelligence.engagementAssumption,
        hypeBoost: event.eventType === "sale" ? 1 : event.eventType === "bike_night" ? 0.75 : 0.5,
        insight: intelligence.memoryInsight,
      },
    }),
    upsertDealershipMemory({
      userId,
      dealershipName,
      memoryType: "generation_weights",
      memoryValue: {
        urgencyBoost:
          event.eventType === "sale" ? 2 : event.eventType === "service_clinic" ? 1 : 1,
        hypeBoost: event.eventType === "bike_night" ? 2 : event.eventType === "sale" ? 1 : 0,
        professionalismBoost: event.eventType === "service_clinic" ? 2 : 0,
        ctaStyle:
          event.eventType === "sale"
            ? "direct"
            : event.eventType === "community_event"
              ? "community"
              : "direct",
        preferredStructure:
          event.eventType === "community_event" || event.eventType === "service_clinic"
            ? "story"
            : "hype",
        eventPatternStrength: 1,
        source: "event_promotion",
      },
    }),
  ]);
}
