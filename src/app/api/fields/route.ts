import { NextResponse } from "next/server";
import { getFields, createField, type CreateFieldInput } from "@/lib/fields-service";
import { createPolygon } from "@/lib/agromonitoring-service";
import { requireApiAccess } from "@/lib/billing/require-access";

/**
 * GET /api/fields
 * List all fields
 */
export async function GET() {
  // Protected: requires auth + verified email + active subscription.
  const denied = await requireApiAccess();
  if (denied) return denied;

  try {
    const fields = await getFields();
    return NextResponse.json({ fields });
  } catch (error) {
    console.error("Failed to fetch fields:", error);
    return NextResponse.json({ error: "Failed to fetch fields" }, { status: 500 });
  }
}

/**
 * POST /api/fields
 * Create a new field. Optionally creates a polygon in AgroMonitoring
 * and stores the returned agroMonitoringId.
 *
 * Body:
 * {
 *   name: string,
 *   cropType: string,
 *   boundaries: [{ lat, lng }],
 *   latitude: number,
 *   longitude: number,
 *   syncWithAgroMonitoring?: boolean  // default true
 * }
 */
export async function POST(request: Request) {
  // Protected: requires auth + verified email + active subscription.
  const denied = await requireApiAccess();
  if (denied) return denied;

  try {
    const body = await request.json();

    const input: CreateFieldInput = {
      name: body.name,
      cropType: body.cropType,
      boundaries: body.boundaries,
      latitude: body.latitude,
      longitude: body.longitude,
    };

    if (!input.name || !input.cropType || !input.boundaries || input.boundaries.length < 3) {
      return NextResponse.json(
        { error: "name, cropType, and at least 3 boundaries are required" },
        { status: 400 }
      );
    }

    // Sync with AgroMonitoring to get polygon ID (best effort)
    const syncWithAgro = body.syncWithAgroMonitoring !== false;
    if (syncWithAgro && process.env.AGROMONITORING_API_KEY) {
      try {
        const agroPolygon = await createPolygon(input.name, input.boundaries);
        input.agroMonitoringId = agroPolygon.id;
      } catch (agroError) {
        console.warn("AgroMonitoring polygon creation failed:", agroError);
      }
    }

    const field = await createField(input);

    return NextResponse.json({ field }, { status: 201 });
  } catch (error) {
    console.error("Failed to create field:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create field" },
      { status: 500 }
    );
  }
}

