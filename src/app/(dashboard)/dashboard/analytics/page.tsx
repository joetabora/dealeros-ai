import { AnalyticsWorkspace } from "@/components/analytics/analytics-workspace";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import {
  buildAnalyticsSummary,
  listCampaignAnalytics,
} from "@/lib/analytics/repository";
import { requireSession } from "@/lib/auth/session";
import type { CampaignAnalyticsRecord } from "@/types/analytics";

export default async function AnalyticsPage() {
  const session = await requireSession();

  let records: CampaignAnalyticsRecord[] = [];

  try {
    records = await listCampaignAnalytics(50);
  } catch {
    records = [];
  }

  const summary = buildAnalyticsSummary(records);

  return (
    <PageContainer>
      <PageHeader
        title="Revenue Intelligence"
        description="Simulated ROI, traffic impact, and performance insights — see what's working and where your marketing is headed."
      />
      <AnalyticsWorkspace
        records={records}
        summary={summary}
        dealershipName={session.dealer.name}
      />
    </PageContainer>
  );
}
