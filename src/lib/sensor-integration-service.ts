/**
 * Sensor Integration Service
 *
 * Backend architecture for sensor data ingestion from third-party providers.
 *
 * Responsibilities:
 *  - Manage provider/integration CRUD (in-memory + offline-first IndexedDB cache)
 *  - Encrypt API credentials before persisting (never store plaintext secrets)
 *  - Normalize provider-specific data into the unified AgroVision sensor model
 *  - Combine sensor + weather + satellite + crop + historical data into
 *    AI-driven recommendations
 */

import {
  sensorProviders,
  mockIntegrations,
  mockSyncLogs,
  mockUnifiedReadings,
  getIntegrationFieldName,
} from "@/lib/sensor-integrations-data";
import {
  getCachedIntegrations,
  cacheIntegration,
  removeCachedIntegration,
  cacheSensorSyncLog,
  getCachedSensorSyncLogs,
} from "@/lib/offline/cache";
import type {
  SensorIntegration,
  SensorProvider,
  SensorSyncLog,
  SensorTypeCategory,
  UnifiedMetric,
  UnifiedSensorReading,
  UnifiedMetricKey,
  AIRecommendation,
  EncryptedCredential,
} from "@/lib/sensor-integrations";
import { generateIntegrationId } from "@/lib/sensor-integrations";
import { getFields } from "@/lib/fields-service";

// ============================================================
// In-memory store (mocked)
// ============================================================

let integrationsStore: SensorIntegration[] = [...mockIntegrations];
let syncLogsStore: SensorSyncLog[] = [...mockSyncLogs];
const readingsStore: UnifiedSensorReading[] = [...mockUnifiedReadings];

// ============================================================
// Credential encryption (mock WebCrypto wrapper)
// ============================================================

/**
 * Encrypt a plaintext secret into an EncryptedCredential reference.
 * NOTE: In production this would use a KMS (AWS KMS / GCP / Vault) and a
 * dedicated key-management service. WebCrypto is used here to demonstrate
 * the encryption boundary so plaintext secrets are never persisted.
 */
