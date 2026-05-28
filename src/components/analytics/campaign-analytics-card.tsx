import { formatCurrency } from "@/lib/closing-kit/roi-calculator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CampaignAnalyticsRecord } from "@/types/analytics";

type CampaignAnalyticsCardProps = {
  record: CampaignAnalyticsRecord;
  rank?: number;
  capturedLeads?: number;
};

function formatTypeLabel(value: string) {
  return value.replace(/_/g, " ");
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-primary";
  return "text-amber-400";
}

export function CampaignAnalyticsCard({
  record,
  rank,
  capturedLeads = 0,
}: CampaignAnalyticsCardProps) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {rank ? (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                #{rank}
              </Badge>
            ) : null}
            <CardTitle className="text-base">{record.campaignLabel}</CardTitle>
          </div>
          <CardDescription>
            {record.dealershipName} · {formatTypeLabel(record.campaignType)}
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Score
          </p>
          <p className={cn("text-2xl font-semibold", scoreColor(record.performanceScore))}>
            {record.performanceScore}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Est. revenue" value={formatCurrency(record.estimatedRevenueImpact)} />
          <Metric label="Traffic lift" value={`+${record.estimatedTrafficLift}%`} />
          <Metric label="Engagement" value={record.estimatedEngagement.toLocaleString()} />
          <Metric label="Est. leads" value={String(record.estimatedLeads)} />
          <Metric
            label="Captured leads"
            value={String(capturedLeads)}
            highlight={capturedLeads > 0}
          />
        </div>
      </CardContent>
    </Card>
  );
}

type MetricProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function Metric({ label, value, highlight }: MetricProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/30 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm font-semibold", highlight && "text-emerald-400")}>
        {value}
      </p>
    </div>
  );
}
