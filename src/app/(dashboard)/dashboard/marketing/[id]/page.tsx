import { notFound } from "next/navigation";

import { MarketingDetailView } from "@/components/marketing/marketing-detail-view";
import { PageContainer } from "@/components/layout/page-shell";
import { getMarketingCampaign } from "@/lib/marketing/repository";
import { requireSession } from "@/lib/auth/session";

type MarketingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MarketingDetailPage({
  params,
}: MarketingDetailPageProps) {
  await requireSession();
  const { id } = await params;
  const campaign = await getMarketingCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <PageContainer>
      <MarketingDetailView campaign={campaign} />
    </PageContainer>
  );
}
