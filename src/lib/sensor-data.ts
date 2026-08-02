/**
 * IoT Sensors & Field Monitoring - Mock Data
 *
 * Tracks field-deployed sensors (soil moisture, temperature, EC, pH, nutrients,
 * weather) and their time-series readings. Uses the types defined in iot-types.ts
 * and follows the same data-layer pattern as inventory-data.ts.
 */

import {
  type IoTSensor,
  type SensorReading,
  type SensorAggregate,
  type SensorStatus,
  type SensorType,
  isReadingNormal,
} from "@/lib/iot-types";

// ============================================================
// Sensor metadata (icon/unit/label per type)
// ============================================================

export interface SensorTypeInfo {
  label: string;
  unit: string;
  shortUnit: string;
  color: string;
  min: number;
  max: number;
}

export const sensorTypeInfo: Record<SensorType, SensorTypeInfo> = {
  soil_moisture: { label: "Soil Moisture", unit: "m³/m³", shortUnit: "%", color: "text-blue-500", min: 0, max: 0.5 },
  soil_temperature: { label: "Soil Temperature", unit: "°C", shortUnit: "°C", color: "text-orange-500", min: 10, max: 30 },
  soil_ec: { label: "Soil EC", unit: "dS/m", shortUnit: "dS/m", color: "text-purple-500", min: 0, max: 4 },
  soil_ph: { label: "Soil pH", unit: "pH", shortUnit: "pH", color: "text-emerald-500", min: 5.5, max: 8 },
  soil_nitrogen: { label: "Soil Nitrogen", unit: "ppm", shortUnit: "ppm", color: "text-green-500", min: 20, max: 120 },
  soil_phosphorus: { label: "Soil Phosphorus", unit: "ppm", shortUnit: "ppm", color: "text-teal-500", min: 15, max: 60 },
  soil_potassium: { label: "Soil Potassium", unit: "ppm", shortUnit: "ppm", color: "text-lime-500", min: 100, max: 300 },
  air_temperature: { label: "Air Temperature", unit: "°C", shortUnit: "°C", color: "text-yellow-500", min: 10, max: 35 },
  air_humidity: { label: "Air Humidity", unit: "%", shortUnit: "%", color: "text-cyan-500", min: 30, max: 90 },
  leaf_wetness: { label: "Leaf Wetness", unit: "%", shortUnit: "%", color: "text-sky-500", min: 0, max: 100 },
  wind_speed: { label: "Wind Speed", unit: "km/h", shortUnit: "km/h", color: "text-indigo-500", min: 0, max: 40 },
  wind_direction: { label: "Wind Direction", unit: "°", shortUnit: "°", color: "text-indigo-500", min: 0, max: 360 },
  rainfall: { label: "Rainfall", unit: "mm", shortUnit: "mm", color: "text-blue-600", min: 0, max: 50 },
  solar_radiation: { label: "Solar Radiation", unit: "W/m²", shortUnit: "W/m²", color: "text-amber-500", min: 0, max: 1000 },
  barometric_pressure: { label: "Barometric Pressure", unit: "hPa", shortUnit: "hPa", color: "text-slate-500", min: 980, max: 1030 },
  co2: { label: "CO₂", unit: "ppm", shortUnit: "ppm", color: "text-neutral-500", min: 300, max: 800 },
  custom: { label: "Custom Sensor", unit: "", shortUnit: "", color: "text-muted-foreground", min: 0, max: 100 },
};

// ============================================================
// Sensor devices
// ============================================================

