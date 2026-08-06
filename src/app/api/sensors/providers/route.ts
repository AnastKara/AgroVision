import { NextResponse } from "next/server";
import { getProviders } from "@/lib/sensor-integration-service";
import { requireApiAccess } from "@/lib/billing/require-access";

/**
 * GET /api/sensors/providers
 * List all supported sensor providers.
 */
export async function GET() {
  // Protected: requires auth + verified email + active subscription.
  const denied = await requireApiAccess();
  if (denied) return denied;

  try {
    const providers = await getProviders();
    return NextResponse.json({ providers });
  } catch (error) {
    console.error("Failed to fetch sensor providers:", error);
    return NextResponse.json({ error: "Failed to fetch sensor providers" }, { status: 500 });
  }
}
