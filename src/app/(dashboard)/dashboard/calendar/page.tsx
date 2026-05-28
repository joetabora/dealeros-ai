import { CalendarWorkspace } from "@/components/calendar/calendar-workspace";
import { PendingApprovalBanner } from "@/components/approvals/pending-approval-banner";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { listApprovals } from "@/lib/approval-system/repository";
import { listScheduledActions } from "@/lib/scheduling/repository";
import { requireSession } from "@/lib/auth/session";
import type { ApprovalStatus } from "@/types/approval";
import type { ScheduledMarketingAction } from "@/types/scheduling";

export default async function CalendarPage() {
  await requireSession();

  let actions: ScheduledMarketingAction[] = [];
  let approvalStatusByActionId: Record<string, ApprovalStatus> = {};
  let pendingApprovalCount = 0;

  try {
    actions = await listScheduledActions(200);
    const approvals = await listApprovals(200);
    pendingApprovalCount = approvals.filter((item) => item.status === "pending").length;

    approvalStatusByActionId = approvals.reduce<Record<string, ApprovalStatus>>(
      (map, approval) => {
        if (approval.scheduledActionId) {
          map[approval.scheduledActionId] = approval.status;
        }
        return map;
      },
      {},
    );
  } catch {
    actions = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="Marketing Calendar"
        description="Scheduled marketing runs across Meta, SMS, and email when approved and due — you stay in control at every step."
      />
      <div className="space-y-6">
        <PendingApprovalBanner count={pendingApprovalCount} />
        <CalendarWorkspace
          initialActions={actions}
          approvalStatusByActionId={approvalStatusByActionId}
          pendingApprovalCount={pendingApprovalCount}
        />
      </div>
    </PageContainer>
  );
}