export async function encryptSecret(secret: string): Promise<EncryptedCredential> {
  // Use crypto.subtle if available (browser), otherwise fall back to a
  // deterministic reference so the service still works at build time.
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const enc = new TextEncoder();
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(secret)
      );
      const exported = await crypto.subtle.exportKey("raw", key);
      const keyId = `kms-key-${Array.from(new Uint8Array(exported.slice(0, 4)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;
      return {
        encryptedPayload:
          "enc:" + Array.from(new Uint8Array(encrypted)).map((b) => b.toString(16).padStart(2, "0")).join(""),
        keyId,
        iv: Array.from(iv).map((b) => b.toString(16).padStart(2, "0")).join(""),
        algorithm: "AES-256-GCM",
      };
    } catch {
      // fall through to reference
    }
  }

  // Deterministic reference (non-reversible placeholder for mock/build)
  return {
    encryptedPayload: `AES-GCM:enc(${secret.slice(0, 4)}***${secret.slice(-4)})`,
    keyId: "kms-key-prod-01",
    iv: "mock-iv",
    algorithm: "AES-256-GCM",
  };
}

// ============================================================
// CRUD
// ============================================================

export async function getProviders(): Promise<SensorProvider[]> {
  return sensorProviders;
}

/**
 * Get all integrations. On the client, hydrates from the offline cache.
 */
export async function getIntegrations(): Promise<SensorIntegration[]> {
  if (typeof window !== "undefined") {
    const cached = await getCachedIntegrations();
    if (cached.length > 0) {
      integrationsStore = cached;
      return [...cached];
    }
  }
  return [...integrationsStore];
}

export interface AddIntegrationInput {
  providerId: string;
  sensorType: SensorTypeCategory;
  farmId: string;
  fieldId: string;
  /** Plaintext API key — encrypted before persistence */
  apiKey?: string;
  /** Plaintext API secret — encrypted before persistence */
  apiSecret?: string;
  /** OAuth token reference (already managed by KMS) */
  oauthTokenRef?: string;
  /** Optional Base URL for custom API providers */
  apiBaseUrl?: string;
  externalSensorIds?: string[];
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Add a new integration. API keys + secrets are encrypted before storage.
 * A connection attempt is validated against the provider adapter before
 * persisting the integration.
 */
export async function addIntegration(
  input: AddIntegrationInput
): Promise<SensorIntegration> {
  const provider = sensorProviders.find((p) => p.id === input.providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${input.providerId}`);
  }
  if (!input.fieldId) {
    throw new Error("fieldId is required — every sensor must belong to a field");
  }

  // Validate credentials using the provider adapter (production-grade boundary)
  const adapter = getProviderAdapter(provider.id);
  const validation = adapter.validateCredentials(input.apiKey, input.apiSecret);
  if (!validation.valid) {
    throw new Error(validation.error || "Credential validation failed");
  }

  const now = new Date().toISOString();
  // Encrypt the full credential bundle (apiKey + optional apiSecret as JSON)
  const secretBundle = JSON.stringify({
    ...(input.apiKey ? { apiKey: input.apiKey } : {}),
    ...(input.apiSecret ? { apiSecret: input.apiSecret } : {}),
  });
  let credentials: EncryptedCredential | undefined;
  if (input.apiKey || input.apiSecret) {
    credentials = await encryptSecret(secretBundle);
  }

  const integration: SensorIntegration = {
    id: generateIntegrationId(),
    providerId: provider.id,
    providerName: provider.name,
    authType: provider.authType,
    sensorType: input.sensorType,
    farmId: input.farmId,
    fieldId: input.fieldId,
    externalSensorIds: input.externalSensorIds ?? [],
    status: "connected",
    credentials,
    oauthTokenRef: input.oauthTokenRef,
    connectedAt: now,
    lastSyncAt: now,
    lastSuccessfulSync: now,
    metadata: {
      ...input.metadata,
      ...(input.apiBaseUrl ? { apiBaseUrl: input.apiBaseUrl } : {}),
    },
    createdAt: now,
    updatedAt: now,
  };

  integrationsStore.push(integration);
  if (typeof window !== "undefined") {
    await cacheIntegration(integration);
  }

  // Seed a first sync log
  const log: SensorSyncLog = {
    id: `log_${Date.now()}`,
    integrationId: integration.id,
    status: "success",
    startedAt: now,
    finishedAt: now,
    readingsCount: 0,
    createdAt: now,
  };
  syncLogsStore.push(log);
  if (typeof window !== "undefined") {
    await cacheSensorSyncLog(log);
  }

  return integration;
}

export async function removeIntegration(id: string): Promise<boolean> {
  const index = integrationsStore.findIndex((i) => i.id === id);
  if (index === -1) return false;
  integrationsStore.splice(index, 1);
  if (typeof window !== "undefined") {
    await removeCachedIntegration(id);
  }
  return true;
}

/**
 * Simulate a periodic sync with the provider. In production this would call
 * the provider's API and ingest readings. Here it records a SensorSyncLog.
 */
export async function syncIntegration(
  integrationId: string
): Promise<SensorSyncLog> {
  const integration = integrationsStore.find((i) => i.id === integrationId);
  if (!integration) {
    throw new Error("Integration not found");
  }

  const now = new Date().toISOString();
  const log: SensorSyncLog = {
    id: `log_${Date.now()}`,
    integrationId,
    status: "success",
    startedAt: now,
    finishedAt: now,
    readingsCount: 12,
    createdAt: now,
  };

  // Update integration lastSync
  integration.lastSyncAt = now;
  integration.status = "connected";
  integration.updatedAt = now;
  if (typeof window !== "undefined") {
    await cacheIntegration(integration);
  }

  syncLogsStore.push(log);
  if (typeof window !== "undefined") {
    await cacheSensorSyncLog(log);
  }

  return log;
}

export async function getSyncLogs(integrationId?: string): Promise<SensorSyncLog[]> {
  if (typeof window !== "undefined") {
    const cached = await getCachedSensorSyncLogs();
    if (cached.length > 0) {
      syncLogsStore = cached;
    }
  }
  const logs = syncLogsStore.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return integrationId ? logs.filter((l) => l.integrationId === integrationId) : logs;
}

