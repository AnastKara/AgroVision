/**
 * Server-Side Plan Checking
 *
 * Helpers for server components and API routes to enforce
 * plan-based feature access. Use these in Server Components,
 * Route Handlers, and Server Actions.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateDefaultSubscription,
} from "@/lib/billing/subscription-service";
import {
  hasFeature,
  hasPlan,
  isSubscriptionActive,
} from "@/lib/billing/feature-access";
import type { FeatureFlag, PlanId, UserSubscription } from "./types";

/**
 * Get the current user's subscription from the server.
 * Returns null if unauthenticated or Supabase is not configured.
 */
export async function getCurrentSubscription(): Promise<UserSubscription | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return getOrCreateDefaultSubscription(user.id);
}

/**
 * Require the user to be authenticated.
 * Redirects to /login if not logged in.
 */
export async function requireAuth(): Promise<UserSubscription> {
  const subscription = await getCurrentSubscription();
  if (!subscription) {
    redirect("/login");
  }
  return subscription;
}

/**
 * Server-side plan gate — redirects the user to the pricing page
 * if they don't have the required plan tier.
 *
 * Usage in a Server Component:
 *   await requirePlan("professional");
 */
export async function requirePlan(minPlan: PlanId): Promise<UserSubscription> {
  const subscription = await requireAuth();

  if (!isSubscriptionActive(subscription) || !hasPlan(subscription, minPlan)) {
    redirect("/pricing");
  }

  return subscription;
}

/**
 * Server-side feature gate — redirects the user to the pricing page
 * if they don't have the required feature.
 *
 * Usage in a Server Component:
 *   await requireFeature("ai_assistant");
 */
export async function requireFeature(
  feature: FeatureFlag
): Promise<UserSubscription> {
  const subscription = await requireAuth();

  if (!isSubscriptionActive(subscription) || !hasFeature(subscription, feature)) {
    redirect("/pricing");
  }

  return subscription;
}

/**
 * Non-redirecting variant of requirePlan for use in API routes.
 * Returns an object describing whether the user is allowed.
 */
export async function checkPlanAccess(
  minPlan: PlanId
): Promise<{ allowed: boolean; subscription: UserSubscription | null; reason?: string }> {
  const subscription = await getCurrentSubscription();
  if (!subscription) {
    return { allowed: false, subscription: null, reason: "unauthorized" };
  }
  if (!isSubscriptionActive(subscription)) {
    return { allowed: false, subscription, reason: "inactive" };
  }
  if (!hasPlan(subscription, minPlan)) {
    return { allowed: false, subscription, reason: "insufficient_plan" };
  }
  return { allowed: true, subscription };
}

/**
 * Non-redirecting variant of requireFeature for use in API routes.
 */
export async function checkFeatureAccess(
  feature: FeatureFlag
): Promise<{ allowed: boolean; subscription: UserSubscription | null; reason?: string }> {
  const subscription = await getCurrentSubscription();
  if (!subscription) {
    return { allowed: false, subscription: null, reason: "unauthorized" };
  }
  if (!isSubscriptionActive(subscription)) {
    return { allowed: false, subscription, reason: "inactive" };
  }
  if (!hasFeature(subscription, feature)) {
    return { allowed: false, subscription, reason: "insufficient_plan" };
  }
  return { allowed: true, subscription };
}
