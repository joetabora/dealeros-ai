import { PageContainer, PageHeader, PlaceholderPanel } from "@/components/layout/page-shell";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage dealership profile, team access, integrations, and AI preferences."
      />
      <div className="grid gap-4 md:grid-cols-2">
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
        <PlaceholderPanel
          title="AI preferences"
          description="Tone, compliance guardrails, and automation thresholds."
        />
      </div>
    </PageContainer>
  );
}
