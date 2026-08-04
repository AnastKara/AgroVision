/**
 * NDVI / Health Analytics Engine
 *
 * Provides time-series analysis, linear regression forecasting,
 * yield prediction, and health trend classification for satellite
 * vegetation index data (NDVI, EVI, NDMI).
 *
 * Lightweight ML using simple linear regression - no external deps.
 */

import type { AMImageSearchResult, AMImageStats } from "@/lib/agromonitoring-service";

// ============================================================
// Types
// ============================================================

export interface NdvPoint {
  /** Unix timestamp (seconds) */
  dt: number;
  /** ISO date string */
  date: string;
  /** NDVI value (-1 to 1) */
  ndvi: number | null;
  /** EVI value */
  evi: number | null;
  /** NDMI value */
  ndmi: number | null;
  /** Cloud coverage % */
  cloudCoverage: number;
  /** Satellite image ID */
  imageId: string;
  /** Image URL (NDVI visualization) */
  ndviUrl?: string | null;
  /** True color image URL */
  trueColorUrl?: string | null;
}

export interface TrendPrediction {
  /** Current (latest) value */
  current: number;
  /** Predicted value over the next `periodDays` */
  predicted: number;
  /** Predicted change */
  change: number;
  /** Direction: improving / declining / stable */
  direction: "improving" | "declining" | "stable";
  /** R² confidence (0-1) */
  rSquared: number;
  /** Slope (per day) */
  slope: number;
  /** Number of data points used */
  dataPoints: number;
  /** Sample dates for the forecast line */
  forecast: { date: string; value: number }[];
}

export interface YieldPrediction {
  /** Predicted yield in kg */
  predictedYield: number;
  /** Confidence (0-1) based on NDVI trend + data density */
  confidence: number;
  /** Expected yield range [min, max] in kg */
  range: [number, number];
  /** key factors */
  factors: {
    currentHealth: number;
    ndviTrend: "improving" | "declining" | "stable";
    cropType: string;
    areaHa: number;
  };
}

export interface AnalyticsResult {
  /** Sorted NDVI timeline (oldest → newest) */
  timeline: NdvPoint[];
  /** Latest NDVI */
  latest: {
    ndvi: number | null;
    evi: number | null;
    ndmi: number | null;
    date: string | null;
    imageId: string | null;
  };
  /** NDVI trend prediction (next 30 days) */
  ndviPrediction: TrendPrediction | null;
  /** EVI trend prediction */
  eviPrediction: TrendPrediction | null;
  /** NDMI trend prediction */
  ndmiPrediction: TrendPrediction | null;
  /** Yield prediction */
  yieldPrediction: YieldPrediction | null;
  /** Overall field health score (0-100) derived from NDVI */
  healthScore: number | null;
  /** Health trend label */
  healthTrend: "improving" | "declining" | "stable" | "no-data";
  /** Summary insight text */
  insights: string[];
  /** When the analysis was computed */
  computedAt: string;
}

// ============================================================
// Constants
// ============================================================

const OPTIMAL_NDVI = 0.75; // NDVI value representing dense, healthy vegetation
const BASE_YIELD_PER_HA: Record<string, number> = {
  wheat: 5400,
  corn: 4200,
  soybeans: 3600,
  rice: 6200,
  apples: 2800,
  barley: 3800,
  oats: 3200,
  sunflower: 2500,
  tomato: 12000,
  default: 4000,
};

// ============================================================
// Helpers
// ============================================================

