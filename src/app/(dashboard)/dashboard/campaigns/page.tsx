import { CampaignGenerator } from "@/components/campaigns/campaign-generator";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { listAiGenerations } from "@/lib/campaigns/repository";
import { requireSession } from "@/lib/auth/session";
import type { AiGeneration } from "@/types/campaign";

export default async function CampaignsPage() {
  const session = await requireSession();

  let history: AiGeneration[] = [];

  try {
    history = await listAiGenerations();
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
