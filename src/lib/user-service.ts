/**
 * User Service
 *
 * Database abstraction layer for the AgroVision users table.
 * Currently uses an in-memory store, designed to be swapped with
 * Supabase/PostgreSQL without changing the rest of the app.
 *
 * User table columns:
 * - id
 * - email
 * - name
 * - email_verified
 * - created_at
 * - subscription_status
 * - subscription_plan
 * - stripe_customer_id
 * - stripe_subscription_id
 */

import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanId, SubscriptionStatus } from "./billing/types";

// ============================================================
// Types
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  created_at: string;
  subscription_status: SubscriptionStatus;
  subscription_plan: PlanId;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

/**
 * Extended profile fields persisted to Supabase `user_metadata`.
 * These are the editable profile fields shown in Settings.
 */
export interface UserProfileFields {
  name?: string;
  farm_name?: string;
  phone?: string;
}

export interface VerificationToken {
  token: string;
  userId: string;
  expiresAt: string;
  used: boolean;
}

// ============================================================
// In-memory store (mocked). Swap with DB queries later.
// ============================================================

const usersStore: User[] = [];
const tokensStore: VerificationToken[] = [];

/** Verification token TTL (hours) */
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

// ============================================================
// Helpers
// ============================================================

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ============================================================
// Email Validation
// ============================================================

/**
 * Validate an email address format.
 * Returns true if the email is valid.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

// ============================================================
// User CRUD
// ============================================================

/**
 * Create a new user record.
 * Throws if the email is invalid or already registered.
 */
export async function createUser(input: {
  id: string;
  email: string;
  name: string;
}): Promise<User> {
  if (!isValidEmail(input.email)) {
    throw new Error("Invalid email format");
  }

  const existing = usersStore.find(
    (u) => u.email.toLowerCase() === input.email.toLowerCase()
  );
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const user: User = {
    id: input.id,
    email: input.email,
    name: input.name,
    email_verified: false,
    created_at: new Date().toISOString(),
    subscription_status: "incomplete",
    subscription_plan: "starter",
    stripe_customer_id: null,
    stripe_subscription_id: null,
  };

  usersStore.push(user);
  return { ...user };
}

/**
 * Get a user by their auth (Supabase) ID.
 */
export async function getUserById(userId: string): Promise<User | null> {
  const user = usersStore.find((u) => u.id === userId);
  return user ? { ...user } : null;
}

/**
 * Get a user by email.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const user = usersStore.find(
    (u) => u.email.toLowerCase() === (email || "").toLowerCase()
  );
  return user ? { ...user } : null;
}

/**
 * Get a user by their Stripe customer ID.
 * Used by the webhook to map Stripe events to the correct user.
 */
export async function getUserByStripeCustomerId(
  stripeCustomerId: string
): Promise<User | null> {
  const user = usersStore.find(
    (u) => u.stripe_customer_id === stripeCustomerId
  );
  return user ? { ...user } : null;
}

/**
 * Update a user's Stripe customer ID.
 */
export async function setUserStripeCustomerId(
  userId: string,
  stripeCustomerId: string
): Promise<User | null> {
  const user = await getUserById(userId);
  if (!user) return null;
  user.stripe_customer_id = stripeCustomerId;
  saveUser(user);
  return { ...user };
}

/**
 * Update a user's subscription fields (from webhook events).
 */
export async function updateUserSubscription(
  userId: string,
  input: {
    subscription_status: SubscriptionStatus;
    subscription_plan: PlanId;
    stripe_subscription_id?: string | null;
  }
): Promise<User | null> {
  const user = await getUserById(userId);
  if (!user) return null;
  user.subscription_status = input.subscription_status;
  user.subscription_plan = input.subscription_plan;
  if (input.stripe_subscription_id !== undefined) {
    user.stripe_subscription_id = input.stripe_subscription_id;
  }
  saveUser(user);
  return { ...user };
}

function saveUser(user: User) {
  const index = usersStore.findIndex((u) => u.id === user.id);
  if (index !== -1) {
    usersStore[index] = user;
  }
}

// ============================================================
// Email Verification
// ============================================================

/**
 * Create an expiring verification token for a user.
 * Returns the raw token (to embed in the verification link).
 */
