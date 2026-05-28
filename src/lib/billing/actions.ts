"use server";

import { redirect } from "next/navigation";

import {
  getCheckoutPriceId,
  getStripeClient,
} from "@/lib/billing/repository";
import { getAppBaseUrl } from "@/lib/config/environment";
import { isStripeConfigured } from "@/lib/config/environment";
import { toActionError } from "@/lib/errors/normalize";
import { canManageBilling } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { getDealershipSubscription } from "@/lib/billing/repository";
import type { BillingPlan } from "@/types/tenant";

export async function startCheckoutAction(plan: BillingPlan) {
  try {
    const session = await requireSession();

    if (!canManageBilling(session.tenant)) {
      return { error: "Only dealership owners can manage billing." };
    }

    if (!isStripeConfigured()) {
      return {
        error: "Stripe is not configured. Add STRIPE_SECRET_KEY and price IDs to enable billing.",
      };
    }

    const stripe = getStripeClient();
    const priceId = getCheckoutPriceId(plan);

    if (!stripe || !priceId) {
      return { error: "Unable to start checkout for this plan." };
    }

    const subscription = await getDealershipSubscription(session.tenant.dealershipId);
    const baseUrl = getAppBaseUrl();

    let customerId = subscription?.stripe_customer_id ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.dealer.name,
        metadata: {
          dealershipId: session.tenant.dealershipId,
          userId: session.user.id,
        },
      });
      customerId = customer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/settings?billing=success`,
      cancel_url: `${baseUrl}/dashboard/settings?billing=canceled`,
      metadata: {
        dealershipId: session.tenant.dealershipId,
        plan,
      },
    });

    if (checkoutSession.url) {
      redirect(checkoutSession.url);
    }

    return { error: "Unable to create checkout session." };
  } catch (error) {
    return toActionError(error, "Unable to start checkout.");
  }
}

export async function getBillingDashboardAction() {
  try {
    const session = await requireSession();
    const subscription = await getDealershipSubscription(session.tenant.dealershipId);

    return {
      plan: session.tenant.plan,
      subscriptionStatus: session.tenant.subscriptionStatus,
      canManageBilling: canManageBilling(session.tenant),
      stripeEnabled: isStripeConfigured(),
      currentPeriodEnd: subscription?.current_period_end ?? null,
    };
  } catch (error) {
    return toActionError(error, "Unable to load billing.");
  }
}
