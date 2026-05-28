import { getMarketingTypeProfile } from "@/lib/marketing/validation";
import { getEventIntelligence } from "@/lib/events/promotion-engine/event-intelligence";
import type { CampaignPerformanceMetrics } from "@/types/analytics";
import type { CampaignGeneratorInput } from "@/types/campaign";
import type { DealershipEvent } from "@/types/event";
import type { DealershipMemoryProfile } from "@/types/memory";
import type {
  FullMarketingCampaignOutput,
  MarketingCampaignInput,
  MarketingUrgencyLevel,
} from "@/types/marketing";

const AVG_LEAD_VALUE = 850;
const AVG_SERVICE_VALUE = 240;
const AVG_EVENT_SPEND = 175;

const REACH_BASELINES: Record<string, number> = {
  event: 2400,
  sale: 2200,
  service: 1800,
  reactivation: 1500,
  seasonal_sale: 2300,
  service_promo: 1700,
  bike_night: 2800,
  service_clinic: 1600,
  community_event: 2500,
};

const CLOSE_RATES: Record<string, number> = {
  event: 0.08,
  sale: 0.14,
  service: 0.12,
  reactivation: 0.06,
  seasonal_sale: 0.15,
  service_promo: 0.11,
  bike_night: 0.09,
  service_clinic: 0.13,
  community_event: 0.08,
};

const URGENCY_MULTIPLIERS: Record<MarketingUrgencyLevel, number> = {
  low: 1,
  medium: 1.12,
  high: 1.28,
  critical: 1.45,
};

const TONE_ENGAGEMENT: Record<string, number> = {
  energetic: 1.2,
  premium: 1.05,
  community: 1.1,
  aggressive_sales: 1.25,
};

const ENGAGEMENT_ASSUMPTION_BOOST: Record<string, number> = {
  medium: 1,
  high: 1.15,
  very_high: 1.3,
};

