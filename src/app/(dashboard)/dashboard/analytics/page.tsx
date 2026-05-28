import { AnalyticsWorkspace } from "@/components/analytics/analytics-workspace";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import {
  buildAnalyticsSummary,
  listCampaignAnalytics,
} from "@/lib/analytics/repository";
import { requireSession } from "@/lib/auth/session";
import { buildLeadCountsByCampaign, listLeads } from "@/lib/leads/repository";
import type { CampaignAnalyticsRecord } from "@/types/analytics";

export default async function AnalyticsPage() {
  const session = await requireSession();

  let records: CampaignAnalyticsRecord[] = [];
  let capturedLeadTotal = 0;
  let leadCountsByCampaign: Record<string, number> = {};

  try {
    const [analyticsRecords, leads] = await Promise.all([
      listCampaignAnalytics(50),
      listLeads(200),
    ]);
    records = analyticsRecords;
    capturedLeadTotal = leads.length;
    leadCountsByCampaign = Object.fromEntries(
      buildLeadCountsByCampaign(leads).entries(),
    );
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
        capturedLeadTotal={capturedLeadTotal}
        leadCountsByCampaign={leadCountsByCampaign}
      />
    </PageContainer>
  );
}
