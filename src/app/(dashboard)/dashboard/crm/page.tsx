import { CrmWorkspace } from "@/components/crm/crm-workspace";
import { FeatureGate } from "@/components/billing/feature-gate";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { getCrmDashboardAction } from "@/lib/crm/actions";
import { requireSession } from "@/lib/auth/session";

export default async function CrmPage() {
  const session = await requireSession();
  const result = await getCrmDashboardAction();

  if (result.error || !result.pipeline || !result.summary || !result.board) {
    return (
      <PageContainer>
        <PageHeader
          title="CRM Lite"
          description="Simple sales pipeline — know exactly what to do next to close every lead."
        />
        <p className="text-sm text-muted-foreground">
          {result.error ??
            "Unable to load CRM pipeline. Confirm Supabase migrations are applied."}
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="CRM Lite"
        description="Action-driven closing system — track follow-ups, prioritize high-intent leads, and convert marketing into sales."
      />
      <FeatureGate tenant={session.tenant} feature="crm_lite">
        <CrmWorkspace
          pipeline={result.pipeline}
          summary={result.summary}
          board={result.board}
        />
      </FeatureGate>
    </PageContainer>
  );
}
