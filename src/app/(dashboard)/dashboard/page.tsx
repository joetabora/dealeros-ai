import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { DashboardActionHub } from "@/components/dashboard/dashboard-action-hub";
import { listLeads } from "@/lib/leads/repository";
import { listMarketingCampaigns } from "@/lib/marketing/repository";
import { getOnboardingState } from "@/lib/onboarding/repository";
import { listScheduledActions } from "@/lib/scheduling/repository";
import { requireSession } from "@/lib/auth/session";

import type { DealershipLead } from "@/types/leads";
import type { MarketingCampaign } from "@/types/marketing";
import type { ScheduledMarketingAction } from "@/types/scheduling";

export default async function DashboardPage() {
  const session = await requireSession();
  const now = new Date();

  let campaigns: MarketingCampaign[] = [];
  let upcomingActions: ScheduledMarketingAction[] = [];
  let recentLeads: DealershipLead[] = [];

  try {
    [campaigns, upcomingActions, recentLeads] = await Promise.all([
      listMarketingCampaigns(5),
      listScheduledActions(20),
      listLeads(5, session.tenant.dealershipId),
    ]);
  } catch {
    campaigns = [];
    upcomingActions = [];
    recentLeads = [];
  }

  const futureActions = upcomingActions
    .filter((action) => new Date(action.scheduledFor) >= now)
    .sort(
      (a, b) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
    );

  const onboarding = await getOnboardingState({
    userId: session.user.id,
    dealershipId: session.tenant.dealershipId,
    dealershipName: session.tenant.dealershipName,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Home"
        description={`Welcome back, ${session.dealer.name}. Here is what to do next.`}
      />
      <DashboardActionHub
        campaigns={campaigns}
        upcomingActions={futureActions}
        recentLeads={recentLeads}
        onboarding={onboarding}
      />
    </PageContainer>
  );
}
