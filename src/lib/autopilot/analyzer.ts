import type { CampaignAnalyticsRecord } from "@/types/analytics";
import type { DealershipMemoryProfile } from "@/types/memory";
import type {
  CampaignTypePerformance,
  EngagementTrend,
  PerformanceAnalysis,
  PlatformMixStats,
} from "@/types/autopilot";
import type { ScheduledMarketingAction } from "@/types/scheduling";

const EVENT_TYPES = new Set([
  "event",
  "bike_night",
  "community_event",
  "sale",
  "seasonal_sale",
]);

const SERVICE_TYPES = new Set(["service", "service_promo", "service_clinic"]);

function formatTypeLabel(value: string) {
  return value.replace(/_/g, " ");
}

function toneFromCampaignType(type: string) {
  if (EVENT_TYPES.has(type)) return "energetic";
  if (SERVICE_TYPES.has(type)) return "community";
  if (type === "sale" || type === "seasonal_sale") return "aggressive_sales";
  if (type === "reactivation") return "premium";
  return "community";
}

function groupByType(
  records: CampaignAnalyticsRecord[],
): CampaignTypePerformance[] {
  const buckets = new Map<string, CampaignTypePerformance>();

  for (const record of records) {
    const existing = buckets.get(record.campaignType) ?? {
      campaignType: record.campaignType,
      averageScore: 0,
      averageEngagement: 0,
      averageRevenue: 0,
      count: 0,
    };

    existing.averageScore += record.performanceScore;
    existing.averageEngagement += record.estimatedEngagement;
    existing.averageRevenue += record.estimatedRevenueImpact;
    existing.count += 1;
    buckets.set(record.campaignType, existing);
  }

  return [...buckets.values()]
    .map((bucket) => ({
      ...bucket,
      averageScore: Math.round(bucket.averageScore / bucket.count),
      averageEngagement: Math.round(bucket.averageEngagement / bucket.count),
      averageRevenue: Math.round(bucket.averageRevenue / bucket.count),
    }))
    .sort((left, right) => right.averageScore - left.averageScore);
}

function countPlatforms(actions: ScheduledMarketingAction[]): PlatformMixStats {
  return actions.reduce(
    (counts, action) => {
      counts[action.platform] += 1;
      return counts;
    },
    { facebook: 0, instagram: 0, sms: 0, email: 0 },
  );
}

function detectEngagementTrend(
  records: CampaignAnalyticsRecord[],
): { trend: EngagementTrend; detail: string } {
  if (records.length < 2) {
    return {
      trend: "unknown",
      detail: "Not enough campaign history to detect a trend yet.",
    };
  }

  const sorted = [...records].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
  const midpoint = Math.floor(sorted.length / 2);
  const older = sorted.slice(0, midpoint);
  const recent = sorted.slice(midpoint);

  const olderAvg =
    older.reduce((sum, record) => sum + record.estimatedEngagement, 0) /
    older.length;
  const recentAvg =
    recent.reduce((sum, record) => sum + record.estimatedEngagement, 0) /
    recent.length;

  const delta = recentAvg - olderAvg;
  const pct = olderAvg > 0 ? Math.round((delta / olderAvg) * 100) : 0;

  if (pct >= 10) {
    return {
      trend: "rising",
      detail: `Engagement is up about ${pct}% compared to earlier campaigns.`,
    };
  }

  if (pct <= -10) {
    return {
      trend: "declining",
      detail: `Engagement has dipped about ${Math.abs(pct)}% from earlier campaigns.`,
    };
  }

  return {
    trend: "stable",
    detail: "Engagement is holding steady across recent campaigns.",
  };
}

function buildHighestRoiPatterns(types: CampaignTypePerformance[]) {
  return types
    .sort((left, right) => right.averageRevenue - left.averageRevenue)
    .slice(0, 3)
    .map(
      (entry) =>
        `${formatTypeLabel(entry.campaignType)} campaigns average ${entry.averageRevenue.toLocaleString()} in projected revenue impact.`,
    );
}

function buildWhatsWorking(
  types: CampaignTypePerformance[],
  memory: DealershipMemoryProfile,
  trend: EngagementTrend,
) {
  const items: string[] = [];

  if (types[0]) {
    items.push(
      `${formatTypeLabel(types[0].campaignType)} campaigns are your strongest performer with an average score of ${types[0].averageScore}.`,
    );
  }

  if (memory.preferredTone) {
    items.push(
      `${formatTypeLabel(memory.preferredTone.replace("_", " "))} messaging aligns with what your audience responds to.`,
    );
  }

  if (trend === "rising") {
    items.push("Recent campaigns are gaining momentum — keep the current mix going.");
  }

  return items.slice(0, 3);
}

