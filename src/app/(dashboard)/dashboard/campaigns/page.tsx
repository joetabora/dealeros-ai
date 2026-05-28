import Link from "next/link";
import { Plus } from "lucide-react";

import { CampaignHistoryList } from "@/components/campaigns/campaign-history-list";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { listCampaigns } from "@/lib/campaigns/repository";
import { requireSession } from "@/lib/auth/session";
import type { Campaign } from "@/types/campaign";

export default async function CampaignsHistoryPage() {
  await requireSession();

  let campaigns: Campaign[] = [];

  try {
    campaigns = await listCampaigns();
  } catch {
    campaigns = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="Campaign History"
        description="Every generated campaign is saved automatically. Revisit, copy, and reuse your dealership marketing packages."
        actions={
          <Button render={<Link href="/dashboard/campaigns/new" />}>
            <Plus />
            New campaign
          </Button>
        }
      />
      <CampaignHistoryList campaigns={campaigns} />
    </PageContainer>
  );
}
