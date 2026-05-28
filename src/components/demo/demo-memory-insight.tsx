import { Brain } from "lucide-react";

import type { DemoDealershipProfile } from "@/config/demo-dealerships";
import { getCampaignTypeLabel, getCampaignToneLabel } from "@/lib/campaigns/validation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DemoMemoryInsightProps = {
  dealership: DemoDealershipProfile;
};

export function DemoMemoryInsight({ dealership }: DemoMemoryInsightProps) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="size-4 text-primary" />
          <CardTitle className="text-base">Dealership Memory Active</CardTitle>
        </div>
        <CardDescription>
          DealerOS already knows how {dealership.name} communicates — no setup
          required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {dealership.memory.preferredTone ? (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Tone: {getCampaignToneLabel(dealership.memory.preferredTone as never)}
            </Badge>
          ) : null}
          {dealership.memory.preferredCampaignType ? (
            <Badge variant="secondary">
              Focus:{" "}
              {getCampaignTypeLabel(dealership.memory.preferredCampaignType as never)}
            </Badge>
          ) : null}
          <Badge variant="secondary">Pre-trained profile</Badge>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {dealership.memoryBullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
