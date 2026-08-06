import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/billing/providers";
import { getStripePriceId, PLANS } from "@/lib/billing/plans";
import { getOrCreateDefaultSubscription, upsertSubscription } from "@/lib/billing/subscription-service";
import type { BillingCycle, PlanId } from "@/lib/billing/types";

/**
 * POST /api/billing/checkout
 *
 * Create a Stripe Checkout session for a subscription.
 *
 * Body:
 * {
 *   planId: "starter" | "professional" | "enterprise",
 *   billingCycle: "monthly" | "yearly",
 *   successUrl?: string,
 *   cancelUrl?: string,
 * }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Dev mode: if Supabase is not configured, simulate a checkout session
    // that points to the in-app simulated checkout page.
    if (!supabase) {
      const body = await request.json().catch(() => ({}));
      const planId = body.planId as PlanId;
      const billingCycle = (body.billingCycle || "monthly") as BillingCycle;
      if (!PLANS[planId]) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
      const origin =
        request.headers.get("origin") ||
        process.env.APP_URL ||
        "http://localhost:3000";
const successUrl =
        body.successUrl || `${origin}/dashboard/billing?success=true`;
      const cancelUrl =
        body.cancelUrl || `${origin}/pricing?canceled=true`;
      // In dev mode (no Stripe), the /checkout page creates a session and
      // redirects to Stripe's hosted Checkout when available, otherwise
      // falls back to the success page. No card details are collected.
      const url = `${origin}/checkout?plan=${planId}&cycle=${billingCycle}&success=${encodeURIComponent(successUrl)}&cancel=${encodeURIComponent(cancelUrl)}`;
      return NextResponse.json({
        url,
        sessionId: `mock_cs_${Date.now()}`,
      });
    }

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const planId = body.planId as PlanId;
    const billingCycle = (body.billingCycle || "monthly") as BillingCycle;

    // Validate plan
    if (!PLANS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get or create default subscription to ensure user has a record
    const currentSub = await getOrCreateDefaultSubscription(user.id);

    // Get the user's Stripe customer ID (create if needed)
    const provider = getPaymentProvider();
    let customerId = currentSub.stripeCustomerId;

    if (!customerId) {
      const customer = await provider.createCustomer({
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "AgroVision User",
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Store the customer ID
      await upsertSubscription({
        userId: user.id,
        planId: currentSub.planId,
        status: currentSub.status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: currentSub.stripeSubscriptionId,
        billingCycle: currentSub.billingCycle,
      });
    }

    const priceId = getStripePriceId(planId, billingCycle);

    const origin = request.headers.get("origin") || process.env.APP_URL || "http://localhost:3000";
    const successUrl = body.successUrl || `${origin}/dashboard/billing?success=true`;
    const cancelUrl = body.cancelUrl || `${origin}/pricing?canceled=true`;

    // Create the checkout session
    const session = await provider.createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      trialPeriodDays: currentSub.status === "active" && currentSub.planId === "starter" ? 14 : 0,
      allowPromotionCodes: true,
      metadata: {
        userId: user.id,
        planId,
        billingCycle,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.sessionId });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