export const sensorDevices: IoTSensor[] = [
  {
    id: "sm-01",
    name: "Soil Moisture – North Field",
    type: "soil_moisture",
    status: "online",
    protocol: "lorawan",
    fieldId: "f1",
    location: { lat: 40.7138, lng: -74.006, elevation: 42 },
    metadata: {
      manufacturer: "Sensoterra",
      model: "ST-SM-100",
      firmwareVersion: "v2.4.1",
      batteryLevel: 86,
      signalStrength: -78,
      lastSeen: "2024-03-18T08:00:00Z",
      installationDepth: 20,
      calibrationDate: "2024-01-10",
    },
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
  {
    id: "st-01",
    name: "Soil Temp – North Field",
    type: "soil_temperature",
    status: "online",
    protocol: "lorawan",
    fieldId: "f1",
    location: { lat: 40.7142, lng: -74.005, elevation: 41 },
    metadata: {
      manufacturer: "Meter Group",
      model: "TEROS-12",
      firmwareVersion: "v1.8.0",
      batteryLevel: 72,
      signalStrength: -81,
      lastSeen: "2024-03-18T08:00:00Z",
      installationDepth: 10,
    },
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
  {
    id: "at-01",
    name: "Air Temp – North Field",
    type: "air_temperature",
    status: "online",
    protocol: "mqtt",
    fieldId: "f1",
    location: { lat: 40.7135, lng: -74.0065, elevation: 45 },
    metadata: {
      manufacturer: "Davis Instruments",
      model: "Vantage Vue",
      batteryLevel: 94,
      signalStrength: -65,
      lastSeen: "2024-03-18T08:00:00Z",
    },
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
  {
    id: "sm-02",
    name: "Soil Moisture – South Meadow",
    type: "soil_moisture",
    status: "online",
    protocol: "lorawan",
    fieldId: "f2",
    location: { lat: 40.7128, lng: -74.004, elevation: 38 },
    metadata: {
      manufacturer: "Sensoterra",
      model: "ST-SM-100",
      firmwareVersion: "v2.4.1",
      batteryLevel: 64,
      signalStrength: -88,
      lastSeen: "2024-03-18T07:55:00Z",
      installationDepth: 30,
    },
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-03-18T07:55:00Z",
  },
  {
    id: "ec-01",
    name: "Soil EC – South Meadow",
    type: "soil_ec",
    status: "error",
    protocol: "lorawan",
    fieldId: "f2",
    location: { lat: 40.7132, lng: -74.0035, elevation: 39 },
    metadata: {
      manufacturer: "Sentek",
      model: "Drill & Drop EC",
      firmwareVersion: "v3.0.2",
      batteryLevel: 51,
      signalStrength: -92,
      lastSeen: "2024-03-18T07:30:00Z",
      installationDepth: 20,
    },
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-03-18T07:30:00Z",
  },
  {
    id: "rf-01",
    name: "Rain Gauge – South Meadow",
    type: "rainfall",
    status: "online",
    protocol: "sigfox",
    fieldId: "f2",
    location: { lat: 40.7125, lng: -74.0045, elevation: 40 },
    metadata: {
      manufacturer: "Davis Instruments",
      model: "Rain Collector II",
      batteryLevel: 88,
      signalStrength: -70,
      lastSeen: "2024-03-18T08:00:00Z",
    },
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
  {
    id: "sm-03",
    name: "Soil Moisture – East Orchard",
    type: "soil_moisture",
    status: "low_battery",
    protocol: "mqtt",
    fieldId: "f3",
    location: { lat: 40.7155, lng: -74.002, elevation: 55 },
    metadata: {
      manufacturer: "Sensoterra",
      model: "ST-SM-100",
      firmwareVersion: "v2.3.0",
      batteryLevel: 12,
      signalStrength: -95,
      lastSeen: "2024-03-17T20:00:00Z",
      installationDepth: 15,
    },
    createdAt: "2024-02-01T11:00:00Z",
    updatedAt: "2024-03-17T20:00:00Z",
  },
  {
    id: "ph-01",
    name: "Soil pH – East Orchard",
    type: "soil_ph",
    status: "online",
    protocol: "lorawan",
    fieldId: "f3",
    location: { lat: 40.7159, lng: -74.001, elevation: 56 },
    metadata: {
      manufacturer: "Vegetronix",
      model: "VH400-PH",
      firmwareVersion: "v1.2.0",
      batteryLevel: 79,
      signalStrength: -75,
      lastSeen: "2024-03-18T07:50:00Z",
      installationDepth: 12,
    },
    createdAt: "2024-02-01T11:00:00Z",
    updatedAt: "2024-03-18T07:50:00Z",
  },
  {
    id: "n-01",
    name: "Nitrogen – West Pasture",
    type: "soil_nitrogen",
    status: "online",
    protocol: "modbus",
    fieldId: "f4",
    location: { lat: 40.7125, lng: -74.008, elevation: 44 },
    metadata: {
      manufacturer: "Spectrum",
      model: "WatchDog 2000",
      firmwareVersion: "v4.1.0",
      batteryLevel: 82,
      signalStrength: -68,
      lastSeen: "2024-03-18T08:00:00Z",
      installationDepth: 10,
    },
    createdAt: "2024-01-10T07:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
  {
    id: "sm-04",
    name: "Soil Moisture – West Pasture",
    type: "soil_moisture",
    status: "online",
    protocol: "lorawan",
    fieldId: "f4",
    location: { lat: 40.7129, lng: -74.007, elevation: 43 },
    metadata: {
      manufacturer: "Sensoterra",
      model: "ST-SM-100",
      firmwareVersion: "v2.4.1",
      batteryLevel: 68,
      signalStrength: -84,
      lastSeen: "2024-03-18T08:00:00Z",
      installationDepth: 25,
    },
    createdAt: "2024-01-10T07:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
  {
    id: "ws-01",
    name: "Wind Station – West Pasture",
    type: "wind_speed",
    status: "online",
    protocol: "mqtt",
    fieldId: "f4",
    location: { lat: 40.7119, lng: -74.0085, elevation: 48 },
    metadata: {
      manufacturer: "Davis Instruments",
      model: "Anemometer 6410",
      batteryLevel: 90,
      signalStrength: -72,
      lastSeen: "2024-03-18T08:00:00Z",
    },
    createdAt: "2024-01-10T07:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
  {
    id: "sm-05",
    name: "Soil Moisture – Central Valley",
    type: "soil_moisture",
    status: "online",
    protocol: "lorawan",
    fieldId: "f5",
    location: { lat: 40.714, lng: -74.0, elevation: 30 },
    metadata: {
      manufacturer: "Sensoterra",
      model: "ST-SM-100",
      firmwareVersion: "v2.4.1",
      batteryLevel: 95,
      signalStrength: -60,
      lastSeen: "2024-03-18T08:00:00Z",
      installationDepth: 20,
    },
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
  {
    id: "st-03",
    name: "Soil Temp – Central Valley",
    type: "soil_temperature",
    status: "offline",
    protocol: "lorawan",
    fieldId: "f5",
    location: { lat: 40.7144, lng: -73.999, elevation: 31 },
    metadata: {
      manufacturer: "Meter Group",
      model: "TEROS-12",
      firmwareVersion: "v1.8.0",
      batteryLevel: 4,
      lastSeen: "2024-03-16T14:00:00Z",
      installationDepth: 15,
    },
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-03-16T14:00:00Z",
  },
  {
    id: "ah-01",
    name: "Humidity – Central Valley",
    type: "air_humidity",
    status: "online",
    protocol: "mqtt",
    fieldId: "f5",
    location: { lat: 40.7134, lng: -73.9995, elevation: 32 },
    metadata: {
      manufacturer: "Davis Instruments",
      model: "Vantage Vue",
      batteryLevel: 91,
      signalStrength: -66,
      lastSeen: "2024-03-18T08:00:00Z",
    },
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-03-18T08:00:00Z",
  },
];

// ============================================================
// Time-series readings
// ============================================================

/**
 * Generate a deterministic 24h time series for a sensor around a base value
 * with a realistic diurnal pattern. Seed is used so values are stable across renders.
 */
function generateReadings(
  sensorId: string,
  base: number,
  amplitude: number,
  unit: string,
  hours = 24,
  seed = 0
): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = new Date("2024-03-18T08:00:00Z").getTime();

  for (let i = hours; i >= 0; i--) {
    const t = now - i * 3600 * 1000;
    const hourOfDay = new Date(t).getUTCHours();
    // Diurnal curve peaks mid-afternoon
    const diurnal = Math.sin(((hourOfDay - 6) / 24) * Math.PI * 2) * amplitude * 0.5;
    const noise = Math.sin(seed + i * 1.7) * amplitude * 0.35;
    readings.push({
      id: `${sensorId}-${i}`,
      sensorId,
      timestamp: new Date(t).toISOString(),
      value: Math.round((base + diurnal + noise) * 100) / 100,
      unit,
      quality: Math.round((0.85 + (Math.sin(seed + i) + 1) * 0.07) * 100) / 100,
    });
  }
  return readings;
}

const readingDefs: Record<string, { base: number; amp: number; unit: string }> = {
  "sm-01": { base: 0.32, amp: 0.04, unit: "m³/m³" },
  "st-01": { base: 18, amp: 2, unit: "°C" },
  "at-01": { base: 22, amp: 4, unit: "°C" },
  "sm-02": { base: 0.48, amp: 0.03, unit: "m³/m³" },
  "ec-01": { base: 4.6, amp: 0.2, unit: "dS/m" },
  "rf-01": { base: 0.5, amp: 0.6, unit: "mm" },
  "sm-03": { base: 0.28, amp: 0.04, unit: "m³/m³" },
  "ph-01": { base: 6.5, amp: 0.15, unit: "pH" },
  "n-01": { base: 75, amp: 8, unit: "ppm" },
  "sm-04": { base: 0.14, amp: 0.02, unit: "m³/m³" },
  "ws-01": { base: 12, amp: 4, unit: "km/h" },
  "sm-05": { base: 0.85, amp: 0.05, unit: "m³/m³" },
  "st-03": { base: 20, amp: 2, unit: "°C" },
  "ah-01": { base: 65, amp: 8, unit: "%" },
};

export const sensorReadings: SensorReading[] = sensorDevices.flatMap((sensor, idx) => {
  const def = readingDefs[sensor.id];
  if (!def) return [];
  return generateReadings(sensor.id, def.base, def.amp, def.unit, 24, idx * 3.3);
});

// ============================================================
// Helper functions
// ============================================================

export function getSensorsByField(fieldId: string): IoTSensor[] {
  return sensorDevices.filter((s) => s.fieldId === fieldId);
}

export function getSensorById(sensorId: string): IoTSensor | undefined {
  return sensorDevices.find((s) => s.id === sensorId);
}

export function getLatestReading(sensorId: string): SensorReading | undefined {
  const readings = sensorReadings.filter((r) => r.sensorId === sensorId);
  if (readings.length === 0) return undefined;
  return readings[readings.length - 1];
}

export function getReadingsForChart(sensorId: string, hours = 24): SensorReading[] {
  const all = sensorReadings
    .filter((r) => r.sensorId === sensorId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  if (all.length === 0) return [];

  // Anchor the window to the most recent reading timestamp so mock data charts correctly
  const latestTime = new Date(all[all.length - 1].timestamp).getTime();
  const cutoff = latestTime - hours * 3600 * 1000;
  return all.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
}

export function getAverageReading(sensorId: string, fieldId: string, hours = 24): SensorAggregate | undefined {
  const readings = getReadingsForChart(sensorId, hours);
  if (readings.length === 0) return undefined;
  const sensor = getSensorById(sensorId);
  if (!sensor) return undefined;

  const values = readings.map((r) => r.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance = values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length;

  return {
    sensorId,
    fieldId,
    type: sensor.type,
    period: {
      start: readings[0].timestamp,
      end: readings[readings.length - 1].timestamp,
    },
    avg: Math.round(avg * 100) / 100,
    min: Math.round(Math.min(...values) * 100) / 100,
    max: Math.round(Math.max(...values) * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(Math.sqrt(variance) * 100) / 100,
    sampleCount: readings.length,
    unit: readings[0].unit,
  };
}

export interface SensorAlert {
  id: string;
  sensorId: string;
  sensorName: string;
  fieldId: string;
  fieldName: string;
  type: SensorType;
  severity: "warning" | "critical";
  message: string;
  value: number;
  unit: string;
  timestamp: string;
}

// Field name lookup (kept local to avoid circular imports with data.ts)
const fieldNames: Record<string, string> = {
  f1: "North Field",
  f2: "South Meadow",
  f3: "East Orchard",
  f4: "West Pasture",
  f5: "Central Valley",
};

export function getFieldName(fieldId?: string): string {
  if (!fieldId) return "Unassigned";
  return fieldNames[fieldId] || fieldId;
}

export function getFieldById(fieldId: string): { id: string; name: string } | undefined {
  if (!fieldNames[fieldId]) return undefined;
  return { id: fieldId, name: fieldNames[fieldId] };
}

/**
 * Compute active alerts across all sensors using isReadingNormal() plus
 * sensor-specific thresholds (e.g., very low moisture is critical).
 */
export function getSensorAlerts(): SensorAlert[] {
  const alerts: SensorAlert[] = [];

  for (const sensor of sensorDevices) {
    const latest = getLatestReading(sensor.id);
    if (!latest) {
      if (sensor.status === "offline") {
        alerts.push({
          id: `${sensor.id}-offline`,
          sensorId: sensor.id,
          sensorName: sensor.name,
          fieldId: sensor.fieldId || "",
          fieldName: getFieldName(sensor.fieldId),
          type: sensor.type,
          severity: "warning",
          message: `Sensor offline — no data received since ${sensor.metadata.lastSeen || "unknown"}`,
          value: 0,
          unit: "",
          timestamp: sensor.metadata.lastSeen || sensor.updatedAt,
        });
      }
      continue;
    }

    // Out of normal range per iot-types helper
    if (!isReadingNormal(latest)) {
      const info = sensorTypeInfo[sensor.type];
      const severity: "warning" | "critical" =
        sensor.type === "soil_moisture" && latest.value < 0.15 ? "critical" : "warning";
      alerts.push({
        id: `${sensor.id}-range`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        fieldId: sensor.fieldId || "",
        fieldName: getFieldName(sensor.fieldId),
        type: sensor.type,
        severity,
        message: `${info.label} reading ${formatSensorValue(latest.value, latest.unit)} is outside the normal range`,
        value: latest.value,
        unit: latest.unit,
        timestamp: latest.timestamp,
      });
    }

    // Low battery
    if (sensor.status === "low_battery" || (sensor.metadata.batteryLevel ?? 100) < 20) {
      alerts.push({
        id: `${sensor.id}-battery`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        fieldId: sensor.fieldId || "",
        fieldName: getFieldName(sensor.fieldId),
        type: sensor.type,
        severity: "warning",
        message: `Low battery (${sensor.metadata.batteryLevel ?? 0}%) — replace batteries soon`,
        value: sensor.metadata.batteryLevel ?? 0,
        unit: "%",
        timestamp: sensor.updatedAt,
      });
    }
  }

  return alerts.sort((a, b) =>
    a.severity === b.severity
      ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      : a.severity === "critical"
      ? -1
      : 1
  );
}

export function getSensorStatusSummary(): Record<SensorStatus, number> {
  const summary: Record<SensorStatus, number> = {
    online: 0,
    offline: 0,
    error: 0,
    low_battery: 0,
  };
  for (const sensor of sensorDevices) {
    summary[sensor.status] += 1;
  }
  return summary;
}

export function getAverageBattery(): number {
  const batteries = sensorDevices.map((s) => s.metadata.batteryLevel ?? 0);
  if (batteries.length === 0) return 0;
  return Math.round(batteries.reduce((a, b) => a + b, 0) / batteries.length);
}

export function getOnlineSensors(): IoTSensor[] {
  return sensorDevices.filter((s) => s.status === "online");
}

/**
 * Format a raw reading value for display using the sensor's unit.
 * Soil moisture m³/m³ is shown as a percentage.
 */
export function formatSensorValue(value: number, unit: string): string {
  if (unit === "m³/m³") {
    return `${Math.round(value * 100)}%`;
  }
  if (unit === "pH") {
    return value.toFixed(1);
  }
  if (unit === "dS/m") {
    return value.toFixed(1);
  }
  return `${Math.round(value)} ${unit}`;
}

