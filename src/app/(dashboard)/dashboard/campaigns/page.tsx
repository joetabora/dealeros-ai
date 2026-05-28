import { PageContainer, PageHeader, PlaceholderPanel } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export default function CampaignsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Campaigns"
        description="Build, launch, and monitor AI-assisted outbound and nurture sequences."
        actions={<Button>Create campaign</Button>}
      />
      <PlaceholderPanel
        title="Campaign workspace"
        description="Campaign builder, audience targeting, and performance analytics will live here."
      />
    </PageContainer>
  );
}
