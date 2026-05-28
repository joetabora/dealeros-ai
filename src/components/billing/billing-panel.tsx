"use client";

import { useTransition } from "react";
import { CreditCard } from "lucide-react";

import { startCheckoutAction } from "@/lib/billing/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_LABELS, type BillingPlan, type SubscriptionStatus } from "@/types/tenant";

const PLAN_DETAILS: Record<
  BillingPlan,
  { price: string; description: string; highlights: string[] }
> = {
  starter: {
    price: "$99/mo",
    description: "Launch AI campaigns with basic scheduling.",
    highlights: ["10 campaigns / month", "Campaign generator", "Marketing calendar"],
  },
  growth: {
    price: "$249/mo",
    description: "Full marketing engine with execution and CRM.",
    highlights: ["Auto execution", "CRM Lite pipeline", "Revenue intelligence"],
  },
  pro: {
    price: "$499/mo",
    description: "Autopilot optimization and multi-user access.",
    highlights: ["Marketing Autopilot", "Multi-user roles", "Priority support"],
  },
};

type BillingPanelProps = {
  currentPlan: BillingPlan;
  subscriptionStatus: SubscriptionStatus;
  canManageBilling: boolean;
  stripeEnabled: boolean;
};

export function BillingPanel({
  currentPlan,
  subscriptionStatus,
  canManageBilling,
  stripeEnabled,
}: BillingPanelProps) {
  const [isPending, startTransition] = useTransition();

  function checkout(plan: BillingPlan) {
    startTransition(async () => {
      await startCheckoutAction(plan);
    });
  }

  return (
    <Card id="billing" className="border-border/60 bg-card/40 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Billing & Plans
        </CardTitle>
        <CardDescription>
          Current plan: {PLAN_LABELS[currentPlan]} · Status: {subscriptionStatus}
          {!stripeEnabled ? " · Demo billing mode (Stripe not configured)" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(PLAN_DETAILS) as BillingPlan[]).map((plan) => (
          <div
            key={plan}
            className="rounded-xl border border-border/60 bg-background/30 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{PLAN_LABELS[plan]}</p>
              {plan === currentPlan ? (
                <Badge className="bg-primary/15 text-primary">Current</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {PLAN_DETAILS[plan].price}
            </p>
            <p className="mt-2 text-sm">{PLAN_DETAILS[plan].description}</p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {PLAN_DETAILS[plan].highlights.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            {canManageBilling && plan !== currentPlan ? (
              <Button
                type="button"
                size="sm"
                className="mt-4"
                variant={plan === "pro" ? "default" : "secondary"}
                disabled={isPending || !stripeEnabled}
                onClick={() => checkout(plan)}
              >
                {stripeEnabled ? `Upgrade to ${PLAN_LABELS[plan]}` : "Configure Stripe"}
              </Button>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
