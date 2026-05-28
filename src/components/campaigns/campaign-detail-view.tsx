import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CampaignResults } from "@/components/campaigns/campaign-results";
import { DeleteCampaignButton } from "@/components/campaigns/delete-campaign-button";
import { PageHeader } from "@/components/layout/page-shell";
import {
  getCampaignPlatformLabel,
  getCampaignToneLabel,
  getCampaignTypeLabel,
} from "@/lib/campaigns/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/types/campaign";

type CampaignDetailViewProps = {
  campaign: Campaign;
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

export function CampaignDetailView({ campaign }: CampaignDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          render={<Link href="/dashboard/campaigns" />}
        >
          <ArrowLeft />
          Back to history
        </Button>
        <DeleteCampaignButton campaignId={campaign.id} />
      </div>

      <PageHeader
        title={campaign.dealershipName}
        description={`Generated ${formatDate(campaign.createdAt)} · ${getCampaignTypeLabel(campaign.campaignType)}`}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {getCampaignTypeLabel(campaign.campaignType)}
        </Badge>
        <Badge variant="secondary">
          {getCampaignToneLabel(campaign.inputsJson.tone)}
        </Badge>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {getCampaignPlatformLabel(campaign.inputsJson.platform)}
        </Badge>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/30 p-4">
        <p className="text-sm font-medium">Target audience</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {campaign.inputsJson.targetAudience}
        </p>
      </div>

      <CampaignResults outputs={campaign.outputsJson} editable={false} />
    </div>
  );
}
