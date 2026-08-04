import { NextResponse } from "next/server";
import { getProviders } from "@/lib/sensor-integration-service";

/**
 * GET /api/sensors/providers
 * List all supported sensor providers.
 */
export async function GET() {
  try {
    const providers = await getProviders();
    return NextResponse.json({ providers });
  } catch (error) {
    console.error("Failed to fetch sensor providers:", error);
    return NextResponse.json({ error: "Failed to fetch sensor providers" }, { status: 500 });
  }
}
