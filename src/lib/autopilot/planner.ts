import type {
  CampaignRecommendation,
  PerformanceAnalysis,
  WeeklyMarketingPlan,
  WeeklyPlanDay,
} from "@/types/autopilot";
import type { MarketingCampaignType, MarketingUrgencyLevel } from "@/types/marketing";
import type { ScheduledPlatform } from "@/types/scheduling";

const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type DayBlueprint = {
  campaignType: MarketingCampaignType | "rest";
  contentTheme: string;
  platforms: ScheduledPlatform[];
  urgencyLevel: MarketingUrgencyLevel;
  expectedOutcome: string;
};

function startOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

function platformsFromMix(
  mix: { facebook: number; instagram: number; sms: number; email: number },
  preset: ScheduledPlatform[],
): ScheduledPlatform[] {
  if (preset.length > 0) return preset;

  const platforms: ScheduledPlatform[] = [];
  if (mix.facebook > 0) platforms.push("facebook");
  if (mix.instagram > 0) platforms.push("instagram");
  if (mix.sms > 0) platforms.push("sms");
  if (mix.email > 0) platforms.push("email");
  return platforms.length > 0 ? platforms : ["facebook", "instagram"];
}

function buildBlueprints(
  analysis: PerformanceAnalysis,
  recommendation: CampaignRecommendation,
): DayBlueprint[] {
  const topType = analysis.topPerformingTypes[0]?.campaignType ?? recommendation.campaignType;
  const isEventHeavy =
    topType.includes("event") ||
    topType.includes("bike") ||
    recommendation.campaignType === "event";

  return [
    {
      campaignType: "service",
      contentTheme: "Service reminder campaign",
      platforms: platformsFromMix(recommendation.platformMix, ["email", "sms"]),
      urgencyLevel: "medium",
      expectedOutcome: "Book maintenance appointments and service bay traffic.",
    },
    {
      campaignType: "rest",
      contentTheme: "Light social touchpoint",
      platforms: ["instagram"],
      urgencyLevel: "low",
      expectedOutcome: "Stay visible without oversaturating the audience.",
    },
    {
      campaignType: "event",
      contentTheme: "Community engagement post",
      platforms: platformsFromMix(recommendation.platformMix, ["facebook", "instagram"]),
      urgencyLevel: "medium",
      expectedOutcome: "Build event awareness and mid-week engagement.",
    },
    {
      campaignType: isEventHeavy ? "event" : recommendation.campaignType,
      contentTheme: "Audience warm-up content",
      platforms: ["facebook", "email"],
      urgencyLevel: "medium",
      expectedOutcome: "Prime the audience for the weekend push.",
    },
    {
      campaignType: recommendation.campaignType,
      contentTheme: "High urgency event or offer push",
      platforms: platformsFromMix(recommendation.platformMix, ["facebook", "instagram", "sms"]),
      urgencyLevel: "high",
      expectedOutcome: "Drive strong pre-weekend intent and RSVPs.",
    },
    {
      campaignType: recommendation.campaignType,
      contentTheme: "SMS blast + attendance drive",
      platforms: ["sms", "facebook", "instagram"],
      urgencyLevel: "critical",
      expectedOutcome: "Maximize same-day showroom and event turnout.",
    },
    {
      campaignType: "reactivation",
      contentTheme: "Follow-up + reactivation",
      platforms: ["email", "sms"],
      urgencyLevel: "medium",
      expectedOutcome: "Re-engage visitors and convert post-event leads.",
    },
  ];
}

export function generateWeeklyPlan({
  dealershipName,
  analysis,
  recommendation,
}: {
  dealershipName: string;
  analysis: PerformanceAnalysis;
  recommendation: CampaignRecommendation;
}): WeeklyMarketingPlan {
  const blueprints = buildBlueprints(analysis, recommendation);
  const weekStart = startOfWeek();

  const days: WeeklyPlanDay[] = blueprints.map((blueprint, index) => ({
    id: `day-${index}`,
    dayLabel: DAY_LABELS[index]!,
    dayIndex: index,
    campaignType: blueprint.campaignType,
    contentTheme: blueprint.contentTheme,
    platforms: blueprint.platforms,
    urgencyLevel: blueprint.urgencyLevel,
    expectedOutcome: blueprint.expectedOutcome,
  }));

  const platformBreakdown = days.reduce(
    (counts, day) => {
      for (const platform of day.platforms) {
        counts[platform] += 1;
      }
      return counts;
    },
    { facebook: 0, instagram: 0, sms: 0, email: 0 },
  );

  return {
    dealershipName,
    weekStart,
    days,
    platformBreakdown,
    generatedAt: new Date().toISOString(),
  };
}

export function updateWeeklyPlanDay(
  plan: WeeklyMarketingPlan,
  dayId: string,
  updates: Partial<Pick<WeeklyPlanDay, "contentTheme" | "urgencyLevel" | "platforms">>,
): WeeklyMarketingPlan {
  const days = plan.days.map((day) =>
    day.id === dayId ? { ...day, ...updates } : day,
  );

  const platformBreakdown = days.reduce(
    (counts, day) => {
      for (const platform of day.platforms) {
        counts[platform] += 1;
      }
      return counts;
    },
    { facebook: 0, instagram: 0, sms: 0, email: 0 },
  );

  return {
    ...plan,
    days,
    platformBreakdown,
    generatedAt: new Date().toISOString(),
  };
}