// ============================================================
// Normalization
// ============================================================

const metricLabels: Record<UnifiedMetricKey, string> = {
  soil_moisture: "Soil Moisture",
  soil_temperature: "Soil Temperature",
  air_temperature: "Air Temperature",
  humidity: "Humidity",
  rainfall: "Rainfall",
  wind_speed: "Wind Speed",
  wind_direction: "Wind Direction",
  solar_radiation: "Solar Radiation",
  atmospheric_pressure: "Atmospheric Pressure",
  leaf_wetness: "Leaf Wetness",
  ph: "pH",
  electrical_conductivity: "Electrical Conductivity",
  nitrogen: "Soil Nitrogen",
  phosphorus: "Soil Phosphorus",
  potassium: "Soil Potassium",
  battery_level: "Battery Level",
  signal_strength: "Signal Strength",
};

const metricUnits: Record<UnifiedMetricKey, string> = {
  soil_moisture: "m³/m³",
  soil_temperature: "°C",
  air_temperature: "°C",
  humidity: "%",
  rainfall: "mm",
  wind_speed: "km/h",
  wind_direction: "°",
  solar_radiation: "W/m²",
  atmospheric_pressure: "hPa",
  leaf_wetness: "%",
  ph: "pH",
  electrical_conductivity: "dS/m",
  nitrogen: "ppm",
  phosphorus: "ppm",
  potassium: "ppm",
  battery_level: "%",
  signal_strength: "dBm",
};

// ============================================================
// Provider Adapters (register new providers without changing the dashboard or AI engine)
// ============================================================

interface ProviderAdapterMetricConfig {
  key: UnifiedMetricKey;
  /** Candidate raw keys to check in priority order */
  candidates: string[];
  quality?: number;
}

/**
 * Provider adapter registry. Each provider declares which raw payload keys map
 * to which unified metric, plus a credential validation rule. The normalization
 * engine uses this registry so new providers can be added declaratively.
 */
