import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/billing/providers";
import {
  getOrCreateDefaultSubscription,
  getPaymentHistory,
  getSubscriptionForUser,
  updateSubscription,
} from "@/lib/billing/subscription-service";
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

    // Dev mode: if Supabase is not configured, return a default Starter
    // subscription so the client provider works without a backend.
    if (!supabase) {
      const starterPlan = PLANS.starter;
      return NextResponse.json({
        subscription: {
          id: "dev_sub",
          userId: "dev-user",
          planId: "starter" as const,
          status: "active",
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

    // Get or create the user's subscription record (defaults to Starter)
    const subscription = await getOrCreateDefaultSubscription(user.id);

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
        verifiedSubscription = await updateSubscription(user.id, {
          planId: stripeSub.planId || subscription.planId,
          status: stripeSub.status as SubscriptionStatus,
          billingCycle: stripeSub.billingCycle,
          currentPeriodStart: stripeSub.currentPeriodStart
            ? new Date(stripeSub.currentPeriodStart * 1000).toISOString()
            : undefined,
          currentPeriodEnd: stripeSub.currentPeriodEnd
            ? new Date(stripeSub.currentPeriodEnd * 1000).toISOString()
            : undefined,
          cancelAtPeriodEnd: stripeSub.cancelAtPeriodEnd,
          trialEnd: stripeSub.trialEnd
            ? new Date(stripeSub.trialEnd * 1000).toISOString()
            : undefined,
          stripeSubscriptionId: stripeSub.id,
        }) || subscription;
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
