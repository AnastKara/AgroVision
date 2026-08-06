"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Check,
  Lock,
  Shield,
  Zap,
  Leaf,
  ArrowLeft,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/billing/plans";
import type { BillingCycle, PlanId } from "@/lib/billing/types";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const planId = (searchParams.get("plan") as PlanId) || "professional";
  const cycle = (searchParams.get("cycle") as BillingCycle) || "monthly";
  const successUrl = searchParams.get("success") || "/dashboard/billing?success=true";

  const plan = PLANS[planId];
  const price = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate a payment processing delay
    await new Promise((r) => setTimeout(r, 1200));
    setProcessing(false);
    setDone(true);
    // Redirect to the billing dashboard after a short confirmation
    setTimeout(() => router.push(successUrl), 1500);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <PartyPopper size={36} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Your {plan.name} plan is now active. Redirecting to your dashboard...
          </p>
          <div className="w-8 h-8 mx-auto">
            <Loader2 className="animate-spin text-primary" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
            Secure checkout
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to pricing
        </Link>

        <div className="grid md:grid-cols-5 gap-6 items-start">
          {/* Order summary */}
          <div className="md:col-span-2">
            <Card className={plan.isPopular ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Billing</span>
                  <span className="font-medium capitalize">{cycle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold">
                    ${Math.round(price / 100)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{cycle === "yearly" ? "yr" : "mo"}
                    </span>
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Total due today</span>
                  <span className="text-lg font-bold text-primary">
                    ${Math.round(price / 100)}.{String(price % 100).padStart(2, "0")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={14} className="text-primary" />
              14-day free trial. Cancel anytime. No hidden fees.
            </div>
          </div>

          {/* Payment form */}
          <form onSubmit={handlePay} className="md:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <Input type="email" placeholder="you@farm.com" defaultValue="farmer@agrovizion.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Card information</label>
                  <div className="space-y-2">
                    <Input placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" required />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="MM / YY" defaultValue="12 / 28" required />
                      <Input placeholder="CVC" defaultValue="123" required />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name on card</label>
                  <Input placeholder="Alex Driver" defaultValue="Alex Driver" required />
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                  <Lock size={14} className="text-green-500" />
                  This is a simulated checkout for development. No real payment is processed.
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Pay ${Math.round(price / 100)}.00
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <Shield size={12} />
                  Payments are encrypted and processed securely.
                </p>
              </CardContent>
            </Card>
          </form>
        </div>
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
      <CheckoutContent />
    </Suspense>
  );
}
