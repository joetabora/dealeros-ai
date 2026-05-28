import { CampaignGenerator } from "@/components/campaigns/campaign-generator";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { listCampaigns } from "@/lib/campaigns/repository";
import { requireSession } from "@/lib/auth/session";
import type { Campaign } from "@/types/campaign";

export default async function NewCampaignPage() {
  const session = await requireSession();

  let history: Campaign[] = [];

  try {
    history = await listCampaigns(10);
  } catch {
    history = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Campaign Generator"
        description="Generate dealership-native marketing copy for events, promos, reactivation, and seasonal pushes across every channel."
      />
      <CampaignGenerator
        initialHistory={history}
        defaultDealershipName={session.dealer.name}
      />
    </PageContainer>
  );
}
