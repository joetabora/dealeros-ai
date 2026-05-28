import { notFound } from "next/navigation";

import { EventDetailView } from "@/components/events/event-detail-view";
import { PageContainer } from "@/components/layout/page-shell";
import { getEvent } from "@/lib/events/repository";
import { requireSession } from "@/lib/auth/session";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  await requireSession();
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <PageContainer>
      <EventDetailView event={event} />
    </PageContainer>
  );
}
