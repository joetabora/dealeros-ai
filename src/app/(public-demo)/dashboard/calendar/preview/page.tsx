import { DemoCalendarPreview } from "@/components/calendar/demo-calendar-preview";
import { PageContainer } from "@/components/layout/page-shell";

export const metadata = {
  title: "Campaign Timeline Preview",
};

type CalendarPreviewPageProps = {
  searchParams: Promise<{ dealership?: string }>;
};

export default async function CalendarPreviewPage({
  searchParams,
}: CalendarPreviewPageProps) {
  const params = await searchParams;

  return (
    <PageContainer>
      <DemoCalendarPreview initialDealershipId={params.dealership} />
    </PageContainer>
  );
}
