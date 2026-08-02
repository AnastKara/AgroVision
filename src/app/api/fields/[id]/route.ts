import { NextResponse } from "next/server";
import { getField, updateField, deleteField } from "@/lib/fields-service";
import { getPolygon, updatePolygon, deletePolygon, getPolygonWeather, getPolygonSatellite, getPolygonSoil } from "@/lib/agromonitoring-service";

/**
 * GET /api/fields/[id]
 * Get a single field with optional AgroMonitoring satellite/weather/soil data
 *
 * Query params:
 *   - include: comma-separated: "weather", "satellite", "soil"
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const include = searchParams.get("include") || "";

    const field = await getField(id);
    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    const result: Record<string, unknown> = { field };

    // Include AgroMonitoring data if field has an agroMonitoringId
    if (field.agroMonitoringId && process.env.AGROMONITORING_API_KEY) {
      const agroId = field.agroMonitoringId;

      if (include.includes("weather")) {
        try {
          result.weather = await getPolygonWeather(agroId);
        } catch (e) {
          console.warn("Failed to fetch polygon weather:", e);
          result.weather = null;
        }
      }

      if (include.includes("satellite")) {
        try {
          result.satellite = await getPolygonSatellite(agroId);
        } catch (e) {
          console.warn("Failed to fetch polygon satellite:", e);
          result.satellite = null;
        }
      }

      if (include.includes("soil")) {
        try {
          result.soil = await getPolygonSoil(agroId);
        } catch (e) {
          console.warn("Failed to fetch polygon soil:", e);
          result.soil = null;
        }
      }

      // Include polygon details from AgroMonitoring
      try {
        result.agroPolygon = await getPolygon(agroId);
      } catch (e) {
        console.warn("Failed to fetch AgroMonitoring polygon:", e);
        result.agroPolygon = null;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch field:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch field" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/fields/[id]
 * Update a field. If boundaries changed, also updates AgroMonitoring polygon.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const field = await getField(id);
    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    // Sync boundary changes with AgroMonitoring
    if (body.boundaries && field.agroMonitoringId && process.env.AGROMONITORING_API_KEY) {
      try {
        await updatePolygon(field.agroMonitoringId, {
          name: body.name || field.name,
          boundaries: body.boundaries,
        });
      } catch (e) {
        console.warn("Failed to update AgroMonitoring polygon:", e);
      }
    }

    const updated = await updateField(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update field" }, { status: 500 });
    }

    return NextResponse.json({ field: updated });
  } catch (error) {
    console.error("Failed to update field:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update field" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/fields/[id]
 * Delete a field. Also deletes AgroMonitoring polygon if it exists.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const field = await getField(id);
    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    // Delete AgroMonitoring polygon first
    if (field.agroMonitoringId && process.env.AGROMONITORING_API_KEY) {
      try {
        await deletePolygon(field.agroMonitoringId);
      } catch (e) {
        console.warn("Failed to delete AgroMonitoring polygon:", e);
      }
    }

    const deleted = await deleteField(id);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete field" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete field:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete field" },
      { status: 500 }
    );
  }
}
