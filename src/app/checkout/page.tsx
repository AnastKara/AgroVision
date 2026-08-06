"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Lock,
  Shield,
  Leaf,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/billing/plans";
import { createCheckoutSession } from "@/lib/billing/client";
import type { BillingCycle, PlanId } from "@/lib/billing/types";

function CheckoutRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(true);

  const planId = (searchParams.get("plan") as PlanId) || "professional";
  const cycle = (searchParams.get("cycle") as BillingCycle) || "monthly";
  const successUrl =
    searchParams.get("success") || "/dashboard/billing?success=true";
  const cancelUrl = searchParams.get("cancel") || "/pricing?canceled=true";

  const plan = PLANS[planId];

  useEffect(() => {
    let active = true;

    // Create the Stripe Checkout Session on the server and redirect the
    // browser to Stripe's hosted Checkout page. No card details are ever
    // collected inside AgroVision — Stripe handles all payment methods,
    // 3-D Secure, and security.
    const startCheckout = async () => {
      try {
        const { url } = await createCheckoutSession({
          planId,
          billingCycle: cycle,
          successUrl,
          cancelUrl,
        });

if (!active) return;

        // If the returned URL points back to this same /checkout page (dev-mode
        // mock session), avoid an infinite redirect loop and complete the flow
        // by going to the success page instead.
        const isSelfRedirect =
          url && url.includes("/checkout") && url.includes("plan=");

        if (url && !isSelfRedirect) {
          window.location.assign(url);
          return;
        }

        // No real Stripe URL (dev mode without Stripe configured) or the URL
        // loops back to /checkout. Fall back to the success page so the flow
        // still completes.
        setRedirecting(false);
        router.push(successUrl);
      } catch (err) {
        if (!active) return;
        setRedirecting(false);
        setError(
          err instanceof Error ? err.message : "Failed to start checkout"
        );
      }
    };

    startCheckout();

    return () => {
      active = false;
    };
  }, [planId, cycle, successUrl, cancelUrl, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/pricing" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">AgroVision Checkout</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock size={14} className="text-green-500" />
            Secure Stripe Checkout
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          {error ? (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
                <AlertTriangle size={28} className="text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Checkout couldn&apos;t be started
                </h1>
                <p className="text-muted-foreground text-sm">{error}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => router.push("/pricing")}>
                  Back to Pricing
                </Button>
                <Button variant="outline" onClick={() => router.refresh()}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Loader2 className="animate-spin text-primary" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Redirecting to Stripe Checkout
                </h1>
                <p className="text-muted-foreground text-sm">
                  You&apos;re about to securely complete your{" "}
                  <span className="font-medium text-foreground">
                    {plan.name}
                  </span>{" "}
                  subscription on Stripe&apos;s official checkout page.
                </p>
              </div>

              {/* Order summary */}
              <div className="rounded-2xl border border-border bg-card p-5 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-medium capitalize">{cycle}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">
                    $
                    {Math.round(
                      (cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) /
                        100
                    )}
                    /{cycle === "yearly" ? "yr" : "mo"}
                  </span>
                </div>
              </div>

              {/* Stripe trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Lock, label: "Secure" },
                  { icon: Shield, label: "PCI Compliant" },
                  { icon: Shield, label: "3-D Secure" },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-muted-foreground"
                  >
                    <b.icon size={18} className="text-green-500" />
                    <span className="text-[11px] font-medium">{b.label}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Lock size={12} />
                Payments are processed by Stripe. We never see your card
                details.
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutRedirect />
    </Suspense>
  );
}
