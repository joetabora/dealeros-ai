"use server";

import { getDemoDealership } from "@/config/demo-dealerships";
import { generateFullMarketingCampaign } from "@/lib/marketing/generate-full-campaign";
import { buildDemoPreviewSchedule } from "@/lib/scheduling/schedule-service";
import type { ScheduledMarketingAction } from "@/types/scheduling";
import type { MarketingCampaignInput } from "@/types/marketing";

export async function previewDemoScheduleAction(
  dealershipId: string,
): Promise<{ error?: string; actions?: ScheduledMarketingAction[] }> {
  const dealership = getDemoDealership(dealershipId);

  if (!dealership) {
    return { error: "Select a valid demo dealership." };
  }

  const input: MarketingCampaignInput = {
    dealershipName: dealership.name,
    campaignType:
      dealership.input.campaignType === "service_promo"
        ? "service"
        : dealership.input.campaignType === "seasonal_sale"
          ? "sale"
          : dealership.input.campaignType === "reactivation"
            ? "reactivation"
            : "event",
    eventOrOfferName: dealership.historySamples[0]?.label ?? "Demo Event",
    description: dealership.historySamples[0]?.excerpt,
    targetAudience: dealership.input.targetAudience,
    campaignDate: undefined,
  };

  input.campaignDate = defaultDemoDate();

  const memory = {
    ...dealership.memory,
    dealershipName: dealership.name,
  };

  const outputs = generateFullMarketingCampaign(input, memory);
  const actions = await buildDemoPreviewSchedule({
    dealershipName: dealership.name,
    outputs,
    input,
  });

  return { actions };
}

function defaultDemoDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
