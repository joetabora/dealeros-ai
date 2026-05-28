"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";

import { AutopilotInsightsPanel } from "@/components/autopilot/autopilot-insights-panel";
import { NextCampaignCard } from "@/components/autopilot/next-campaign-card";
import { WeeklyPlanView } from "@/components/autopilot/weekly-plan-view";
import { refreshAutopilotAction } from "@/lib/autopilot/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { AutopilotDashboard } from "@/types/autopilot";

type AutopilotWorkspaceProps = {
  initialDashboard: AutopilotDashboard;
};

export function AutopilotWorkspace({ initialDashboard }: AutopilotWorkspaceProps) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(async () => {
      const result = await refreshAutopilotAction();
      if (result.dashboard) {
        setDashboard(result.dashboard);
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/40">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/15 text-primary">Autopilot Active</Badge>
              <Badge variant="secondary">
                {dashboard.analysis.totalCampaigns} campaigns analyzed
              </Badge>
              <Badge variant="secondary">
                Avg score {dashboard.analysis.averageScore}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {dashboard.analysis.engagementTrendDetail}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={handleRefresh}
          >
            <RefreshCw />
            Refresh plan
          </Button>
        </CardContent>
      </Card>

      <AutopilotInsightsPanel analysis={dashboard.analysis} />
      <NextCampaignCard recommendation={dashboard.recommendation} />
      <WeeklyPlanView key={dashboard.lastUpdated} initialPlan={dashboard.weeklyPlan} />
    </div>
  );
}
