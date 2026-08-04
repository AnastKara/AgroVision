/**
 * Sensor Integration Data
 *
 * Mock data for third-party sensor providers and existing integrations.
 * Provider definitions follow the pattern of iot-types + sensor-data.
 */

import type {
  SensorProvider,
  SensorIntegration,
  SensorSyncLog,
  UnifiedSensorReading,
} from "@/lib/sensor-integrations";

// ============================================================
// Supported providers
// ============================================================

export const sensorProviders: SensorProvider[] = [
  {
    id: "metos",
    name: "METOS",
    tagline: "Pessl Instruments",
    description:
      "Field-level weather stations and soil moisture probes with IoT connectivity and precision ag insights.",
    authType: "oauth",
    sensorTypes: ["weather_station", "soil_sensor"],
    brandColor: "#00A651",
    iconName: "CloudSun",
    capabilities: ["Weather", "Soil Moisture", "Disease Models", "Frost Alerts"],
    oauthScopes: ["weather:read", "soil:read"],
    isConfigured: false,
  },
  {
    id: "davis",
    name: "Davis Instruments",
    tagline: "Vantage Pro2 / Vue",
    description:
      "Weather stations delivering hyper-local air temperature, humidity, rainfall, wind, and solar radiation data.",
    authType: "oauth",
    sensorTypes: ["weather_station"],
    brandColor: "#E4002B",
    iconName: "Thermometer",
    capabilities: ["Air Temp", "Humidity", "Rainfall", "Wind Speed", "Solar Radiation"],
    oauthScopes: ["stations:read", "observations:read"],
    isConfigured: false,
  },
  {
    id: "cropx",
    name: "CropX",
    tagline: "Soil & Irrigation",
    description:
      "Soil sensors and irrigation controllers providing real-time soil moisture, EC, temperature, and NPK data.",
    authType: "apikey",
    sensorTypes: ["soil_sensor", "irrigation_controller"],
    brandColor: "#007A3D",
    iconName: "Droplets",
    capabilities: ["Soil Moisture", "Soil EC", "Soil Temp", "NPK", "Irrigation Control"],
    apiBaseUrl: "https://api.cropx.com/v2",
    apiFormHelp:
      "Enter your CropX API credentials. The API Key, Farm ID, and Sensor ID are found in your CropX developer portal.",
    isConfigured: false,
  },
  {
    id: "sencrop",
    name: "Sencrop",
    tagline: "Crop Weather Network",
    description:
      "Connected weather stations and sensors from a collaborative grower network with localized crop intelligence.",
    authType: "oauth",
    sensorTypes: ["weather_station", "soil_sensor"],
    brandColor: "#00A3B2",
    iconName: "Activity",
    capabilities: ["Weather", "Leaf Wetness", "Soil Moisture", "Disease Pressure"],
    oauthScopes: ["stations:read", "measurements:read"],
    isConfigured: false,
  },
  {
    id: "johndeere",
    name: "John Deere",
    tagline: "Operations Center",
    description:
      "Connect your John Deere Operations Center to sync machinery, field operations, and sensor data.",
    authType: "oauth",
    sensorTypes: ["machinery", "soil_sensor"],
    brandColor: "#367C2B",
    iconName: "Tractor",
    capabilities: ["Machinery", "Field Ops", "Yield Data", "Soil Sensing"],
    oauthScopes: [
      "orgs:read",
      "fields:read",
      "machines:read",
      "equipment:read",
    ],
    isConfigured: false,
  },
  {
    id: "custom",
    name: "Custom API",
    tagline: "Any REST API",
    description:
      "Connect any sensor platform with a REST API using an API key. Map your data into the unified AgroVision model.",
    authType: "apikey",
    sensorTypes: ["weather_station", "soil_sensor", "irrigation_controller"],
    brandColor: "#64748b",
    iconName: "Cpu",
    capabilities: ["Flexible Mappings", "Custom Endpoints", "Any Sensor"],
    apiBaseUrl: "https://your-api.example.com",
    apiFormHelp:
      "Provide your custom API endpoint credentials. AgroVision will poll the endpoint and normalize supported metrics.",
    isConfigured: false,
  },
];

// ============================================================
// Mock existing integrations
// ============================================================

