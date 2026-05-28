import { getDealershipMemoryProfile } from "@/lib/campaigns/memory/repository";
import { upsertDealershipMemory } from "@/lib/campaigns/memory/repository";
import { generateEventPromotionPack } from "@/lib/events/promotion-engine";
import { createEvent, updateEventPromotionPack } from "@/lib/events/repository";
import { generateFullMarketingCampaign } from "@/lib/marketing/generate-full-campaign";
import { createMarketingCampaign } from "@/lib/marketing/repository";
import {
  simulateEventRsvpLead,
  simulateSmsResponseLead,
} from "@/lib/leads/capture-engine";
import { scheduleFromMarketingCampaign } from "@/lib/scheduling/schedule-service";
import { scheduleFromEvent } from "@/lib/scheduling/schedule-service";
import type { DealershipType } from "@/types/onboarding";
import type { MarketingCampaignInput } from "@/types/marketing";
import type { EventInput } from "@/types/event";

function buildSampleCampaignInput(
  dealershipName: string,
  dealershipType: DealershipType,
): MarketingCampaignInput {
  const audienceByType: Record<DealershipType, string> = {
    harley: "Local riders and Harley owners within 30 miles",
    powersports: "ATV, UTV, and side-by-side enthusiasts",
    multi_line: "Motorcycle and powersports buyers in your market",
    other: "Local riders and dealership customers",
  };

  const offerByType: Record<DealershipType, string> = {
    harley: "Spring Open House & Test Ride Weekend",
    powersports: "Spring Ride Demo Day",
    multi_line: "Season Kickoff Sales Event",
    other: "Weekend Lot Event & Demo Rides",
  };

  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 14);

  return {
    dealershipName,
    campaignType: "event",
    eventOrOfferName: offerByType[dealershipType],
    description: "Grand opening energy for your next big lot event.",
    targetAudience: audienceByType[dealershipType],
    campaignDate: eventDate.toISOString().slice(0, 10),
  };
}

function buildSampleEventInput(dealershipType: DealershipType): EventInput {
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 21);

  const nameByType: Record<DealershipType, string> = {
    harley: "Harley Open House",
    powersports: "Powersports Demo Day",
    multi_line: "Multi-Line Ride & Drive",
    other: "Dealership Open House",
  };

  return {
    eventName: nameByType[dealershipType],
    eventType: "community_event",
    description: "Food, demos, and same-day specials on the lot.",
    eventDate: eventDate.toISOString().slice(0, 10),
  };
}

export async function seedOnboardingData({
  userId,
  dealershipId,
  dealershipName,
  dealershipType,
}: {
  userId: string;
  dealershipId: string;
  dealershipName: string;
  dealershipType: DealershipType;
}) {
  const memory = await getDealershipMemoryProfile(userId, dealershipName);
  const campaignInput = buildSampleCampaignInput(dealershipName, dealershipType);
  const outputs = generateFullMarketingCampaign(campaignInput, memory);

  const campaign = await createMarketingCampaign({
    userId,
    dealershipId,
    input: campaignInput,
    outputs,
  });

  await scheduleFromMarketingCampaign({
    userId,
    dealershipId,
    input: campaignInput,
    outputs,
    campaignId: campaign.id,
  });

  const eventInput = buildSampleEventInput(dealershipType);
  const draftEvent = await createEvent({
    userId,
    dealershipId,
    dealershipName,
    input: eventInput,
  });
  const promotionPack = generateEventPromotionPack(draftEvent, memory);
  const event = await updateEventPromotionPack(draftEvent.id, promotionPack);

  await scheduleFromEvent({
    userId,
    dealershipId,
    event,
  });

  await simulateSmsResponseLead({
    userId,
    dealershipName,
    dealershipId,
    keyword: "YES",
    campaignId: campaign.id,
    eventId: event.id,
  });

  await simulateEventRsvpLead({
    userId,
    dealershipName,
    dealershipId,
    eventId: event.id,
    campaignId: campaign.id,
  });

  await upsertDealershipMemory({
    userId,
    dealershipId,
    dealershipName,
    memoryType: "performance_insights",
    memoryValue: {
      topCampaignId: campaign.id,
      avgEngagementLift: 32,
      snapshotAt: new Date().toISOString(),
      note: "Sample analytics from your starter campaign.",
    },
  });

  return { campaign, event };
}
