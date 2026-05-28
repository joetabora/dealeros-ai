"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

import { getContextualSetupMessage } from "@/lib/conversion/funnel";
import { Button } from "@/components/ui/button";
import type { OnboardingState } from "@/types/onboarding";

type SetupBannerProps = {
  onboarding: OnboardingState;
};

export function SetupBanner({ onboarding }: SetupBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  if (!onboarding.setupComplete) {
    return (
      <div className="border-b border-primary/20 bg-primary/10 px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">
            Finish setup to unlock full automation
          </p>
          <Button
            size="sm"
            render={<Link href="/dashboard/onboarding" />}
          >
            Continue setup
            <ArrowRight />
          </Button>
        </div>
      </div>
    );
  }

  const message = getContextualSetupMessage(onboarding.contextualStep ?? null);

  if (!message || onboarding.funnelStage === "conversion") {
    return null;
  }

  const hrefByStep: Record<string, string> = {
    generate: "/dashboard/marketing",
    results: "/dashboard/analytics",
    schedule: "/dashboard/calendar",
    leads: "/dashboard/leads",
  };

  const href = onboarding.contextualStep
    ? hrefByStep[onboarding.contextualStep]
    : "/dashboard/marketing";

  return (
    <div className="border-b border-border/60 bg-muted/40 px-4 py-2.5 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="secondary" render={<Link href={href} />}>
            Next step
            <ArrowRight />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
          >
            <X />
          </Button>
        </div>
      </div>
    </div>
  );
}
