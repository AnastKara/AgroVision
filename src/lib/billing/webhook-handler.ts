/**
 * Webhook Business Logic
 *
 * Handles Stripe webhook events by syncing the database and sending
 * transactional emails. This is the single source of truth for
 * subscription state — the frontend is never trusted.
 */

import type { WebhookHandlerResult } from "./payment-service";
import type {
  BillingCycle,
  PlanId,
  SubscriptionStatus,
} from "./types";
import { PLANS } from "./plans";
import {
  getSubscriptionByCustomerId,
  getSubscriptionByStripeId,
  upsertSubscription,
  upsertPaymentRecord,
} from "./subscription-service";
import {
  getUserByStripeCustomerId,
  getUserById,
  updateUserSubscription,
  setUserStripeCustomerId,
} from "@/lib/user-service";
import { writeSubscriptionMetadata } from "./subscription-store";
import { getEmailProvider } from "@/lib/email/providers";
import { getAppUrl } from "@/lib/email/email-service";

// ============================================================
// Helpers
// ============================================================

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

function mapPriceToPlan(priceId: string | undefined): PlanId {
  for (const plan of Object.values(PLANS)) {
    if (
      plan.stripePriceIds.monthly === priceId ||
      plan.stripePriceIds.yearly === priceId
    ) {
      return plan.id;
    }
  }
  return "starter";
}

function mapPriceToCycle(priceId: string | undefined): BillingCycle {
  for (const plan of Object.values(PLANS)) {
    if (plan.stripePriceIds.monthly === priceId) return "monthly";
    if (plan.stripePriceIds.yearly === priceId) return "yearly";
  }
  return "monthly";
}

/** Build the invoice number from a Stripe invoice ID */
function invoiceNumberFromId(id: string): string {
  // Strip the "in_" prefix and uppercase
  return `INV-${id.replace(/^in_/, "").slice(0, 8).toUpperCase()}`;
}

// ============================================================
// Event Handlers
// ============================================================

/**
 * Handle checkout.session.completed — activate the subscription.
 */
async function handleCheckoutCompleted(
  result: WebhookHandlerResult
): Promise<WebhookHandlerResult> {
  const data = (result.data || {}) as {
    customer?: string;
    subscription?: string;
    metadata?: Record<string, string>;
    client_reference_id?: string;
  };
  const customerId = result.customerId || (data.customer as string);
  const subscriptionId =
    result.subscriptionId || (data.subscription as string);
  const userId =
    result.userId || data.metadata?.userId || data.client_reference_id;

  if (!customerId) {
    return { ...result, success: false, error: "Missing customer ID" };
  }

  // Resolve the user. Prefer metadata userId, then lookup by customer ID.
  let user = userId ? await getUserById(userId) : null;
  if (!user) {
    user = await getUserByStripeCustomerId(customerId);
  }

  if (!user) {
    return { ...result, success: false, error: "No user found for customer" };
  }

// Store the Stripe customer ID on the user
  await setUserStripeCustomerId(user.id, customerId);

  // Persist to Supabase user_metadata (server-side source of truth)
  await writeSubscriptionMetadata(user.id, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId || null,
    subscription_status: "trialing", // starts as trial; updated by subscription.* events
    subscription_plan: (data.metadata?.planId as PlanId) || "professional",
  });

  // Upsert the subscription record
  const sub = await upsertSubscription({
    userId: user.id,
    planId: (data.metadata?.planId as PlanId) || "professional",
    status: "trialing", // starts as trial; updated by subscription.* events
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId || null,
    billingCycle: (data.metadata?.billingCycle as BillingCycle) || "monthly",
    provider: "stripe",
  });

  // Send the welcome email
  const emailService = getEmailProvider();
  await emailService.sendWelcome({
    to: user.email,
    name: user.name,
  });

  console.log(
    `[Webhook] checkout.session.completed → user ${user.id} subscribed (${sub.planId})`
  );

  return { ...result, userId: user.id, success: true };
}

/**
 * Handle customer.subscription.created/updated — sync status + plan.
 */
