import { generateCampaign } from "@/lib/demo-ai";
import type { DemoCampaignOutput } from "@/lib/demo-ai/types";
import { SeededRandom } from "@/lib/demo-ai/types";
import { scaleMemoryForProximity } from "@/lib/events/promotion-engine/event-intelligence";
import { injectRevenueHook } from "@/lib/events/promotion-engine/revenue-hooks";
import {
  formatMarketingDate,
  getDaysUntilCampaign,
  getMarketingTypeProfile,
  resolveUrgencyLevel,
} from "@/lib/marketing/validation";
import type {
  FullMarketingCampaignOutput,
  MarketingCampaignInput,
  MarketingRevenueLayer,
  MarketingStrategy,
  MarketingTimelineItem,
} from "@/types/marketing";
import type { DealershipMemoryProfile } from "@/types/memory";

type Platform = "facebook" | "instagram" | "sms" | "email";

function hashSeed(parts: string[]) {
  const value = parts.join(":");
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function extractPlatformContent(output: DemoCampaignOutput, platform: Platform) {
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

function wrapContent(
  input: MarketingCampaignInput,
  label: string,
  body: string,
) {
  const dateLine = input.campaignDate
    ? formatMarketingDate(input.campaignDate)
    : null;
  const header = [input.eventOrOfferName, input.dealershipName, dateLine]
    .filter(Boolean)
    .join(" · ");

  const description = input.description ? `\n\n${input.description}` : "";

  return `${header}\n${label}${description}\n\n${body}`;
}

function generateSlot(
  input: MarketingCampaignInput,
  memory: DealershipMemoryProfile,
  platform: Platform,
  slotId: string,
  daysUntil?: number,
) {
  const profile = getMarketingTypeProfile(input.campaignType);
  const seed = hashSeed([
    input.dealershipName,
    input.eventOrOfferName,
    input.campaignType,
    platform,
    slotId,
  ]);
  const rng = new SeededRandom(seed);
  const scaledMemory = scaleMemoryForProximity(memory, daysUntil);

  const output = generateCampaign(
    {
      dealership_name: input.dealershipName,
      campaign_type: profile.demoCampaignType,
      target_audience: input.targetAudience,
      tone: profile.tone,
      platform,
    },
    scaledMemory,
  );

  const platformContent = extractPlatformContent(output, platform);
  return injectRevenueHook(platformContent, rng);
}

function buildStrategy(
  input: MarketingCampaignInput,
  memory: DealershipMemoryProfile,
): MarketingStrategy {
  const profile = getMarketingTypeProfile(input.campaignType);
  const daysUntil = getDaysUntilCampaign(input.campaignDate);
  const urgencyLevel = resolveUrgencyLevel(daysUntil);

  const memoryTone = memory.preferredTone
    ? ` Memory suggests ${memory.preferredTone.replace("_", " ")} messaging performs well for this store.`
    : "";

  return {
    positioning: `${profile.positioningTemplate} for ${input.eventOrOfferName} at ${input.dealershipName}.${memoryTone}`,
    suggestedAngle: profile.suggestedAngle,
    urgencyLevel,
    audienceTargeting: `Primary audience: ${input.targetAudience}. Messaging tuned for ${profile.demoCampaignType.replace("_", " ")} conversion paths.`,
  };
}

function buildRevenueLayer(
  input: MarketingCampaignInput,
): MarketingRevenueLayer {
  const profile = getMarketingTypeProfile(input.campaignType);

  return {
    serviceUpsell: `While you're at ${input.dealershipName}, ask about service specials tied to ${input.eventOrOfferName} — bays book fast during promotions.`,
    salesCta: `Talk to our team at ${input.dealershipName} about current offers on ${input.eventOrOfferName}.`,
    testRideCta: profile.includeTestRide
      ? `Schedule a test ride at ${input.dealershipName} and see what's on the floor.`
      : undefined,
    inventoryMention:
      input.campaignType === "sale"
        ? `Select inventory is moving at ${input.dealershipName} — first come, first served on ${input.eventOrOfferName}.`
        : `Stop in at ${input.dealershipName} and check out what's on the lot during ${input.eventOrOfferName}.`,
  };
}

function buildReelScript(
  input: MarketingCampaignInput,
  memory: DealershipMemoryProfile,
) {
  const caption = generateSlot(
    input,
    memory,
    "instagram",
    "reel-script",
    getDaysUntilCampaign(input.campaignDate),
  );

  return `REEL SCRIPT — ${input.eventOrOfferName}\n\nHOOK (0–3s): "This is happening at ${input.dealershipName} — you don't want to miss it."\n\nBODY (3–15s): Show lot energy, bikes, team, and event signage. Voiceover or text overlay:\n${caption.slice(0, 280)}…\n\nCTA (15–20s): "Pull up to ${input.dealershipName}. Link in bio."`;
}

function buildTimeline(
  input: MarketingCampaignInput,
  memory: DealershipMemoryProfile,
): MarketingTimelineItem[] {
  const slots: Array<Omit<MarketingTimelineItem, "content"> & { daysUntil?: number }> = [
    {
      id: "t7-hype",
      timing: "T-7 days",
      label: "Hype post",
      platform: "Facebook",
      daysUntil: 7,
    },
    {
      id: "t3-reminder",
      timing: "T-3 days",
      label: "Reminder push",
      platform: "SMS",
      daysUntil: 3,
    },
    {
      id: "t1-urgency",
      timing: "T-1 day",
      label: "Urgency push",
      platform: "SMS",
      daysUntil: 1,
    },
    {
      id: "day-of",
      timing: "Day-of",
      label: "Attendance push",
      platform: "Facebook",
      daysUntil: 0,
    },
    {
      id: "post-event",
      timing: "Post-event",
      label: "Follow-up + reactivation",
      platform: "Email",
    },
  ];

  const platformMap: Record<string, Platform> = {
    Facebook: "facebook",
    SMS: "sms",
    Email: "email",
  };

  return slots.map((slot) => {
    const platform = platformMap[slot.platform] ?? "facebook";
    const body = generateSlot(
      input,
      memory,
      platform,
      slot.id,
      slot.daysUntil,
    );

    return {
      id: slot.id,
      timing: slot.timing,
      label: slot.label,
      platform: slot.platform,
      content: wrapContent(input, `${slot.timing} — ${slot.label}`, body),
    };
  });
}

export function generateFullMarketingCampaign(
  input: MarketingCampaignInput,
  memory: DealershipMemoryProfile,
): FullMarketingCampaignOutput {
  const daysUntil = getDaysUntilCampaign(input.campaignDate);
  const scaledMemory = scaleMemoryForProximity(memory, daysUntil);

  const facebookPosts = [
    wrapContent(
      input,
      "Facebook Post 1 — Launch hype",
      generateSlot(input, scaledMemory, "facebook", "fb-1", 7),
    ),
    wrapContent(
      input,
      "Facebook Post 2 — Mid-cycle push",
      generateSlot(input, scaledMemory, "facebook", "fb-2", 3),
    ),
    wrapContent(
      input,
      "Facebook Post 3 — Final urgency",
      generateSlot(input, scaledMemory, "facebook", "fb-3", 1),
    ),
  ] as [string, string, string];

  const instagramCaptions = [
    wrapContent(
      input,
      "Instagram Caption 1 — Teaser",
      generateSlot(input, scaledMemory, "instagram", "ig-1", 7),
    ),
    wrapContent(
      input,
      "Instagram Caption 2 — Countdown",
      generateSlot(input, scaledMemory, "instagram", "ig-2", 3),
    ),
    wrapContent(
      input,
      "Instagram Caption 3 — Day-of energy",
      generateSlot(input, scaledMemory, "instagram", "ig-3", 0),
    ),
  ] as [string, string, string];

  const announcement = wrapContent(
    input,
    "SMS — Announcement",
    generateSlot(input, scaledMemory, "sms", "sms-announce", 7),
  );
  const reminder = wrapContent(
    input,
    "SMS — Reminder",
    generateSlot(input, scaledMemory, "sms", "sms-reminder", 3),
  );
  const finalUrgency = wrapContent(
    input,
    "SMS — Final urgency",
    generateSlot(input, scaledMemory, "sms", "sms-final", 1),
  );

  const emailBody = wrapContent(
    input,
    "Email body",
    generateSlot(input, scaledMemory, "email", "email-body", daysUntil),
  );

  const subjectLines = [
    `${input.eventOrOfferName} at ${input.dealershipName} — you're invited`,
    `Don't miss ${input.eventOrOfferName} — ${input.dealershipName}`,
    `${input.dealershipName}: ${input.eventOrOfferName} details inside`,
  ] as [string, string, string];

  const revenueLayer = buildRevenueLayer(input);

  return {
    generatedAt: new Date().toISOString(),
    strategy: buildStrategy(input, scaledMemory),
    socialMedia: {
      facebookPosts,
      instagramCaptions,
      reelScript: buildReelScript(input, scaledMemory),
    },
    sms: {
      announcement,
      reminder,
      finalUrgency,
    },
    email: {
      subjectLines,
      body: emailBody,
      ctaSection: `${revenueLayer.salesCta}\n${revenueLayer.serviceUpsell}${revenueLayer.testRideCta ? `\n${revenueLayer.testRideCta}` : ""}\n${revenueLayer.inventoryMention}`,
    },
    timeline: buildTimeline(input, scaledMemory),
    revenueLayer,
  };
}
