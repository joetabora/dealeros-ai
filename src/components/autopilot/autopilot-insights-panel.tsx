import { TrendingDown, TrendingUp, Zap } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PerformanceAnalysis } from "@/types/autopilot";

type AutopilotInsightsPanelProps = {
  analysis: PerformanceAnalysis;
};

export function AutopilotInsightsPanel({ analysis }: AutopilotInsightsPanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <InsightCard
        title="What's Working"
        icon={TrendingUp}
        items={analysis.whatsWorking}
        tone="positive"
      />
      <InsightCard
        title="What's Declining"
        icon={TrendingDown}
        items={
          analysis.whatsDeclining.length > 0
            ? analysis.whatsDeclining
            : ["No major declines detected in recent campaigns."]
        }
        tone="neutral"
      />
      <InsightCard
        title="What Should Change"
        icon={Zap}
        items={analysis.shouldChange}
        tone="action"
      />
    </div>
  );
}

type InsightCardProps = {
  title: string;
  icon: typeof TrendingUp;
  items: string[];
  tone: "positive" | "neutral" | "action";
};

function InsightCard({ title, icon: Icon, items, tone }: InsightCardProps) {
  const borderClass =
    tone === "positive"
      ? "border-emerald-500/20 bg-emerald-500/5"
      : tone === "action"
        ? "border-primary/20 bg-primary/5"
        : "border-border/60 bg-card/40";

  return (
    <Card className={borderClass}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4" />
          {title}
        </CardTitle>
        <CardDescription>{analysisDetail(tone, items.length)}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm leading-6 text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function analysisDetail(tone: InsightCardProps["tone"], count: number) {
  if (tone === "positive") return `${count} positive signal${count === 1 ? "" : "s"}`;
  if (tone === "action") return `${count} recommended shift${count === 1 ? "" : "s"}`;
  return `${count} watch item${count === 1 ? "" : "s"}`;
}
