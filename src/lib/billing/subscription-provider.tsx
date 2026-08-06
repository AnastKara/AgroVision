"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import type { BillingCycle, FeatureFlag, PlanId, UserSubscription } from "./types";
import { fetchSubscription, type SubscriptionResponse } from "./client";
import { PLANS } from "./plans";

// ============================================================
// Context Types
// ============================================================

interface SubscriptionContextType {
  /** The user's subscription (null while loading) */
  subscription: UserSubscription | null;
  /** The plan details for the user's current plan */
  plan: (typeof PLANS)[PlanId] | null;
  /** Payment history */
  paymentHistory: unknown[];
  /** Whether the subscription is loading */
  loading: boolean;
  /** Whether the subscription data has been loaded */
  loaded: boolean;
  /** Refresh the subscription data */
  refresh: () => Promise<void>;
  /** Check if the user has access to a feature */
  hasFeature: (feature: FeatureFlag) => boolean;
  /** Check if the user's plan is at least the given plan */
  hasPlan: (minPlan: PlanId) => boolean;
  /** Check if the user has an active subscription (not trialing/canceled) */
  isActive: boolean;
  /** Check if the user is on a trial */
  isTrialing: boolean;
  /** The user's current plan ID */
  planId: PlanId;
  /** The user's billing cycle */
  billingCycle: BillingCycle;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  plan: null,
  paymentHistory: [],
  loading: true,
  loaded: false,
  refresh: async () => {},
  hasFeature: () => false,
  hasPlan: () => false,
  isActive: false,
  isTrialing: false,
  planId: "starter",
  billingCycle: "monthly",
});

// ============================================================
// Provider
// ============================================================

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const result = await fetchSubscription();
    setData(result);
    setLoading(false);
    setLoaded(true);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const result = await fetchSubscription();
      if (active) {
        setData(result);
        setLoading(false);
        setLoaded(true);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SubscriptionContextType>(() => {
    const subscription = data?.subscription ?? null;
    const planId: PlanId = subscription?.planId ?? "starter";
    const plan = PLANS[planId] ?? null;
    const isActive = subscription?.status === "active";
    const isTrialing = subscription?.status === "trialing";

    return {
      subscription,
      plan,
      paymentHistory: data?.paymentHistory ?? [],
      loading,
      loaded,
      refresh,
      hasFeature: (feature: FeatureFlag) => {
        if (!plan) return false;
        return plan.featureFlags.includes(feature);
      },
      hasPlan: (minPlan: PlanId) => {
        if (!plan) return false;
        return plan.order >= PLANS[minPlan].order;
      },
      isActive,
      isTrialing,
      planId,
      billingCycle: subscription?.billingCycle ?? "monthly",
    };
  }, [data, loading, loaded, refresh]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useSubscription() {
  return useContext(SubscriptionContext);
}
