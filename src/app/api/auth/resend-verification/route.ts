import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createVerificationToken,
  getUserById,
  getOrCreateUser,
} from "@/lib/user-service";
import { getEmailProvider } from "@/lib/email/providers";
import { getAppUrl } from "@/lib/email/email-service";

/**
 * POST /api/auth/resend-verification
 *
 * Generate a fresh verification token and email it to the user.
 * Requires an authenticated session.
 */
export async function POST() {
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

// Ensure a user record exists
    const userRecord =
      (await getUserById(user.id)) ||
      (await getOrCreateUser({
        id: user.id,
        email: user.email,
        name: (user.user_metadata?.name as string) || user.email.split("@")[0],
      }));

    if (userRecord.email_verified) {
      return NextResponse.json(
        { error: "Your email is already verified", alreadyVerified: true },
        { status: 400 }
      );
    }

    // Create a fresh expiring token
    const verification = await createVerificationToken(user.id);
    if (!verification) {
      return NextResponse.json({ error: "Failed to create verification token" }, { status: 500 });
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
      console.error("Failed to send verification email:", result.error);
    }

    return NextResponse.json({
      sent: true,
      simulated: result.simulated || false,
      expiresInHours: 24,
    });
  } catch (error) {
    console.error("Failed to resend verification:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to resend verification" },
      { status: 500 }
    );
  }
}
