import { PageContainer, PageHeader, PlaceholderPanel } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Events"
        description="Plan dealership events, track registrations, and measure show-floor conversion."
        actions={<Button>Schedule event</Button>}
      />
      <PlaceholderPanel
        title="Event calendar"
        description="Upcoming activations, capacity planning, and post-event follow-up workflows will appear here."
      />
    </PageContainer>
  );
}
