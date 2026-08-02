"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FieldDetailsDashboard from "@/components/field-details-dashboard";
import { getField } from "@/lib/fields-service";
import {
  getPolygonWeather,
  getPolygonSatellite,
  getPolygonSoil,
} from "@/lib/agromonitoring-service";
import type { Field } from "@/lib/data";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  AlertTriangle,
  Edit3,
  Trash2,
} from "lucide-react";

const FieldPolygonDrawer = dynamic(
  () => import("@/components/field-polygon-drawer"),
  { ssr: false }
);

interface SatelliteData {
  ndvi: number | null;
  evi: number | null;
  ndmi: number | null;
  imageUrl: string | null;
  trueColorUrl: string | null;
  date: string | null;
  cloudCoverage: number | null;
  imageId?: string;
}

interface SoilData {
  moisture: number | null;
  moisture10: number | null;
  moisture20: number | null;
  moisture40: number | null;
  moisture60: number | null;
  moisture100: number | null;
  surfaceTemp: number | null;
}

interface WeatherData {
  current?: {
    temperature: number;
    humidity: number;
    rain: number;
    wind: number;
    condition: string;
    icon?: string;
    feelsLike: number;
    uvIndex: number;
  };
  forecast?: {
    day: string;
    temp: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    rain: number;
    wind: number;
    condition: string;
  }[];
}

interface HistoryItem {
  id: string;
  dt: number;
  cloud_coverage: number;
  visible: boolean;
}

export default function FieldDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fieldId = params.id;

  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [satellite, setSatellite] = useState<SatelliteData | null>(null);
  const [soil, setSoil] = useState<SoilData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const agroMonitoringConfigured = !!process.env.NEXT_PUBLIC_AGROMONITORING_ENABLED;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load field from service (in-memory store)
      const fieldData = await getField(fieldId);
      if (!fieldData) {
        setError("Field not found");
        setLoading(false);
        return;
      }
      setField(fieldData);

      // Try to load AgroMonitoring data if field has an agroMonitoringId
      if (fieldData.agroMonitoringId && process.env.NEXT_PUBLIC_AGROMONITORING_ENABLED) {
        try {
          const now = Math.floor(Date.now() / 1000);
          const start = now - 30 * 24 * 60 * 60;

          const [satResult, weatherResult, soilResult] = await Promise.allSettled([
            getPolygonSatellite(fieldData.agroMonitoringId, start, now),
            getPolygonWeather(fieldData.agroMonitoringId),
            getPolygonSoil(fieldData.agroMonitoringId),
          ]);

          if (satResult.status === "fulfilled") {
            const { images, latestStats } = satResult.value;
            setHistory(images);
            setSatellite({
              ndvi: latestStats?.ndvi?.mean ?? null,
              evi: latestStats?.evi?.mean ?? null,
              ndmi: latestStats?.ndmi?.mean ?? null,
              imageUrl: latestStats?.ndvi_url ?? latestStats?.false_color_url ?? null,
              trueColorUrl: latestStats?.true_color_url ?? null,
              date: images.length > 0 ? new Date(images[0].dt * 1000).toISOString() : null,
              cloudCoverage: images[0]?.cloud_coverage ?? null,
              imageId: images[0]?.id,
            });
          }

          if (weatherResult.status === "fulfilled") {
            const w = weatherResult.value;
            const current = w.current;
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            setWeather({
              current: {
                temperature: Math.round(current.temp),
                humidity: current.humidity,
                rain: Math.round(current.rain?.["1h"] ?? 0),
                wind: Math.round(current.wind_speed),
                condition: getCondition(current.weather?.[0]?.id ?? 800),
                icon: current.weather?.[0]?.icon,
                feelsLike: Math.round(current.feels_like),
                uvIndex: current.uvi,
              },
              forecast: (w.daily || []).slice(0, 7).map((day) => {
                const date = new Date(day.dt * 1000);
                return {
                  day: dayNames[date.getDay()],
                  temp: Math.round(day.temp.day),
                  tempMin: Math.round(day.temp.min),
                  tempMax: Math.round(day.temp.max),
                  humidity: day.humidity,
                  rain: Math.round((day.pop || 0) * 100),
                  wind: Math.round(day.wind_speed),
                  condition: getCondition(day.weather?.[0]?.id ?? 800),
                };
              }),
            });
          }

          if (soilResult.status === "fulfilled") {
            const s = soilResult.value;
            const data = s.data?.[0];
            setSoil({
              moisture: data?.soil_moisture ?? null,
              moisture10: data?.soil_moisture_10 ?? null,
              moisture20: data?.soil_moisture_20 ?? null,
              moisture40: data?.soil_moisture_40 ?? null,
              moisture60: data?.soil_moisture_60 ?? null,
              moisture100: data?.soil_moisture_100 ?? null,
              surfaceTemp: data?.surface_temp ?? null,
            });
          }

          setLastUpdate(new Date().toISOString());
        } catch (agroError) {
          console.warn("Failed to load AgroMonitoring data:", agroError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load field");
    } finally {
      setLoading(false);
    }
  }, [fieldId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = useCallback(async () => {
    if (!field) return;
    if (!window.confirm(`Delete field "${field.name}"? This cannot be undone.`)) return;

    try {
      const { deleteField } = await import("@/lib/fields-service");
      await deleteField(field.id);
      router.push("/dashboard/fields");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete field");
    }
  }, [field, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto mb-3 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading field details...</p>
        </div>
      </div>
    );
  }

  if (error || !field) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto mt-20"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Field Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The field you are looking for does not exist."}
            </p>
            <Button onClick={() => router.push("/dashboard/fields")}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Fields
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Top navigation bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/fields")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{field.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin size={12} />
              {field.latitude.toFixed(4)}, {field.longitude.toFixed(4)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {field.agroMonitoringId ? (
            <Badge variant="success">Synced with AgroMonitoring</Badge>
          ) : (
            <Badge variant="secondary">Local field</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/fields/${field.id}/edit`)}
          >
            <Edit3 size={14} className="mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Field map */}
      <Card className="p-0 overflow-hidden">
        <div className="relative">
          <FieldPolygonDrawer
            initialBoundaries={field.boundaries}
            center={[field.latitude, field.longitude]}
            zoom={15}
          />
        </div>
      </Card>

      {/* Field details dashboard */}
      <FieldDetailsDashboard
        field={field}
        loading={loading}
        satellite={satellite}
        soil={soil}
        weather={weather}
        history={history}
        lastUpdate={lastUpdate}
        agroMonitoringConfigured={agroMonitoringConfigured}
        onRefresh={loadData}
      />
    </motion.div>
  );
}

function getCondition(id: number): string {
  if (id >= 200 && id < 300) return "Stormy";
  if (id >= 300 && id < 400) return "Rainy";
  if (id >= 500 && id < 600) return "Rainy";
  if (id >= 600 && id < 700) return "Snowy";
  if (id >= 700 && id < 800) return "Foggy";
  if (id === 800) return "Sunny";
  if (id === 801) return "Partly Cloudy";
  if (id >= 802 && id < 900) return "Cloudy";
  return "Unknown";
}

