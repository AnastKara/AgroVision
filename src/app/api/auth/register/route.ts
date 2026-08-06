import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createUser,
  getOrCreateUser,
  createVerificationToken,
  getUserById,
} from "@/lib/user-service";
import { writeSubscriptionMetadata } from "@/lib/billing/subscription-store";
import { getEmailProvider } from "@/lib/email/providers";
import { getAppUrl } from "@/lib/email/email-service";

/**
 * POST /api/auth/register
 *
 * Called after a successful Supabase signup.
 * Creates the AgroVision user record and sends the verification email.
 *
 * Body: { name?: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name =
      (body.name as string) ||
      (user.user_metadata?.name as string) ||
      user.email.split("@")[0];

// Create the user record (idempotent)
    let userRecord = await getUserById(user.id);
    if (!userRecord) {
      try {
        userRecord = await createUser({
          id: user.id,
          email: user.email,
          name,
        });
      } catch {
        // Account already exists; reuse it
        userRecord = await getOrCreateUser({
          id: user.id,
          email: user.email,
          name,
        });
      }
    }

// Initialize the user's subscription metadata (status = incomplete).
    // A new user has no active subscription until a Stripe webhook grants one.
    await writeSubscriptionMetadata(user.id, {
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_status: "incomplete",
      subscription_plan: "starter",
      subscription_current_period_end: null,
    });

    // Create an expiring verification token
    const verification = await createVerificationToken(user.id);
    if (!verification) {
      return NextResponse.json(
        { error: "Failed to create verification token" },
        { status: 500 }
      );
    }

    const appUrl = getAppUrl();
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${verification.token}`;

    // Send the verification email via Resend
    const emailService = getEmailProvider();
    const result = await emailService.sendVerification({
      to: user.email,
      name: userRecord.name,
      verificationUrl,
      expiresInHours: 24,
    });

    if (!result.success) {
      console.error("Failed to send initial verification email:", result.error);
    }

    return NextResponse.json({
      sent: true,
      simulated: result.simulated || false,
      expiresInHours: 24,
    });
  } catch (error) {
    console.error("Failed to register user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register user" },
      { status: 500 }
    );
  }
}
