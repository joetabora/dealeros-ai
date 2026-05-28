"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FEATURE_LABELS, UPGRADE_PLAN_FOR_FEATURE } from "@/types/billing";
import type { BillableFeature } from "@/types/billing";
import { PLAN_LABELS, type BillingPlan } from "@/types/tenant";

type UpgradePromptProps = {
  feature: BillableFeature;
  currentPlan: BillingPlan;
};

export function UpgradePrompt({ feature, currentPlan }: UpgradePromptProps) {
  const requiredPlan = UPGRADE_PLAN_FOR_FEATURE[feature] ?? "pro";

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-5 text-primary" />
          Upgrade to unlock {FEATURE_LABELS[feature]}
        </CardTitle>
        <CardDescription>
          Your {PLAN_LABELS[currentPlan]} plan does not include this feature. Upgrade to{" "}
          {PLAN_LABELS[requiredPlan]} to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button render={<Link href="/dashboard/settings#billing" />}>
          View plans
        </Button>
      </CardContent>
    </Card>
  );
}
