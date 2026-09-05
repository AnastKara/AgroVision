"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "./client";
import type { User, AuthError, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Provider = "google" | "github";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  getSession: () => Promise<Session | null>;
  isConfigured: boolean;
  emailVerified: boolean;
  resendVerification: () => Promise<{ error: AuthError | string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithProvider: async () => ({ error: null }),
  signOut: async () => {},
  getSession: async () => null,
  isConfigured: false,
  emailVerified: false,
  resendVerification: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  // Supabase is always configured because the client/server clients fall back
  // to the hardcoded AgroVision project credentials when env vars are absent.
  const isConfigured = true;

  useEffect(() => {
    if (!supabase?.auth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: unknown, session: unknown) => {
        setUser((session as { user: User } | null)?.user ?? null);
        setLoading(false);
        router.refresh();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase?.auth) {
      window.location.href = "/dashboard";
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      if (!supabase?.auth) {
        window.location.href = "/dashboard";
        return { error: null };
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      return { error };
    },
    []
  );

  const signInWithProvider = useCallback(async (provider: Provider) => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    if (!supabase?.auth) {
      window.location.href = "/dashboard";
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase?.auth) {
      await supabase.auth.signOut();
    }
    setUser(null);
    router.push("/");
  }, []);

  const getSession = useCallback(async (): Promise<Session | null> => {
    if (!supabase?.auth) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  }, []);

  const resendVerification = useCallback(async () => {
    if (!supabase?.auth) {
      return { error: null };
    }
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Failed to resend verification email" };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to resend verification email",
      };
    }
  }, []);

  const emailVerified = !!user?.email_confirmed_at;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithProvider,
        signOut,
        getSession,
        isConfigured,
        emailVerified,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
