/**
 * Sensor Integration Types
 *
 * Types for connecting to third-party agricultural sensor providers
 * (METOS, Davis Instruments, CropX, Sencrop, John Deere, Custom API).
 *
 * Security model: raw API credentials are NEVER stored. Instead, the service
 * stores an encrypted credential reference (encrypted payload + key reference)
 * so secrets are not persisted in plaintext.
 */

// ============================================================
// Provider metadata
// ============================================================

export type SensorProviderAuthType = "oauth" | "apikey";

export type SensorTypeCategory =
  | "weather_station"
  | "soil_sensor"
  | "irrigation_controller"
  | "machinery";

export interface SensorProvider {
  id: string;
  name: string;
  tagline: string;
  description: string;
  authType: SensorProviderAuthType;
  /** Categories of sensors this provider supports */
  sensorTypes: SensorTypeCategory[];
  /** Brand color (e.g. "#00A651") for theming */
  brandColor: string;
  /** lucide icon name */
  iconName: string;
  /** Capabilities / metrics provided */
  capabilities: string[];
  /** OAuth scopes requested (if oauth) — informational */
  oauthScopes?: string[];
  /** Whether this provider is officially supported/integrated */
  isConfigured: boolean;
  /** Base URL for the provider API (if apikey) */
  apiBaseUrl?: string;
  /** Help text for the API key form */
  apiFormHelp?: string;
}

// ============================================================
// Encrypted credential reference
// ============================================================

/**
 * Encrypted credential reference. Never holds plaintext secrets.
 * - encryptedPayload: the encrypted secret (e.g. derived from WebCrypto AES-GCM)
 * - keyId: reference to the key used (managed by a key management service)
 * - iv: initialization vector used for the encryption
 * - algorithm: crypto algorithm used
 */
export interface EncryptedCredential {
  encryptedPayload: string;
  keyId: string;
  iv?: string;
  algorithm: string;
}

// ============================================================
// Integration
// ============================================================

export type IntegrationStatus = "connected" | "error" | "syncing" | "disconnected";

export interface SensorIntegration {
  id: string;
  providerId: string;
  providerName: string;
  authType: SensorProviderAuthType;
  /** Category of sensor hardware */
  sensorType: SensorTypeCategory;
  /** The farm this integration belongs to */
  farmId: string;
  /** Field within the farm (farms contain many fields, each sensor belongs to a specific field) */
  fieldId: string;
  /** External mapping */
  externalSensorIds: string[];
  status: IntegrationStatus;
  /** Encrypted credential reference (no plaintext secrets) */
  credentials?: EncryptedCredential;
  /** OAuth token reference (no raw token) */
  oauthTokenRef?: string;
  connectedAt: string;
  lastSyncAt?: string;
  /** Timestamp of the last successful sync */
  lastSuccessfulSync?: string;
  /** Provider-native metadata (model, firmware, etc.) */
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Provider Adapter (future-ready — add new providers without changing the dashboard)
// ============================================================

/**
 * Interface for a provider adapter that normalizes provider-specific data
 * into the unified AgroVision model. New providers can be added by
 * implementing this adapter without modifying the dashboard or AI engine.
 */
export interface ProviderAdapter {
  /** Unique provider identifier (matches SensorProvider.id) */
  providerId: string;
  /** Normalize raw provider API response into unified sensor readings */
  normalize(raw: Record<string, unknown>, integrationId: string, fieldId: string, sensorType: SensorTypeCategory, timestamp: string): UnifiedSensorReading;
  /** Validate credential format before attempting connection */
  validateCredentials(apiKey?: string, apiSecret?: string): { valid: boolean; error?: string };
  /** Build the OAuth redirect URL (if oauth provider) */
  buildOAuthUrl?(redirectUri: string, state: string): string;
  /** Build API request configuration for syncing data */
  buildSyncRequest?(credentials: EncryptedCredential): { url: string; headers: Record<string, string>; method: string };
}

// ============================================================
// Sync log
// ============================================================

export type SyncLogStatus = "success" | "error";

export interface SensorSyncLog {
  id: string;
  integrationId: string;
  status: SyncLogStatus;
  startedAt: string;
  finishedAt?: string;
  /** Number of readings ingested */
  readingsCount: number;
  /** Error message if status is error */
  error?: string;
  /** Provider-specific raw response errors */
  providerErrors?: string[];
  createdAt: string;
}

// ============================================================
// Unified sensor data model (normalized)
// ============================================================

export type UnifiedMetricKey =
  | "soil_moisture"
  | "soil_temperature"
  | "air_temperature"
  | "humidity"
  | "rainfall"
  | "wind_speed"
  | "wind_direction"
  | "solar_radiation"
  | "atmospheric_pressure"
  | "leaf_wetness"
  | "electrical_conductivity"
  | "ph"
  | "nitrogen"
  | "phosphorus"
  | "potassium"
  | "battery_level"
  | "signal_strength";

export interface UnifiedMetric {
  key: UnifiedMetricKey;
  label: string;
  value: number;
  unit: string;
  quality: number; // 0-1 confidence
  timestamp: string;
}

/**
 * A single unified reading snapshot normalized from any provider's format
 * into the AgroVision data model.
 */
export interface UnifiedSensorReading {
  id: string;
  integrationId: string;
  providerId: string;
  fieldId?: string;
  sensorType: SensorTypeCategory;
  timestamp: string;
  metrics: UnifiedMetric[];
}

// ============================================================
// AI Recommendation
// ============================================================

export type RecommendationPriority = "high" | "medium" | "low";

export interface AIRecommendation {
  id: string;
  fieldId: string;
  fieldName: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  /** Data source driving this recommendation */
  sources: ("sensor" | "weather" | "satellite" | "crop" | "historical")[];
  /** Suggested action link */
  actionLabel?: string;
  actionHref?: string;
  confidence: number; // 0-1
  createdAt: string;
}

// ============================================================
// Helpers
// ============================================================

export function generateIntegrationId(): string {
  return `integ_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
