/**
 * IoT Sensor Types
 *
 * Future-ready types for IoT agricultural sensor integration.
 * These types define the data structures for receiving readings from
 * physical sensors deployed in the field (soil moisture, temperature, EC, nutrients).
 *
 * Designed to be compatible with:
 * - LoRaWAN / Sigfox sensors
 * - MQTT-based sensor networks
 * - REST API sensor gateways
 * - Modbus/RS485 field bus sensors
 */

// ============================================================
// Sensor Device Types
// ============================================================

export type SensorType =
  | "soil_moisture"
  | "soil_temperature"
  | "soil_ec"
  | "soil_ph"
  | "soil_nitrogen"
  | "soil_phosphorus"
  | "soil_potassium"
  | "air_temperature"
  | "air_humidity"
  | "leaf_wetness"
  | "wind_speed"
  | "wind_direction"
  | "rainfall"
  | "solar_radiation"
  | "barometric_pressure"
  | "co2"
  | "custom";

export type SensorStatus = "online" | "offline" | "error" | "low_battery";

export type SensorProtocol = "lorawan" | "mqtt" | "sigfox" | "modbus" | "http" | "ble" | "zigbee" | "custom";

export interface SensorMetadata {
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  batteryLevel?: number; // 0-100 percentage
  signalStrength?: number; // RSSI in dBm
  lastSeen?: string; // ISO timestamp
  installationDepth?: number; // cm depth for soil sensors
  calibrationDate?: string;
}

export interface IoTSensor {
  id: string;
  name: string;
  type: SensorType;
  status: SensorStatus;
  protocol: SensorProtocol;
  fieldId?: string; // Links to Field.id
  location?: {
    lat: number;
    lng: number;
    elevation?: number;
  };
  metadata: SensorMetadata;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Sensor Reading Types
// ============================================================

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: string; // ISO 8601
  value: number;
  unit: string;
  quality?: number; // 0-1 confidence score
}

export interface SoilMoistureReading extends SensorReading {
  depth?: number; // cm
  volumetricWaterContent?: number; // m³/m³
}

export interface TemperatureReading extends SensorReading {
  type: "air" | "soil" | "water";
  min?: number;
  max?: number;
}

export interface SoilECReading extends SensorReading {
  temperature?: number; // compensation temperature
  poreWaterEC?: number; // dS/m
}

export interface NutrientReading extends SensorReading {
  nutrient: "nitrogen" | "phosphorus" | "potassium" | "calcium" | "magnesium" | "sulfur";
  unit: "ppm" | "mg/kg" | "kg/ha";
}

// ============================================================
// Aggregated Sensor Data
// ============================================================

export interface SensorAggregate {
  sensorId: string;
  fieldId: string;
  type: SensorType;
  period: {
    start: string;
    end: string;
  };
  avg: number;
  min: number;
  max: number;
  median: number;
  stdDev: number;
  sampleCount: number;
  unit: string;
}

// ============================================================
// Sensor Configuration
// ============================================================

export interface SensorAlertThreshold {
  sensorId: string;
  min?: number;
  max?: number;
  enabled: boolean;
  notifyOnRecovery?: boolean;
}

export interface SensorConfig {
  sensorId: string;
  name: string;
  samplingInterval: number; // seconds
  transmissionInterval: number; // seconds
  alerts: SensorAlertThreshold[];
  enabled: boolean;
}

// ============================================================
// Helper: Generate a unique sensor ID
// ============================================================

export function generateSensorId(): string {
  return `sensor_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Check if sensor reading is within normal range based on type
 */
export function isReadingNormal(reading: SensorReading): boolean {
  switch (reading.unit) {
    case "m³/m³": // Volumetric water content
      return reading.value >= 0.1 && reading.value <= 0.5;
    case "°C":
      return reading.value >= -10 && reading.value <= 50;
    case "dS/m": // Electrical conductivity
      return reading.value >= 0 && reading.value <= 4;
    case "pH":
      return reading.value >= 0 && reading.value <= 14;
    case "ppm":
      return reading.value >= 0 && reading.value <= 500;
    default:
      return true;
  }
}

