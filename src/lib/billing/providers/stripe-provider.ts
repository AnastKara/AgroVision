/**
 * StripeProvider
 *
 * Implementation of the PaymentService abstraction using Stripe.
 * Handles customers, checkout sessions, customer portal, subscriptions,
 * and webhook verification/processing.
 */

import Stripe from "stripe";
import type {
  PaymentService,
  CreateCustomerParams,
  CreateCheckoutSessionParams,
  CreatePortalSessionParams,
  GetSubscriptionParams,
  CancelSubscriptionParams,
  UpdateSubscriptionParams,
  WebhookHandlerResult,
} from "../payment-service";
import type {
  BillingCycle,
  PaymentProvider,
  PlanId,
  SubscriptionStatus,
  WebhookEventType,
} from "../types";
import { PLANS, getStripePriceId } from "../plans";

// ============================================================
// Stripe Client
// ============================================================

const apiKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!apiKey || apiKey === "sk_test_your_secret_key") {
    return null;
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(apiKey, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }
  return stripeInstance;
}

// ============================================================
// Helpers
// ============================================================

/**
 * Map Stripe subscription status to our app status.
 */
function mapStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete_expired";
    case "paused":
      return "paused";
    default:
      return "incomplete";
  }
}

/**
 * Map Stripe price ID to a plan ID.
 */
function mapPriceToPlan(priceId: string): PlanId | null {
  for (const plan of Object.values(PLANS)) {
    if (
      plan.stripePriceIds.monthly === priceId ||
      plan.stripePriceIds.yearly === priceId
    ) {
      return plan.id;
    }
  }
  return null;
}

/**
 * Map Stripe price ID to billing cycle.
 */
function mapPriceToCycle(priceId: string): BillingCycle {
  for (const plan of Object.values(PLANS)) {
    if (plan.stripePriceIds.monthly === priceId) return "monthly";
    if (plan.stripePriceIds.yearly === priceId) return "yearly";
  }
  return "monthly";
}

// ============================================================
// StripeProvider
// ============================================================

export class StripeProvider implements PaymentService {
  readonly providerName: PaymentProvider = "stripe";

  // ==========================================================
  // Customers
  // ==========================================================

