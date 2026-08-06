import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processWebhookEvent } from "@/lib/billing/webhook-handler";
import { getOrCreateDefaultSubscription } from "@/lib/billing/subscription-service";
import { setUserStripeCustomerId } from "@/lib/user-service";
import { PLANS } from "@/lib/billing/plans";
import type { BillingCycle, PlanId } from "@/lib/billing/types";

/**
 * POST /api/billing/simulate
 *
 * DEVELOPMENT-ONLY endpoint to simulate Stripe webhook events.
 *
 * This lets you test the full subscription lifecycle (and transactional
 * emails / invoices) without a real Stripe account. It must be disabled
 * in production.
 *
 * Body:
 * {
 *   event: "checkout.completed" | "subscription.created" |
 *          "subscription.updated" | "subscription.deleted" |
 *          "invoice.paid" | "invoice.failed",
 *   planId?: PlanId,
 *   billingCycle?: BillingCycle
 * }
 */
export async function POST(request: Request) {
  // Hard guard: never allow this in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const event = body.event as string;
    const planId = (body.planId as PlanId) || "professional";
    const billingCycle = (body.billingCycle as BillingCycle) || "monthly";

    if (!PLANS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Ensure the user has a subscription record
    const sub = await getOrCreateDefaultSubscription(user.id);
    const plan = PLANS[planId];

    // Build a realistic simulated customer/subscription
    const customerId = sub.stripeCustomerId || `cus_sim_${user.id.slice(0, 8)}`;
    const subscriptionId = sub.stripeSubscriptionId || `sub_sim_${user.id.slice(0, 8)}`;
    const priceId = plan.stripePriceIds[billingCycle];

    await setUserStripeCustomerId(user.id, customerId);

    const now = Math.floor(Date.now() / 1000);
    const periodEnd = now + (billingCycle === "yearly" ? 365 : 30) * 86400;
    const metadata = { userId: user.id, planId, billingCycle };

    const handlers: Record<string, () => Promise<unknown>> = {
      "checkout.completed": () =>
        processWebhookEvent({
          success: true,
          eventType: "checkout.session.completed",
          subscriptionId,
          customerId,
          userId: user.id,
          data: {
            id: `cs_sim_${Date.now()}`,
            customer: customerId,
            subscription: subscriptionId,
            metadata,
            client_reference_id: user.id,
          },
        }),

      "subscription.created": () =>
        processWebhookEvent({
          success: true,
          eventType: "customer.subscription.created",
          subscriptionId,
          customerId,
          userId: user.id,
          data: {
            id: subscriptionId,
            customer: customerId,
            status: "trialing",
            metadata,
            items: { data: [{ price: { id: priceId } }] },
            current_period_start: now,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            trial_end: now + 14 * 86400,
          },
        }),

      "subscription.updated": () =>
        processWebhookEvent({
          success: true,
          eventType: "customer.subscription.updated",
          subscriptionId,
          customerId,
          userId: user.id,
          data: {
            id: subscriptionId,
            customer: customerId,
            status: "active",
            metadata,
            items: { data: [{ price: { id: priceId } }] },
            current_period_start: now,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            trial_end: null,
          },
        }),

      "subscription.deleted": () =>
        processWebhookEvent({
          success: true,
          eventType: "customer.subscription.deleted",
          subscriptionId,
          customerId,
          userId: user.id,
          data: {
            id: subscriptionId,
            customer: customerId,
            metadata,
          },
        }),

      "invoice.paid": () =>
        processWebhookEvent({
          success: true,
          eventType: "invoice.payment_succeeded",
          subscriptionId,
          customerId,
          userId: user.id,
          data: {
            id: `in_sim_${Date.now()}`,
            customer: customerId,
            subscription: subscriptionId,
            amount_paid: plan[billingCycle === "yearly" ? "yearlyPrice" : "monthlyPrice"],
            amount_due: plan[billingCycle === "yearly" ? "yearlyPrice" : "monthlyPrice"],
            currency: "usd",
            status: "paid",
            hosted_invoice_url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard/billing`,
            invoice_pdf: `${process.env.APP_URL || "http://localhost:3000"}/api/billing/invoices/download`,
            lines: {
              data: [
                {
                  description: `${plan.name} plan — ${billingCycle} subscription`,
                  period: { start: now, end: periodEnd },
                },
              ],
            },
            created: now,
          },
        }),

      "invoice.failed": () =>
        processWebhookEvent({
          success: true,
          eventType: "invoice.payment_failed",
          subscriptionId,
          customerId,
          userId: user.id,
          data: {
            id: `in_fail_${Date.now()}`,
            customer: customerId,
            subscription: subscriptionId,
            amount_due: plan[billingCycle === "yearly" ? "yearlyPrice" : "monthlyPrice"],
            currency: "usd",
            created: now,
          },
        }),
    };

    const handler = handlers[event];
    if (!handler) {
      return NextResponse.json(
        { error: `Unknown event: ${event}` },
        { status: 400 }
      );
    }

    const result = await handler();
    return NextResponse.json({ received: true, event, result });
  } catch (error) {
    console.error("Simulate webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Simulation failed" },
      { status: 500 }
    );
  }
}