function buildWhatsDeclining(types: CampaignTypePerformance[], trend: EngagementTrend) {
  const items: string[] = [];

  if (trend === "declining") {
    items.push("Engagement has softened on recent campaigns — time to refresh the angle.");
  }

  const weakTypes = [...types]
    .sort((left, right) => left.averageScore - right.averageScore)
    .slice(0, 2);

  for (const entry of weakTypes) {
    if (entry.count >= 1 && entry.averageScore < 60) {
      items.push(
        `${formatTypeLabel(entry.campaignType)} campaigns are underperforming relative to your top formats.`,
      );
    }
  }

  return items.slice(0, 3);
}

function buildShouldChange(
  types: CampaignTypePerformance[],
  platformMix: PlatformMixStats,
  trend: EngagementTrend,
) {
  const items: string[] = [];

  if (platformMix.sms < platformMix.facebook && platformMix.sms < 2) {
    items.push("Add more SMS reminders to drive same-week showroom traffic.");
  }

  if (types.length >= 2) {
    const top = types[0]!;
    const underused = types.find(
      (entry) => entry.campaignType !== top.campaignType && entry.averageScore >= 65,
    );
    if (underused) {
      items.push(
        `Double down on ${formatTypeLabel(underused.campaignType)} — it converts well but runs less often.`,
      );
    }
  }

  if (trend === "declining") {
    items.push("Shift toward community events or high-urgency offers to re-engage your audience.");
  }

  if (items.length === 0) {
    items.push("Maintain your current rhythm and test one new campaign type this week.");
  }

  return items.slice(0, 3);
}

function defaultAnalysis(dealershipName: string): PerformanceAnalysis {
  return {
    dealershipName,
    totalCampaigns: 0,
    totalScheduledActions: 0,
    topPerformingTypes: [],
    bestPerformingTone: "energetic",
    highestRoiPatterns: [
      "Event campaigns typically drive the strongest lot traffic.",
      "Service reminders build repeat revenue with loyal owners.",
    ],
    engagementTrend: "unknown",
    engagementTrendDetail: "Generate your first campaign to unlock autopilot insights.",
    platformMix: { facebook: 0, instagram: 0, sms: 0, email: 0 },
    averageScore: 0,
    averageTrafficLift: 0,
    whatsWorking: [
      "Your dealership is ready for a structured weekly marketing rhythm.",
    ],
    whatsDeclining: [],
    shouldChange: [
      "Start with a community event to build engagement momentum.",
    ],
  };
}

export function analyzePerformanceHistory({
  dealershipName,
  analytics,
  memory,
  scheduledActions,
}: {
  dealershipName: string;
  analytics: CampaignAnalyticsRecord[];
  memory: DealershipMemoryProfile;
  scheduledActions: ScheduledMarketingAction[];
}): PerformanceAnalysis {
  const dealershipAnalytics = analytics.filter(
    (record) => record.dealershipName === dealershipName,
  );
  const dealershipActions = scheduledActions.filter(
    (action) => action.dealershipName === dealershipName,
  );

  if (dealershipAnalytics.length === 0) {
    return defaultAnalysis(dealershipName);
  }

  const topPerformingTypes = groupByType(dealershipAnalytics);
  const { trend, detail } = detectEngagementTrend(dealershipAnalytics);
  const platformMix = countPlatforms(dealershipActions);

  const topType = topPerformingTypes[0]?.campaignType;
  const bestPerformingTone =
    memory.preferredTone ?? (topType ? toneFromCampaignType(topType) : "energetic");

  const averageScore = Math.round(
    dealershipAnalytics.reduce((sum, record) => sum + record.performanceScore, 0) /
      dealershipAnalytics.length,
  );
  const averageTrafficLift =
    Math.round(
      (dealershipAnalytics.reduce(
        (sum, record) => sum + record.estimatedTrafficLift,
        0,
      ) /
        dealershipAnalytics.length) *
        10,
    ) / 10;

  return {
    dealershipName,
    totalCampaigns: dealershipAnalytics.length,
    totalScheduledActions: dealershipActions.length,
    topPerformingTypes,
    bestPerformingTone,
    highestRoiPatterns: buildHighestRoiPatterns(topPerformingTypes),
    engagementTrend: trend,
    engagementTrendDetail: detail,
    platformMix,
    averageScore,
    averageTrafficLift,
    whatsWorking: buildWhatsWorking(topPerformingTypes, memory, trend),
    whatsDeclining: buildWhatsDeclining(topPerformingTypes, trend),
    shouldChange: buildShouldChange(topPerformingTypes, platformMix, trend),
  };
}