  async createCustomer(params: CreateCustomerParams): Promise<{ id: string }> {
    const stripe = getStripe();
    if (!stripe) {
      // Dev mode: return a mock customer
      return { id: `mock_cus_${Date.now()}` };
    }

    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    });

    return { id: customer.id };
  }

  async getCustomer(customerId: string) {
    const stripe = getStripe();
    if (!stripe) return null;

    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return null;
      return {
        id: customer.id,
        email: customer.email || null,
        name: customer.name || null,
      };
    } catch {
      return null;
    }
  }

  // ==========================================================
  // Checkout
  // ==========================================================

  async createCheckoutSession(params: CreateCheckoutSessionParams) {
    const stripe = getStripe();
    if (!stripe) {
      // Dev mode: return a mock session
      return {
        sessionId: `mock_cs_${Date.now()}`,
        url: params.successUrl,
        customerId: params.customerId,
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: params.customerId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: params.allowPromotionCodes ?? true,
      subscription_data: {
        metadata: params.metadata,
        ...(params.trialPeriodDays
          ? { trial_period_days: params.trialPeriodDays }
          : {}),
      },
      metadata: params.metadata,
    });

    return {
      sessionId: session.id,
      url: session.url,
      customerId: typeof session.customer === "string" ? session.customer : null,
    };
  }

  // ==========================================================
  // Customer Portal
  // ==========================================================

  async createPortalSession(params: CreatePortalSessionParams) {
    const stripe = getStripe();
    if (!stripe) {
      // Dev mode: return mock
      return { url: params.returnUrl };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });

    return { url: session.url };
  }

  // ==========================================================
  // Subscriptions
  // ==========================================================

  async getSubscription(params: GetSubscriptionParams) {
    const stripe = getStripe();
    if (!stripe) return null;

    try {
      const subscription = await stripe.subscriptions.retrieve(
        params.subscriptionId
      );

      const item = subscription.items.data[0];
      const priceId = item?.price?.id || "";
      const planId = mapPriceToPlan(priceId);

      return {
        id: subscription.id,
        customerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
        status: mapStatus(subscription.status),
        planId,
        billingCycle: mapPriceToCycle(priceId),
        currentPeriodStart: item?.current_period_start ?? null,
        currentPeriodEnd: item?.current_period_end ?? null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end,
        raw: subscription as unknown as Record<string, unknown>,
      };
    } catch {
      return null;
    }
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<boolean> {
    const stripe = getStripe();
    if (!stripe) return true;

    try {
      await stripe.subscriptions.update(params.subscriptionId, {
        cancel_at_period_end: params.atPeriodEnd ?? true,
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateSubscription(params: UpdateSubscriptionParams): Promise<boolean> {
    const stripe = getStripe();
    if (!stripe) return true;

    try {
      const subscription = await stripe.subscriptions.retrieve(
        params.subscriptionId
      );
      const itemId = subscription.items.data[0]?.id;
      if (!itemId) return false;

      await stripe.subscriptions.update(params.subscriptionId, {
        items: [
          {
            id: itemId,
            ...(params.priceId ? { price: params.priceId } : {}),
            ...(params.quantity ? { quantity: params.quantity } : {}),
          },
        ],
        metadata: params.metadata,
      });
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================================
  // Webhooks
  // ==========================================================

  async verifyWebhookSignature(payload: string, signature: string) {
    const stripe = getStripe();
    if (!stripe || !webhookSecret) {
      // Dev mode: parse the payload as JSON without verification
      const event = JSON.parse(payload);
      return {
        type: event.type as WebhookEventType | string,
        data: event.data?.object || {},
      };
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return {
      type: event.type as WebhookEventType | string,
      data: event.data?.object || {},
    };
  }

  async handleWebhookEvent(event: {
    type: WebhookEventType | string;
    data: Record<string, unknown>;
  }): Promise<WebhookHandlerResult> {
    const { type, data } = event;

    // Extract common fields
    const subscriptionId = (data as { id?: string }).id || null;

    const rawCustomer = (data as { customer?: unknown }).customer;
    const customerId =
      typeof rawCustomer === "string"
        ? rawCustomer
        : (rawCustomer as { id?: string } | undefined)?.id || null;

    switch (type) {
      case "checkout.session.completed": {
        const session = data as {
          customer?: string;
          subscription?: string;
          client_reference_id?: string;
        };

        return {
          success: true,
          eventType: type,
          subscriptionId:
            typeof session.subscription === "string"
              ? session.subscription
              : undefined,
          customerId:
            typeof session.customer === "string" ? session.customer : undefined,
        };
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = data as {
          id?: string;
          customer?: string;
          status?: string;
          items?: { data?: { price?: { id?: string } }[] };
        };

        return {
          success: true,
          eventType: type,
          subscriptionId: sub.id,
          customerId:
            typeof sub.customer === "string" ? sub.customer : undefined,
        };
      }

      case "customer.subscription.deleted": {
        const sub = data as { id?: string; customer?: string };
        return {
          success: true,
          eventType: type,
          subscriptionId: sub.id,
          customerId:
            typeof sub.customer === "string" ? sub.customer : undefined,
        };
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = data as {
          id?: string;
          subscription?: string;
          customer?: string;
          amount_paid?: number;
          currency?: string;
          status?: string;
        };

        return {
          success: true,
          eventType: type,
          subscriptionId:
            typeof invoice.subscription === "string"
              ? invoice.subscription
              : undefined,
          customerId:
            typeof invoice.customer === "string" ? invoice.customer : undefined,
        };
      }

      default:
        return {
          success: true,
          eventType: type,
          subscriptionId: subscriptionId || undefined,
          customerId: customerId || undefined,
        };
    }
  }
}

// ============================================================
// Price ID helpers (exposed for external use)
// ============================================================

export function getPriceIdForPlan(
  planId: PlanId,
  cycle: BillingCycle
): string {
  return getStripePriceId(planId, cycle);
}