async function handleSubscriptionEvent(
  type: string,
  result: WebhookHandlerResult
): Promise<WebhookHandlerResult> {
  const data = (result.data || {}) as {
    id?: string;
    customer?: string;
    status?: string;
    metadata?: Record<string, string>;
    items?: {
      data?: { price?: { id?: string } }[];
    };
    current_period_start?: number;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
    trial_end?: number | null;
  };

  const subscriptionId = result.subscriptionId || data.id;
  const customerId = result.customerId || (data.customer as string);
  const userId = result.userId || data.metadata?.userId;

  if (!subscriptionId || !customerId) {
    return { ...result, success: false, error: "Missing subscription/customer" };
  }

  const priceId = data.items?.data?.[0]?.price?.id;
  const planId = mapPriceToPlan(priceId);
  const status = mapStatus(data.status || "incomplete");

  // Resolve the user
  let user = userId ? await getUserById(userId) : null;
  if (!user) user = await getUserByStripeCustomerId(customerId);

  if (!user) {
    // Try to find via subscription store
    const existingSub = await getSubscriptionByStripeId(subscriptionId);
    if (existingSub) {
      user = await getUserById(existingSub.userId);
    }
  }

  if (!user) {
    return { ...result, success: false, error: "No user found for customer" };
  }

  await setUserStripeCustomerId(user.id, customerId);

  const currentPeriodStart = data.current_period_start
    ? new Date(data.current_period_start * 1000).toISOString()
    : null;
  const currentPeriodEnd = data.current_period_end
    ? new Date(data.current_period_end * 1000).toISOString()
    : null;
  const trialEnd =
    typeof data.trial_end === "number"
      ? new Date(data.trial_end * 1000).toISOString()
      : null;

  // Upsert subscription + user subscription fields
  await upsertSubscription({
    userId: user.id,
    planId,
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    billingCycle: mapPriceToCycle(priceId),
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    trialEnd,
    provider: "stripe",
  });

await updateUserSubscription(user.id, {
    subscription_status: status,
    subscription_plan: planId,
    stripe_subscription_id: subscriptionId,
  });

  // Persist to Supabase user_metadata (server-side source of truth)
  await writeSubscriptionMetadata(user.id, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    subscription_status: status,
    subscription_plan: planId,
    subscription_current_period_end: currentPeriodEnd || undefined,
  });

  // Send subscription update email if the status changed
  if (type === "customer.subscription.updated") {
    const emailService = getEmailProvider();
    const planName = PLANS[planId].name;
    const message =
      status === "canceled"
        ? `Your ${planName} subscription has been canceled. You'll retain access until the end of your billing period.`
        : status === "past_due" || status === "unpaid"
        ? `There's an issue with your ${planName} payment. Please update your payment method to avoid losing access.`
        : `Your ${planName} subscription is now ${status}.`;
    await emailService.sendSubscriptionUpdate({
      to: user.email,
      name: user.name,
      planName,
      status,
      message,
      billingUrl: `${getAppUrl()}/dashboard/billing`,
    });
  }

  console.log(
    `[Webhook] ${type} → user ${user.id} plan=${planId} status=${status}`
  );

  return { ...result, userId: user.id, success: true };
}

/**
 * Handle customer.subscription.deleted — downgrade to starter.
 */
async function handleSubscriptionDeleted(
  result: WebhookHandlerResult
): Promise<WebhookHandlerResult> {
  const data = (result.data || {}) as {
    id?: string;
    customer?: string;
    metadata?: Record<string, string>;
  };
  const subscriptionId = result.subscriptionId || data.id;
  const customerId = result.customerId || (data.customer as string);
  const userId = result.userId || data.metadata?.userId;

  let user = userId ? await getUserById(userId) : null;
  if (!user) user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    const existingSub = subscriptionId
      ? await getSubscriptionByStripeId(subscriptionId)
      : null;
    if (existingSub) user = await getUserById(existingSub.userId);
  }

  if (!user) {
    return { ...result, success: false, error: "No user found" };
  }

  // Downgrade to starter / inactive
  await upsertSubscription({
    userId: user.id,
    planId: "starter",
    status: "canceled",
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId || null,
    billingCycle: "monthly",
    provider: "stripe",
  });

await updateUserSubscription(user.id, {
    subscription_status: "canceled",
    subscription_plan: "starter",
    stripe_subscription_id: subscriptionId || null,
  });

  // Persist cancellation to Supabase user_metadata
  await writeSubscriptionMetadata(user.id, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId || null,
    subscription_status: "canceled",
    subscription_plan: "starter",
  });

  // Notify the user
  const emailService = getEmailProvider();
  await emailService.sendSubscriptionUpdate({
    to: user.email,
    name: user.name,
    planName: "Starter",
    status: "canceled",
    message:
      "Your subscription has been canceled and you've been moved to the Starter plan. Premium features are no longer accessible.",
    billingUrl: `${getAppUrl()}/dashboard/billing`,
  });

  console.log(`[Webhook] customer.subscription.deleted → user ${user.id} downgraded`);

  return { ...result, userId: user.id, success: true };
}

/**
 * Handle invoice.payment_succeeded — record payment + send email.
 */
