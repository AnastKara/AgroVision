import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/billing/providers";
import { getSubscriptionForUser } from "@/lib/billing/subscription-service";

/**
 * POST /api/billing/portal
 *
 * Create a Stripe Customer Portal session for managing billing.
 * Returns the portal URL to redirect the user to.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's subscription
    const subscription = await getSubscriptionForUser(user.id);

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please subscribe first." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const origin = request.headers.get("origin") || process.env.APP_URL || "http://localhost:3000";
    const returnUrl = body.returnUrl || `${origin}/dashboard/billing`;

    // Create the portal session
    const provider = getPaymentProvider();
    const session = await provider.createPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create portal session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create portal session" },
      { status: 500 }
    );
  }
}
