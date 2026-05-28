"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { getCampaignTypeLabel } from "@/lib/campaigns/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/types/campaign";

type CampaignHistoryListProps = {
  campaigns: Campaign[];
  className?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CampaignHistoryList({
  campaigns,
  className,
}: CampaignHistoryListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {campaigns.length} saved campaign{campaigns.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button render={<Link href="/dashboard/campaigns/new" />}>
          <Plus />
          New campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-card/20">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">No campaigns yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Generate your first campaign package and it will appear here
                automatically.
              </p>
            </div>
            <Button render={<Link href="/dashboard/campaigns/new" />}>
              <Plus />
              Create first campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/dashboard/campaigns/${campaign.id}`}
              className="block"
            >
              <Card className="border-border/60 bg-card/40 transition-colors hover:border-primary/30 hover:bg-card/70">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {campaign.dealershipName}
                    </CardTitle>
                    <CardDescription>
                      {getCampaignTypeLabel(campaign.campaignType)}
                    </CardDescription>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(campaign.createdAt)}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {getCampaignTypeLabel(campaign.campaignType)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {campaign.inputsJson.platform.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary">
                      {campaign.inputsJson.tone.replace("_", " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
