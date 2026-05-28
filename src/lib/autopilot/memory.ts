import { upsertDealershipMemory } from "@/lib/campaigns/memory/repository";
import type { AutopilotDashboard } from "@/types/autopilot";

export async function syncAutopilotMemory({
  userId,
  dealershipName,
  dashboard,
}: {
  userId: string;
  dealershipName: string;
  dashboard: AutopilotDashboard;
}) {
  await upsertDealershipMemory({
    userId,
    dealershipName,
    memoryType: "autopilot_state",
    memoryValue: {
      lastUpdated: dashboard.lastUpdated,
      recommendation: dashboard.recommendation,
      weeklyPlan: dashboard.weeklyPlan,
      analysisSummary: {
        averageScore: dashboard.analysis.averageScore,
        engagementTrend: dashboard.analysis.engagementTrend,
        topType: dashboard.analysis.topPerformingTypes[0]?.campaignType ?? null,
        whatsWorking: dashboard.analysis.whatsWorking,
        whatsDeclining: dashboard.analysis.whatsDeclining,
        shouldChange: dashboard.analysis.shouldChange,
      },
      patternSignals: dashboard.analysis.highestRoiPatterns,
      source: "autopilot",
    },
  });
}

export async function syncAutopilotLearning({
  userId,
  dealershipName,
  insights,
}: {
  userId: string;
  dealershipName: string;
  insights: string[];
}) {
  if (insights.length === 0) return;

  await upsertDealershipMemory({
    userId,
    dealershipName,
    memoryType: "performance_insights",
    memoryValue: {
      autopilotInsights: insights,
      source: "autopilot",
      updatedAt: new Date().toISOString(),
    },
  });
}