function getBaseYield(cropType: string): number {
  const key = cropType.toLowerCase();
  for (const [name, val] of Object.entries(BASE_YIELD_PER_HA)) {
    if (key.includes(name)) return val;
  }
  return BASE_YIELD_PER_HA.default;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear regression: given points (x, y), return slope, intercept, R².
 */
export function linearRegression(
  points: { x: number; y: number }[]
): { slope: number; intercept: number; rSquared: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: 0, rSquared: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² = 1 - SSres/SStot
  const meanY = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssRes += (p.y - predicted) ** 2;
    ssTot += (p.y - meanY) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : clamp(1 - ssRes / ssTot, 0, 1);

  return { slope, intercept, rSquared };
}

/**
 * Build a trend prediction for a value timeline.
 * @param values - array of { x: days since first, y: value }
 * @param periodDays - forecast horizon (default 30)
 */
export function buildTrendPrediction(
  values: { x: number; y: number }[],
  periodDays = 30
): TrendPrediction | null {
  if (values.length < 2) return null;

  const { slope, intercept, rSquared } = linearRegression(values);
  const lastX = values[values.length - 1].x;
  const current = values[values.length - 1].y;
  const predicted = slope * (lastX + periodDays) + intercept;

  // Direction classification
  const threshold = Math.abs(current) * 0.05 + 0.005;
  let direction: TrendPrediction["direction"] = "stable";
  if (slope * periodDays > threshold) direction = "improving";
  else if (slope * periodDays < -threshold) direction = "declining";

  // Build forecast points
  const forecast: { date: string; value: number }[] = [];
  const step = Math.max(1, Math.floor(periodDays / 8));
  for (let d = 0; d <= periodDays; d += step) {
    const x = lastX + d;
    forecast.push({
      date: new Date(Date.now() + d * 86400 * 1000).toISOString().split("T")[0],
      value: slope * x + intercept,
    });
  }

  return {
    current,
    predicted,
    change: predicted - current,
    direction,
    rSquared,
    slope,
    dataPoints: values.length,
    forecast,
  };
}

// ============================================================
// Main Analysis
// ============================================================

/**
 * Compute full analytics from a set of satellite images and their stats.
 *
 * @param images - sorted satellite image search results
 * @param statsByImage - map of imageId → stats
 * @param cropType - crop type for yield prediction
 * @param areaHa - field area in hectares
 * @param currentHealth - current field health (0-100) from app data
 */
export function computeAnalytics(
  images: AMImageSearchResult[],
  statsByImage: Map<string, AMImageStats>,
  cropType: string,
  areaHa: number,
  currentHealth?: number
): AnalyticsResult {
  const now = Date.now();

  // Filter cloud-free visible images and build timeline
  const points: NdvPoint[] = [];
  for (const img of images) {
    if (!img.visible || img.cloud_coverage >= 30) continue;
    const stats = statsByImage.get(img.id);
    if (!stats) continue;

    points.push({
      dt: img.dt,
      date: new Date(img.dt * 1000).toISOString(),
      ndvi: stats.ndvi?.mean ?? null,
      evi: stats.evi?.mean ?? null,
      ndmi: stats.ndmi?.mean ?? null,
      cloudCoverage: img.cloud_coverage,
      imageId: img.id,
      ndviUrl: stats.ndvi_url ?? null,
      trueColorUrl: stats.true_color_url ?? null,
    });
  }

  // Sort by date ascending
  points.sort((a, b) => a.dt - b.dt);

  const latest = points.length > 0 ? points[points.length - 1] : null;
  const latestNdvi = latest?.ndvi ?? null;

  // Build regression series (x = days since first point)
  const firstDt = points.length > 0 ? points[0].dt : 0;
  const ndviSeries = points
    .filter((p) => p.ndvi !== null)
    .map((p) => ({ x: (p.dt - firstDt) / 86400, y: p.ndvi as number }));
  const eviSeries = points
    .filter((p) => p.evi !== null)
    .map((p) => ({ x: (p.dt - firstDt) / 86400, y: p.evi as number }));
  const ndmiSeries = points
    .filter((p) => p.ndmi !== null)
    .map((p) => ({ x: (p.dt - firstDt) / 86400, y: p.ndmi as number }));

  const ndviPrediction = buildTrendPrediction(ndviSeries);
  const eviPrediction = buildTrendPrediction(eviSeries);
  const ndmiPrediction = buildTrendPrediction(ndmiSeries);

  // Yield prediction
  let yieldPrediction: YieldPrediction | null = null;
  if (latestNdvi !== null) {
    const ratio = clamp(latestNdvi / OPTIMAL_NDVI, 0, 1.5);
    const healthFactor = currentHealth !== undefined ? clamp(currentHealth / 100, 0.5, 1.2) : 1;
    const baseYield = getBaseYield(cropType) * areaHa;
    const predictedYield = Math.round(baseYield * ratio * healthFactor);

    // Confidence based on data density + R²
    const dataPoints = ndviSeries.length;
    const r2 = ndviPrediction?.rSquared ?? 0;
    const confidence = clamp(0.3 + dataPoints * 0.05 + r2 * 0.3, 0.3, 0.95);

    yieldPrediction = {
      predictedYield,
      confidence,
      range: [Math.round(predictedYield * 0.85), Math.round(predictedYield * 1.15)],
      factors: {
        currentHealth: Math.round(healthFactor * 100),
        ndviTrend: ndviPrediction?.direction ?? "stable",
        cropType,
        areaHa,
      },
    };
  }

  // Health score from NDVI (0-100)
  const healthScore = latestNdvi !== null
    ? Math.round(clamp((latestNdvi + 0.2) / 1.2, 0, 1) * 100)
    : null;

  // Health trend
  let healthTrend: AnalyticsResult["healthTrend"] = "no-data";
  if (ndviPrediction) {
    healthTrend = ndviPrediction.direction;
  }

  // Build insights
  const insights: string[] = [];
  if (points.length === 0) {
    insights.push("No cloud-free satellite data available for this field in the selected period.");
  } else {
    insights.push(
      `${points.length} cloud-free satellite observation${points.length > 1 ? "s" : ""} collected over the analyzed period.`
    );
    if (latestNdvi !== null) {
      insights.push(
        `Latest NDVI is ${latestNdvi.toFixed(2)} (${classifyNdvi(latestNdvi)}).`
      );
    }
    if (ndviPrediction) {
      insights.push(
        `NDVI trend is ${ndviPrediction.direction} over the next 30 days (R²=${ndviPrediction.rSquared.toFixed(2)}).`
      );
    }
    if (yieldPrediction) {
      insights.push(
        `Predicted yield: ~${yieldPrediction.predictedYield.toLocaleString()} kg (${(yieldPrediction.confidence * 100).toFixed(0)}% confidence).`
      );
    }
    if (healthScore !== null) {
      insights.push(
        `Derived field health score: ${healthScore}/100 (${healthScore >= 75 ? "Good" : healthScore >= 50 ? "Fair" : "At Risk"}).`
      );
    }
  }

  return {
    timeline: points,
    latest: {
      ndvi: latestNdvi,
      evi: latest?.evi ?? null,
      ndmi: latest?.ndmi ?? null,
      date: latest?.date ?? null,
      imageId: latest?.imageId ?? null,
    },
    ndviPrediction,
    eviPrediction,
    ndmiPrediction,
    yieldPrediction,
    healthScore,
    healthTrend,
    insights,
    computedAt: new Date(now).toISOString(),
  };
}

/**
 * Classify an NDVI value into a qualitative label.
 */
export function classifyNdvi(ndvi: number): string {
  if (ndvi >= 0.6) return "Dense vegetation";
  if (ndvi >= 0.4) return "Moderate vegetation";
  if (ndvi >= 0.2) return "Sparse vegetation";
  return "Barren / stressed";
}

/**
 * Get a color for an NDVI value (for charts/badges).
 */
export function getNdvColor(ndvi: number | null): string {
  if (ndvi === null) return "text-muted-foreground";
  if (ndvi >= 0.6) return "text-green-500";
  if (ndvi >= 0.4) return "text-yellow-500";
  if (ndvi >= 0.2) return "text-orange-500";
  return "text-red-500";
}

/**
 * Get a color hex for chart series.
 */
export function getNdvChartColor(ndvi: number | null): string {
  if (ndvi === null) return "#94a3b8";
  if (ndvi >= 0.6) return "#22c55e";
  if (ndvi >= 0.4) return "#eab308";
  if (ndvi >= 0.2) return "#f97316";
  return "#ef4444";
}

/**
 * Format a trend direction for display.
 */
export function formatTrend(direction: string): string {
  switch (direction) {
    case "improving": return "Improving";
    case "declining": return "Declining";
    case "stable": return "Stable";
    default: return "No data";
  }
}
