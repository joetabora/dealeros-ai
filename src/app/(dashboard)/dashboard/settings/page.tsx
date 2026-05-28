import { ControlModePanel } from "@/components/approvals/control-mode-panel";
import { BillingPanel } from "@/components/billing/billing-panel";
import { PageContainer, PageHeader, PlaceholderPanel } from "@/components/layout/page-shell";
import { getBillingDashboardAction } from "@/lib/billing/actions";
import { getControlMode } from "@/lib/approval-system/repository";
import { canManageBilling } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import type { ControlMode } from "@/types/approval";

export default async function SettingsPage() {
  const session = await requireSession();
  let controlMode: ControlMode = "manual";

  try {
    controlMode = await getControlMode(session.user.id, session.dealer.name);
  } catch {
    controlMode = "manual";
  }

  const billing = await getBillingDashboardAction();
  const billingPlan = "plan" in billing ? billing.plan : session.tenant.plan;
  const billingStatus =
    "subscriptionStatus" in billing ? billing.subscriptionStatus : session.tenant.subscriptionStatus;
  const stripeEnabled = "stripeEnabled" in billing ? billing.stripeEnabled : false;

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage dealership profile, team access, billing, integrations, and AI control preferences."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <BillingPanel
          currentPlan={billingPlan ?? session.tenant.plan}
          subscriptionStatus={billingStatus ?? session.tenant.subscriptionStatus}
          canManageBilling={canManageBilling(session.tenant)}
          stripeEnabled={stripeEnabled ?? false}
        />
        <ControlModePanel initialMode={controlMode} />
        <PlaceholderPanel
          title="Dealership profile"
          description="Store name, locations, hours, and brand voice configuration."
        />
        <PlaceholderPanel
          title="Integrations"
          description="Connect CRM, DMS, and messaging providers."
        />
        <PlaceholderPanel
          title="Team & roles"
          description="Invite users and configure operational permissions (Owner, Manager, Marketer, Viewer)."
        />
      </div>
    </PageContainer>
  );
}
