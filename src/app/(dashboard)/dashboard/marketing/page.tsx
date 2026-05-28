import { MarketingEngine } from "@/components/marketing/marketing-engine";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { listMarketingCampaigns } from "@/lib/marketing/repository";
import { requireSession } from "@/lib/auth/session";
import type { MarketingCampaign } from "@/types/marketing";

export default async function MarketingPage() {
  const session = await requireSession();

  let history: MarketingCampaign[] = [];

  try {
    history = await listMarketingCampaigns(10);
  } catch {
    history = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="One-Click Marketing"
        description="Enter one event or promotion idea and generate a complete dealership marketing campaign — strategy, social, SMS, email, timeline, and revenue CTAs."
      />
      <MarketingEngine
        initialHistory={history}
        defaultDealershipName={session.dealer.name}
      />
    </PageContainer>
  );
}
