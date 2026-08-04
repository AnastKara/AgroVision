import { NextResponse } from "next/server";
import { syncIntegration, getSyncLogs } from "@/lib/sensor-integration-service";

/**
 * GET /api/sensors/sync?integrationId=<id>
 * List synchronization history for an integration (or all).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("integrationId") || undefined;
    const logs = await getSyncLogs(integrationId);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to fetch sync logs:", error);
    return NextResponse.json({ error: "Failed to fetch sync logs" }, { status: 500 });
  }
}

/**
 * POST /api/sensors/sync
 * Trigger a sync for a connected integration.
 *
 * Body: { integrationId: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.integrationId) {
      return NextResponse.json({ error: "integrationId is required" }, { status: 400 });
    }

    const log = await syncIntegration(body.integrationId);
    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Failed to sync integration:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync integration" },
      { status: 500 }
    );
  }
}
