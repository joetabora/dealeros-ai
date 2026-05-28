import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getAppEnvironment, isStripeConfigured } from "@/lib/config/environment";
import type { BillingPlan, SubscriptionStatus } from "@/types/tenant";

type SubscriptionRow = {
  id: string;
  dealership_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  current_period_end: string | null;
};

export async function getDealershipSubscription(dealershipId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("dealership_id", dealershipId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as SubscriptionRow | null;
}

export async function upsertSubscriptionFromStripe({
  dealershipId,
  stripeCustomerId,
  stripeSubscriptionId,
  plan,
  status,
  currentPeriodEnd,
}: {
  dealershipId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: BillingPlan;
  status: SubscriptionStatus;
  currentPeriodEnd?: string | null;
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        dealership_id: dealershipId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        plan,
        status,
        current_period_end: currentPeriodEnd ?? null,
        updated_at: now,
      },
      { onConflict: "dealership_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SubscriptionRow;
}

export async function updateSubscriptionStatus({
  stripeSubscriptionId,
  status,
  plan,
  currentPeriodEnd,
}: {
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  plan?: BillingPlan;
  currentPeriodEnd?: string | null;
}) {
  const supabase = await createClient();

  const payload: Record<string, string | null> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (plan) payload.plan = plan;
  if (currentPeriodEnd !== undefined) payload.current_period_end = currentPeriodEnd;

  const { error } = await supabase
    .from("subscriptions")
    .update(payload)
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    throw new Error(error.message);
  }
}

export function getStripeClient() {
  if (!isStripeConfigured()) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
}

export function mapStripePlan(priceId: string | undefined): BillingPlan {
  const starter = process.env.STRIPE_PRICE_STARTER;
  const growth = process.env.STRIPE_PRICE_GROWTH;
  const pro = process.env.STRIPE_PRICE_PRO;

  if (priceId && priceId === pro) return "pro";
  if (priceId && priceId === growth) return "growth";
  if (priceId && priceId === starter) return "starter";
  return "growth";
}

export function getCheckoutPriceId(plan: BillingPlan) {
  const map = {
    starter: process.env.STRIPE_PRICE_STARTER,
    growth: process.env.STRIPE_PRICE_GROWTH,
    pro: process.env.STRIPE_PRICE_PRO,
  };
  return map[plan] ?? null;
}

export function billingModeLabel() {
  return isStripeConfigured() ? getAppEnvironment() : "demo";
}
