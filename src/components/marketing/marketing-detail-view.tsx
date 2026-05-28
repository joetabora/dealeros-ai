import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MarketingResults } from "@/components/marketing/marketing-results";
import { PageHeader } from "@/components/layout/page-shell";
import { getMarketingTypeLabel } from "@/lib/marketing/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MarketingCampaign } from "@/types/marketing";

type MarketingDetailViewProps = {
  campaign: MarketingCampaign;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MarketingDetailView({ campaign }: MarketingDetailViewProps) {
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        render={<Link href="/dashboard/marketing" />}
      >
        <ArrowLeft />
        Back to marketing
      </Button>

      <PageHeader
        title={campaign.eventOrOfferName}
        description={`${campaign.dealershipName} · Generated ${formatDate(campaign.createdAt)}`}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {getMarketingTypeLabel(campaign.campaignType)}
        </Badge>
        <Badge className="bg-primary/15 text-primary">
          Full marketing engine output
        </Badge>
      </div>

      <MarketingResults outputs={campaign.outputsJson} editable={false} />
    </div>
  );
}