export type AnalyticsContext = {
  dealershipName: string;
  campaignType: string;
  campaignLabel: string;
  tone: string;
  urgencyLevel: MarketingUrgencyLevel;
  memory: DealershipMemoryProfile;
  scheduledActionCount: number;
  platformCounts: {
    facebook: number;
    instagram: number;
    sms: number;
    email: number;
  };
  hasCountdown: boolean;
  hasRevenueHooks: boolean;
  daysUntilEvent?: number;
  engagementAssumption?: "high" | "medium" | "very_high";
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeToScore(value: number, max: number) {
  return clamp(Math.round((value / max) * 100), 0, 100);
}

function scoreMemoryAlignment(tone: string, memory: DealershipMemoryProfile) {
  let score = 55;

  if (memory.preferredTone && memory.preferredTone === tone) {
    score += 25;
  } else if (memory.preferredTone) {
    score += 8;
  }

  score += memory.urgencyBoost * 3;
  score += memory.hypeBoost * 2;
  score += memory.professionalismBoost * 2;
  score += memory.eventPatternStrength * 5;

  return clamp(Math.round(score), 0, 100);
}

function estimateReach(context: AnalyticsContext) {
  const baseline = REACH_BASELINES[context.campaignType] ?? 2000;
  const urgencyMultiplier = URGENCY_MULTIPLIERS[context.urgencyLevel];
  const platformBonus =
    context.platformCounts.facebook * 120 +
    context.platformCounts.instagram * 150 +
    context.platformCounts.sms * 80 +
    context.platformCounts.email * 100;
  const frequencyBonus = Math.min(context.scheduledActionCount * 45, 450);

  return Math.round((baseline + platformBonus + frequencyBonus) * urgencyMultiplier);
}

function estimateEngagement(context: AnalyticsContext, reach: number) {
  const toneBoost = TONE_ENGAGEMENT[context.tone] ?? 1;
  const memoryBoost =
    context.memory.preferredTone === context.tone ? 1.18 : 1;
  const intensityBoost =
    1 + Math.min(context.scheduledActionCount / 20, 0.35);
  const eventBoost = context.engagementAssumption
    ? ENGAGEMENT_ASSUMPTION_BOOST[context.engagementAssumption] ?? 1
    : 1;

  const rate = 0.045 * toneBoost * memoryBoost * intensityBoost * eventBoost;
  return Math.round(reach * rate);
}

function estimateTrafficLift(context: AnalyticsContext) {
  let lift = 8;

  if (context.daysUntilEvent !== undefined) {
    if (context.daysUntilEvent <= 1) lift += 12;
    else if (context.daysUntilEvent <= 3) lift += 9;
    else if (context.daysUntilEvent <= 7) lift += 6;
    else lift += 3;
  }

  lift += context.platformCounts.sms * 4.5;
  if (context.hasCountdown) lift += 6;
  lift += URGENCY_MULTIPLIERS[context.urgencyLevel] * 4;

  if (context.campaignType === "event" || context.campaignType === "bike_night") {
    lift += 5;
  }

  return Math.round(lift * 10) / 10;
}

function estimateLeads(context: AnalyticsContext, engagement: number) {
  let conversionRate = 0.035;

  if (context.hasRevenueHooks) conversionRate += 0.012;
  if (context.campaignType === "sale" || context.campaignType === "seasonal_sale") {
    conversionRate += 0.018;
  }
  if (context.campaignType === "service" || context.campaignType === "service_promo") {
    conversionRate += 0.01;
  }
  if (context.platformCounts.sms >= 2) conversionRate += 0.008;

  return Math.max(1, Math.round(engagement * conversionRate));
}

function estimateRevenueImpact(context: AnalyticsContext, leads: number) {
  const closeRate = CLOSE_RATES[context.campaignType] ?? 0.08;

  if (
    context.campaignType === "service" ||
    context.campaignType === "service_promo" ||
    context.campaignType === "service_clinic"
  ) {
    return Math.round(leads * closeRate * AVG_SERVICE_VALUE * 2.2);
  }

  if (
    context.campaignType === "event" ||
    context.campaignType === "bike_night" ||
    context.campaignType === "community_event"
  ) {
    return Math.round(
      leads * closeRate * AVG_LEAD_VALUE + leads * 0.25 * AVG_EVENT_SPEND,
    );
  }

  return Math.round(leads * closeRate * AVG_LEAD_VALUE);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatType(value: string) {
  return value.replace(/_/g, " ");
}

function buildInsights(context: AnalyticsContext, metrics: CampaignPerformanceMetrics) {
  const insights: string[] = [];

  if (context.memory.preferredTone === context.tone) {
    insights.push(
      `${capitalize(context.tone.replace("_", " "))} tone aligns with what has worked for ${context.dealershipName}.`,
    );
  }

  if (context.platformCounts.sms >= 2) {
    insights.push("SMS reminders are likely to increase same-week turnout.");
  }

  if (context.hasCountdown) {
    insights.push("Countdown scheduling should lift pre-event traffic.");
  }

  if (metrics.performanceScore >= 75) {
    insights.push(
      `${context.campaignLabel} is projected to outperform typical ${formatType(context.campaignType)} campaigns.`,
    );
  }

  if (
    context.campaignType === "service" ||
    context.campaignType === "service_promo" ||
    context.campaignType === "service_clinic"
  ) {
    insights.push("Service campaigns tend to generate higher repeat-value conversions.");
  }

  if (context.urgencyLevel === "high" || context.urgencyLevel === "critical") {
    insights.push("High urgency messaging should accelerate near-term action.");
  }

  return insights.slice(0, 4);
}

function countPlatforms(actions: { platform: string }[]) {
  return actions.reduce(
    (counts, action) => {
      const key = action.platform as keyof typeof counts;
      if (key in counts) counts[key] += 1;
      return counts;
    },
    { facebook: 0, instagram: 0, sms: 0, email: 0 },
  );
}

export function analyzeCampaignPerformance(
  context: AnalyticsContext,
): CampaignPerformanceMetrics {
  const reach = estimateReach(context);
  const engagement = estimateEngagement(context, reach);
  const trafficLift = estimateTrafficLift(context);
  const leads = estimateLeads(context, engagement);
  const revenueImpact = estimateRevenueImpact(context, leads);

  const engagementScore = normalizeToScore(engagement, reach * 0.12);
  const trafficScore = normalizeToScore(trafficLift, 45);
  const leadsScore = normalizeToScore(leads, 40);
  const memoryAlignmentScore = scoreMemoryAlignment(context.tone, context.memory);

  const performanceScore = clamp(
    Math.round(
      engagementScore * 0.25 +
        trafficScore * 0.25 +
        leadsScore * 0.3 +
        memoryAlignmentScore * 0.2,
    ),
    0,
    100,
  );

  const metrics: CampaignPerformanceMetrics = {
    estimatedReach: reach,
    estimatedEngagement: engagement,
    estimatedTrafficLift: trafficLift,
    estimatedLeads: leads,
    estimatedRevenueImpact: revenueImpact,
    performanceScore,
    engagementScore,
    trafficScore,
    leadsScore,
    memoryAlignmentScore,
    insights: [],
  };

  metrics.insights = buildInsights(context, metrics);
  return metrics;
}

export function buildMarketingAnalyticsContext({
  input,
  output,
  memory,
  scheduledActions,
}: {
  input: MarketingCampaignInput;
  output: FullMarketingCampaignOutput;
  memory: DealershipMemoryProfile;
  scheduledActions: { platform: string; contentType: string }[];
}): AnalyticsContext {
  const profile = getMarketingTypeProfile(input.campaignType);

  return {
    dealershipName: input.dealershipName,
    campaignType: input.campaignType,
    campaignLabel: input.eventOrOfferName,
    tone: profile.tone,
    urgencyLevel: output.strategy.urgencyLevel,
    memory,
    scheduledActionCount: scheduledActions.length,
    platformCounts: countPlatforms(scheduledActions),
    hasCountdown: scheduledActions.some(
      (action) =>
        action.contentType === "reminder" ||
        output.timeline.some((item) => item.timing.includes("T-")),
    ),
    hasRevenueHooks: Boolean(
      output.revenueLayer.salesCta && output.revenueLayer.serviceUpsell,
    ),
    daysUntilEvent: input.campaignDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(`${input.campaignDate}T12:00:00`).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : undefined,
  };
}

export function buildEventAnalyticsContext({
  event,
  memory,
  scheduledActions,
}: {
  event: DealershipEvent;
  memory: DealershipMemoryProfile;
  scheduledActions: { platform: string; contentType: string; content?: string }[];
}): AnalyticsContext {
  const intelligence = getEventIntelligence(event.eventType);
  const daysUntil = Math.max(
    0,
    Math.ceil(
      (new Date(`${event.eventDate}T12:00:00`).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  let urgencyLevel: MarketingUrgencyLevel = "medium";
  if (daysUntil <= 1) urgencyLevel = "critical";
  else if (daysUntil <= 3) urgencyLevel = "high";
  else if (daysUntil <= 7) urgencyLevel = "medium";
  else urgencyLevel = "low";

  const packContent =
    event.promotionPack?.items.map((item) => item.content).join(" ") ?? "";

  return {
    dealershipName: event.dealershipName,
    campaignType: event.eventType,
    campaignLabel: event.eventName,
    tone: intelligence.tone,
    urgencyLevel,
    memory,
    scheduledActionCount: scheduledActions.length,
    platformCounts: countPlatforms(scheduledActions),
    hasCountdown: scheduledActions.some((action) => action.contentType === "reminder"),
    hasRevenueHooks: /service|inventory|test ride|financ/i.test(packContent),
    daysUntilEvent: daysUntil,
    engagementAssumption: intelligence.engagementAssumption,
  };
}

export function buildLegacyCampaignAnalyticsContext({
  input,
  memory,
  scheduledActions,
}: {
  input: CampaignGeneratorInput;
  memory: DealershipMemoryProfile;
  scheduledActions: { platform: string; contentType: string }[];
}): AnalyticsContext {
  return {
    dealershipName: input.dealershipName,
    campaignType: input.campaignType,
    campaignLabel: `${input.campaignType.replace(/_/g, " ")} campaign`,
    tone: input.tone,
    urgencyLevel: "medium",
    memory,
    scheduledActionCount: scheduledActions.length,
    platformCounts: countPlatforms(scheduledActions),
    hasCountdown: false,
    hasRevenueHooks: scheduledActions.length >= 3,
    engagementAssumption: "medium",
  };
}
