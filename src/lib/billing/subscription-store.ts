/**
 * Subscription Store — Supabase-backed persistence
 *
 * Persists the user's subscription state to Supabase `auth.users.user_metadata`
 * via the ADMIN client (service role). This is the authoritative source of
 * truth for subscription status, surviving server restarts and deployments.
 *
 * Fields stored (mirrors the requirements):
 *   - stripe_customer_id
 *   - stripe_subscription_id
 *   - subscription_status
 *   - subscription_plan
 *   - subscription_current_period_end
 *
 * When Supabase is not configured (dev mode), it falls back to the existing
 * in-memory store so the app still works locally.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanId, SubscriptionStatus } from "./types";
import {
  getSubscriptionForUser,
  upsertSubscription,
} from "./subscription-service";

// ============================================================
// Types
// ============================================================

export interface SubscriptionMetadata {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_plan: PlanId;
  subscription_current_period_end: string | null;
}

export const DEFAULT_SUBSCRIPTION_METADATA: SubscriptionMetadata = {
  stripe_customer_id: null,
  stripe_subscription_id: null,
  subscription_status: "incomplete",
  subscription_plan: "starter",
  subscription_current_period_end: null,
};

// ============================================================
// Helpers
// ============================================================

/**
 * Extract subscription metadata from a Supabase user object's metadata.
 * Returns defaults if the metadata is absent or malformed.
 */
export function extractSubscriptionMetadata(
  userMetadata: Record<string, unknown> | null | undefined
): SubscriptionMetadata {
  const md = userMetadata ?? {};
  const plan = md.subscription_plan as PlanId | undefined;
  const status = md.subscription_status as SubscriptionStatus | undefined;

  return {
    stripe_customer_id: (md.stripe_customer_id as string) || null,
    stripe_subscription_id: (md.stripe_subscription_id as string) || null,
    subscription_status:
      status && ["active", "trialing", "past_due", "canceled", "unpaid", "incomplete", "incomplete_expired", "paused"].includes(status)
        ? status
        : "incomplete",
    subscription_plan:
      plan && ["starter", "professional", "enterprise"].includes(plan)
        ? plan
        : "starter",
    subscription_current_period_end:
      (md.subscription_current_period_end as string) || null,
  };
}

/**
 * Check if a subscription status grants active access.
 */
export function isActiveStatus(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing";
}

// ============================================================
// Read
// ============================================================

/**
 * Read a user's subscription metadata from Supabase via the admin client.
 * Returns null if Supabase is not configured or the user is not found.
 */
export async function readSubscriptionFromSupabase(
  userId: string
): Promise<SubscriptionMetadata | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data?.user) {
    console.error("[subscription-store] Failed to read user metadata:", error?.message);
    return null;
  }

  return extractSubscriptionMetadata(data.user.user_metadata);
}

/**
 * Read a user's subscription metadata, preferring Supabase and falling back
 * to the in-memory store when Supabase is not configured.
 */
export async function getSubscriptionMetadata(
  userId: string
): Promise<SubscriptionMetadata> {
  const fromSupabase = await readSubscriptionFromSupabase(userId);
  if (fromSupabase) return fromSupabase;

  // Dev fallback: read from in-memory subscription store
  const inMemory = await getSubscriptionForUser(userId);
  if (inMemory) {
    return {
      stripe_customer_id: inMemory.stripeCustomerId,
      stripe_subscription_id: inMemory.stripeSubscriptionId,
      subscription_status: inMemory.status,
      subscription_plan: inMemory.planId,
      subscription_current_period_end: inMemory.currentPeriodEnd,
    };
  }

  return { ...DEFAULT_SUBSCRIPTION_METADATA };
}

// ============================================================
// Write
// ============================================================

/**
 * Persist a user's subscription metadata to Supabase user_metadata via the
 * admin client. Also mirrors to the in-memory store for dev consistency.
 *
 * Returns the resulting metadata, or null on failure.
 */
export async function writeSubscriptionMetadata(
  userId: string,
  input: Partial<SubscriptionMetadata>
): Promise<SubscriptionMetadata | null> {
  const admin = createAdminClient();
  const current = await getSubscriptionMetadata(userId);
  const next: SubscriptionMetadata = {
    ...current,
    ...input,
  };

  // Mirror to in-memory store (used by dev mode and other services)
  try {
    await upsertSubscription({
      userId,
      planId: next.subscription_plan,
      status: next.subscription_status,
      stripeCustomerId: next.stripe_customer_id || null,
      stripeSubscriptionId: next.stripe_subscription_id || null,
      currentPeriodEnd: next.subscription_current_period_end,
      billingCycle: "monthly",
      provider: "stripe",
    });
  } catch (e) {
    console.error("[subscription-store] Failed to mirror to in-memory store:", e);
  }

  if (!admin) {
    // Dev mode without Supabase — the in-memory store is authoritative.
    return next;
  }

  const metadata = {
    ...(userId ? await readUserRawMetadata(admin, userId) : {}),
    stripe_customer_id: next.stripe_customer_id,
    stripe_subscription_id: next.stripe_subscription_id,
    subscription_status: next.subscription_status,
    subscription_plan: next.subscription_plan,
    subscription_current_period_end: next.subscription_current_period_end,
  };

  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });

  if (error) {
    console.error("[subscription-store] Failed to write user metadata:", error.message);
    return null;
  }

  return next;
}

// Helpers to preserve existing metadata fields when updating
type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

async function readUserRawMetadata(
  admin: AdminClient,
  userId: string
): Promise<Record<string, unknown>> {
  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    return data?.user?.user_metadata ?? {};
  } catch {
    return {};
  }
}
