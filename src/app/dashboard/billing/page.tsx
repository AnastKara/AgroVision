"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Check,
  ArrowRight,
  Crown,
  Sparkles,
  Zap,
  Calendar,
  RefreshCcw,
  Shield,
  Receipt,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/lib/billing/subscription-provider";
import { openBillingPortal } from "@/lib/billing/client";
import { PLANS, PLANS_LIST } from "@/lib/billing/plans";
import type { PaymentRecord } from "@/lib/billing/types";
import { PlanBadge } from "@/components/billing/plan-badge";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const router = useRouter();
  const {
    subscription,
    plan,
    planId,
    billingCycle,
    isTrialing,
    paymentHistory,
    loading,
  } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  const status = subscription?.status;
  const currentPlan = plan || PLANS[planId];
  const limits = currentPlan.limits;

  const statusLabel: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    trialing: { label: "Trial", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    past_due: { label: "Past Due", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    canceled: { label: "Canceled", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    unpaid: { label: "Unpaid", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    incomplete: { label: "Incomplete", className: "bg-muted text-muted-foreground border-border" },
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      await openBillingPortal("/dashboard/billing");
    } catch (error) {
      console.error("Failed to open portal:", error);
    } finally {
      setPortalLoading(false);
    }
  };

  const nextPlan = PLANS_LIST.find((p) => p.order > currentPlan.order);
  const prevPlan = PLANS_LIST.find((p) => p.order < currentPlan.order);

  const usageItems = [
    { key: "acres", label: "Acres", used: 40, max: limits.maxAcres },
    { key: "users", label: "Users", used: 3, max: limits.maxUsers },
    { key: "fields", label: "Fields", used: 12, max: limits.maxFields },
    { key: "sensors", label: "Sensors", used: 8, max: limits.maxSensors },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard size={26} className="text-primary" />
            Billing & Plan
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription, billing cycle, and payment methods.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PlanBadge />
          {status && (
            <Badge
              variant="outline"
              className={cn("font-medium", statusLabel[status]?.className)}
            >
              {statusLabel[status]?.label || status}
            </Badge>
          )}
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 size={28} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your subscription...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Plan Card */}
          <Card className={cn("relative overflow-hidden", currentPlan.isPopular && "border-primary")}>
            {/* Success banner */}
            <div className="flex items-center gap-2 px-6 py-3 bg-green-500/10 border-b border-green-500/20 text-green-600 text-sm font-medium">
              <PartyPopper size={16} />
              Your subscription is active. Enjoy all the benefits of your {currentPlan.name} plan.
            </div>
            {currentPlan.isPopular && (
              <div className="absolute top-14 right-6 hidden sm:block">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Zap size={12} />
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown size={18} className={currentPlan.isPopular ? "text-amber-500" : "text-primary"} />
                Current Plan — {currentPlan.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan pricing & cycle */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    ${Math.round((billingCycle === "yearly" ? currentPlan.yearlyPrice : currentPlan.monthlyPrice) / 100)}
                    <span className="text-base font-normal text-muted-foreground">/{billingCycle === "yearly" ? "yr" : "mo"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {billingCycle === "yearly" ? "Billed annually" : "Billed monthly"}
                    {subscription?.cancelAtPeriodEnd && " · Cancels at period end"}
                    {subscription?.currentPeriodEnd && (
                      <>
                        {" · "}Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleOpenPortal} disabled={portalLoading}>
                    {portalLoading ? <Loader2 size={16} className="animate-spin mr-1" /> : <RefreshCcw size={16} className="mr-1" />}
                    Manage Billing
                  </Button>
                  <Button onClick={() => router.push("/pricing")}>
                    Change Plan
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Plan features */}
              <div>
                <p className="text-sm font-medium mb-3">What&apos;s included</p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {currentPlan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Usage limits */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Plan usage</p>
                  <span className="text-xs text-muted-foreground">
                    {limits.maxAcres === null ? "Unlimited acres" : `${limits.maxAcres} acres max`}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {usageItems.map((item) => {
                    const isUnlimited = item.max === null;
                    const max = Number(item.max) || 1;
                    return (
                      <div key={item.key}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">
                            {isUnlimited ? "Unlimited" : `${item.used} / ${item.max}`}
                          </span>
                        </div>
                        <Progress
                          value={isUnlimited ? 100 : (item.used / max) * 100}
                          variant={!isUnlimited && item.used / max > 0.8 ? "warning" : "default"}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade / Downgrade */}
          <div className="grid md:grid-cols-2 gap-6">
            {nextPlan ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles size={16} className="text-primary" />
                    Upgrade to {nextPlan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{nextPlan.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {nextPlan.features.slice(0, 4).map((f) => (
                      <Badge key={f} variant="secondary" className="text-[11px]">
                        {f}
                      </Badge>
                    ))}
                    {nextPlan.features.length > 4 && (
                      <Badge variant="outline" className="text-[11px]">
                        +{nextPlan.features.length - 4} more
                      </Badge>
                    )}
                  </div>
                  <Button onClick={() => router.push("/pricing")} className="w-full">
                    Upgrade to {nextPlan.name}
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Crown size={16} className="text-amber-500" />
                    You&apos;re on the highest plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You have access to every AgroVision feature. Contact our sales team for custom
                    enterprise solutions.
                  </p>
                </CardContent>
              </Card>
            )}

            {prevPlan ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowRight size={16} className="rotate-180 text-muted-foreground" />
                    Downgrade to {prevPlan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Save costs by switching to the {prevPlan.name} plan. You&apos;ll keep access until the
                    end of your billing period.
                  </p>
                  <Button variant="outline" onClick={handleOpenPortal} className="w-full">
                    Manage Subscription
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield size={16} className="text-green-500" />
                    Starter plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re currently on the lowest available plan. Upgrade anytime to unlock more
                    features.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt size={18} className="text-primary" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No payments yet. Your first invoice will appear here after your trial ends.
                </p>
              ) : (
                <div className="space-y-3">
                  {(paymentHistory as PaymentRecord[]).map((payment, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Receipt size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{payment.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : "Processing"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          ${((payment.amount || 0) / 100).toFixed(2)}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            payment.status === "paid"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar size={16} className="text-primary" />
                Billing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">Billing cycle</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">Next renewal</span>
                <span className="font-medium">
                  {subscription?.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">Trial</span>
                <span className="font-medium">{isTrialing ? "Active" : "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">Payment method</span>
                <span className="font-medium">—</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
