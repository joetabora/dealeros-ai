import { CalendarWorkspace } from "@/components/calendar/calendar-workspace";
import { PendingApprovalBanner } from "@/components/approvals/pending-approval-banner";
import { FunnelTracker } from "@/components/conversion/funnel-tracker";
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
      <FunnelTracker stage="dependence" />
      <PageHeader
        title="Auto-Posting Schedule"
        description="See when posts, texts, and emails go out — your auto-posting system across every channel."
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
