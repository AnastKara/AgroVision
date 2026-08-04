"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-provider";
import { useLanguage } from "@/components/language-provider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isConfigured } = useAuth();
  const { t } = useLanguage();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isConfigured && supabase?.auth) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
      });
      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            {t("auth.backLogin")}
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sprout size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">AgroVision</span>
          </div>

          {!sent ? (
            <>
              <h1 className="text-3xl font-bold mb-2">{t("auth.forgotPasswordTitle")}</h1>
              <p className="text-muted-foreground mb-8">
                {t("auth.forgotPasswordSubtitle")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" className="w-full" size="lg">
                  {t("auth.sendResetLink")}
                  <Mail size={16} className="ml-2" />
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t("auth.checkEmail")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("auth.checkEmailSubtitle")} {" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <Button
                variant="outline"
                onClick={() => setSent(false)}
              >
                {t("auth.sendAgain")}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-secondary/10 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
            <Mail size={60} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t("auth.resetTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("auth.resetSubtitle")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

