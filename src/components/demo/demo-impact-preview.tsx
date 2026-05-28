import { TrendingUp, Users, Zap } from "lucide-react";

import type { DemoImpactMetrics } from "@/config/demo-dealerships";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DemoImpactPreviewProps = {
  impact: DemoImpactMetrics;
};

const METRICS = [
  {
    key: "engagementLift" as const,
    label: "Estimated engagement",
    icon: TrendingUp,
  },
  {
    key: "attendanceLift" as const,
    label: "Expected event attendance lift",
    icon: Users,
  },
  {
    key: "followUpLift" as const,
    label: "Lead follow-up improvement",
    icon: Zap,
  },
];

export function DemoImpactPreview({ impact }: DemoImpactPreviewProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-card/40">
      <CardHeader>
        <CardTitle>Campaign Impact Preview</CardTitle>
        <CardDescription>
          Simulated performance lift based on this dealership&apos;s profile and
          campaign history patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {METRICS.map((metric) => (
            <div
              key={metric.key}
              className="rounded-xl border border-border/60 bg-background/50 p-4"
            >
              <div className="mb-2 flex items-center gap-2 text-primary">
                <metric.icon className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {metric.label}
                </span>
              </div>
              <p className="text-3xl font-semibold tracking-tight text-primary">
                +{impact[metric.key]}%
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Mock projection for demo purposes — not a live performance guarantee.
        </p>
      </CardContent>
    </Card>
  );
}
