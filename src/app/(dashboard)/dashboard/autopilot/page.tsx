import { AutopilotWorkspace } from "@/components/autopilot/autopilot-workspace";
import { FeatureGate } from "@/components/billing/feature-gate";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { buildAutopilotDashboard } from "@/lib/autopilot/service";
import { requireSession } from "@/lib/auth/session";
import type { AutopilotDashboard } from "@/types/autopilot";

export default async function AutopilotPage() {
  const session = await requireSession();

  let dashboard: AutopilotDashboard | null = null;

  try {
    dashboard = await buildAutopilotDashboard({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.dealer.name,
      softUpdate: true,
    });
  } catch {
    dashboard = null;
  }

  if (!dashboard) {
    return (
      <PageContainer>
        <PageHeader
          title="Marketing Autopilot"
          description="Self-improving recommendations and weekly plans based on your campaign performance."
        />
        <p className="text-sm text-muted-foreground">
          Unable to load autopilot. Confirm Supabase migrations are applied and generate
          at least one campaign.
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Marketing Autopilot"
        description="It tells you exactly what to do next — analyze performance, recommend campaigns, and plan your week automatically."
      />
      <FeatureGate tenant={session.tenant} feature="autopilot">
        <AutopilotWorkspace initialDashboard={dashboard} />
      </FeatureGate>
    </PageContainer>
  );
}
