import { EventsWorkspace } from "@/components/events/events-workspace";
import { PendingApprovalBanner } from "@/components/approvals/pending-approval-banner";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { listPendingApprovals } from "@/lib/approval-system/repository";
import { listEvents } from "@/lib/events/repository";
import { requireSession } from "@/lib/auth/session";
import type { DealershipEvent } from "@/types/event";

export default async function EventsPage() {
  const session = await requireSession();

  let events: DealershipEvent[] = [];
  let pendingApprovalCount = 0;

  try {
    events = await listEvents();
    const pending = await listPendingApprovals(50);
    pendingApprovalCount = pending.length;
  } catch {
    events = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="Events"
        description="Plan dealership events, auto-generate promotion packs, and approve content before it goes live."
      />
      <div className="space-y-6">
        <PendingApprovalBanner count={pendingApprovalCount} />
        <EventsWorkspace
          initialEvents={events}
          dealershipName={session.dealer.name}
        />
      </div>
    </PageContainer>
  );
}
