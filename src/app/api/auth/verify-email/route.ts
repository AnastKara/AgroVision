import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyUserToken } from "@/lib/user-service";

/**
 * GET /api/auth/verify-email?token=...
 *
 * Validate an email verification token and mark the user's email as verified.
 * Returns a JSON response indicating success/failure. The /verify-email
 * page uses this to show the result to the user.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing verification token", verified: false },
      { status: 400 }
    );
  }

  const result = await verifyUserToken(token);

  if (!result.success) {
    const message =
      result.error === "expired"
        ? "This verification link has expired. Please request a new one."
        : "This verification link is invalid. Please request a new one.";
    return NextResponse.json({ error: message, verified: false }, { status: 400 });
  }

  // If a user is logged in, refresh the session so the app picks up verification
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.refreshSession();
  }

  return NextResponse.json({
    verified: true,
    email: result.user?.email,
  });
}
