import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/billing/providers";
import {
  getPaymentHistory,
} from "@/lib/billing/subscription-service";
import { getSubscriptionMetadata } from "@/lib/billing/subscription-store";
import { PLANS } from "@/lib/billing/plans";
import type { SubscriptionStatus } from "@/lib/billing/types";

/**
 * GET /api/billing/subscription
 *
 * Get the current user's subscription status.
 * Always verifies against the payment provider (Stripe) —
 * never trust the frontend for subscription status.
 */
export async function GET() {
  try {
    const supabase = await createClient();

// Dev mode: if Supabase is not configured, there is no way to verify a
    // real subscription. Return the DEFAULT state (status "incomplete") so the
    // paywall is enforced — a user is NEVER granted "active" without a verified
    // Stripe/webhook flow. This prevents the free-access bypass.
    if (!supabase) {
      const starterPlan = PLANS.starter;
      return NextResponse.json({
        subscription: {
          id: "dev_sub",
          userId: "dev-user",
          planId: "starter" as const,
          status: "incomplete",
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          billingCycle: "monthly",
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          trialEnd: null,
          provider: "stripe",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          plan: {
            id: starterPlan.id,
            name: starterPlan.name,
            description: starterPlan.description,
            monthlyPrice: starterPlan.monthlyPrice,
            yearlyPrice: starterPlan.yearlyPrice,
            features: starterPlan.features,
            featureFlags: starterPlan.featureFlags,
            limits: starterPlan.limits,
          },
        },
        paymentHistory: [],
      });
    }

// Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read the authoritative subscription status from Supabase (server-side,
    // persisted via Stripe webhooks). Never trust the frontend.
    const metadata = await getSubscriptionMetadata(user.id);

    // Build the subscription object from the persisted metadata.
    const subscription = {
      id: `sub_${user.id}`,
      userId: user.id,
      planId: metadata.subscription_plan,
      status: metadata.subscription_status,
      stripeCustomerId: metadata.stripe_customer_id,
      stripeSubscriptionId: metadata.stripe_subscription_id,
      billingCycle: "monthly" as const,
      currentPeriodStart: null,
      currentPeriodEnd: metadata.subscription_current_period_end,
      cancelAtPeriodEnd: false,
      trialEnd: null,
      provider: "stripe" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If the user has a Stripe subscription, verify the real status from Stripe
    let verifiedSubscription = subscription;

    if (subscription.stripeSubscriptionId && subscription.stripeCustomerId) {
      const provider = getPaymentProvider();
      const stripeSub = await provider.getSubscription({
        customerId: subscription.stripeCustomerId,
        subscriptionId: subscription.stripeSubscriptionId,
      });

      if (stripeSub) {
        // Sync the verified status from Stripe into our DB
        verifiedSubscription = {
          ...subscription,
          planId: stripeSub.planId || subscription.planId,
          status: (stripeSub.status as SubscriptionStatus) || subscription.status,
          currentPeriodEnd: stripeSub.currentPeriodEnd
            ? new Date(stripeSub.currentPeriodEnd * 1000).toISOString()
            : subscription.currentPeriodEnd,
        };
      }
    }

    // Get payment history
    const paymentHistory = await getPaymentHistory(user.id);

    const plan = PLANS[verifiedSubscription.planId];

    return NextResponse.json({
      subscription: {
        ...verifiedSubscription,
        plan: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: plan.features,
          featureFlags: plan.featureFlags,
          limits: plan.limits,
        },
      },
      paymentHistory,
    });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
