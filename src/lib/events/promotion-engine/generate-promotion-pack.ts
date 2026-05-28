import { generateCampaign } from "@/lib/demo-ai";
import type { DemoCampaignOutput } from "@/lib/demo-ai/types";
import { SeededRandom } from "@/lib/demo-ai/types";
import {
  getDaysUntilEvent,
  getEventIntelligence,
  scaleMemoryForProximity,
} from "@/lib/events/promotion-engine/event-intelligence";
import { injectRevenueHook } from "@/lib/events/promotion-engine/revenue-hooks";
import { formatEventDate } from "@/lib/events/validation";
import type {
  DealershipEvent,
  EventPromotionPack,
  PromotionPackItem,
  PromotionPhase,
  PromotionPlatform,
} from "@/types/event";
import type { DealershipMemoryProfile } from "@/types/memory";

type PromotionSlot = {
  id: string;
  phase: PromotionPhase;
  label: string;
  platform: PromotionPlatform;
  daysUntil?: number;
};

const PROMOTION_SLOTS: PromotionSlot[] = [
  {
    id: "pre-facebook-hype",
    phase: "pre_event",
    label: "Facebook hype post (7–1 days before)",
    platform: "facebook",
  },
  {
    id: "pre-instagram-teaser",
    phase: "pre_event",
    label: "Instagram teaser post",
    platform: "instagram",
  },
  {
    id: "pre-sms-announcement",
    phase: "pre_event",
    label: "SMS announcement",
    platform: "sms",
  },
  {
    id: "pre-email-invitation",
    phase: "pre_event",
    label: "Email invitation",
    platform: "email",
  },
  {
    id: "countdown-3-day",
    phase: "countdown",
    label: "3-day reminder",
    platform: "sms",
    daysUntil: 3,
  },
  {
    id: "countdown-1-day",
    phase: "countdown",
    label: "1-day reminder",
    platform: "sms",
    daysUntil: 1,
  },
  {
    id: "countdown-tomorrow-hype",
    phase: "countdown",
    label: '"Tomorrow" hype message',
    platform: "facebook",
    daysUntil: 1,
  },
  {
    id: "day-morning-announcement",
    phase: "day_of",
    label: "Morning announcement post",
    platform: "facebook",
    daysUntil: 0,
  },
  {
    id: "day-midday-reminder",
    phase: "day_of",
    label: "Mid-day reminder",
    platform: "instagram",
    daysUntil: 0,
  },
  {
    id: "day-urgency-sms",
    phase: "day_of",
    label: "Urgency push SMS",
    platform: "sms",
    daysUntil: 0,
  },
  {
    id: "post-thank-you",
    phase: "post_event",
    label: "Thank you post",
    platform: "facebook",
  },
  {
    id: "post-lead-followup",
    phase: "post_event",
    label: "Lead capture follow-up message",
    platform: "sms",
  },
  {
    id: "post-reactivation",
    phase: "post_event",
    label: "Service or sales reactivation message",
    platform: "email",
  },
];

function hashSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function extractPlatformContent(
  output: DemoCampaignOutput,
  platform: PromotionPlatform,
) {
  switch (platform) {
    case "facebook":
      return output.facebook_post;
    case "instagram":
      return output.instagram_caption;
    case "sms":
      return output.sms_message;
    case "email":
      return output.email_campaign;
  }
}

function buildPhaseHeader(
  event: DealershipEvent,
  slot: PromotionSlot,
) {
  const dateLabel = formatEventDate(event.eventDate);

  if (slot.daysUntil === 0) {
    return `TODAY — ${event.eventName} · ${dateLabel}`;
  }

  if (slot.daysUntil === 1) {
    return `TOMORROW — ${event.eventName} · ${dateLabel}`;
  }

  if (slot.daysUntil !== undefined && slot.daysUntil > 1) {
    return `${slot.daysUntil} DAYS OUT — ${event.eventName} · ${dateLabel}`;
  }

  if (slot.phase === "post_event") {
    return `AFTER THE EVENT — ${event.eventName}`;
  }

  return `${event.eventName} · ${dateLabel}`;
}

function buildSlotContent(
  event: DealershipEvent,
  slot: PromotionSlot,
  body: string,
) {
  const header = buildPhaseHeader(event, slot);

  return `${header}\n${event.dealershipName}\n\n${event.description}\n\n${body}`;
}

function generateSlotContent(
  event: DealershipEvent,
  slot: PromotionSlot,
  memory: DealershipMemoryProfile,
): string {
  const intelligence = getEventIntelligence(event.eventType);
  const seed = hashSeed(`${event.id}:${slot.id}:${event.eventDate}`);
  const rng = new SeededRandom(seed);
  const scaledMemory = scaleMemoryForProximity(memory, slot.daysUntil);

  const output = generateCampaign(
    {
      dealership_name: event.dealershipName,
      campaign_type: intelligence.campaignType,
      target_audience: intelligence.targetAudience,
      tone: intelligence.tone,
      platform: slot.platform,
    },
    scaledMemory,
  );

  const platformContent = extractPlatformContent(output, slot.platform);
  const withHook = injectRevenueHook(platformContent, rng);
  return buildSlotContent(event, slot, withHook);
}

export function generateEventPromotionPack(
  event: DealershipEvent,
  memory: DealershipMemoryProfile,
): EventPromotionPack {
  const daysUntil = getDaysUntilEvent(event.eventDate);
  const baseMemory = scaleMemoryForProximity(memory, daysUntil);

  const items: PromotionPackItem[] = PROMOTION_SLOTS.map((slot) => ({
    id: slot.id,
    phase: slot.phase,
    label: slot.label,
    platform: slot.platform,
    content: generateSlotContent(event, slot, baseMemory),
  }));

  return {
    generatedAt: new Date().toISOString(),
    items,
  };
}

export { PROMOTION_SLOTS };