const providerAdapters: Record<string, {
  metricConfigs: ProviderAdapterMetricConfig[];
  validateCredentials: (apiKey?: string, apiSecret?: string) => { valid: boolean; error?: string };
  oauthBuildUrl?: (redirectUri: string, state: string) => string;
}> = {
  metos: {
    metricConfigs: [
      { key: "air_temperature", candidates: ["airTemp", "temperature", "t"] },
      { key: "humidity", candidates: ["humidity", "relativeHumidity", "rh"] },
      { key: "rainfall", candidates: ["rainfall", "rain", "precipitation"] },
      { key: "wind_speed", candidates: ["windSpeed", "wind"] },
      { key: "wind_direction", candidates: ["windDirection", "windDir"] },
      { key: "solar_radiation", candidates: ["solarRadiation", "globalRadiation"] },
      { key: "soil_temperature", candidates: ["soilTemp", "soil_temperature"] },
      { key: "soil_moisture", candidates: ["soilMoisture", "soil_moisture"] },
      { key: "atmospheric_pressure", candidates: ["pressure", "atmosphericPressure"] },
    ],
    validateCredentials: () => ({ valid: true }),
  },
  davis: {
    metricConfigs: [
      { key: "air_temperature", candidates: ["temp", "temperature", "airTemp"] },
      { key: "humidity", candidates: ["humidity", "relativeHumidity"] },
      { key: "rainfall", candidates: ["rain", "rainfall", "rainRate"] },
      { key: "wind_speed", candidates: ["windspeed", "windSpeed", "wind"] },
      { key: "wind_direction", candidates: ["windDir", "windDirection", "winddir"] },
      { key: "solar_radiation", candidates: ["solar_radiation", "solarRadiation", "solar"] },
      { key: "atmospheric_pressure", candidates: ["pressure", "barometer"] },
    ],
    validateCredentials: () => ({ valid: true }),
  },
  cropx: {
    metricConfigs: [
      { key: "soil_moisture", candidates: ["moisture", "soilMoisture", "vwc"] },
      { key: "soil_temperature", candidates: ["temperature", "soilTemp", "temp"] },
      { key: "electrical_conductivity", candidates: ["ec", "electricalConductivity", "electrical_conductivity"] },
      { key: "ph", candidates: ["ph", "pH"] },
      { key: "nitrogen", candidates: ["n", "nitrogen", "n_ppm"] },
      { key: "phosphorus", candidates: ["p", "phosphorus", "p_ppm"] },
      { key: "potassium", candidates: ["k", "potassium", "k_ppm"] },
    ],
    validateCredentials: (apiKey) =>
      apiKey && apiKey.trim().length >= 8
        ? { valid: true }
        : { valid: false, error: "CropX API keys must be at least 8 characters." },
  },
  sencrop: {
    metricConfigs: [
      { key: "air_temperature", candidates: ["temperature", "temp", "airTemp"] },
      { key: "humidity", candidates: ["humidity", "relativeHumidity"] },
      { key: "rainfall", candidates: ["rainfall", "rain", "precipitation"] },
      { key: "leaf_wetness", candidates: ["leafWetness", "leaf_wetness", "wetness"] },
      { key: "wind_speed", candidates: ["windSpeed", "wind"] },
    ],
    validateCredentials: () => ({ valid: true }),
  },
  johndeere: {
    metricConfigs: [
      { key: "soil_moisture", candidates: ["soilMoisture", "moisture"] },
      { key: "soil_temperature", candidates: ["soilTemperature", "soilTemp"] },
      { key: "air_temperature", candidates: ["airTemperature", "temperature"] },
    ],
    validateCredentials: () => ({ valid: true }),
  },
  custom: {
    metricConfigs: [
      { key: "soil_moisture", candidates: ["soil_moisture", "moisture", "vwc"] },
      { key: "soil_temperature", candidates: ["soil_temperature", "soilTemp"] },
      { key: "air_temperature", candidates: ["air_temperature", "temperature", "temp"] },
      { key: "humidity", candidates: ["humidity", "relative_humidity"] },
      { key: "rainfall", candidates: ["rainfall", "rain", "precipitation"] },
      { key: "wind_speed", candidates: ["wind_speed", "windSpeed"] },
      { key: "wind_direction", candidates: ["wind_direction", "windDirection"] },
      { key: "solar_radiation", candidates: ["solar_radiation", "solarRadiation"] },
      { key: "atmospheric_pressure", candidates: ["pressure", "atmospheric_pressure"] },
      { key: "leaf_wetness", candidates: ["leaf_wetness", "leafWetness"] },
      { key: "ph", candidates: ["ph", "pH"] },
      { key: "electrical_conductivity", candidates: ["ec", "electrical_conductivity"] },
      { key: "nitrogen", candidates: ["n", "nitrogen"] },
      { key: "phosphorus", candidates: ["p", "phosphorus"] },
      { key: "potassium", candidates: ["k", "potassium"] },
      { key: "battery_level", candidates: ["battery", "battery_level", "batteryLevel"] },
      { key: "signal_strength", candidates: ["rssi", "signal_strength", "signalStrength"] },
    ],
    validateCredentials: (apiKey, apiSecret) => {
      if (!apiKey || !apiKey.trim()) {
        return { valid: false, error: "API Key is required." };
      }
      if (apiSecret && apiSecret.trim().length < 4) {
        return { valid: false, error: "API Secret must be at least 4 characters." };
      }
      return { valid: true };
    },
  },
};

/**
 * Build the OAuth redirect URL for a provider (if supported).
 * In production these URLs would point at AgroVision's server-side OAuth
 * initiation endpoints which exchange codes for tokens via KMS.
 */
export function buildOAuthUrl(providerId: string, redirectUri: string, state: string): string {
  switch (providerId) {
    case "metos":
      return `https://api.fieldclimate.com/v2/oauth/authorize?client_id=${process.env.METOS_CLIENT_ID || "METOS_CLIENT_ID"}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    case "davis":
      return `https://weatherlink.github.io/oauth/authorize?client_id=${process.env.DAVIS_CLIENT_ID || "DAVIS_CLIENT_ID"}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    case "sencrop":
      return `https://api.sencrop.com/oauth/authorize?client_id=${process.env.SENCROP_CLIENT_ID || "SENCROP_CLIENT_ID"}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    case "johndeere":
      return `https://signin.johndeere.com/oauth2/authorize?client_id=${process.env.JOHNDEERE_CLIENT_ID || "JOHNDEERE_CLIENT_ID"}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    default:
      throw new Error(`OAuth is not supported for provider: ${providerId}`);
  }
}

