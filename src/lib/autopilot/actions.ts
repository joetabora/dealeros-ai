"use server";

import { revalidatePath } from "next/cache";

import { buildAutopilotDashboard, refreshAutopilotPlan, saveWeeklyPlanUpdate } from "@/lib/autopilot/service";
import { syncMarketingMemory } from "@/lib/marketing/memory";
import { createMarketingCampaign } from "@/lib/marketing/repository";
import { generateFullMarketingCampaign } from "@/lib/marketing/generate-full-campaign";
import { scheduleFromMarketingCampaign } from "@/lib/scheduling/schedule-service";
import { getDealershipMemoryProfile } from "@/lib/campaigns/memory/repository";
import { createCampaign } from "@/lib/campaigns/repository";
import {
  toCampaignGeneratorInput,
  toCampaignGeneratorOutputs,
} from "@/lib/marketing/campaign-bridge";
import { syncDealershipMemory } from "@/lib/campaigns/memory/analyzer";
import { requireSession } from "@/lib/auth/session";
import type { AutopilotDashboard } from "@/types/autopilot";
import type { MarketingCampaignInput, MarketingUrgencyLevel } from "@/types/marketing";
import type { ScheduledPlatform } from "@/types/scheduling";

const GENERATION_DELAY_MS = 600;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function revalidateAutopilotRoutes() {
  revalidatePath("/dashboard/autopilot");
  revalidatePath("/dashboard/marketing");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/calendar");
}

function defaultCampaignDate(urgency: MarketingUrgencyLevel) {
  const date = new Date();
  if (urgency === "critical") date.setDate(date.getDate() + 2);
  else if (urgency === "high") date.setDate(date.getDate() + 5);
  else date.setDate(date.getDate() + 10);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getAutopilotDashboardAction(): Promise<{
  error?: string;
  dashboard?: AutopilotDashboard;
}> {
  try {
    const session = await requireSession();
    const dashboard = await buildAutopilotDashboard({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      softUpdate: true,
    });

    return { dashboard };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to load autopilot insights.",
    };
  }
}

export async function refreshAutopilotAction(): Promise<{
  error?: string;
  dashboard?: AutopilotDashboard;
}> {
  try {
    const session = await requireSession();
    const dashboard = await refreshAutopilotPlan({
      userId: session.user.id,
      dealershipName: session.dealer.name,
    });

    revalidateAutopilotRoutes();
    return { dashboard: dashboard ?? undefined };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to refresh autopilot.",
    };
  }
}

export async function updateWeeklyPlanDayAction(
  dayId: string,
  updates: {
    contentTheme?: string;
    urgencyLevel?: MarketingUrgencyLevel;
    platforms?: ScheduledPlatform[];
  },
): Promise<{ error?: string; dashboard?: AutopilotDashboard }> {
  try {
    const session = await requireSession();
    const dashboard = await saveWeeklyPlanUpdate({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      dayId,
      updates,
    });

    revalidateAutopilotRoutes();
    return { dashboard };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update weekly plan.",
    };
  }
}

export async function generateRecommendedCampaignAction(): Promise<{
  error?: string;
  campaignId?: string;
}> {
  try {
    const session = await requireSession();
    const dashboard = await buildAutopilotDashboard({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      softUpdate: true,
    });

    const recommendation = dashboard.recommendation;
    const input: MarketingCampaignInput = {
      dealershipName: session.dealer.name,
      campaignType: recommendation.campaignType,
      eventOrOfferName: recommendation.eventOrOfferName,
      description: recommendation.description,
      targetAudience: recommendation.targetAudience,
      campaignDate: defaultCampaignDate(recommendation.urgencyLevel),
    };

    const memory = await getDealershipMemoryProfile(
      session.user.id,
      session.dealer.name,
    );

    await delay(GENERATION_DELAY_MS);

    const outputs = generateFullMarketingCampaign(input, memory);
    outputs.strategy.urgencyLevel = recommendation.urgencyLevel;

    const campaign = await createMarketingCampaign({
      userId: session.user.id,
      input,
      outputs,
    });

    await syncMarketingMemory({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      input,
      output: outputs,
    });

    const campaignInput = toCampaignGeneratorInput(input);
    const campaignOutputs = toCampaignGeneratorOutputs(outputs);
    const savedCampaign = await createCampaign({
      userId: session.user.id,
      input: campaignInput,
      outputs: campaignOutputs,
    });

    await syncDealershipMemory({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      input: campaignInput,
      outputs: campaignOutputs,
    });

    await scheduleFromMarketingCampaign({
      userId: session.user.id,
      input,
      outputs,
      campaignId: savedCampaign.id,
    });

    revalidateAutopilotRoutes();
    return { campaignId: campaign.id };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate recommended campaign.",
    };
  }
}
