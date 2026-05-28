import { ControlModePanel } from "@/components/approvals/control-mode-panel";
import { PageContainer, PageHeader, PlaceholderPanel } from "@/components/layout/page-shell";
import { getControlMode } from "@/lib/approval-system/repository";
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

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage dealership profile, team access, integrations, and AI control preferences."
      />
      <div className="grid gap-4 md:grid-cols-2">
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
          description="Invite users and configure operational permissions."
        />
      </div>
    </PageContainer>
  );
}
