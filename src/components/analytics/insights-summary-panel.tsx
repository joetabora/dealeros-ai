import { Lightbulb } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DealershipPerformanceInsight } from "@/types/analytics";

type InsightsSummaryPanelProps = {
  insights: DealershipPerformanceInsight[];
  dealershipName: string;
};

export function InsightsSummaryPanel({
  insights,
  dealershipName,
}: InsightsSummaryPanelProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="size-5 text-primary" />
          What&apos;s Working For {dealershipName}
        </CardTitle>
        <CardDescription>
          Simulated performance patterns based on your campaigns, events, and
          scheduled executions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight, index) => (
            <li
              key={`${insight.category}-${index}`}
              className="rounded-lg border border-border/60 bg-background/40 px-4 py-3 text-sm leading-6"
            >
              {insight.text}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
