/**
 * Feature Access Control
 *
 * Centralized feature gating logic. All feature access decisions
 * must go through these functions to ensure consistent enforcement
 * of plan-based restrictions across the app.
 */

import type {
  FeatureFlag,
  PlanId,
  SubscriptionStatus,
  UserSubscription,
} from "./types";
import { PLANS, getPlan, getPlanLimits } from "./plans";

// ============================================================
// Constants
// ============================================================

/** Statuses that grant active access to features */
const ACTIVE_STATUSES: SubscriptionStatus[] = [
  "active",
  "trialing",
];

// ============================================================
// Core Helpers
// ============================================================

/**
 * Check if a subscription is active (or trialing).
 */
export function isSubscriptionActive(
  subscription: UserSubscription | null
): boolean {
  if (!subscription) return false;
  return ACTIVE_STATUSES.includes(subscription.status);
}

/**
 * Get the effective plan ID for a subscription.
 * Falls back to the default plan (starter) if subscription is null
 * or inactive.
 */
export function getEffectivePlanId(
  subscription: UserSubscription | null
): PlanId {
  if (!subscription || !ACTIVE_STATUSES.includes(subscription.status)) {
    return "starter";
  }
  return subscription.planId;
}

/**
 * Check if a user has access to a specific feature.
 * This is the primary function used throughout the app.
 */
export function hasFeature(
  subscription: UserSubscription | null,
  feature: FeatureFlag
): boolean {
  const planId = getEffectivePlanId(subscription);
  const plan = PLANS[planId];
  return plan.featureFlags.includes(feature);
}

/**
 * Check if a user's plan is at least the given plan.
 * E.g. hasPlan(sub, "professional") returns true for
 * Professional and Enterprise users.
 */
export function hasPlan(
  subscription: UserSubscription | null,
  minPlan: PlanId
): boolean {
  const currentPlanId = getEffectivePlanId(subscription);
  return PLANS[currentPlanId].order >= PLANS[minPlan].order;
}

/**
 * Get the current plan for a subscription.
 */
export function getCurrentPlan(subscription: UserSubscription | null) {
  const planId = getEffectivePlanId(subscription);
  return PLANS[planId];
}

/**
 * Get feature flags available to a subscription.
 */
export function getAvailableFeatures(
  subscription: UserSubscription | null
): FeatureFlag[] {
  const planId = getEffectivePlanId(subscription);
  return PLANS[planId].featureFlags;
}

// ============================================================
// Limit Checks
// ============================================================

/**
 * Check if a user can add more acres.
 */
export function canAddAcres(
  subscription: UserSubscription | null,
  currentAcres: number
): boolean {
  const limits = getPlanLimits(getEffectivePlanId(subscription));
  if (limits.maxAcres === null) return true;
  return currentAcres < limits.maxAcres;
}

/**
 * Check if a user can add more users.
 */
export function canAddUsers(
  subscription: UserSubscription | null,
  currentUsers: number
): boolean {
  const limits = getPlanLimits(getEffectivePlanId(subscription));
  if (limits.maxUsers === null) return true;
  return currentUsers < limits.maxUsers;
}

/**
 * Check if a user can add more fields.
 */
export function canAddFields(
  subscription: UserSubscription | null,
  currentFields: number
): boolean {
  const limits = getPlanLimits(getEffectivePlanId(subscription));
  if (limits.maxFields === null) return true;
  return currentFields < limits.maxFields;
}

/**
 * Check if a user can add more sensors.
 */
export function canAddSensors(
  subscription: UserSubscription | null,
  currentSensors: number
): boolean {
  const limits = getPlanLimits(getEffectivePlanId(subscription));
  if (limits.maxSensors === null) return true;
  return currentSensors < limits.maxSensors;
}

/**
 * Check if AI usage is within limits.
 * Returns true if unlimited or within the monthly message limit.
 */
export function canUseAI(
  subscription: UserSubscription | null,
  messagesUsedThisMonth: number
): boolean {
  const limits = getPlanLimits(getEffectivePlanId(subscription));
  if (limits.aiMessagesPerMonth === null) return true;
  return messagesUsedThisMonth < limits.aiMessagesPerMonth;
}

// ============================================================
// Plan Comparison
// ============================================================

/**
 * Get the plan upgrade path for a subscription.
 * Returns the next plan tier, or null if already on the highest plan.
 */
export function getUpgradePath(
  subscription: UserSubscription | null
): PlanId | null {
  const currentPlanId = getEffectivePlanId(subscription);
  const currentOrder = PLANS[currentPlanId].order;

  const nextPlan = Object.values(PLANS)
    .sort((a, b) => a.order - b.order)
    .find((plan) => plan.order > currentOrder);

  return nextPlan?.id || null;
}

/**
 * Get the plan downgrade path for a subscription.
 * Returns the next lower plan tier, or null if already on the lowest plan.
 */
export function getDowngradePath(
  subscription: UserSubscription | null
): PlanId | null {
  const currentPlanId = getEffectivePlanId(subscription);
  const currentOrder = PLANS[currentPlanId].order;

  const prevPlan = Object.values(PLANS)
    .sort((a, b) => b.order - a.order)
    .find((plan) => plan.order < currentOrder);

  return prevPlan?.id || null;
}

// ============================================================
// Usage Summaries
// ============================================================

/**
 * Get a human-readable summary of what the user's plan includes.
 */
export function getPlanFeatureSummary(
  subscription: UserSubscription | null
): string[] {
  const plan = getCurrentPlan(subscription);
  return plan.features;
}

/**
 * Get the user's usage limits as a formatted object.
 */
export function getUsageLimits(subscription: UserSubscription | null) {
  const planId = getEffectivePlanId(subscription);
  const limits = getPlanLimits(planId);
  return {
    ...limits,
    maxAcres: limits.maxAcres === null ? "Unlimited" : limits.maxAcres,
    maxUsers: limits.maxUsers === null ? "Unlimited" : limits.maxUsers,
    maxFarms: limits.maxFarms === null ? "Unlimited" : limits.maxFarms,
    maxFields: limits.maxFields === null ? "Unlimited" : limits.maxFields,
    maxSensors: limits.maxSensors === null ? "Unlimited" : limits.maxSensors,
    aiMessagesPerMonth:
      limits.aiMessagesPerMonth === null
        ? "Unlimited"
        : limits.aiMessagesPerMonth,
    apiRequestsPerHour:
      limits.apiRequestsPerHour === null
        ? "Unlimited"
        : limits.apiRequestsPerHour,
  };
}

/**
 * Get a plan's feature flags for display.
 */
export function getPlanFeatures(planId: PlanId): FeatureFlag[] {
  return getPlan(planId).featureFlags;
}
