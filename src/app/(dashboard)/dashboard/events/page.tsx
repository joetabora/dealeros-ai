import { EventsWorkspace } from "@/components/events/events-workspace";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { listEvents } from "@/lib/events/repository";
import { requireSession } from "@/lib/auth/session";
import type { DealershipEvent } from "@/types/event";

export default async function EventsPage() {
  const session = await requireSession();

  let events: DealershipEvent[] = [];

  try {
    events = await listEvents();
  } catch {
    events = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="Events"
        description="Plan dealership events, track registrations, and measure show-floor conversion."
      />
      <EventsWorkspace
        initialEvents={events}
        dealershipName={session.dealer.name}
      />
    </PageContainer>
  );
}
