import { AnalyticsWorkspace } from "@/components/analytics/analytics-workspace";
import { FunnelTracker } from "@/components/conversion/funnel-tracker";
import { ValueMomentBanner } from "@/components/conversion/value-moment";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import {
  buildAnalyticsSummary,
  listCampaignAnalytics,
} from "@/lib/analytics/repository";
import { requireSession } from "@/lib/auth/session";
import { buildLeadCountsByCampaign, listLeads } from "@/lib/leads/repository";
import { getOnboardingState } from "@/lib/onboarding/repository";
import type { CampaignAnalyticsRecord } from "@/types/analytics";

export default async function AnalyticsPage() {
  const session = await requireSession();

  let records: CampaignAnalyticsRecord[] = [];
  let capturedLeadTotal = 0;
  let leadCountsByCampaign: Record<string, number> = {};

  try {
    const [analyticsRecords, leads] = await Promise.all([
      listCampaignAnalytics(50, session.tenant.dealershipId),
      listLeads(200, session.tenant.dealershipId),
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
  const onboarding = await getOnboardingState({
    userId: session.user.id,
    dealershipId: session.tenant.dealershipId,
    dealershipName: session.tenant.dealershipName,
  });

  return (
    <PageContainer>
      <FunnelTracker stage="engagement" />
      <PageHeader
        title="What's Working"
        description="See what's driving results — engagement, leads, and where your marketing is headed."
      />
      <div className="space-y-6">
        <ValueMomentBanner
          momentKey="analytics_view"
          alreadySeen={onboarding.valueMomentsSeen.includes("analytics_view")}
        />
        <AnalyticsWorkspace
        records={records}
        summary={summary}
        dealershipName={session.dealer.name}
        capturedLeadTotal={capturedLeadTotal}
        leadCountsByCampaign={leadCountsByCampaign}
      />
      </div>
    </PageContainer>
  );
}
