import { NextResponse } from "next/server";
import {
  createPolygon,
  listPolygons,
  getPolygon,
  updatePolygon,
  deletePolygon,
  getPolygonWeather,
  getPolygonSatellite,
  getPolygonSoil,
  type AMPolygon,
} from "@/lib/agromonitoring-service";

/**
 * GET /api/agromonitoring/polygons
 * List all polygons from AgroMonitoring
 *
 * Query params:
 *   - id: get a single polygon by ID
 *   - include: comma-separated: "weather", "satellite", "soil" (only when id is provided)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const include = searchParams.get("include") || "";

    if (!process.env.AGROMONITORING_API_KEY) {
      return NextResponse.json(
        { error: "AGROMONITORING_API_KEY not configured" },
        { status: 400 }
      );
    }

    // Get single polygon
    if (id) {
      const polygon = await getPolygon(id);
      const result: Record<string, unknown> = { polygon };

      if (include.includes("weather")) {
        result.weather = await getPolygonWeather(id);
      }
      if (include.includes("satellite")) {
        result.satellite = await getPolygonSatellite(id);
      }
      if (include.includes("soil")) {
        result.soil = await getPolygonSoil(id);
      }

      return NextResponse.json(result);
    }

    // List all polygons
    const polygons = await listPolygons();
    return NextResponse.json({ polygons });
  } catch (error) {
    console.error("AgroMonitoring API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch AgroMonitoring data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agromonitoring/polygons
 * Create a new polygon in AgroMonitoring
 *
 * Body:
 * {
 *   name: string,
 *   boundaries: [{ lat, lng }]
 * }
 */
export async function POST(request: Request) {
  try {
    if (!process.env.AGROMONITORING_API_KEY) {
      return NextResponse.json(
        { error: "AGROMONITORING_API_KEY not configured" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.name || !body.boundaries || body.boundaries.length < 3) {
      return NextResponse.json(
        { error: "name and at least 3 boundaries are required" },
        { status: 400 }
      );
    }

    const polygon: AMPolygon = await createPolygon(body.name, body.boundaries);

    return NextResponse.json({ polygon }, { status: 201 });
  } catch (error) {
    console.error("Failed to create AgroMonitoring polygon:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create polygon" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agromonitoring/polygons
 * Update a polygon in AgroMonitoring
 *
 * Body:
 * {
 *   id: string,
 *   name?: string,
 *   boundaries?: [{ lat, lng }]
 * }
 */
export async function PUT(request: Request) {
  try {
    if (!process.env.AGROMONITORING_API_KEY) {
      return NextResponse.json(
        { error: "AGROMONITORING_API_KEY not configured" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const polygon = await updatePolygon(body.id, {
      name: body.name,
      boundaries: body.boundaries,
    });

    return NextResponse.json({ polygon });
  } catch (error) {
    console.error("Failed to update AgroMonitoring polygon:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update polygon" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agromonitoring/polygons
 * Delete a polygon in AgroMonitoring
 *
 * Body:
 * {
 *   id: string
 * }
 */
export async function DELETE(request: Request) {
  try {
    if (!process.env.AGROMONITORING_API_KEY) {
      return NextResponse.json(
        { error: "AGROMONITORING_API_KEY not configured" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await deletePolygon(body.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete AgroMonitoring polygon:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete polygon" },
      { status: 500 }
    );
  }
}
