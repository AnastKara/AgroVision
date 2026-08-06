/**
 * Billing Plans Configuration
 *
 * Defines the three AgroVision subscription tiers:
 * - Starter: $29/month — for small family farms
 * - Professional: $79/month — for growing operations (Most Popular)
 * - Enterprise: Starting at $199/month — for large-scale agricultural companies
 *
 * Prices are stored in cents for Stripe compatibility.
 */

import type { Plan, PlanId } from "./types";

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for small family farms",
    description:
      "Everything you need to manage a small family farm with basic monitoring and forecasting.",
    monthlyPrice: 2900,
    yearlyPrice: 29000,
    stripePriceIds: {
      monthly: "price_1U19FNJKQYzGcvoMUBPnLKMT",
      yearly: "price_1U19FNJKQYzGcvoMiu1lmh46",
    },
    features: [
      "Up to 50 acres",
      "Basic analytics",
      "Weather forecasts",
      "Task management",
      "Basic satellite monitoring",
      "Limited AI assistant usage",
      "Email support",
    ],
    featureFlags: [
      "basic_analytics",
      "weather_forecasts",
      "task_management",
      "satellite_monitoring",
    ],
    limits: {
      maxAcres: 50,
      maxUsers: 1,
      maxFarms: 1,
      maxFields: 10,
      maxSensors: 5,
      aiMessagesPerMonth: 50,
      apiRequestsPerHour: null,
    },
    order: 1,
  },
  professional: {
    id: "professional",
    name: "Professional",
    tagline: "Ideal for growing operations",
    description:
      "Advanced analytics, AI farming assistant, satellite intelligence, and IoT sensor integrations.",
    monthlyPrice: 7900,
    yearlyPrice: 79000,
    stripePriceIds: {
      monthly: "price_1U19FOJKQYzGcvoMjMGB0JWb",
      yearly: "price_1U19FOJKQYzGcvoMXKn710EA",
    },
    features: [
      "Up to 500 acres",
      "Advanced analytics",
      "AI farming assistant",
      "Farm map and field management",
      "Satellite imagery analysis",
      "Crop health monitoring",
      "Disease and pest detection",
      "Equipment tracking",
      "IoT sensor integrations",
      "API access",
      "Priority support",
      "Unlimited AI assistant usage",
    ],
    featureFlags: [
      "advanced_analytics",
      "weather_forecasts",
      "task_management",
      "farm_map",
      "field_management",
      "satellite_imagery_analysis",
      "crop_health_monitoring",
      "disease_pest_detection",
      "equipment_tracking",
      "iot_sensor_integrations",
      "api_access",
      "ai_assistant",
      "unlimited_ai",
      "priority_support",
    ],
    limits: {
      maxAcres: 500,
      maxUsers: 10,
      maxFarms: 5,
      maxFields: 50,
      maxSensors: 50,
      aiMessagesPerMonth: null,
      apiRequestsPerHour: 1000,
    },
    isPopular: true,
    order: 2,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For large-scale agricultural companies",
    description:
      "Unlimited everything with premium AI models, custom integrations, and dedicated support.",
    monthlyPrice: 19900,
    yearlyPrice: 199000,
    stripePriceIds: {
      monthly: "price_1U19FOJKQYzGcvoMSAiRUDDk",
      yearly: "price_1U19FPJKQYzGcvoMiu0V7MSF",
    },
    features: [
      "Unlimited acres",
      "Full analytics suite",
      "Premium AI models",
      "Unlimited users",
      "Unlimited farms and fields",
      "Custom integrations",
      "Advanced IoT management",
      "Dedicated support",
      "SLA guarantee",
      "White-label options",
      "On-premise deployment option",
      "Custom AI solutions",
    ],
    featureFlags: [
      "full_analytics",
      "weather_forecasts",
      "task_management",
      "farm_map",
      "field_management",
      "satellite_imagery_analysis",
      "crop_health_monitoring",
      "disease_pest_detection",
      "equipment_tracking",
      "iot_sensor_integrations",
      "advanced_iot_management",
      "ai_assistant",
      "unlimited_ai",
      "premium_ai_models",
      "custom_ai_solutions",
      "api_access",
      "custom_integrations",
      "unlimited_users",
      "unlimited_farms_fields",
      "dedicated_support",
      "sla_guarantee",
      "white_label",
      "on_premise_deployment",
    ],
    limits: {
      maxAcres: null,
      maxUsers: null,
      maxFarms: null,
      maxFields: null,
      maxSensors: null,
      aiMessagesPerMonth: null,
      apiRequestsPerHour: null,
    },
    order: 3,
  },
};

/** Ordered list of plans for display */
export const PLANS_LIST: Plan[] = Object.values(PLANS).sort(
  (a, b) => a.order - b.order
);

/** Default plan for new/free users */
export const DEFAULT_PLAN_ID: PlanId = "starter";

/** Free trial duration in days */
export const TRIAL_DAYS = 14;

/**
 * Get a plan by ID.
 */
export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

/**
 * Get the display price for a plan based on billing cycle.
 * Returns price in cents.
 */
export function getPlanPrice(planId: PlanId, cycle: "monthly" | "yearly"): number {
  const plan = PLANS[planId];
  return cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
}

/**
 * Get the formatted display price for a plan.
 * Returns like "$29" or "$199".
 */
export function getPlanDisplayPrice(
  planId: PlanId,
  cycle: "monthly" | "yearly"
): string {
  const price = getPlanPrice(planId, cycle);
  return `$${Math.round(price / 100)}`;
}

/**
 * Check if a plan has a specific feature.
 */
export function planHasFeature(planId: PlanId, feature: string): boolean {
  const plan = PLANS[planId];
  return plan.featureFlags.includes(feature as never);
}

/**
 * Get a plan's limits.
 */
export function getPlanLimits(planId: PlanId) {
  return PLANS[planId].limits;
}

/**
 * Check if a plan is upgradeable to another plan.
 */
export function isUpgrade(current: PlanId, target: PlanId): boolean {
  return PLANS[target].order > PLANS[current].order;
}

/**
 * Check if a plan is downgradeable to another plan.
 */
export function isDowngrade(current: PlanId, target: PlanId): boolean {
  return PLANS[target].order < PLANS[current].order;
}

/**
 * Get the Stripe price ID for a plan and billing cycle.
 */
export function getStripePriceId(planId: PlanId, cycle: "monthly" | "yearly"): string {
  return PLANS[planId].stripePriceIds[cycle];
}
