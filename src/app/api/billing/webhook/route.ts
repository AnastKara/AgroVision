import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/billing/providers";
import { processWebhookEvent } from "@/lib/billing/webhook-handler";

/**
 * POST /api/billing/webhook
 *
 * Handle Stripe webhook events.
 *
 * Never trust the frontend for subscription status.
 * All subscription state changes must come through here.
 *
 * Handled events:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export async function POST(request: Request) {
  try {
    // Get the raw body and signature header
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider();

    // Verify the webhook signature — throws if invalid
    const event = await provider.verifyWebhookSignature(payload, signature);

// Process the verified event (provider-level extraction)
    const extracted = await provider.handleWebhookEvent(event);

    // Persist changes to the database + send transactional emails
    // This is the single source of truth for subscription state.
    const result = await processWebhookEvent(extracted);

    if (!result.success) {
      console.error("Webhook processing failed:", event.type, result.error);
      return NextResponse.json(
        { error: result.error || "Webhook processing failed" },
        { status: 500 }
      );
    }

    // Log the processed event for audit
    console.log(
      `[Webhook] ${event.type} processed successfully${
        result.subscriptionId ? ` (subscription: ${result.subscriptionId})` : ""
      }${result.customerId ? ` (customer: ${result.customerId})` : ""}${
        result.userId ? ` (user: ${result.userId})` : ""
      }`
    );

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    // Signature verification failed or other error
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 400 }
    );
  }
}
