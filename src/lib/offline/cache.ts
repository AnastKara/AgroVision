/**
 * Offline Cache Helpers
 *
 * High-level helpers for caching and retrieving farm data in IndexedDB.
 * These are used by the data services (fields, weather) to provide
 * offline-first behavior.
 */

import {
  putRecords,
  getAllRecords,
  getRecord,
  deleteRecord,
  clearStore,
  isIndexedDBAvailable,
  type StoreName,
} from "./db";
import type { Field } from "@/lib/data";
import type { WeatherData, SatelliteIndex } from "@/lib/weather-service";

// ============================================================
// Fields cache
// ============================================================

/**
 * Cache all fields in IndexedDB.
 */
export async function cacheFields(fields: Field[]): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    await putRecords("fields", fields);
  } catch (error) {
    console.warn("Failed to cache fields:", error);
  }
}

/**
 * Get all cached fields from IndexedDB.
 * Returns an empty array if nothing is cached or IndexedDB is unavailable.
 */
export async function getCachedFields(): Promise<Field[]> {
  if (!isIndexedDBAvailable()) return [];
  try {
    return await getAllRecords<Field>("fields");
  } catch (error) {
    console.warn("Failed to read cached fields:", error);
    return [];
  }
}

/**
 * Cache a single field (upsert).
 */
export async function cacheField(field: Field): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    await putRecords("fields", [field]);
  } catch (error) {
    console.warn("Failed to cache field:", error);
  }
}

/**
 * Remove a field from the cache.
 */
export async function removeCachedField(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    await deleteRecord("fields", id);
  } catch (error) {
    console.warn("Failed to remove cached field:", error);
  }
}

// ============================================================
// Weather cache
// ============================================================

/**
 * Cache weather data under a stable id ("current").
 */
export async function cacheWeather(data: WeatherData): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    await putRecords("weather", [{ id: "current", ...data }]);
  } catch (error) {
    console.warn("Failed to cache weather:", error);
  }
}

/**
 * Get cached weather data.
 */
export async function getCachedWeather(): Promise<WeatherData | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const record = await getRecord<WeatherData & { id: string }>(
      "weather",
      "current"
    );
    if (!record) return null;
    const { id: _id, ...data } = record;
    return data;
  } catch (error) {
    console.warn("Failed to read cached weather:", error);
    return null;
  }
}

// ============================================================
// Satellite cache
// ============================================================

/**
 * Cache satellite vegetation index data.
 */
export async function cacheSatellite(data: SatelliteIndex): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    await putRecords("satellite", [{ id: "current", ...data }]);
  } catch (error) {
    console.warn("Failed to cache satellite data:", error);
  }
}

/**
 * Get cached satellite data.
 */
export async function getCachedSatellite(): Promise<SatelliteIndex | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const record = await getRecord<SatelliteIndex & { id: string }>(
      "satellite",
      "current"
    );
    if (!record) return null;
    const { id: _id, ...data } = record;
    return data;
  } catch (error) {
    console.warn("Failed to read cached satellite data:", error);
    return null;
  }
}

// ============================================================
// Settings cache
// ============================================================

/**
 * Cache a settings value.
 */
export async function cacheSetting<T>(key: string, value: T): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    await putRecords("settings", [{ id: key, value }]);
  } catch (error) {
    console.warn("Failed to cache setting:", error);
  }
}

/**
 * Get a cached settings value.
 */
export async function getCachedSetting<T>(
  key: string
): Promise<T | undefined> {
  if (!isIndexedDBAvailable()) return undefined;
  try {
    const record = await getRecord<{ id: string; value: T }>("settings", key);
    return record?.value;
  } catch (error) {
    console.warn("Failed to read cached setting:", error);
    return undefined;
  }
}

// ============================================================
// Utility
// ============================================================

/**
 * Clear all offline caches.
 */
export async function clearAllCaches(): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  const stores: StoreName[] = ["fields", "weather", "satellite", "settings"];
  for (const store of stores) {
    try {
      await clearStore(store);
    } catch (error) {
      console.warn(`Failed to clear cache store "${store}":`, error);
    }
  }
}

/**
 * Check if the browser is currently online.
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
