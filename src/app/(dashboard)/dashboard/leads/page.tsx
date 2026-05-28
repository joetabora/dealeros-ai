import { LeadsWorkspace } from "@/components/leads/leads-workspace";
import { FunnelTracker } from "@/components/conversion/funnel-tracker";
import { ValueMomentBanner } from "@/components/conversion/value-moment";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { getLeadsDashboardAction } from "@/lib/leads/actions";
import { requireSession } from "@/lib/auth/session";
import { getOnboardingState } from "@/lib/onboarding/repository";

export default async function LeadsPage() {
  const session = await requireSession();
  const result = await getLeadsDashboardAction();
  const onboarding = await getOnboardingState({
    userId: session.user.id,
    dealershipId: session.tenant.dealershipId,
    dealershipName: session.tenant.dealershipName,
  });

  if (result.error || !result.leads || !result.summary) {
    return (
      <PageContainer>
        <PageHeader
          title="Leads"
          description="Structured contacts from marketing engagement — your revenue pipeline."
        />
        <p className="text-sm text-muted-foreground">
          {result.error ??
            "Unable to load leads. Confirm Supabase migration 20260527210000_leads.sql is applied."}
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FunnelTracker stage="attachment" />
      <PageHeader
        title="Leads"
        description="Every campaign interaction becomes a contact — captured automatically, ready for follow-up."
      />
      <div className="space-y-6">
        <ValueMomentBanner
          momentKey="lead_capture"
          alreadySeen={onboarding.valueMomentsSeen.includes("lead_capture")}
        />
        <LeadsWorkspace leads={result.leads} summary={result.summary} />
      </div>
    </PageContainer>
  );
}
