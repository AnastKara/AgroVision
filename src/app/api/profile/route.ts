import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile, updateProfile } from "@/lib/user-service";

/**
 * GET /api/profile
 * Returns the authenticated user's profile fields (name, farm_name, phone, email).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfile(user.id);

    return NextResponse.json({
      profile: {
        email: user.email ?? "",
        ...(profile ?? {}),
      },
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Updates the authenticated user's profile fields.
 *
 * Body (all optional):
 * { name?, farm_name?, phone? }
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    const updated = await updateProfile(user.id, {
      name: typeof body.name === "string" ? body.name : undefined,
      farm_name: typeof body.farm_name === "string" ? body.farm_name : undefined,
      phone: typeof body.phone === "string" ? body.phone : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: { email: user.email ?? "", ...updated } });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
