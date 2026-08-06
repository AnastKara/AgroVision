/**
 * PaymentService Abstraction
 *
 * Defines the contract for payment providers (Stripe, Adyen, Paddle, etc.).
 * The application business logic depends only on this interface, so we can
 * switch payment providers without rewriting any business logic.
 */

import type {
  BillingCycle,
  PlanId,
  PaymentProvider,
  UserSubscription,
  WebhookEventType,
} from "./types";

// ============================================================
// Request/Response Types
// ============================================================

export interface CreateCustomerParams {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionParams {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  /** Allow promo codes */
  allowPromotionCodes?: boolean;
  /** Trial period in days */
  trialPeriodDays?: number;
}

export interface CreateCheckoutSessionResult {
  sessionId: string;
  url: string | null;
  /** Customer ID if one was created/used */
  customerId: string | null;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

export interface CreatePortalSessionResult {
  url: string | null;
}

export interface GetSubscriptionParams {
  customerId: string;
  subscriptionId: string;
}

export interface SubscriptionDetails {
  id: string;
  customerId: string;
  status: string;
  planId: PlanId | null;
  billingCycle: BillingCycle;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  /** Raw provider data for advanced use cases */
  raw?: Record<string, unknown>;
}

export interface CancelSubscriptionParams {
  subscriptionId: string;
  /** If true, cancel immediately; otherwise cancel at period end */
  atPeriodEnd?: boolean;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  /** New price ID to switch to */
  priceId?: string;
  /** New quantity (e.g. number of users) */
  quantity?: number;
  metadata?: Record<string, string>;
}

export interface WebhookHandlerResult {
  /** Whether the webhook was successfully processed */
  success: boolean;
  /** Event type that was handled */
  eventType: WebhookEventType | string;
  /** Relevant subscription ID if any */
  subscriptionId?: string;
  /** Relevant customer ID if any */
  customerId?: string;
  /** Any error message */
  error?: string;
}

// ============================================================
// PaymentService Interface
// ============================================================

export interface PaymentService {
  /** The provider name (e.g. "stripe") */
  readonly providerName: PaymentProvider;

  // ---- Customers ----
  createCustomer(params: CreateCustomerParams): Promise<{ id: string }>;
  getCustomer(customerId: string): Promise<{ id: string; email: string | null; name: string | null } | null>;

  // ---- Checkout ----
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CreateCheckoutSessionResult>;

  // ---- Customer Portal (billing management) ----
  createPortalSession(params: CreatePortalSessionParams): Promise<CreatePortalSessionResult>;

  // ---- Subscriptions ----
  getSubscription(params: GetSubscriptionParams): Promise<SubscriptionDetails | null>;
  cancelSubscription(params: CancelSubscriptionParams): Promise<boolean>;
  updateSubscription(params: UpdateSubscriptionParams): Promise<boolean>;

  // ---- Webhooks ----
  /**
   * Verify the raw webhook payload and return the parsed event.
   * Throws if signature verification fails.
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): Promise<{ type: WebhookEventType | string; data: Record<string, unknown> }>;
  /**
   * Process a verified webhook event.
   * Returns details about what was handled.
   */
  handleWebhookEvent(event: {
    type: WebhookEventType | string;
    data: Record<string, unknown>;
  }): Promise<WebhookHandlerResult>;
}
