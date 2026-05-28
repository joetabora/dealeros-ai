import { NextResponse } from "next/server";
import Stripe from "stripe";

import {
  mapStripePlan,
  updateSubscriptionStatus,
  upsertSubscriptionFromStripe,
} from "@/lib/billing/repository";
import { isStripeConfigured } from "@/lib/config/environment";
import { logger } from "@/lib/logging/logger";
import type { SubscriptionStatus } from "@/types/tenant";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    logger.error("billing.webhook.invalid_signature", {
      message: error instanceof Error ? error.message : "Invalid signature",
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const dealershipId = session.metadata?.dealershipId;
        const plan = (session.metadata?.plan ?? "growth") as import("@/types/tenant").BillingPlan;

        if (dealershipId && session.customer && session.subscription) {
          await upsertSubscriptionFromStripe({
            dealershipId,
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId: String(session.subscription),
            plan,
            status: "active",
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const status = subscription.status as SubscriptionStatus;
        const mappedStatus: SubscriptionStatus =
          status === "active" ||
          status === "trialing" ||
          status === "past_due" ||
          status === "canceled"
            ? status
            : "canceled";

        await updateSubscriptionStatus({
          stripeSubscriptionId: subscription.id,
          status: mappedStatus,
          plan: mapStripePlan(priceId),
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        });
        break;
      }
      default:
        break;
    }

    logger.info("billing.webhook.processed", { type: event.type });
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("billing.webhook.failed", {
      type: event.type,
      message: error instanceof Error ? error.message : "Webhook failed",
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
