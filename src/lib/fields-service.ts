/**
 * Fields Service
 *
 * Database abstraction layer for field CRUD operations.
 * Currently uses in-memory mock data (fields array from data.ts).
 * Designed to be swapped with Supabase/PostgreSQL without changing
 * the rest of the application.
 */

import { fields as mockFields, type Field } from "@/lib/data";

// ============================================================
// In-memory store (mocked). Swap with DB queries later.
// ============================================================

let fieldsStore: Field[] = [...mockFields];

// ============================================================
// Types
// ============================================================

export interface CreateFieldInput {
  name: string;
  cropType: string;
  boundaries: { lat: number; lng: number }[];
  latitude: number;
  longitude: number;
  agroMonitoringId?: string;
}

export interface UpdateFieldInput {
  name?: string;
  cropType?: string;
  boundaries?: { lat: number; lng: number }[];
  latitude?: number;
  longitude?: number;
  agroMonitoringId?: string;
  health?: number;
  moisture?: number;
  nitrogen?: number;
  growthStage?: string;
  expectedYield?: number;
  lastIrrigation?: string;
  lastFertilization?: string;
  sensorIds?: string[];
}

// ============================================================
// Helper functions
// ============================================================

/**
 * Calculate the approximate area (in hectares) of a polygon
 * using the Shoelace formula + lat/lng to ha conversion.
 * This is approximate; AgroMonitoring provides exact area.
 */
export function calculateArea(boundaries: { lat: number; lng: number }[]): number {
  if (boundaries.length < 3) return 0;

  // Convert lat/lng to approximate meters
  // Using the mean latitude for the conversion
  const avgLat = boundaries.reduce((s, b) => s + b.lat, 0) / boundaries.length;
  const latToM = 111320; // meters per degree latitude
  const lngToM = 111320 * Math.cos((avgLat * Math.PI) / 180);

  // Shoelace formula for area in square meters
  let area = 0;
  const n = boundaries.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = boundaries[i].lng * lngToM;
    const yi = boundaries[i].lat * latToM;
    const xj = boundaries[j].lng * lngToM;
    const yj = boundaries[j].lat * latToM;
    area += xi * yj;
    area -= xj * yi;
  }
  area = Math.abs(area) / 2;

  // Convert square meters to hectares (1 ha = 10,000 m²)
  return Math.round((area / 10000) * 100) / 100;
}

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return `f${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================================
// CRUD Operations
// ============================================================

/**
 * Get all fields
 */
export async function getFields(): Promise<Field[]> {
  // Future: replace with Supabase query
  return [...fieldsStore];
}

/**
 * Get a single field by ID
 */
export async function getField(id: string): Promise<Field | undefined> {
  // Future: replace with Supabase query
  return fieldsStore.find((f) => f.id === id);
}

/**
 * Create a new field
 */
export async function createField(input: CreateFieldInput): Promise<Field> {
  const now = new Date().toISOString();
  const area = calculateArea(input.boundaries);

  const newField: Field = {
    id: generateId(),
    name: input.name,
    cropType: input.cropType,
    area,
    health: 100, // Initial health assumed 100%
    moisture: 50,
    nitrogen: 50,
    growthStage: "Planted",
    expectedYield: 0,
    lastIrrigation: now.split("T")[0],
    lastFertilization: now.split("T")[0],
    latitude: input.latitude,
    longitude: input.longitude,
    boundaries: input.boundaries,
    agroMonitoringId: input.agroMonitoringId,
    sensorIds: [],
    createdAt: now,
    updatedAt: now,
  };

  // Future: replace with Supabase insert
  fieldsStore.push(newField);

  return newField;
}

/**
 * Update an existing field
 */
export async function updateField(id: string, input: UpdateFieldInput): Promise<Field | undefined> {
  const index = fieldsStore.findIndex((f) => f.id === id);
  if (index === -1) return undefined;

  const now = new Date().toISOString();
  const existing = fieldsStore[index];

  // If boundaries changed, recalculate area
  let area = existing.area;
  if (input.boundaries) {
    area = calculateArea(input.boundaries);
  }

  const updated: Field = {
    ...existing,
    ...input,
    area,
    updatedAt: now,
  };

  // Future: replace with Supabase update
  fieldsStore[index] = updated;

  return updated;
}

/**
 * Delete a field
 */
export async function deleteField(id: string): Promise<boolean> {
  const index = fieldsStore.findIndex((f) => f.id === id);
  if (index === -1) return false;

  // Future: replace with Supabase delete
  fieldsStore.splice(index, 1);
  return true;
}

/**
 * Search fields by name or crop type
 */
export async function searchFields(query: string): Promise<Field[]> {
  const lowerQuery = query.toLowerCase();
  return fieldsStore.filter(
    (f) =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.cropType.toLowerCase().includes(lowerQuery)
  );
}