async function handleInvoiceSucceeded(
  result: WebhookHandlerResult
): Promise<WebhookHandlerResult> {
  const data = (result.data || {}) as {
    id?: string;
    customer?: string;
    subscription?: string;
    amount_paid?: number;
    amount_due?: number;
    currency?: string;
    hosted_invoice_url?: string;
    invoice_pdf?: string;
    lines?: {
      data?: { description?: string }[];
    };
    created?: number;
  };

  const invoiceId = data.id || result.subscriptionId || "invoice";
  const customerId = result.customerId || (data.customer as string);
  const userId = result.userId;

  let user = userId ? await getUserById(userId) : null;
  if (!user) user = await getUserByStripeCustomerId(customerId || "");
  if (!user && customerId) {
    const sub = await getSubscriptionByCustomerId(customerId);
    if (sub) user = await getUserById(sub.userId);
  }

  if (!user) {
    return { ...result, success: false, error: "No user found for invoice" };
  }

  const amount = data.amount_paid || data.amount_due || 0;
  const currency = data.currency || "usd";
  const description =
    data.lines?.data?.[0]?.description ||
    `${user.subscription_plan} plan subscription`;
  const paidAt = data.created
    ? new Date(data.created * 1000).toISOString()
    : new Date().toISOString();

  // Record the payment
  const record = await upsertPaymentRecord({
    userId: user.id,
    subscriptionId: result.subscriptionId || null,
    providerPaymentId: invoiceId,
    stripeCustomerId: customerId || null,
    amount,
    currency,
    status: "paid",
    description,
    billingCycle: "monthly",
    paidAt,
    dueAt: paidAt,
  });

  const planName = PLANS[user.subscription_plan]?.name || "Starter";
  const appUrl = getAppUrl();
  const invoiceNumber = invoiceNumberFromId(invoiceId);

  // Send payment confirmation + invoice emails
  const emailService = getEmailProvider();
  await emailService.sendPaymentSuccess({
    to: user.email,
    name: user.name,
    planName,
    amount,
    currency,
    date: paidAt,
    invoicesUrl: `${appUrl}/dashboard/billing`,
  });
  await emailService.sendInvoice({
    to: user.email,
    name: user.name,
    invoiceNumber,
    planName,
    amount,
    currency,
    date: paidAt,
    invoicePdfUrl: `${appUrl}/api/billing/invoices/${record.id}/download`,
    invoicesUrl: `${appUrl}/dashboard/billing`,
  });

  console.log(
    `[Webhook] invoice.payment_succeeded → user ${user.id} paid ${amount} ${currency}`
  );

  return { ...result, userId: user.id, success: true };
}

/**
 * Handle invoice.payment_failed — notify the user.
 */
async function handleInvoiceFailed(
  result: WebhookHandlerResult
): Promise<WebhookHandlerResult> {
  const data = (result.data || {}) as {
    id?: string;
    customer?: string;
    amount_due?: number;
    currency?: string;
    created?: number;
  };
  const customerId = result.customerId || (data.customer as string);
  const userId = result.userId;

  let user = userId ? await getUserById(userId) : null;
  if (!user) user = await getUserByStripeCustomerId(customerId || "");
  if (!user && customerId) {
    const sub = await getSubscriptionByCustomerId(customerId);
    if (sub) user = await getUserById(sub.userId);
  }

  if (!user) {
    return { ...result, success: false, error: "No user found for failed invoice" };
  }

  const amount = data.amount_due || 0;
  const currency = data.currency || "usd";
  const dueDate = data.created
    ? new Date(data.created * 1000).toISOString()
    : new Date().toISOString();

  const emailService = getEmailProvider();
  await emailService.sendPaymentFailed({
    to: user.email,
    name: user.name,
    planName: PLANS[user.subscription_plan]?.name || "Starter",
    amount,
    currency,
    dueDate,
    billingUrl: `${getAppUrl()}/dashboard/billing`,
  });

console.log(`[Webhook] invoice.payment_failed → user ${user.id}`);

  return { ...result, userId: user.id, success: true };
}

// ============================================================
// Main dispatcher
// ============================================================

/**
 * Process a verified webhook event and persist changes to the database.
 */
export async function processWebhookEvent(
  result: WebhookHandlerResult
): Promise<WebhookHandlerResult> {
  const type = result.eventType;

  switch (type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(result);
    case "customer.subscription.created":
      return handleSubscriptionEvent(type, result);
    case "customer.subscription.updated":
      return handleSubscriptionEvent(type, result);
    case "customer.subscription.deleted":
      return handleSubscriptionDeleted(result);
    case "invoice.payment_succeeded":
      return handleInvoiceSucceeded(result);
    case "invoice.payment_failed":
      return handleInvoiceFailed(result);
    default:
      return { ...result, success: true };
  }
}
