import { NextResponse } from "next/server";
import {
  getImageStats,
  listPolygons,
  searchSatelliteImages,
} from "@/lib/agromonitoring-service";

/**
 * GET /api/weather/satellite
 *
 * Fetch satellite imagery data (NDVI, EVI) from AgroMonitoring
 *
 * Query params:
 *   - lat: latitude (default: from env)
 *   - lon: longitude (default: from env)
 *   - days: days to look back for satellite images (default: 7)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") || process.env.DEFAULT_FARM_LAT || "40.7128";
  const lon = searchParams.get("lon") || process.env.DEFAULT_FARM_LON || "-74.006";
  const days = parseInt(searchParams.get("days") || "7", 10);

  const apiKey = process.env.AGROMONITORING_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AgroMonitoring API key not configured" },
      { status: 400 }
    );
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const start = now - days * 24 * 60 * 60;

    // AgroMonitoring imagery is associated with a registered polygon, not a
    // free-form latitude/longitude pair. Use the nearest saved farm polygon.
    const polygons = await listPolygons();
    const nearestPolygon = polygons.sort(
      (a, b) =>
        (a.center[1] - Number(lat)) ** 2 + (a.center[0] - Number(lon)) ** 2 -
        ((b.center[1] - Number(lat)) ** 2 + (b.center[0] - Number(lon)) ** 2)
    )[0];

    if (!nearestPolygon) {
      return NextResponse.json({
        ndvi: null,
        evi: null,
        ndmi: null,
        imageUrl: null,
        date: null,
        message: "Add a field to enable satellite imagery.",
      });
    }

    const images = await searchSatelliteImages(nearestPolygon.id, start, now);

    // Get the latest image with NDVI data
    const latestImage = images
      .filter((img) => img.visible && img.cloud_coverage < 30)
      .sort((a, b) => b.dt - a.dt)[0];

    if (!latestImage) {
      return NextResponse.json({
        ndvi: null,
        evi: null,
        ndmi: null,
        imageUrl: null,
        date: null,
        message: "No recent satellite images available (cloud cover may be too high).",
      });
    }

    // Get stats for the latest image
    const stats = await getImageStats(latestImage.id);

    return NextResponse.json({
      ndvi: stats.ndvi?.mean ?? null,
      evi: stats.evi?.mean ?? null,
      ndmi: stats.ndmi?.mean ?? null,
      ndviMin: stats.ndvi?.min ?? null,
      ndviMax: stats.ndvi?.max ?? null,
      eviMin: stats.evi?.min ?? null,
      eviMax: stats.evi?.max ?? null,
      imageUrl: stats.ndvi_url ?? stats.false_color_url ?? null,
      trueColorUrl: stats.true_color_url ?? null,
      date: new Date(latestImage.dt * 1000).toISOString(),
      cloudCoverage: latestImage.cloud_coverage,
      imageId: latestImage.id,
    });
  } catch (error) {
    console.error("Satellite API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch satellite data" },
      { status: 500 }
    );
  }
}