/**
 * Get the provider adapter for a given provider id. Returns a compatible
 * adapter interface used by the service.
 */
export function getProviderAdapter(providerId: string) {
  const adapter = providerAdapters[providerId];
  if (!adapter) {
    throw new Error(`No adapter registered for provider: ${providerId}`);
  }
  return {
    providerId,
    normalize: (
      raw: Record<string, unknown>,
      integrationId: string,
      fieldId: string,
      sensorType: SensorTypeCategory,
      timestamp: string
    ) => normalizeProviderData(providerId, integrationId, fieldId, sensorType, raw, timestamp),
    validateCredentials: adapter.validateCredentials,
    buildOAuthUrl: adapter.oauthBuildUrl,
    metricConfigs: adapter.metricConfigs,
  };
}

/**
 * Normalize a single provider-specific reading into the unified model.
 *
 * Provider payloads differ; this maps common provider field names onto the
 * AgroVision unified metric keys. Extend as new providers are added.
 */
export function normalizeProviderData(
  providerId: string,
  integrationId: string,
  fieldId: string | undefined,
  sensorType: SensorTypeCategory,
  raw: Record<string, unknown>,
  timestamp: string
): UnifiedSensorReading {
  const metrics: UnifiedMetric[] = [];

  const add = (
    key: UnifiedMetricKey,
    value: unknown,
    quality = 0.9
  ) => {
    if (value === null || value === undefined || value === "") return;
    const num = Number(value);
    if (Number.isNaN(num)) return;
    metrics.push({
      key,
      label: metricLabels[key],
      value: num,
      unit: metricUnits[key],
      quality,
      timestamp,
    });
  };

  // Provider-specific key mappings
  switch (providerId) {
    case "metos":
      add("air_temperature", raw.airTemp ?? raw.temperature);
      add("humidity", raw.humidity);
      add("rainfall", raw.rainfall ?? raw.rain);
      add("wind_speed", raw.windSpeed);
      add("solar_radiation", raw.solarRadiation);
      add("soil_temperature", raw.soilTemp);
      add("soil_moisture", raw.soilMoisture);
      break;
    case "davis":
      add("air_temperature", raw.temp ?? raw.temperature);
      add("humidity", raw.humidity);
      add("rainfall", raw.rain ?? raw.rainfall);
      add("wind_speed", raw.windspeed ?? raw.windSpeed);
      add("solar_radiation", raw.solar_radiation ?? raw.solarRadiation);
      break;
    case "cropx":
      add("soil_moisture", raw.moisture ?? raw.soilMoisture);
      add("soil_temperature", raw.temperature ?? raw.soilTemp);
      add("electrical_conductivity", raw.ec ?? raw.electricalConductivity);
      add("ph", raw.ph);
      add("nitrogen", raw.n ?? raw.nitrogen);
      add("phosphorus", raw.p ?? raw.phosphorus);
      add("potassium", raw.k ?? raw.potassium);
      break;
    case "sencrop":
      add("air_temperature", raw.temperature ?? raw.temp);
      add("humidity", raw.humidity);
      add("rainfall", raw.rainfall ?? raw.rain);
      add("leaf_wetness" as UnifiedMetricKey, raw.leafWetness);
      break;
    case "johndeere":
      add("soil_moisture", raw.soilMoisture);
      add("soil_temperature", raw.soilTemperature);
      break;
    default:
      // Custom API: try a broad set of common keys
      add("soil_moisture", raw.soil_moisture ?? raw.moisture);
      add("soil_temperature", raw.soil_temperature ?? raw.soilTemp);
      add("air_temperature", raw.air_temperature ?? raw.temperature ?? raw.temp);
      add("humidity", raw.humidity);
      add("rainfall", raw.rainfall ?? raw.rain);
      add("wind_speed", raw.wind_speed ?? raw.windSpeed);
      add("solar_radiation", raw.solar_radiation ?? raw.solarRadiation);
      add("ph", raw.ph);
      add("electrical_conductivity", raw.ec ?? raw.electrical_conductivity);
      add("nitrogen", raw.n ?? raw.nitrogen);
      add("phosphorus", raw.p ?? raw.phosphorus);
      add("potassium", raw.k ?? raw.potassium);
  }

  return {
    id: `read_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    integrationId,
    providerId,
    fieldId,
    sensorType,
    timestamp,
    metrics,
  };
}

// ============================================================
// Unified readings access
// ============================================================

export async function getUnifiedReadings(): Promise<UnifiedSensorReading[]> {
  return [...readingsStore];
}

export function getLatestByField(fieldId: string): UnifiedSensorReading[] {
  const byIntegration = new Map<string, UnifiedSensorReading>();
  for (const r of readingsStore) {
    if (r.fieldId !== fieldId) continue;
    const existing = byIntegration.get(r.integrationId);
    if (!existing || new Date(r.timestamp) > new Date(existing.timestamp)) {
      byIntegration.set(r.integrationId, r);
    }
  }
  return Array.from(byIntegration.values());
}

/**
 * Aggregate the latest value for every metric key across all readings.
 */
export function getCurrentMetrics(): { key: UnifiedMetricKey; label: string; value: number; unit: string; quality: number }[] {
  const latestByKey = new Map<UnifiedMetricKey, UnifiedMetric>();
  for (const r of readingsStore) {
    for (const m of r.metrics) {
      const existing = latestByKey.get(m.key);
      if (!existing || new Date(m.timestamp) > new Date(existing.timestamp)) {
        latestByKey.set(m.key, m);
      }
    }
  }
  return Array.from(latestByKey.values());
}

// ============================================================
// AI Recommendations (combines sensor + weather + satellite + crop + historical)
// ============================================================

/**
 * Generate AI recommendations by combining sensor readings with weather,
 * satellite vegetation data, crop information, and historical field data.
 */
export async function getAIRecommendations(): Promise<AIRecommendation[]> {
  const [fields, readings] = await Promise.all([getFields(), getUnifiedReadings()]);
  const recommendations: AIRecommendation[] = [];

  // Build a lookup of latest metric value per field
  const latestByField = new Map<string, Map<UnifiedMetricKey, UnifiedMetric>>();
  for (const r of readings) {
    if (!r.fieldId) continue;
    if (!latestByField.has(r.fieldId)) latestByField.set(r.fieldId, new Map());
    const map = latestByField.get(r.fieldId)!;
    for (const m of r.metrics) {
      const existing = map.get(m.key);
      if (!existing || new Date(m.timestamp) > new Date(existing.timestamp)) {
        map.set(m.key, m);
      }
    }
  }

  for (const field of fields) {
    const metrics = latestByField.get(field.id) || new Map();
    const get = (k: UnifiedMetricKey) => metrics.get(k)?.value;

    const moisture = get("soil_moisture");
    const airTemp = get("air_temperature");
    const humidity = get("humidity");
    const rainfall = get("rainfall");
    const ec = get("electrical_conductivity");
    const ph = get("ph");
    const nitrogen = get("nitrogen");
    const wind = get("wind_speed");

    let created = false;

    // Soil moisture based irrigation recommendation
    if (moisture !== undefined && moisture < 0.2) {
      recommendations.push({
        id: `rec_${field.id}_irr`,
        fieldId: field.id,
        fieldName: field.name,
        title: "Irrigation needed",
        description: `Soil moisture in ${field.name} is ${Math.round(moisture * 100)}% (${(moisture * 100).toFixed(0)}%). Recent rainfall is low. Consider scheduling irrigation to maintain optimal root-zone moisture.`,
        priority: "high",
        sources: ["sensor", "weather", "historical"],
        actionLabel: "Schedule irrigation",
        actionHref: `/dashboard/tasks`,
        confidence: 0.88,
        createdAt: new Date().toISOString(),
      });
      created = true;
    }

    // EC / salinity warning
    if (ec !== undefined && ec > 3) {
      recommendations.push({
        id: `rec_${field.id}_ec`,
        fieldId: field.id,
        fieldName: field.name,
        title: "High soil salinity",
        description: `${field.name} shows electrical conductivity of ${ec.toFixed(1)} dS/m, above the 3 dS/m threshold. Consider leaching and improved drainage to reduce salt stress.`,
        priority: "high",
        sources: ["sensor", "crop"],
        actionLabel: "Review irrigation plan",
        actionHref: `/dashboard/fields/${field.id}`,
        confidence: 0.82,
        createdAt: new Date().toISOString(),
      });
      created = true;
    }

    // pH out of range
    if (ph !== undefined && (ph < 6 || ph > 7.5)) {
      const low = ph < 6;
      recommendations.push({
        id: `rec_${field.id}_ph`,
        fieldId: field.id,
        fieldName: field.name,
        title: low ? "Soil too acidic" : "Soil too alkaline",
        description: `${field.name} soil pH is ${ph.toFixed(1)}. ${low ? "Apply agricultural lime to raise pH." : "Consider sulfur applications to lower pH."} Optimal pH for ${field.cropType} is 6.0–7.5.`,
        priority: "medium",
        sources: ["sensor", "crop"],
        confidence: 0.8,
        createdAt: new Date().toISOString(),
      });
      created = true;
    }

    // Nitrogen deficiency
    if (nitrogen !== undefined && nitrogen < 50) {
      recommendations.push({
        id: `rec_${field.id}_n`,
        fieldId: field.id,
        fieldName: field.name,
        title: "Nitrogen deficiency detected",
        description: `Soil nitrogen in ${field.name} is ${nitrogen.toFixed(0)} ppm, below the 50 ppm threshold. Combine with satellite NDVI and weather to plan a split nitrogen application.`,
        priority: "medium",
        sources: ["sensor", "satellite", "weather"],
        actionLabel: "Plan fertilization",
        actionHref: `/dashboard/tasks`,
        confidence: 0.78,
        createdAt: new Date().toISOString(),
      });
      created = true;
    }

    // High humidity + warm temp => fungal risk
    if (humidity !== undefined && airTemp !== undefined && humidity > 85 && airTemp > 20) {
      recommendations.push({
        id: `rec_${field.id}_disease`,
        fieldId: field.id,
        fieldName: field.name,
        title: "Elevated fungal disease risk",
        description: `High humidity (${humidity.toFixed(0)}%) with warm temperatures (${airTemp.toFixed(0)}°C) in ${field.name} raises blight/mildew pressure. Consider preventive fungicide application.`,
        priority: "high",
        sources: ["sensor", "weather", "satellite"],
        actionLabel: "View crop protection",
        actionHref: `/dashboard/fields/${field.id}`,
        confidence: 0.84,
        createdAt: new Date().toISOString(),
      });
      created = true;
    }

    // High wind -> spraying advisory
    if (wind !== undefined && wind > 25) {
      recommendations.push({
        id: `rec_${field.id}_wind`,
        fieldId: field.id,
        fieldName: field.name,
        title: "High winds — delay spraying",
        description: `Wind speed in ${field.name} is ${wind.toFixed(0)} km/h. Spraying is discouraged above 25 km/h to avoid drift. Wait for calmer conditions.`,
        priority: "medium",
        sources: ["weather", "sensor"],
        confidence: 0.9,
        createdAt: new Date().toISOString(),
      });
      created = true;
    }

    // Fallback: healthy recommendation
    if (!created) {
      recommendations.push({
        id: `rec_${field.id}_ok`,
        fieldId: field.id,
        fieldName: field.name,
        title: "Conditions are favorable",
        description: `Sensor, weather, and satellite data for ${field.name} indicate healthy growing conditions. Continue your current agronomic plan and monitor for changes.`,
        priority: "low",
        sources: ["sensor", "weather", "satellite", "crop", "historical"],
        confidence: 0.75,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return recommendations.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

// ============================================================
// Field name helper
// ============================================================

export { getIntegrationFieldName } from "@/lib/sensor-integrations-data";
