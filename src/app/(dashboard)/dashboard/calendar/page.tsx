import { MarketingCalendarView } from "@/components/calendar/marketing-calendar-view";
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
        description="Every campaign, event, and one-click marketing run is automatically scheduled — platform, timing, and content ready to publish."
      />
      <MarketingCalendarView actions={actions} />
    </PageContainer>
  );
}
