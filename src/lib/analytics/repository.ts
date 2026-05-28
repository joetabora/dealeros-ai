import { createClient } from "@/lib/supabase/server";
import type {
  AnalyticsSummary,
  CampaignAnalyticsRecord,
  DealershipPerformanceInsight,
} from "@/types/analytics";

type AnalyticsRow = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  event_id: string | null;
  dealership_name: string;
  campaign_label: string;
  campaign_type: string;
  estimated_reach: number;
  estimated_engagement: number;
  estimated_traffic_lift: number;
  estimated_leads: number;
  estimated_revenue_impact: number;
  performance_score: number;
  created_at: string;
};

function mapRow(row: AnalyticsRow): CampaignAnalyticsRecord {
  return {
    id: row.id,
    userId: row.user_id,
    campaignId: row.campaign_id,
    eventId: row.event_id,
    dealershipName: row.dealership_name,
    campaignLabel: row.campaign_label,
    campaignType: row.campaign_type,
    estimatedReach: row.estimated_reach,
    estimatedEngagement: row.estimated_engagement,
    estimatedTrafficLift: Number(row.estimated_traffic_lift),
    estimatedLeads: row.estimated_leads,
    estimatedRevenueImpact: row.estimated_revenue_impact,
    performanceScore: row.performance_score,
    createdAt: row.created_at,
  };
}

export async function insertCampaignAnalytics({
  userId,
  campaignId,
  eventId,
  dealershipName,
  campaignLabel,
  campaignType,
  estimatedReach,
  estimatedEngagement,
  estimatedTrafficLift,
  estimatedLeads,
  estimatedRevenueImpact,
  performanceScore,
}: {
  userId: string;
  campaignId?: string | null;
  eventId?: string | null;
  dealershipName: string;
  campaignLabel: string;
  campaignType: string;
  estimatedReach: number;
  estimatedEngagement: number;
  estimatedTrafficLift: number;
  estimatedLeads: number;
  estimatedRevenueImpact: number;
  performanceScore: number;
}): Promise<CampaignAnalyticsRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_analytics")
    .insert({
      user_id: userId,
      campaign_id: campaignId ?? null,
      event_id: eventId ?? null,
      dealership_name: dealershipName,
      campaign_label: campaignLabel,
      campaign_type: campaignType,
      estimated_reach: estimatedReach,
      estimated_engagement: estimatedEngagement,
      estimated_traffic_lift: estimatedTrafficLift,
      estimated_leads: estimatedLeads,
      estimated_revenue_impact: estimatedRevenueImpact,
      performance_score: performanceScore,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as AnalyticsRow);
}

export async function listCampaignAnalytics(
  limit = 50,
): Promise<CampaignAnalyticsRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_analytics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as AnalyticsRow[]).map(mapRow);
}

export async function listTopPerformingCampaigns(
  limit = 5,
): Promise<CampaignAnalyticsRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_analytics")
    .select("*")
    .order("performance_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as AnalyticsRow[]).map(mapRow);
}

function formatTypeLabel(value: string) {
  return value.replace(/_/g, " ");
}

export function buildDealershipInsights(
  records: CampaignAnalyticsRecord[],
): DealershipPerformanceInsight[] {
  if (records.length === 0) {
    return [
      {
        text: "Generate your first campaign to unlock performance insights.",
        category: "campaign_type",
      },
    ];
  }

  const insights: DealershipPerformanceInsight[] = [];
  const byType = new Map<string, { score: number; count: number }>();

  for (const record of records) {
    const bucket = byType.get(record.campaignType) ?? { score: 0, count: 0 };
    bucket.score += record.performanceScore;
    bucket.count += 1;
    byType.set(record.campaignType, bucket);
  }

  const rankedTypes = [...byType.entries()]
    .map(([type, stats]) => ({
      type,
      average: stats.score / stats.count,
    }))
    .sort((left, right) => right.average - left.average);

  if (rankedTypes.length >= 2) {
    const top = rankedTypes[0]!;
    const second = rankedTypes[1]!;
    const delta = Math.round(top.average - second.average);
    if (delta > 0) {
      insights.push({
        text: `${formatTypeLabel(top.type)} campaigns outperform ${formatTypeLabel(second.type)} by ${delta}% in projected engagement.`,
        category: "campaign_type",
      });
    }
  }

  const avgSmsLift =
    records.reduce((sum, record) => sum + record.estimatedTrafficLift, 0) /
    records.length;
  if (avgSmsLift >= 18) {
    insights.push({
      text: "SMS reminders increase same-week turnout across your scheduled campaigns.",
      category: "channel",
    });
  }

  const topToneCampaign = records.find((record) =>
    ["bike_night", "event", "sale", "seasonal_sale"].includes(record.campaignType),
  );
  if (topToneCampaign) {
    insights.push({
      text: "Energetic tone improves attendance likelihood for event-style promotions.",
      category: "tone",
    });
  }

  const serviceCampaigns = records.filter((record) =>
    ["service", "service_promo", "service_clinic"].includes(record.campaignType),
  );
  if (serviceCampaigns.length > 0) {
    const avgLeads =
      serviceCampaigns.reduce((sum, record) => sum + record.estimatedLeads, 0) /
      serviceCampaigns.length;
    if (avgLeads >= 5) {
      insights.push({
        text: "Service campaigns generate higher lead conversion with repeat-value customers.",
        category: "campaign_type",
      });
    }
  }

  const highUrgency = records.filter((record) => record.estimatedTrafficLift >= 20);
  if (highUrgency.length >= 2) {
    insights.push({
      text: "Countdown-heavy schedules are lifting pre-event traffic across recent campaigns.",
      category: "timing",
    });
  }

  return insights.slice(0, 4);
}

export function buildAnalyticsSummary(
  records: CampaignAnalyticsRecord[],
): AnalyticsSummary {
  const topCampaigns = [...records]
    .sort((left, right) => right.performanceScore - left.performanceScore)
    .slice(0, 5);

  const totalCampaigns = records.length;
  const averageScore =
    totalCampaigns === 0
      ? 0
      : Math.round(
          records.reduce((sum, record) => sum + record.performanceScore, 0) /
            totalCampaigns,
        );
  const totalEstimatedRevenue = records.reduce(
    (sum, record) => sum + record.estimatedRevenueImpact,
    0,
  );
  const averageTrafficLift =
    totalCampaigns === 0
      ? 0
      : Math.round(
          (records.reduce((sum, record) => sum + record.estimatedTrafficLift, 0) /
            totalCampaigns) *
            10,
        ) / 10;

  return {
    totalCampaigns,
    averageScore,
    totalEstimatedRevenue,
    averageTrafficLift,
    topCampaigns,
    insights: buildDealershipInsights(records),
  };
}