export async function createVerificationToken(
  userId: string
): Promise<{ token: string; expiresAt: string } | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  // Remove any existing unused tokens for this user
  const remaining = tokensStore.filter(
    (t) => !(t.userId === userId && !t.used)
  );
  tokensStore.length = 0;
  tokensStore.push(...remaining);

  const token = generateToken();
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();

  tokensStore.push({ token, userId, expiresAt, used: false });
  return { token, expiresAt };
}

/**
 * Validate a verification token and mark the user's email as verified.
 * Returns the user if successful, or null if the token is invalid/expired.
 */
export async function verifyUserToken(
  token: string
): Promise<{ success: boolean; user: User | null; error?: string }> {
  const record = tokensStore.find((t) => t.token === token && !t.used);
  if (!record) {
    return { success: false, user: null, error: "invalid" };
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { success: false, user: null, error: "expired" };
  }

  const user = await getUserById(record.userId);
  if (!user) {
    return { success: false, user: null, error: "invalid" };
  }

  // Mark token as used and user as verified
  record.used = true;
  user.email_verified = true;
  saveUser(user);

  return { success: true, user: { ...user } };
}

/**
 * Check whether a user can access the dashboard.
 * Requires the user record to exist AND the email to be verified.
 */
export async function canAccessDashboard(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  return user.email_verified;
}

/**
 * Get a user's verification status.
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  return !!user?.email_verified;
}

// ============================================================
// Profile (Supabase-backed persistence)
// ============================================================

/**
 * Read a user's profile fields (name, farm_name, phone) from Supabase
 * `user_metadata` via the admin client. Falls back to the in-memory store.
 * Returns null if the user is not found.
 */
export async function getProfile(
  userId: string
): Promise<UserProfileFields | null> {
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (!error && data?.user) {
      const md = data.user.user_metadata ?? {};
      return {
        name:
          (md.name as string) ||
          (data.user.email?.split("@")[0] ?? ""),
        farm_name: (md.farm_name as string) || undefined,
        phone: (md.phone as string) || undefined,
      };
    }
  }

  const user = await getUserById(userId);
  if (!user) return null;
  return { name: user.name };
}

/**
 * Update a user's profile fields in Supabase `user_metadata` via the admin
 * client. Preserves all existing metadata fields. Falls back to the
 * in-memory store when Supabase is not configured.
 */
export async function updateProfile(
  userId: string,
  input: UserProfileFields
): Promise<UserProfileFields | null> {
  const admin = createAdminClient();
  const current = (await getProfile(userId)) ?? {};
  const next: UserProfileFields = {
    ...current,
    ...Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined && v !== null)
    ),
  };

  // Mirror to in-memory store
  const user = await getUserById(userId);
  if (user) {
    if (next.name !== undefined) user.name = next.name;
    saveUser(user);
  }

  if (!admin) {
    return next;
  }

  // Read existing raw metadata to preserve other fields
  let rawMetadata: Record<string, unknown> = {};
  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    rawMetadata = data?.user?.user_metadata ?? {};
  } catch {
    // ignore
  }

  const metadata = {
    ...rawMetadata,
    name: next.name,
    farm_name: next.farm_name,
    phone: next.phone,
  };

  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });

  if (error) {
    console.error("[user-service] Failed to update profile:", error.message);
    return null;
  }

  return next;
}

// ============================================================
// Dev/test helpers
// ============================================================

/**
 * (Dev mode) Ensure a user record exists for a Supabase user.
 * If the user doesn't exist yet, create one with an unverified email.
 * Returns the user. Used primarily in dev mode where a real DB isn't present.
 */
export async function getOrCreateUser(input: {
  id: string;
  email: string;
  name: string;
}): Promise<User> {
  const existing = await getUserById(input.id);
  if (existing) return existing;

  const byEmail = await getUserByEmail(input.email);
  if (byEmail) {
    // Reuse the record but map to this auth id
    byEmail.id = input.id;
    saveUser(byEmail);
    return { ...byEmail };
  }

  return createUser(input);
}

/**
 * Get all users (admin/testing).
 */
export async function getAllUsers(): Promise<User[]> {
  return usersStore.map((u) => ({ ...u }));
}

/**
 * Reset the store (dev only).
 */
export function resetUsersStore(): void {
  usersStore.length = 0;
  tokensStore.length = 0;
}
