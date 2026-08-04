"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-provider";
import { useLanguage } from "@/components/language-provider";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, isConfigured } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // If Supabase is not configured, just redirect to dashboard (dev mode)
    if (!isConfigured) {
      window.location.href = "/dashboard";
      return;
    }

    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-secondary/10 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
            <Sprout size={60} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t("auth.registerTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("auth.registerSubtitle")}
          </p>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            {t("auth.backHome")}
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sprout size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">AgroVision</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">{t("auth.createAccount")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("auth.createAccountSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("auth.fullName")}</label>
              <Input
                type="text"
                placeholder="John Farmer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t("auth.email")}</label>
              <Input
                type="email"
                placeholder="you@farm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t("auth.password")}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {t("auth.passwordHint")}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              {t("auth.createAccountButton")}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth.alreadyHaveAccount")} {" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t("auth.signIn")}
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline hover:text-foreground">Terms of Service</Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

