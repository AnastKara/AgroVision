import { NextResponse } from "next/server";
import {
  searchSatelliteImages,
  getImageStats,
  getPolygon,
  type AMImageSearchResult,
  type AMImageStats,
} from "@/lib/agromonitoring-service";
import { computeAnalytics } from "@/lib/ndvi-analytics";

/**
 * GET /api/agromonitoring/satellite
 *
 * Fetch NDVI timeline + predictive analytics for a field (polygon).
 *
 * Query params:
 *   - polygonId: AgroMonitoring polygon ID (required)
 *   - cropType: crop type for yield prediction (default: "wheat")
 *   - areaHa: field area in hectares (default: 1)
 *   - health: current field health 0-100 (optional)
 *   - days: look-back period in days (default: 180)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const polygonId = searchParams.get("polygonId");
    const cropType = searchParams.get("cropType") || "wheat";
    const areaHa = parseFloat(searchParams.get("areaHa") || "1");
    const health = searchParams.get("health")
      ? parseFloat(searchParams.get("health")!)
      : undefined;
    const days = parseInt(searchParams.get("days") || "180", 10);

    if (!polygonId) {
      return NextResponse.json(
        { error: "polygonId is required" },
        { status: 400 }
      );
    }

    if (!process.env.AGROMONITORING_API_KEY) {
      return NextResponse.json(
        { error: "AGROMONITORING_API_KEY not configured" },
        { status: 400 }
      );
    }

    // Verify polygon exists
    const polygon = await getPolygon(polygonId);
    if (!polygon) {
      return NextResponse.json(
        { error: "Polygon not found" },
        { status: 404 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const start = now - days * 24 * 60 * 60;

    // Search for satellite images in the date range
    const images = await searchSatelliteImages(polygon.id, start, now);

    // Fetch stats for each cloud-free, visible image
    const statsByImage = new Map<string, AMImageStats>();
    const cloudFreeImages: AMImageSearchResult[] = [];
    for (const img of images) {
      if (!img.visible || img.cloud_coverage >= 30) continue;
      cloudFreeImages.push(img);
      try {
        const stats = await getImageStats(img.id);
        statsByImage.set(img.id, stats);
      } catch (e) {
        console.warn(`Failed to fetch stats for image ${img.id}:`, e);
      }
    }

    // Compute analytics
    const analytics = computeAnalytics(
      cloudFreeImages,
      statsByImage,
      cropType,
      areaHa,
      health
    );

    return NextResponse.json({
      ...analytics,
      polygon: {
        id: polygon.id,
        name: polygon.name,
      },
    });
  } catch (error) {
    console.error("Satellite analytics API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch satellite analytics" },
      { status: 500 }
    );
  }
}
