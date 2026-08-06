"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  Sprout,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<
    "idle" | "checking" | "verified" | "failed" | "resent"
  >(token ? "checking" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  // Verify the token if present in the URL
  useEffect(() => {
    if (!token) return;
    let active = true;

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!active) return;
        if (res.ok && data.verified) {
          setState("verified");
          // Refresh to pick up the new session then redirect to dashboard
          setTimeout(() => {
            router.refresh();
            router.push("/dashboard");
          }, 2000);
        } else {
          setState("failed");
          setError(data.error || "Verification failed. Please try again.");
        }
      } catch {
        if (active) {
          setState("failed");
          setError("Something went wrong. Please try again.");
        }
      }
    };

    verify();
    return () => {
      active = false;
    };
  }, [token, router]);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.sent) {
        setState("resent");
      } else {
        setError(data.error || "Failed to resend. Please try again.");
      }
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sprout size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">AgroVision</span>
        </div>

        <Card>
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
            {state === "checking" && (
              <div className="flex flex-col items-center py-6">
                <Loader2 size={40} className="animate-spin text-primary mb-4" />
                <h1 className="text-xl font-bold mb-2">Verifying your email...</h1>
                <p className="text-sm text-muted-foreground">
                  Please wait a moment while we confirm your email address.
                </p>
              </div>
            )}

            {state === "verified" && (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h1 className="text-xl font-bold mb-2">Email verified!</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Your email has been confirmed. Redirecting you to your dashboard...
                </p>
                <Loader2 size={20} className="animate-spin text-primary" />
              </div>
            )}

            {state === "failed" && (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <XCircle size={32} className="text-red-500" />
                </div>
                <h1 className="text-xl font-bold mb-2">Verification failed</h1>
                <p className="text-sm text-muted-foreground mb-6">{error}</p>
                <Button onClick={handleResend} disabled={resending} className="w-full">
                  {resending ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCcw size={16} className="mr-2" />}
                  Resend verification email
                </Button>
              </div>
            )}

            {(state === "idle" || state === "resent") && (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Mail size={32} className="text-primary" />
                </div>
                <h1 className="text-xl font-bold mb-2">
                  {state === "resent" ? "Verification email sent!" : "Please verify your email first"}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {state === "resent"
                    ? "We've sent you a fresh verification link. Check your inbox and click the link to activate your account."
                    : "We've sent a verification link to your email address. Please check your inbox (and spam folder) and click the link to activate your account before accessing the dashboard."}
                </p>
                <Button onClick={handleResend} disabled={resending} variant="outline" className="w-full">
                  {resending ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCcw size={16} className="mr-2" />}
                  Resend verification email
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  className="w-full mt-3"
                >
                  Back to home
                </Button>
              </div>
            )}

            {error && (state === "idle" || state === "resent") && (
              <p className="text-sm text-destructive w-full">{error}</p>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-6 transition-colors"
            >
              Return to AgroVision home <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
