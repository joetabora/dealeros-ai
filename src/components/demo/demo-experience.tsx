"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Handshake, Sparkles, Wand2 } from "lucide-react";

import { CampaignResults } from "@/components/campaigns/campaign-results";
import { CopyButton } from "@/components/campaigns/copy-button";
import { DemoHistoryPreview } from "@/components/demo/demo-history-preview";
import { DemoImpactPreview } from "@/components/demo/demo-impact-preview";
import { DemoMemoryInsight } from "@/components/demo/demo-memory-insight";
import {
  DEMO_DEALERSHIPS,
  type DemoDealershipProfile,
} from "@/config/demo-dealerships";
import {
  enableDemoModeAction,
  generateDemoCampaignPackAction,
  type DemoCampaignPack,
} from "@/lib/demo/actions";
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

const STEPS = [
  "Select a dealership",
  "Generate a full campaign pack",
  "Review outputs and impact",
];

export function DemoExperience() {
  const [selectedId, setSelectedId] = useState(DEMO_DEALERSHIPS[0]!.id);
  const [pack, setPack] = useState<DemoCampaignPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected =
    DEMO_DEALERSHIPS.find((dealer) => dealer.id === selectedId) ??
    DEMO_DEALERSHIPS[0]!;

  function handleSelect(dealer: DemoDealershipProfile) {
    setSelectedId(dealer.id);
    setPack(null);
    setError(null);
  }

  function handleGenerate() {
    startTransition(async () => {
      setError(null);
      await enableDemoModeAction();
      const result = await generateDemoCampaignPackAction(selected.id);

      if (result.error || !result.pack) {
        setError(result.error ?? "Generation failed.");
        return;
      }

      setPack(result.pack);
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 text-center">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Live Dealership Demo
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Watch this.
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          DealerOS AI generates a full dealership marketing pack in seconds —
          Facebook, Instagram, SMS, email, ads, and CTAs — already tuned to
          each store&apos;s voice.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <Badge key={step} variant="secondary">
              {index + 1}. {step}
            </Badge>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {DEMO_DEALERSHIPS.map((dealer) => {
          const isSelected = dealer.id === selectedId;

          return (
            <button
              key={dealer.id}
              type="button"
              onClick={() => handleSelect(dealer)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                isSelected
                  ? "border-primary/40 bg-primary/10 ring-1 ring-primary/20"
                  : "border-border/60 bg-card/40 hover:border-primary/20 hover:bg-card/70",
              )}
            >
              <p className="font-semibold">{dealer.name}</p>
              <p className="mt-1 text-xs text-primary">{dealer.highlight}</p>
              <p className="mt-2 text-sm text-muted-foreground">{dealer.tagline}</p>
            </button>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="border-border/60 bg-card/50">
            <CardHeader>
              <CardTitle>Generate Full Campaign Pack</CardTitle>
              <CardDescription>
                One click. All channels. Pre-filled for {selected.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-border/50 bg-background/40 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Dealership</p>
                  <p className="font-medium">{selected.input.dealershipName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Campaign type</p>
                  <p className="font-medium capitalize">
                    {selected.input.campaignType.replace("_", " ")}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Target audience</p>
                  <p className="font-medium">{selected.input.targetAudience}</p>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </div>
              ) : null}

              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Sparkles />
                    Generating campaign pack...
                  </>
                ) : (
                  <>
                    <Wand2 />
                    Generate Full Campaign Pack
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {pack ? (
            <div className="space-y-6">
              <DemoImpactPreview impact={pack.dealership.impact} />

              <Card className="border-border/60 bg-card/50">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle className="text-base">Event Promo Variation</CardTitle>
                    <CardDescription>
                      Bonus event-focused post tuned for lot traffic.
                    </CardDescription>
                  </div>
                  <CopyButton value={pack.eventPromoVariation} />
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-border/50 bg-background/40 p-4 text-sm leading-6 whitespace-pre-wrap">
                    {pack.eventPromoVariation}
                  </div>
                </CardContent>
              </Card>

              <CampaignResults outputs={pack.outputs} editable={false} />

              <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-card/40">
                <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <p className="font-semibold">Ready to close the deal?</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open the Closing Kit with ROI estimates, objection
                      responses, and a one-click proposal for {selected.name}.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    render={
                      <Link
                        href={`/dashboard/closing-kit?dealership=${selected.id}&excerpt=${encodeURIComponent(pack.outputs.facebookPost.slice(0, 240))}`}
                      />
                    }
                  >
                    <Handshake />
                    Open Closing Kit
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-dashed border-border/70 bg-card/20">
              <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 py-12 text-center">
                <Sparkles className="size-8 text-primary/70" />
                <p className="font-medium">Your campaign pack appears here</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Select a dealership and hit generate. Results show up instantly
                  — no onboarding, no setup, no explanation needed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <DemoMemoryInsight dealership={selected} />
          <DemoHistoryPreview
            dealership={selected}
            latestExcerpt={pack?.outputs.facebookPost.slice(0, 120)}
          />
        </div>
      </div>
    </div>
  );
}
