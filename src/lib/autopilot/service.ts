import { listCampaignAnalytics } from "@/lib/analytics/repository";
import { analyzePerformanceHistory } from "@/lib/autopilot/analyzer";
import {
  syncAutopilotLearning,
  syncAutopilotMemory,
} from "@/lib/autopilot/memory";
import { generateWeeklyPlan, updateWeeklyPlanDay } from "@/lib/autopilot/planner";
import { recommendNextCampaign } from "@/lib/autopilot/recommender";
import {
  getDealershipMemoryProfile,
  listDealershipMemory,
} from "@/lib/campaigns/memory/repository";
import { listLeads } from "@/lib/leads/repository";
import { listPipelineWithLeads } from "@/lib/crm/repository";
import { listScheduledActions } from "@/lib/scheduling/repository";
import type { AutopilotDashboard, WeeklyMarketingPlan } from "@/types/autopilot";

function loadStoredWeeklyPlan(
  records: Awaited<ReturnType<typeof listDealershipMemory>>,
): WeeklyMarketingPlan | null {
  const autopilotRecord = records.find(
    (record) => record.memoryType === "autopilot_state",
  );
  const stored = autopilotRecord?.memoryValue.weeklyPlan as
    | WeeklyMarketingPlan
    | undefined;
  return stored ?? null;
}

export async function buildAutopilotDashboard({
  userId,
  dealershipId,
  dealershipName,
  softUpdate = false,
}: {
  userId: string;
  dealershipId?: string;
  dealershipName: string;
  softUpdate?: boolean;
}): Promise<AutopilotDashboard> {
  const [analytics, scheduledActions, memory, memoryRecords, leads] = await Promise.all([
    listCampaignAnalytics(100, dealershipId),
    listScheduledActions(200),
    getDealershipMemoryProfile(userId, dealershipName),
    listDealershipMemory(userId, dealershipName),
    listLeads(200, dealershipId),
  ]);

  const pipeline = await listPipelineWithLeads(leads, 200);

  const analysis = analyzePerformanceHistory({
    dealershipName,
    analytics,
    memory,
    scheduledActions,
    leads,
    pipeline,
  });

  const recommendation = recommendNextCampaign({ analysis, memory });

  const storedPlan = softUpdate ? loadStoredWeeklyPlan(memoryRecords) : null;
  const weeklyPlan =
    storedPlan ??
    generateWeeklyPlan({
      dealershipName,
      analysis,
      recommendation,
    });

  const lastUpdated = new Date().toISOString();

  return {
    analysis,
    recommendation,
    weeklyPlan,
    lastUpdated,
  };
}

export async function runAutopilotCycle({
  userId,
  dealershipId,
  dealershipName,
  softUpdate = true,
}: {
  userId: string;
  dealershipId?: string;
  dealershipName: string;
  softUpdate?: boolean;
}) {
  try {
    const dashboard = await buildAutopilotDashboard({
      userId,
      dealershipId,
      dealershipName,
      softUpdate,
    });

    await syncAutopilotMemory({
      userId,
      dealershipName,
      dashboard,
    });

    await syncAutopilotLearning({
      userId,
      dealershipName,
      insights: [
        ...dashboard.analysis.whatsWorking,
        dashboard.recommendation.reasoning,
      ],
    });

    return dashboard;
  } catch {
    return null;
  }
}

export async function refreshAutopilotPlan({
  userId,
  dealershipName,
}: {
  userId: string;
  dealershipName: string;
}) {
  return runAutopilotCycle({
    userId,
    dealershipName,
    softUpdate: false,
  });
}

export async function saveWeeklyPlanUpdate({
  userId,
  dealershipId,
  dealershipName,
  dayId,
  updates,
}: {
  userId: string;
  dealershipId?: string;
  dealershipName: string;
  dayId: string;
  updates: Parameters<typeof updateWeeklyPlanDay>[2];
}) {
  const dashboard = await buildAutopilotDashboard({
    userId,
    dealershipId,
    dealershipName,
    softUpdate: true,
  });

  const weeklyPlan = updateWeeklyPlanDay(dashboard.weeklyPlan, dayId, updates);
  const updatedDashboard: AutopilotDashboard = {
    ...dashboard,
    weeklyPlan,
    lastUpdated: new Date().toISOString(),
  };

  await syncAutopilotMemory({
    userId,
    dealershipName,
    dashboard: updatedDashboard,
  });

  return updatedDashboard;
}

export async function runAutopilotForExecutedDealerships({
  userId,
  dealershipNames,
}: {
  userId: string;
  dealershipNames: string[];
}) {
  const uniqueNames = [...new Set(dealershipNames)];

  await Promise.all(
    uniqueNames.map((dealershipName) =>
      runAutopilotCycle({ userId, dealershipName, softUpdate: true }),
    ),
  );
}
