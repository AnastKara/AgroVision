/**
 * Billing & Subscription Types
 *
 * Core type definitions for the AgroVision subscription and billing system.
 * These types are shared across the payment abstraction, database layer,
 * API routes, and client-side UI.
 */

// ============================================================
// Plan Definitions
// ============================================================

export type PlanId = "starter" | "professional" | "enterprise";

export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type PaymentProvider = "stripe" | "adyen" | "paddle";

// ============================================================
// Feature Flags
// ============================================================

export type FeatureFlag =
  // Core features
  | "basic_analytics"
  | "advanced_analytics"
  | "full_analytics"
  | "weather_forecasts"
  | "task_management"
  | "farm_map"
  | "field_management"
  | "satellite_monitoring"
  | "satellite_imagery_analysis"
  | "crop_health_monitoring"
  | "disease_pest_detection"
  | "equipment_tracking"
  | "iot_sensor_integrations"
  | "advanced_iot_management"
  | "ai_assistant"
  | "unlimited_ai"
  | "premium_ai_models"
  | "custom_ai_solutions"
  | "api_access"
  | "custom_integrations"
  | "unlimited_users"
  | "unlimited_farms_fields"
  | "priority_support"
  | "dedicated_support"
  | "sla_guarantee"
  | "white_label"
  | "on_premise_deployment";

// ============================================================
// Plan Structure
// ============================================================

export interface PlanLimits {
  /** Maximum acres allowed (null = unlimited) */
  maxAcres: number | null;
  /** Maximum number of users (null = unlimited) */
  maxUsers: number | null;
  /** Maximum number of farms (null = unlimited) */
  maxFarms: number | null;
  /** Maximum number of fields (null = unlimited) */
  maxFields: number | null;
  /** Maximum number of IoT sensors (null = unlimited) */
  maxSensors: number | null;
  /** AI assistant message limit per month (null = unlimited) */
  aiMessagesPerMonth: number | null;
  /** API requests per hour (null = unlimited) */
  apiRequestsPerHour: number | null;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  tagline: string;
  /** Monthly price in cents */
  monthlyPrice: number;
  /** Yearly price in cents (usually discounted) */
  yearlyPrice: number;
  /** Stripe Price IDs for monthly/yearly billing */
  stripePriceIds: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  featureFlags: FeatureFlag[];
  limits: PlanLimits;
  isPopular?: boolean;
  /** Sort order for display */
  order: number;
}

// ============================================================
// User Subscription
// ============================================================

export interface UserSubscription {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  /** Stripe customer ID */
  stripeCustomerId: string | null;
  /** Stripe subscription ID */
  stripeSubscriptionId: string | null;
  /** Current billing cycle */
  billingCycle: BillingCycle;
  /** Current period start (ISO date) */
  currentPeriodStart: string | null;
  /** Current period end (ISO date) */
  currentPeriodEnd: string | null;
  /** Cancel at period end flag */
  cancelAtPeriodEnd: boolean;
  /** Trial end date (ISO date) */
  trialEnd: string | null;
  /** Payment provider */
  provider: PaymentProvider;
  /** Created/updated timestamps */
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Payment Records
// ============================================================

export interface PaymentRecord {
  id: string;
  userId: string;
  subscriptionId: string | null;
  /** Stripe invoice/payment intent ID */
  providerPaymentId: string;
  /** Stripe customer ID */
  stripeCustomerId: string | null;
  amount: number;
  currency: string;
  status: "paid" | "open" | "uncollectible" | "void";
  description: string;
  /** Billing cycle this payment covers */
  billingCycle: BillingCycle;
  /** Payment date */
  paidAt: string | null;
  /** Due date */
  dueAt: string;
  createdAt: string;
}

// ============================================================
// Webhook Events
// ============================================================

export type WebhookEventType =
  | "checkout.session.completed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed";

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, unknown>;
  createdAt: string;
}
