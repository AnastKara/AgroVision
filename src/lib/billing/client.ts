/**
 * Billing Client Helpers
 *
 * Client-side functions for interacting with the billing API.
 * These are used by the SubscriptionProvider and UI components.
 */

import type { PlanId, BillingCycle, UserSubscription } from "./types";

// ============================================================
// Types
// ============================================================

export interface SubscriptionResponse {
  subscription: UserSubscription & {
    plan: {
      id: PlanId;
      name: string;
      description: string;
      monthlyPrice: number;
      yearlyPrice: number;
      features: string[];
      featureFlags: string[];
      limits: Record<string, number | null>;
    };
  };
  paymentHistory: unknown[];
}

// ============================================================
// API Helpers
// ============================================================

/**
 * Get the current user's subscription from the server.
 */
export async function fetchSubscription(): Promise<SubscriptionResponse | null> {
  try {
    const response = await fetch("/api/billing/subscription", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) return null;
      throw new Error("Failed to fetch subscription");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return null;
  }
}

/**
 * Create a Stripe Checkout session and return the URL.
 */
export async function createCheckoutSession(params: {
  planId: PlanId;
  billingCycle: BillingCycle;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ url: string | null; sessionId: string }> {
  const response = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create checkout session" }));
    throw new Error(error.error || "Failed to create checkout session");
  }

  return await response.json();
}

/**
 * Create a Stripe Customer Portal session and return the URL.
 */
export async function createPortalSession(
  returnUrl?: string
): Promise<{ url: string | null }> {
  const response = await fetch("/api/billing/portal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ returnUrl }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create portal session" }));
    throw new Error(error.error || "Failed to create portal session");
  }

  return await response.json();
}

/**
 * Redirect the user to Stripe Checkout for a plan.
 */
export async function redirectToCheckout(params: {
  planId: PlanId;
  billingCycle: BillingCycle;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<void> {
  const { url } = await createCheckoutSession(params);
  if (url) {
    window.location.href = url;
  } else {
    // Dev mode fallback: redirect to billing page
    window.location.href = params.successUrl || "/dashboard/billing?success=true";
  }
}

/**
 * Open the Stripe Customer Portal for billing management.
 */
export async function openBillingPortal(returnUrl?: string): Promise<void> {
  const { url } = await createPortalSession(returnUrl);
  if (url) {
    window.location.href = url;
  } else {
    // Dev mode fallback: redirect to billing page
    window.location.href = returnUrl || "/dashboard/billing";
  }
}