export const mockIntegrations: SensorIntegration[] = [
  {
    id: "integ_metos_north",
    providerId: "metos",
    providerName: "METOS",
    authType: "oauth",
    sensorType: "weather_station",
    farmId: "farm_greenvalley",
    fieldId: "f1",
    externalSensorIds: ["METOS-8Z4K2-01"],
    status: "connected",
    oauthTokenRef: "kms://metos/token/9f8a2c",
    connectedAt: "2024-02-10T09:00:00Z",
    lastSyncAt: "2024-03-18T08:00:00Z",
    lastSuccessfulSync: "2024-03-18T08:00:12Z",
    metadata: {
      model: "iMetos 3.3",
      stationName: "North Field Station",
      firmware: "v4.2",
    },
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
  {
    id: "integ_davis_south",
    providerId: "davis",
    providerName: "Davis Instruments",
    authType: "oauth",
    sensorType: "weather_station",
    farmId: "farm_greenvalley",
    fieldId: "f2",
    externalSensorIds: ["DVS-7724-01"],
    status: "connected",
    oauthTokenRef: "kms://davis/token/3b71d0",
    connectedAt: "2024-01-25T12:00:00Z",
    lastSyncAt: "2024-03-18T07:55:00Z",
    lastSuccessfulSync: "2024-03-18T07:55:08Z",
    metadata: {
      model: "Vantage Pro2",
      stationName: "South Meadow Station",
    },
    createdAt: "2024-01-25T12:00:00Z",
    updatedAt: "2024-03-18T07:55:00Z",
  },
  {
    id: "integ_cropx_orchard",
    providerId: "cropx",
    providerName: "CropX",
    authType: "apikey",
    sensorType: "soil_sensor",
    farmId: "farm_greenvalley",
    fieldId: "f3",
    externalSensorIds: ["CX-SOIL-1188"],
    status: "connected",
    credentials: {
      encryptedPayload: "AES-GCM:enc(CROPX_API_KEY_REF)",
      keyId: "kms-key-prod-01",
      iv: "7f2a01c9d4e8b6a3",
      algorithm: "AES-256-GCM",
    },
    connectedAt: "2024-03-01T08:30:00Z",
    lastSyncAt: "2024-03-18T07:50:00Z",
    lastSuccessfulSync: "2024-03-18T07:50:05Z",
    metadata: {
      model: "CropX Soil Probe",
      probeDepthCm: 30,
    },
    createdAt: "2024-03-01T08:30:00Z",
    updatedAt: "2024-03-18T07:50:00Z",
  },
  {
    id: "integ_sencrop_west",
    providerId: "sencrop",
    providerName: "Sencrop",
    authType: "oauth",
    sensorType: "weather_station",
    farmId: "farm_greenvalley",
    fieldId: "f4",
    externalSensorIds: ["SC-WX-4412"],
    status: "error",
    oauthTokenRef: "kms://sencrop/token/5c9e12",
    connectedAt: "2024-02-14T10:00:00Z",
    lastSyncAt: "2024-03-17T18:00:00Z",
    lastSuccessfulSync: undefined,
    metadata: {
      model: "Sencrop Raincrop",
      stationName: "West Pasture Mini-station",
    },
    createdAt: "2024-02-14T10:00:00Z",
    updatedAt: "2024-03-17T18:00:00Z",
  },
];

// ============================================================
// Mocks: sync logs
// ============================================================

export const mockSyncLogs: SensorSyncLog[] = [
  {
    id: "log_1",
    integrationId: "integ_metos_north",
    status: "success",
    startedAt: "2024-03-18T08:00:00Z",
    finishedAt: "2024-03-18T08:00:12Z",
    readingsCount: 24,
    createdAt: "2024-03-18T08:00:12Z",
  },
  {
    id: "log_2",
    integrationId: "integ_davis_south",
    status: "success",
    startedAt: "2024-03-18T07:55:00Z",
    finishedAt: "2024-03-18T07:55:08Z",
    readingsCount: 18,
    createdAt: "2024-03-18T07:55:08Z",
  },
  {
    id: "log_3",
    integrationId: "integ_cropx_orchard",
    status: "success",
    startedAt: "2024-03-18T07:50:00Z",
    finishedAt: "2024-03-18T07:50:05Z",
    readingsCount: 9,
    createdAt: "2024-03-18T07:50:05Z",
  },
  {
    id: "log_4",
    integrationId: "integ_sencrop_west",
    status: "error",
    startedAt: "2024-03-17T18:00:00Z",
    finishedAt: "2024-03-17T18:00:03Z",
    readingsCount: 0,
    error: "OAuth token expired. Re-authentication required.",
    providerErrors: ["invalid_token: token_revoked"],
    createdAt: "2024-03-17T18:00:03Z",
  },
];

// ============================================================
// Mocks: unified readings
// ============================================================

function metric(
  key: UnifiedSensorReading["metrics"][number]["key"],
  label: string,
  value: number,
  unit: string,
  quality: number,
  timestamp: string
): UnifiedSensorReading["metrics"][number] {
  return { key, label, value, unit, quality, timestamp };
}

const ts = "2024-03-18T08:00:00Z";

export const mockUnifiedReadings: UnifiedSensorReading[] = [
  {
    id: "read_metos_1",
    integrationId: "integ_metos_north",
    providerId: "metos",
    fieldId: "f1",
    sensorType: "weather_station",
    timestamp: ts,
    metrics: [
      metric("air_temperature", "Air Temperature", 22.4, "°C", 0.97, ts),
      metric("humidity", "Humidity", 64, "%", 0.95, ts),
      metric("rainfall", "Rainfall", 0.5, "mm", 0.99, ts),
      metric("wind_speed", "Wind Speed", 12.3, "km/h", 0.93, ts),
      metric("solar_radiation", "Solar Radiation", 620, "W/m²", 0.9, ts),
      metric("soil_temperature", "Soil Temperature", 16.8, "°C", 0.94, ts),
    ],
  },
  {
    id: "read_davis_1",
    integrationId: "integ_davis_south",
    providerId: "davis",
    fieldId: "f2",
    sensorType: "weather_station",
    timestamp: ts,
    metrics: [
      metric("air_temperature", "Air Temperature", 21.1, "°C", 0.96, ts),
      metric("humidity", "Humidity", 70, "%", 0.95, ts),
      metric("rainfall", "Rainfall", 1.2, "mm", 0.98, ts),
      metric("wind_speed", "Wind Speed", 9.8, "km/h", 0.92, ts),
      metric("solar_radiation", "Solar Radiation", 540, "W/m²", 0.88, ts),
    ],
  },
  {
    id: "read_cropx_1",
    integrationId: "integ_cropx_orchard",
    providerId: "cropx",
    fieldId: "f3",
    sensorType: "soil_sensor",
    timestamp: ts,
    metrics: [
      metric("soil_moisture", "Soil Moisture", 0.28, "m³/m³", 0.96, ts),
      metric("soil_temperature", "Soil Temperature", 15.2, "°C", 0.95, ts),
      metric("electrical_conductivity", "Electrical Conductivity", 1.8, "dS/m", 0.9, ts),
      metric("ph", "pH", 6.4, "pH", 0.93, ts),
      metric("nitrogen", "Soil Nitrogen", 72, "ppm", 0.85, ts),
      metric("phosphorus", "Soil Phosphorus", 38, "ppm", 0.82, ts),
      metric("potassium", "Soil Potassium", 210, "ppm", 0.84, ts),
    ],
  },
  {
    id: "read_sencrop_1",
    integrationId: "integ_sencrop_west",
    providerId: "sencrop",
    fieldId: "f4",
    sensorType: "weather_station",
    timestamp: "2024-03-17T18:00:00Z",
    metrics: [
      metric("air_temperature", "Air Temperature", 19.5, "°C", 0.9, ts),
      metric("humidity", "Humidity", 78, "%", 0.88, ts),
      metric("rainfall", "Rainfall", 0.2, "mm", 0.93, ts),
    ],
  },
];

// ============================================================
// Field name lookup (mirrors sensor-data.ts to avoid circular imports)
// ============================================================

export const integrationFieldNames: Record<string, string> = {
  f1: "North Field",
  f2: "South Meadow",
  f3: "East Orchard",
  f4: "West Pasture",
  f5: "Central Valley",
};

export function getIntegrationFieldName(fieldId?: string): string {
  if (!fieldId) return "Unassigned";
  return integrationFieldNames[fieldId] || fieldId;
}
