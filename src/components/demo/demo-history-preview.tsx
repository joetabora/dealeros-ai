import Link from "next/link";
import { History } from "lucide-react";

import type { DemoDealershipProfile } from "@/config/demo-dealerships";
import { getCampaignTypeLabel } from "@/lib/campaigns/validation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DemoHistoryPreviewProps = {
  dealership: DemoDealershipProfile;
  latestExcerpt?: string;
};

export function DemoHistoryPreview({
  dealership,
  latestExcerpt,
}: DemoHistoryPreviewProps) {
  const samples = latestExcerpt
    ? [
        {
          id: "live-generated",
          campaignType: dealership.input.campaignType,
          label: "Just generated — Full Campaign Pack",
          createdLabel: "Live demo",
          excerpt: latestExcerpt,
        },
        ...dealership.historySamples,
      ]
    : dealership.historySamples;

  return (
    <Card className="border-border/60 bg-card/40">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <CardTitle className="text-base">Campaign History</CardTitle>
          </div>
          <Link
            href="/dashboard/campaigns"
            className="text-xs text-primary hover:underline"
          >
            View full history in app
          </Link>
        </div>
        <CardDescription>
          Every campaign is saved automatically. Memory improves with each run.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {samples.map((sample) => (
          <div
            key={sample.id}
            className="rounded-xl border border-border/50 bg-background/40 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{sample.label}</p>
              <span className="text-xs text-muted-foreground">
                {sample.createdLabel}
              </span>
            </div>
            <div className="mt-2">
              <Badge variant="secondary">
                {getCampaignTypeLabel(sample.campaignType as never)}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{sample.excerpt}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
