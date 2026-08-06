/**
 * Subscription Service
 *
 * Database abstraction layer for user subscription management.
 * Currently uses in-memory mock storage, designed to be swapped
 * with Supabase/PostgreSQL without changing the rest of the app.
 */

import type {
  BillingCycle,
  PaymentProvider,
  PaymentRecord,
  PlanId,
  SubscriptionStatus,
  UserSubscription,
} from "./types";
import { DEFAULT_PLAN_ID } from "./plans";

// ============================================================
// In-memory store (mocked). Swap with DB queries later.
// ============================================================

const subscriptionsStore: UserSubscription[] = [];
const paymentRecordsStore: PaymentRecord[] = [];

// ============================================================
// Types
// ============================================================

export interface CreateSubscriptionInput {
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  billingCycle: BillingCycle;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string | null;
  provider?: PaymentProvider;
}

export interface UpdateSubscriptionInput {
  planId?: PlanId;
  status?: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  billingCycle?: BillingCycle;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string | null;
  provider?: PaymentProvider;
}

// ============================================================
// Helpers
// ============================================================

function generateId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================================
// CRUD Operations
// ============================================================

/**
 * Get the subscription for a user.
 * Returns null if the user has no subscription record.
 */
export async function getSubscriptionForUser(
  userId: string
): Promise<UserSubscription | null> {
  // Future: replace with Supabase query
  const subscription = subscriptionsStore.find(
    (s) => s.userId === userId
  );
  return subscription ? { ...subscription } : null;
}

/**
 * Get a subscription by Stripe customer ID.
 */
export async function getSubscriptionByCustomerId(
  stripeCustomerId: string
): Promise<UserSubscription | null> {
  const subscription = subscriptionsStore.find(
    (s) => s.stripeCustomerId === stripeCustomerId
  );
  return subscription ? { ...subscription } : null;
}

/**
 * Get a subscription by Stripe subscription ID.
 */
export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<UserSubscription | null> {
  const subscription = subscriptionsStore.find(
    (s) => s.stripeSubscriptionId === stripeSubscriptionId
  );
  return subscription ? { ...subscription } : null;
}

/**
 * Create a new subscription record for a user.
 * If a subscription already exists, it will be updated instead.
 */
export async function upsertSubscription(
  input: CreateSubscriptionInput
): Promise<UserSubscription> {
  const existing = await getSubscriptionForUser(input.userId);

  const now = new Date().toISOString();

  if (existing) {
    const updated: UserSubscription = {
      ...existing,
      planId: input.planId,
      status: input.status,
      stripeCustomerId: input.stripeCustomerId ?? existing.stripeCustomerId,
      stripeSubscriptionId:
        input.stripeSubscriptionId ?? existing.stripeSubscriptionId,
      billingCycle: input.billingCycle,
      currentPeriodStart: input.currentPeriodStart ?? existing.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd ?? existing.currentPeriodEnd,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? existing.cancelAtPeriodEnd,
      trialEnd: input.trialEnd ?? existing.trialEnd,
      provider: input.provider ?? existing.provider,
      updatedAt: now,
    };

    const index = subscriptionsStore.findIndex((s) => s.userId === input.userId);
    if (index !== -1) {
      subscriptionsStore[index] = updated;
    }
    return { ...updated };
  }

  const newSubscription: UserSubscription = {
    id: generateId(),
    userId: input.userId,
    planId: input.planId,
    status: input.status,
    stripeCustomerId: input.stripeCustomerId ?? null,
    stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    billingCycle: input.billingCycle,
    currentPeriodStart: input.currentPeriodStart ?? null,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    trialEnd: input.trialEnd ?? null,
    provider: input.provider ?? "stripe",
    createdAt: now,
    updatedAt: now,
  };

  subscriptionsStore.push(newSubscription);
  return { ...newSubscription };
}

/**
 * Update an existing subscription.
 */
export async function updateSubscription(
  userId: string,
  input: UpdateSubscriptionInput
): Promise<UserSubscription | null> {
  const existing = await getSubscriptionForUser(userId);
  if (!existing) return null;

  const updated: UserSubscription = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  const index = subscriptionsStore.findIndex((s) => s.userId === userId);
  if (index !== -1) {
    subscriptionsStore[index] = updated;
  }

  return { ...updated };
}

/**
 * Delete a user's subscription record.
 */
export async function deleteSubscription(userId: string): Promise<boolean> {
  const index = subscriptionsStore.findIndex((s) => s.userId === userId);
  if (index === -1) return false;
  subscriptionsStore.splice(index, 1);
  return true;
}

/**
 * Get the default subscription record for a user.
 *
 * IMPORTANT: New users are created with status "incomplete" — they are NOT
 * granted an active subscription. Access is only granted when a verified
 * Stripe webhook sets the status to "active" or "trialing". This prevents
 * the paywall bypass where new users could access the dashboard for free.
 */
export async function getOrCreateDefaultSubscription(
  userId: string
): Promise<UserSubscription> {
  const existing = await getSubscriptionForUser(userId);
  if (existing) return existing;

  return upsertSubscription({
    userId,
    planId: DEFAULT_PLAN_ID,
    status: "incomplete",
    billingCycle: "monthly",
    provider: "stripe",
  });
}

/**
 * Get all subscriptions (admin).
 */
export async function getAllSubscriptions(): Promise<UserSubscription[]> {
  return subscriptionsStore.map((s) => ({ ...s }));
}

/**
 * Get payment history for a user.
 * Returns actual payment records, sorted by newest first.
 */
export async function getPaymentHistory(userId: string): Promise<PaymentRecord[]> {
  return paymentRecordsStore
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((p) => ({ ...p }));
}

/**
 * Get a payment record by its provider payment ID (e.g. Stripe invoice ID).
 */
export async function getPaymentRecordByProviderId(
  providerPaymentId: string
): Promise<PaymentRecord | null> {
  const record = paymentRecordsStore.find(
    (p) => p.providerPaymentId === providerPaymentId
  );
  return record ? { ...record } : null;
}

/**
 * Get a payment record by its internal ID.
 */
export async function getPaymentRecordById(
  id: string
): Promise<PaymentRecord | null> {
  const record = paymentRecordsStore.find((p) => p.id === id);
  return record ? { ...record } : null;
}

/**
 * Upsert a payment record (create or update based on providerPaymentId).
 */
export async function upsertPaymentRecord(
  input: Omit<PaymentRecord, "id" | "createdAt">
): Promise<PaymentRecord> {
  const existing = paymentRecordsStore.find(
    (p) => p.providerPaymentId === input.providerPaymentId
  );

  if (existing) {
    const updated: PaymentRecord = {
      ...existing,
      ...input,
    };
    const index = paymentRecordsStore.findIndex(
      (p) => p.id === existing.id
    );
    if (index !== -1) {
      paymentRecordsStore[index] = updated;
    }
    return { ...updated };
  }

  const record: PaymentRecord = {
    ...input,
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  paymentRecordsStore.push(record);
  return { ...record };
}
