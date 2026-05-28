import { ApprovalsWorkspace } from "@/components/approvals/approvals-workspace";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { getApprovalsDashboardAction } from "@/lib/approval-system/actions";

export default async function ApprovalsPage() {
  const result = await getApprovalsDashboardAction();

  if (result.error || !result.pending) {
    return (
      <PageContainer>
        <PageHeader
          title="Approvals"
          description="Review and approve AI-generated marketing before it goes live."
        />
        <p className="text-sm text-muted-foreground">
          {result.error ??
            "Unable to load approvals. Confirm Supabase migrations are applied."}
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Approvals"
        description="AI does the work — you approve what goes live. Review, edit, reject, or force-send any scheduled marketing action."
      />
      <ApprovalsWorkspace
        pending={result.pending}
        recent={result.recent ?? []}
        auditLog={result.auditLog ?? []}
        controlMode={result.controlMode ?? "manual"}
      />
    </PageContainer>
  );
}
