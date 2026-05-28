import { formatCurrency } from "@/lib/closing-kit/roi-calculator";
import { CampaignAnalyticsCard } from "@/components/analytics/campaign-analytics-card";
import { InsightsSummaryPanel } from "@/components/analytics/insights-summary-panel";
import { PerformanceChart } from "@/components/analytics/performance-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalyticsSummary, CampaignAnalyticsRecord } from "@/types/analytics";

type AnalyticsWorkspaceProps = {
  records: CampaignAnalyticsRecord[];
  summary: AnalyticsSummary;
  dealershipName: string;
  capturedLeadTotal?: number;
  leadCountsByCampaign?: Record<string, number>;
};

export function AnalyticsWorkspace({
  records,
  summary,
  dealershipName,
  capturedLeadTotal = 0,
  leadCountsByCampaign = {},
}: AnalyticsWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryStat label="Campaigns analyzed" value={String(summary.totalCampaigns)} />
        <SummaryStat label="Avg. performance score" value={String(summary.averageScore)} />
        <SummaryStat
          label="Est. revenue impact"
          value={formatCurrency(summary.totalEstimatedRevenue)}
        />
        <SummaryStat
          label="Avg. traffic lift"
          value={`+${summary.averageTrafficLift}%`}
        />
        <SummaryStat label="Captured leads" value={String(capturedLeadTotal)} />
      </div>

      <InsightsSummaryPanel insights={summary.insights} dealershipName={dealershipName} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Recent campaign scores and projected traffic lift.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart records={records} />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle>ROI Estimates</CardTitle>
            <CardDescription>
              Simulated business impact from leads, close rates, and campaign type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create a marketing campaign or schedule an event to generate ROI
                projections.
              </p>
            ) : (
              summary.topCampaigns.slice(0, 4).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{record.campaignLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      Score {record.performanceScore} · {record.estimatedLeads} est. leads
                      {record.campaignId && leadCountsByCampaign[record.campaignId]
                        ? ` · ${leadCountsByCampaign[record.campaignId]} captured`
                        : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(record.estimatedRevenueImpact)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Top Performing Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            Ranked by performance score across reach, engagement, traffic, and memory alignment.
          </p>
        </div>
        {summary.topCampaigns.length === 0 ? (
          <Card className="border-dashed border-border/70 bg-card/20">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No analytics yet. Run the one-click marketing engine or create an event to
              unlock performance intelligence.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {summary.topCampaigns.map((record, index) => (
              <CampaignAnalyticsCard
                key={record.id}
                record={record}
                rank={index + 1}
                capturedLeads={
                  record.campaignId
                    ? leadCountsByCampaign[record.campaignId] ?? 0
                    : 0
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type SummaryStatProps = {
  label: string;
  value: string;
};

function SummaryStat({ label, value }: SummaryStatProps) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
