import { CalendarWorkspace } from "@/components/calendar/calendar-workspace";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { listScheduledActions } from "@/lib/scheduling/repository";
import { requireSession } from "@/lib/auth/session";
import type { ScheduledMarketingAction } from "@/types/scheduling";

export default async function CalendarPage() {
  await requireSession();

  let actions: ScheduledMarketingAction[] = [];

  try {
    actions = await listScheduledActions(200);
  } catch {
    actions = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="Marketing Calendar"
        description="Scheduled marketing auto-executes across Meta, SMS, and email when due — generate, schedule, and publish without manual posting."
      />
      <CalendarWorkspace initialActions={actions} />
    </PageContainer>
  );
}
