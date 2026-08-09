/**
 * Server-Side Access Guard
 *
 * Shared helper for protecting server routes, server components, and API
 * routes. Validates, in order:
 *   1. The user is authenticated
 *   2. The user's email is verified
 *   3. The user has an ACTIVE subscription (status active or trialing)
 *
 * Subscription status is read from Supabase `user.user_metadata` (populated
 * only by verified Stripe webhooks) — never from the client.
 *
 * This is the single reusable gate used across the app. It MUST be used by
 * every protected route/API so no endpoint can be reached without payment.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getSubscriptionMetadata,
  isActiveStatus,
  type SubscriptionMetadata,
} from "./subscription-store";

// ============================================================
// Complimentary / Admin Free Access
// ============================================================
// Emails in this list are granted full access WITHOUT an active
// subscription. This lets the owner (and any internal accounts)
// use AgroVision for free. Email matching is case-insensitive.
const COMPLIMENTARY_EMAILS = new Set<string>([
  process.env.ADMIN_FREE_ACCESS_EMAIL?.toLowerCase() ?? "",
  "anast13kara@gmail.com",
].filter(Boolean));

/**
 * Returns true if the given email is on the complimentary/free-access list.
 */
export function isComplimentaryEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return COMPLIMENTARY_EMAILS.has(email.trim().toLowerCase());
}

// ============================================================
// Result types
// ============================================================

export interface AccessCheckResult {
  /** Whether the request is allowed. */
  allowed: boolean;
  /** The authenticated user (if any). */
  userId: string | null;
  /** The user's email (if any). */
  email: string | null;
  /** The resolved subscription metadata (if any). */
  subscription: SubscriptionMetadata | null;
  /** Reason why access was denied. */
  reason?: "unauthorized" | "unverified" | "inactive_subscription";
}

// ============================================================
// Core check (non-redirecting)
// ============================================================

/**
 * Perform the access check for the current request.
 * Returns a structured result that callers can act on.
 */
export async function checkAccess(): Promise<AccessCheckResult> {
  const supabase = await createClient();

// If Supabase is not configured, there is no way to positively verify an
  // active subscription — deny access so the paywall can never be bypassed.
  // Once Supabase is configured, the full production gate below is enforced.
  if (!supabase) {
    return {
      allowed: false,
      userId: null,
      email: null,
      subscription: null,
      reason: "inactive_subscription",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      allowed: false,
      userId: null,
      email: null,
      subscription: null,
      reason: "unauthorized",
    };
  }

  // Email must be verified before accessing protected resources.
  if (!user.email_confirmed_at) {
    return {
      allowed: false,
      userId: user.id,
      email: user.email ?? null,
      subscription: null,
      reason: "unverified",
    };
  }

// Resolve the authoritative subscription status from Supabase metadata.
  const subscription = await getSubscriptionMetadata(user.id);

  // Complimentary / admin free access: these accounts never need an active
  // subscription. They are treated as having full access.
  const isComplimentary = isComplimentaryEmail(user.email);

  if (!isComplimentary && !isActiveStatus(subscription.subscription_status)) {
    return {
      allowed: false,
      userId: user.id,
      email: user.email ?? null,
      subscription,
      reason: "inactive_subscription",
    };
  }

  return {
    allowed: true,
    userId: user.id,
    email: user.email ?? null,
    subscription,
  };
}

/**
 * Convenience wrapper for API routes: returns a JSON response that denies
 * access with the appropriate status code, or null if access is allowed.
 *
 * Usage:
 *   const denied = await requireApiAccess();
 *   if (denied) return denied;
 */
export async function requireApiAccess(): Promise<NextResponse | null> {
  const result = await checkAccess();

  if (result.allowed) {
    return null;
  }

  if (result.reason === "inactive_subscription") {
    return NextResponse.json(
      {
        error:
          "You need an active subscription to access AgroVision.",
        code: "inactive_subscription",
      },
      { status: 403 }
    );
  }

  if (result.reason === "unverified") {
    return NextResponse.json(
      { error: "Please verify your email before continuing.", code: "unverified" },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { error: "Unauthorized", code: "unauthorized" },
    { status: 401 }
  );
}
