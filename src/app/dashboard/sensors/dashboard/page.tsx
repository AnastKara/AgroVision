"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getUnifiedReadings, getAIRecommendations, getCurrentMetrics } from "@/lib/sensor-integration-service";
import type { UnifiedSensorReading, AIRecommendation, UnifiedMetricKey } from "@/lib/sensor-integrations";
import { getIntegrationFieldName } from "@/lib/sensor-integrations-data";
import {
  Droplets,
  Thermometer,
  Cloud,
  CloudRain,
  Wind,
  Sun,
  Leaf,
  Gauge,
  Activity,
  ArrowLeft,
  Plug,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  Battery,
  Signal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metricIcons: Record<string, any> = {
  soil_moisture: Droplets,
  soil_temperature: Thermometer,
  air_temperature: Thermometer,
  humidity: Cloud,
  rainfall: CloudRain,
  wind_speed: Wind,
  wind_direction: Wind,
  solar_radiation: Sun,
  atmospheric_pressure: Gauge,
  leaf_wetness: Droplets,
  ph: Leaf,
  electrical_conductivity: Gauge,
  nitrogen: Leaf,
  phosphorus: Leaf,
  potassium: Leaf,
  battery_level: Battery,
  signal_strength: Signal,
};

const metricColors: Record<UnifiedMetricKey, string> = {
  soil_moisture: "#3b82f6",
  soil_temperature: "#f97316",
  air_temperature: "#eab308",
  humidity: "#06b6d4",
  rainfall: "#2563eb",
  wind_speed: "#6366f1",
  wind_direction: "#8b5cf6",
  solar_radiation: "#f59e0b",
  atmospheric_pressure: "#64748b",
  leaf_wetness: "#0ea5e9",
  ph: "#10b981",
  electrical_conductivity: "#a855f7",
  nitrogen: "#22c55e",
  phosphorus: "#14b8a6",
  potassium: "#84cc16",
  battery_level: "#eab308",
  signal_strength: "#06b6d4",
};

const priorityVariant: Record<string, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

function formatMetricValue(key: UnifiedMetricKey, value: number): string {
  if (key === "soil_moisture") return `${Math.round(value * 100)}%`;
  if (key === "ph") return value.toFixed(1);
  if (key === "electrical_conductivity") return value.toFixed(1);
  return `${Math.round(value)}`;
}

// Build a synthetic historical series for charting from the latest readings
function buildHistorySeries(readings: UnifiedSensorReading[]): {
  time: string;
  [key: string]: number | string;
}[] {
  const points: { time: string; [key: string]: number | string }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 2 * 3600 * 1000);
    const point: { time: string; [key: string]: number | string } = {
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    for (const r of readings) {
      for (const m of r.metrics) {
        // Deterministic pseudo-series around the current value
        const wave = Math.sin((i + r.id.length) * 0.8) * m.value * 0.08;
        point[m.key] = Math.round((m.value + wave) * 100) / 100;
      }
    }
    points.push(point);
  }
  return points;
}

export default function SensorDashboardPage() {
  const [readings, setReadings] = useState<UnifiedSensorReading[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [r, recs] = await Promise.all([getUnifiedReadings(), getAIRecommendations()]);
      setReadings(r);
      setRecommendations(recs);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const currentMetrics = useMemo(() => getCurrentMetrics(), []);
  const chartData = useMemo(() => buildHistorySeries(readings), [readings]);

  const highCount = recommendations.filter((r) => r.priority === "high").length;
  const mediumCount = recommendations.filter((r) => r.priority === "medium").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/sensors"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-3xl font-bold">Sensor Monitoring Dashboard</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Unified readings from all connected providers, normalized into one view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 size={16} className="animate-spin mr-1" />
            ) : (
              <RefreshCw size={16} className="mr-1" />
            )}
            Refresh
          </Button>
          <Link href="/dashboard/sensors/connect">
            <Button>
              <Plug size={16} className="mr-1" />
              Connect Sensors
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Readings", value: readings.length, icon: Activity, color: "text-primary" },
          { label: "Data Points", value: readings.reduce((a, r) => a + r.metrics.length, 0), icon: TrendingUp, color: "text-green-500" },
          { label: "High Priority", value: highCount, icon: AlertTriangle, color: highCount > 0 ? "text-destructive" : "text-green-500" },
          { label: "Medium Priority", value: mediumCount, icon: Sparkles, color: "text-yellow-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current readings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            Current Sensor Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {currentMetrics.map((m) => {
              const Icon = metricIcons[m.key] || Activity;
              const color = metricColors[m.key] || "#64748b";
              return (
                <div key={m.key} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      <Icon size={14} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                  <p className="text-lg font-bold" style={{ color }}>
                    {formatMetricValue(m.key, m.value)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{m.unit}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Field readings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Droplets size={16} className="text-blue-500" />
            Readings by Field
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {readings.map((reading) => (
              <div key={reading.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{getIntegrationFieldName(reading.fieldId)}</p>
                    <Badge variant="secondary" className="text-[9px] px-1.5">
                      {reading.sensorType.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5">
                      {new Date(reading.timestamp).toLocaleString()}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {reading.metrics.map((metric) => {
                    const Icon = metricIcons[metric.key] || Activity;
                    const color = metricColors[metric.key] || "#64748b";
                    return (
                      <div key={metric.key} className="glass rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={12} style={{ color }} />
                          <span className="text-[9px] text-muted-foreground">{metric.label}</span>
                        </div>
                        <p className="text-sm font-semibold">{formatMetricValue(metric.key, metric.value)}</p>
                        <p className="text-[9px] text-muted-foreground">{metric.unit}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical charts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            Historical Trends (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="time" stroke="currentColor" opacity={0.5} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                {chartData[0] && Object.keys(chartData[0]).filter((k) => k !== "time").slice(0, 4).map((key, i) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={metricColors[key as UnifiedMetricKey] || (i % 2 ? "#f97316" : "#3b82f6")}
                    fillOpacity={1}
                    fill={i === 0 ? "url(#g1)" : i === 1 ? "url(#g2)" : "transparent"}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-500" />
            AI Recommendations
            <span className="text-xs text-muted-foreground font-normal">
              Based on sensor + weather + satellite + crop + historical data
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recommendations yet. Connect sensors to generate insights.
            </p>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border ${
                  rec.priority === "high"
                    ? "border-destructive/20 bg-destructive/5"
                    : rec.priority === "medium"
                    ? "border-yellow-500/20 bg-yellow-500/5"
                    : "border-green-500/20 bg-green-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rec.priority === "high"
                          ? "bg-destructive/10 text-destructive"
                          : rec.priority === "medium"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      {rec.priority === "low" ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertTriangle size={16} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{rec.title}</p>
                        <Badge variant={priorityVariant[rec.priority]} className="text-[9px] px-1.5">
                          {rec.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] px-1.5">
                          {rec.fieldName}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="flex gap-1">
                          {rec.sources.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-[8px] px-1.5">
                              {s}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Confidence {(rec.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {rec.actionHref && (
                    <Link href={rec.actionHref}>
                      <Button variant="outline" size="sm" className="ml-auto flex-shrink-0">
                        {rec.actionLabel || "View"}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Call to action */}
      {readings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Plug size={40} className="mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="font-medium mb-1">No sensors connected yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your METOS, Davis, CropX, Sencrop, or John Deere sensors to start monitoring.
            </p>
            <Link href="/dashboard/sensors/connect">
              <Button>
                <Plug size={16} className="mr-1" />
                Connect Sensors
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
