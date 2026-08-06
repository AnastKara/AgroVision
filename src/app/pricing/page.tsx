"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Sparkles, ArrowRight, Leaf, Shield, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS_LIST, getPlanDisplayPrice } from "@/lib/billing/plans";
import { redirectToCheckout } from "@/lib/billing/client";
import { useSubscription } from "@/lib/billing/subscription-provider";
import { useAuth } from "@/lib/supabase/auth-provider";
import { cn } from "@/lib/utils";

function PricingContent() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
const router = useRouter();
  const searchParams = useSearchParams();
  const accessDenied = searchParams.get("accessDenied") === "true";
  const { user, isConfigured } = useAuth();
  const { planId, isActive } = useSubscription();

const handleSelectPlan = async (planId: string) => {
    setLoadingPlan(planId);

    // If auth is not configured (dev mode), go straight to checkout
    if (!isConfigured) {
      try {
        await redirectToCheckout({
          planId: planId as "starter" | "professional" | "enterprise",
          billingCycle,
          successUrl: "/dashboard/billing?success=true",
          cancelUrl: "/pricing?canceled=true",
        });
      } catch (error) {
        console.error("Failed to start checkout:", error);
        router.push("/dashboard/billing");
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    // If user is not logged in, redirect to signup
    if (!user) {
      router.push(`/register?plan=${planId}`);
      return;
    }

    // If user already has this plan, go to billing
    if (isActive && planId === planId) {
      router.push("/dashboard/billing");
      return;
    }

    try {
      await redirectToCheckout({
        planId: planId as "starter" | "professional" | "enterprise",
        billingCycle,
        successUrl: "/dashboard/billing?success=true",
        cancelUrl: "/pricing?canceled=true",
      });
    } catch (error) {
      console.error("Failed to start checkout:", error);
      router.push("/dashboard/billing");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">AgroVision</span>
          </Link>
<div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Access denied banner */}
      {accessDenied && (
        <div className="bg-destructive/10 border-b border-destructive/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm text-destructive">
            <Lock size={16} className="flex-shrink-0" />
            <span className="font-medium">
              You need an active subscription to access AgroVision.
            </span>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="py-16 lg:py-24 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles size={14} />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            The Operating System
            <br />
            <span className="text-primary">for Modern Farming</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your operation. Upgrade, downgrade, or cancel
            anytime. Every plan includes a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-muted/50 mb-12">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === "monthly"
                  ? "bg-primary text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === "yearly"
                  ? "bg-primary text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <span className="ml-1.5 text-xs bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 px-4">
          {PLANS_LIST.map((plan, index) => {
            const isCurrentPlan = isActive && planId === plan.id;
            const displayPrice = getPlanDisplayPrice(plan.id, billingCycle);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "relative rounded-2xl border p-6 lg:p-8 flex flex-col",
                  plan.isPopular
                    ? "border-primary shadow-xl shadow-primary/10 bg-gradient-to-b from-primary/5 to-background"
                    : "border-border bg-card"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Zap size={12} />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{displayPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.isPopular ? "default" : "outline"}
                  size="lg"
                  className="w-full"
                  disabled={loadingPlan === plan.id}
onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrentPlan
                    ? "Current Plan"
                    : loadingPlan === plan.id
                    ? "Redirecting..."
                    : plan.id === "enterprise"
                    ? "Contact Sales"
                    : "Start Free Trial"}
                  {!isCurrentPlan && <ArrowRight size={16} className="ml-2" />}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise note */}
        <p className="text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
          Need a custom solution for your agricultural company?{" "}
          <Link href="/contact" className="text-primary font-medium underline underline-offset-4">
            Contact our sales team
          </Link>{" "}
          for volume pricing, custom AI models, and white-label options.
        </p>
      </section>

      {/* Trust badges */}
      <section className="py-12 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Secure Payments",
              desc: "PCI-DSS compliant processing via Stripe. Your data is always encrypted.",
            },
            {
              icon: Zap,
              title: "Instant Activation",
              desc: "Get started immediately after signup. No credit card required for trial.",
            },
            {
              icon: Leaf,
              title: "Farmer-First",
              desc: "Built by farmers, for farmers. Real-time support from our agronomy team.",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Leaf size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold">AgroVision</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/security" className="hover:text-foreground">Security</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AgroVision. All rights reserved.
          </p>
        </div>
</footer>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Zap className="animate-pulse text-primary" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
