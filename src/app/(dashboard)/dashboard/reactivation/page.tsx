import { PageContainer, PageHeader, PlaceholderPanel } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export default function ReactivationPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Reactivation"
        description="Identify dormant leads, prioritize high-intent segments, and deploy win-back playbooks."
        actions={<Button>Start reactivation run</Button>}
      />
      <PlaceholderPanel
        title="Reactivation pipeline"
        description="Lead scoring, AI message drafts, and recovery performance dashboards will be built here."
      />
    </PageContainer>
  );
}
