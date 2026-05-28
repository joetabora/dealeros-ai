"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Rocket, Sparkles } from "lucide-react";

import { generateRecommendedCampaignAction } from "@/lib/autopilot/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CampaignRecommendation } from "@/types/autopilot";

type NextCampaignCardProps = {
  recommendation: CampaignRecommendation;
};

function formatType(value: string) {
  return value.replace(/_/g, " ");
}

export function NextCampaignCard({ recommendation }: NextCampaignCardProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleGenerate() {
    startTransition(async () => {
      setMessage(null);
      const result = await generateRecommendedCampaignAction();

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setMessage({
        type: "success",
        text: "Campaign generated and scheduled. View it in Marketing or Calendar.",
      });
    });
  }

  return (
    <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card/40 to-card/40">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary/15 text-primary">Next Best Campaign</Badge>
          <Badge variant="secondary">{formatType(recommendation.campaignType)}</Badge>
          <Badge variant="secondary">
            {formatType(recommendation.recommendedTone)} tone
          </Badge>
        </div>
        <CardTitle className="text-xl">{recommendation.eventOrOfferName}</CardTitle>
        <CardDescription className="text-base leading-7 text-foreground/80">
          {recommendation.reasoning}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail label="Urgency" value={recommendation.urgencyLevel} />
          <Detail label="Audience" value={recommendation.targetAudience} />
        </div>

        <div className="flex flex-wrap gap-2">
          <PlatformPill label="Facebook" count={recommendation.platformMix.facebook} />
          <PlatformPill label="Instagram" count={recommendation.platformMix.instagram} />
          <PlatformPill label="SMS" count={recommendation.platformMix.sms} />
          <PlatformPill label="Email" count={recommendation.platformMix.email} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={isPending} onClick={handleGenerate}>
            <Sparkles />
            Generate Now
          </Button>
          <Button
            type="button"
            variant="secondary"
            render={<Link href="/dashboard/marketing" />}
          >
            <Rocket />
            Open Marketing
          </Button>
        </div>

        {message ? (
          <div
            role="status"
            className={
              message.type === "error"
                ? "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                : "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400"
            }
          >
            {message.text}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

type DetailProps = {
  label: string;
  value: string;
};

function Detail({ label, value }: DetailProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/30 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize">{value.replace(/_/g, " ")}</p>
    </div>
  );
}

type PlatformPillProps = {
  label: string;
  count: number;
};

function PlatformPill({ label, count }: PlatformPillProps) {
  return (
    <Badge variant="secondary">
      {label} ×{count}
    </Badge>
  );
}
