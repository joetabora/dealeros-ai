import { notFound } from "next/navigation";

import { CampaignDetailView } from "@/components/campaigns/campaign-detail-view";
import { PageContainer } from "@/components/layout/page-shell";
import { getCampaign } from "@/lib/campaigns/repository";
import { requireSession } from "@/lib/auth/session";

type CampaignDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  await requireSession();
  const { id } = await params;
  const campaign = await getCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <PageContainer>
      <CampaignDetailView campaign={campaign} />
    </PageContainer>
  );
}
