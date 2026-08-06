import { NextResponse } from "next/server";
import {
  getIntegrations,
  addIntegration,
  removeIntegration,
} from "@/lib/sensor-integration-service";
import { requireApiAccess } from "@/lib/billing/require-access";

/**
 * GET /api/sensors/integrations
 * List all connected sensor integrations.
 */
export async function GET() {
  // Protected: requires auth + verified email + active subscription.
  const denied = await requireApiAccess();
  if (denied) return denied;

  try {
    const integrations = await getIntegrations();
    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Failed to fetch integrations:", error);
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
  }
}

/**
 * POST /api/sensors/integrations
 * Connect a new sensor provider.
 *
 * Body:
 * {
 *   providerId: string,
 *   sensorType: "weather_station" | "soil_sensor" | "irrigation_controller" | "machinery",
 *   farmId: string,
 *   fieldId?: string,
 *   apiKey?: string,          // encrypted before storage
 *   apiSecret?: string,       // encrypted before storage
 *   apiBaseUrl?: string,      // optional base URL for custom providers
 *   oauthTokenRef?: string,
 *   externalSensorIds?: string[],
 *   metadata?: object
 * }
 */
export async function POST(request: Request) {
  // Protected: requires auth + verified email + active subscription.
  const denied = await requireApiAccess();
  if (denied) return denied;

  try {
    const body = await request.json();

    if (!body.providerId) {
      return NextResponse.json({ error: "providerId is required" }, { status: 400 });
    }
    if (!body.sensorType) {
      return NextResponse.json({ error: "sensorType is required" }, { status: 400 });
    }
    if (!body.farmId) {
      return NextResponse.json({ error: "farmId is required" }, { status: 400 });
    }

    const integration = await addIntegration({
      providerId: body.providerId,
      sensorType: body.sensorType,
      farmId: body.farmId,
      fieldId: body.fieldId,
      apiKey: body.apiKey,
      apiSecret: body.apiSecret,
      apiBaseUrl: body.apiBaseUrl,
      oauthTokenRef: body.oauthTokenRef,
      externalSensorIds: body.externalSensorIds,
      metadata: body.metadata,
    });

    return NextResponse.json({ integration }, { status: 201 });
  } catch (error) {
    console.error("Failed to add integration:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add integration" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sensors/integrations?id=<integrationId>
 * Disconnect a sensor integration.
 */
export async function DELETE(request: Request) {
  // Protected: requires auth + verified email + active subscription.
  const denied = await requireApiAccess();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const removed = await removeIntegration(id);
    if (!removed) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove integration:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove integration" },
      { status: 500 }
    );
  }
}
