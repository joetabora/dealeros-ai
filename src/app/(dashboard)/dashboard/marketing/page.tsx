import { MarketingEngine } from "@/components/marketing/marketing-engine";
import { PendingApprovalBanner } from "@/components/approvals/pending-approval-banner";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { listPendingApprovals } from "@/lib/approval-system/repository";
import { requireSession } from "@/lib/auth/session";
import { listMarketingCampaigns } from "@/lib/marketing/repository";
import type { MarketingCampaign } from "@/types/marketing";

export default async function MarketingPage() {
  const session = await requireSession();

  let history: MarketingCampaign[] = [];
  let pendingApprovalCount = 0;

  try {
    history = await listMarketingCampaigns(10);
    const pending = await listPendingApprovals(50);
    pendingApprovalCount = pending.length;
  } catch {
    history = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="Campaigns"
        description="Enter one idea — get social posts, texts, emails, and your posting schedule in seconds."
      />
      <div className="space-y-6">
        <PendingApprovalBanner count={pendingApprovalCount} />
        <MarketingEngine
          initialHistory={history}
          defaultDealershipName={session.dealer.name}
        />
      </div>
    </PageContainer>
  );
}
