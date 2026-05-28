import type { CampaignAnalyticsRecord } from "@/types/analytics";

type PerformanceChartProps = {
  records: CampaignAnalyticsRecord[];
};

export function PerformanceChart({ records }: PerformanceChartProps) {
  const chartRecords = records.slice(0, 6).reverse();
  const maxScore = Math.max(...chartRecords.map((record) => record.performanceScore), 1);

  if (chartRecords.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/70 text-sm text-muted-foreground">
        Performance trends appear after your first analyzed campaign.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex h-52 items-end gap-3">
        {chartRecords.map((record) => {
          const height = Math.max(12, (record.performanceScore / maxScore) * 100);

          return (
            <div
              key={record.id}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-primary">
                {record.performanceScore}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary"
                  style={{ height: `${height}%` }}
                  title={`${record.campaignLabel}: ${record.performanceScore}`}
                />
              </div>
              <span className="line-clamp-2 text-center text-[10px] text-muted-foreground">
                {record.campaignLabel}
              </span>
            </div>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {chartRecords.slice(-3).map((record) => (
          <div
            key={`${record.id}-lift`}
            className="rounded-lg border border-border/60 bg-background/30 p-3 text-sm"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Traffic lift
            </p>
            <p className="mt-1 font-semibold">+{record.estimatedTrafficLift}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
