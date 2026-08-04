"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { Field } from "@/lib/data";
import type { AnalyticsResult } from "@/lib/ndvi-analytics";
import NdvAnalyticsDashboard from "@/components/ndvi-analytics-dashboard";
import { formatArea, formatTemperature, formatWeight, useUnits } from "@/components/units-provider";
import {
  Sprout,
  Ruler,
  Droplets,
  Activity,
  Thermometer,
  Wind,
  CloudRain,
  Cloud,
  Sun,
  Calendar,
  RefreshCw,
  Satellite,
  TrendingUp,
  TrendingDown,
  Info,
  TreePine,
  Mountain,
  Eye,
  CloudSun,
  CloudSnow,
  Loader2,
  AlertTriangle,
  History,
  MapPin,
  LineChart as LineChartIcon,
} from "lucide-react";

interface FieldDetailsDashboardProps {
  field: Field;
  /** Whether AgroMonitoring data is loading */
  loading?: boolean;
  /** Satellite NDVI/EVI data */
  satellite?: {
    ndvi: number | null;
    evi: number | null;
    ndmi: number | null;
    imageUrl: string | null;
    trueColorUrl: string | null;
    date: string | null;
    cloudCoverage: number | null;
    imageId?: string;
  } | null;
  /** Soil moisture data */
  soil?: {
    moisture: number | null;
    moisture10: number | null;
    moisture20: number | null;
    moisture40: number | null;
    moisture60: number | null;
    moisture100: number | null;
    surfaceTemp: number | null;
  } | null;
  /** Weather data */
  weather?: {
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
  } | null;
  /** Historical satellite images */
  history?: {
    id: string;
    dt: number;
    cloud_coverage: number;
    visible: boolean;
  }[] | null;
  /** Last data update timestamp */
  lastUpdate?: string | null;
  /** Whether AgroMonitoring is configured */
  agroMonitoringConfigured?: boolean;
  /** Callback to refresh data */
  onRefresh?: () => void;
  /** Predictive analytics result (NDVI timeline, yield forecast) */
  analytics?: AnalyticsResult | null;
  /** Whether analytics is loading */
  analyticsLoading?: boolean;
}

const weatherIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sunny: Sun,
  "Partly Cloudy": CloudSun,
  Cloudy: Cloud,
  Rainy: CloudRain,
  Stormy: CloudRain,
  Snowy: CloudSnow,
  Foggy: Eye,
};

function getNDVIColor(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  if (value >= 0.6) return "text-green-500";
  if (value >= 0.4) return "text-yellow-500";
  if (value >= 0.2) return "text-orange-500";
  return "text-red-500";
}

function getNDVILabel(value: number | null): string {
  if (value === null) return "No Data";
  if (value >= 0.6) return "Dense Vegetation";
  if (value >= 0.4) return "Moderate Vegetation";
  if (value >= 0.2) return "Sparse Vegetation";
  return "Barren";
}

function getSoilMoistureColor(value: number | null): string {
  if (value === null) return "bg-muted";
  if (value >= 60) return "bg-blue-500";
  if (value >= 35) return "bg-green-500";
  if (value >= 20) return "bg-yellow-500";
  return "bg-red-500";
}

function getCloudLabel(coverage: number | null): string {
  if (coverage === null) return "No Data";
  if (coverage < 10) return "Clear";
  if (coverage < 30) return "Low";
  if (coverage < 60) return "Moderate";
  if (coverage < 90) return "High";
  return "Overcast";
}

function getCloudColor(coverage: number | null): string {
  if (coverage === null) return "text-muted-foreground";
  if (coverage < 30) return "text-green-500";
  if (coverage < 60) return "text-yellow-500";
  return "text-red-500";
}

export default function FieldDetailsDashboard({
  field,
  loading = false,
  satellite,
  soil,
  weather,
  history,
  lastUpdate,
  agroMonitoringConfigured = false,
  onRefresh,
  analytics,
  analyticsLoading,
}: FieldDetailsDashboardProps) {
  const { unitSystem } = useUnits();
  const [activeTab, setActiveTab] = useState<
    "overview" | "vegetation" | "soil" | "weather" | "history" | "analytics"
  >("overview");

  const current = weather?.current;
  const forecast = weather?.forecast || [];
  const ConditionIcon = current ? weatherIcons[current.condition] || Sun : Sun;
  const isOverviewTab = activeTab === "overview";

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sprout size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{field.name}</h2>
            <p className="text-sm text-muted-foreground">
              {field.cropType} · {formatArea(field.area, unitSystem)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={agroMonitoringConfigured ? "success" : "secondary"}>
            {agroMonitoringConfigured ? "AgroMonitoring Live" : "Local Only"}
          </Badge>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RefreshCw size={12} />
              Updated {new Date(lastUpdate).toLocaleString()}
            </span>
          )}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["overview", "Overview", Sprout],
            ["vegetation", "Vegetation", TreePine],
            ["soil", "Soil", Mountain],
            ["weather", "Weather", CloudSun],
            ["history", "History", History],
            ["analytics", "Predictive Analytics", LineChartIcon],
          ] as const
        ).map(([key, label, Icon]) => (
          <Button
            key={key}
            variant={activeTab === key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(key)}
            className="h-9"
          >
            <Icon size={14} className="mr-1" />
            {label}
          </Button>
        ))}
      </div>

      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 size={32} className="mx-auto mb-3 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading AgroMonitoring data for {field.name}...
            </p>
          </CardContent>
        </Card>
      )}

      {/* ===================== OVERVIEW TAB ===================== */}
      {!loading && activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Area", value: formatArea(field.area, unitSystem), icon: Ruler, color: "text-purple-500" },
              { label: "Health", value: `${field.health}%`, icon: Activity, color: field.health >= 75 ? "text-green-500" : field.health >= 50 ? "text-yellow-500" : "text-red-500" },
              { label: "Moisture", value: `${field.moisture}%`, icon: Droplets, color: "text-blue-500" },
              { label: "Nitrogen", value: `${field.nitrogen}%`, icon: Sprout, color: "text-emerald-500" },
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

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Health card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity size={16} className="text-primary" />
                  Field Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overall Health</span>
                  <span className={`text-lg font-bold ${field.health >= 75 ? "text-green-500" : field.health >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                    {field.health}%
                  </span>
                </div>
                <Progress
                  value={field.health}
                  variant={field.health >= 75 ? "success" : field.health >= 50 ? "warning" : "danger"}
                  className="h-2.5"
                />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="glass rounded-xl p-3 text-center">
                    <Droplets size={14} className="mx-auto mb-1 text-blue-500" />
                    <p className="text-[10px] text-muted-foreground">Moisture</p>
                    <p className="text-sm font-bold">{field.moisture}%</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <Sprout size={14} className="mx-auto mb-1 text-emerald-500" />
                    <p className="text-[10px] text-muted-foreground">Nitrogen</p>
                    <p className="text-sm font-bold">{field.nitrogen}%</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <Ruler size={14} className="mx-auto mb-1 text-purple-500" />
                    <p className="text-[10px] text-muted-foreground">Area</p>
                    <p className="text-sm font-bold">{formatArea(field.area, unitSystem)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sprout size={16} className="text-emerald-500" />
                  Growth & Yield
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="glass rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Growth Stage</span>
                  <Badge variant="info">{field.growthStage}</Badge>
                </div>
                <div className="glass rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Expected Yield</span>
                  <span className="font-semibold">{formatWeight(field.expectedYield, unitSystem)}</span>
                </div>
                <div className="glass rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Irrigation</span>
                  <span className="font-semibold text-sm">{field.lastIrrigation}</span>
                </div>
                <div className="glass rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Fertilization</span>
                  <span className="font-semibold text-sm">{field.lastFertilization}</span>
                </div>
              </CardContent>
            </Card>

            {/* NDVI/Weather snapshot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Satellite size={16} className="text-green-500" />
                  Quick Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {satellite?.ndvi !== null && satellite?.ndvi !== undefined ? (
                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">NDVI</span>
                      <span className={`text-sm font-bold ${getNDVIColor(satellite.ndvi)}`}>
                        {satellite.ndvi.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={((satellite.ndvi + 1) / 2) * 100}
                      className="h-1.5"
                    />
                  </div>
                ) : (
                  <div className="glass rounded-xl p-3 text-center text-xs text-muted-foreground">
                    No NDVI data available
                  </div>
                )}

                {current ? (
                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <ConditionIcon size={20} className="text-yellow-500" />
                      <div>
                        <p className="text-sm font-semibold">{formatTemperature(current.temperature, unitSystem)}</p>
                        <p className="text-[10px] text-muted-foreground">{current.condition}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs font-medium">{current.humidity}%</p>
                        <p className="text-[10px] text-muted-foreground">Humidity</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass rounded-xl p-3 text-center text-xs text-muted-foreground">
                    No weather data available
                  </div>
                )}

                {soil?.moisture !== null && soil?.moisture !== undefined ? (
                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Soil Moisture</span>
                      <span className="text-sm font-bold text-blue-500">
                        {Math.round(soil.moisture)}%
                      </span>
                    </div>
                    <Progress value={soil.moisture} className="h-1.5" />
                  </div>
                ) : (
                  <div className="glass rounded-xl p-3 text-center text-xs text-muted-foreground">
                    No soil moisture data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* ===================== VEGETATION TAB ===================== */}
      {!loading && activeTab === "vegetation" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {!agroMonitoringConfigured ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Satellite size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">AgroMonitoring not configured</p>
                <p className="text-sm">
                  Add AGROMONITORING_API_KEY to your environment variables to view satellite vegetation data.
                </p>
              </CardContent>
            </Card>
          ) : satellite?.ndvi === null || satellite?.ndvi === undefined ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Satellite size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">No recent satellite data</p>
                <p className="text-sm">
                  No cloud-free satellite images were found for this field in the recent period.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Satellite imagery */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Latest satellite image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Satellite size={16} className="text-green-500" />
                      Latest Satellite Imagery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {satellite.imageUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={satellite.imageUrl}
                          alt={`Satellite image of ${field.name}`}
                          className="w-full h-64 object-cover"
                        />
                        {satellite.date && (
                          <div className="absolute bottom-2 left-2 glass rounded-lg px-2 py-1 text-xs">
                            {new Date(satellite.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-xl text-sm text-muted-foreground">
                        No satellite image URL available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* NDVI / EVI values */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TreePine size={16} className="text-green-500" />
                      Vegetation Indices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* NDVI */}
                    <div className="glass rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">NDVI</span>
                        <span className={`text-lg font-bold ${getNDVIColor(satellite.ndvi)}`}>
                          {satellite.ndvi.toFixed(2)}
                        </span>
                      </div>
                      <Progress
                        value={((satellite.ndvi + 1) / 2) * 100}
                        className="h-2.5"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>Barren (-1)</span>
                        <span>Dense (1)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Activity size={14} className={getNDVIColor(satellite.ndvi)} />
                        <span className="text-sm font-medium">{getNDVILabel(satellite.ndvi)}</span>
                      </div>
                    </div>

                    {/* EVI */}
                    <div className="glass rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">EVI</span>
                        <span className={`text-lg font-bold ${getNDVIColor(satellite.evi)}`}>
                          {satellite.evi !== null ? satellite.evi.toFixed(2) : "N/A"}
                        </span>
                      </div>
                      <Progress
                        value={satellite.evi !== null ? Math.min(satellite.evi * 50, 100) : 0}
                        className="h-2.5"
                        variant="default"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Enhanced Vegetation Index
                      </p>
                    </div>

                    {/* NDMI */}
                    <div className="glass rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">NDMI</span>
                        <span className={`text-lg font-bold ${getNDVIColor(satellite.ndmi)}`}>
                          {satellite.ndmi !== null ? satellite.ndmi.toFixed(2) : "N/A"}
                        </span>
                      </div>
                      <Progress
                        value={satellite.ndmi !== null ? ((satellite.ndmi + 1) / 2) * 100 : 0}
                        className="h-2.5"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Normalized Difference Moisture Index
                      </p>
                    </div>

                    {/* Cloud coverage */}
                    <div className="glass rounded-xl p-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Cloud size={14} className="text-blue-500" />
                        Cloud Coverage
                      </span>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${getCloudColor(satellite.cloudCoverage)}`}>
                          {satellite.cloudCoverage !== null ? `${Math.round(satellite.cloudCoverage)}%` : "N/A"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {getCloudLabel(satellite.cloudCoverage)}
                        </p>
                      </div>
                    </div>

                    {satellite.date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Info size={12} />
                        Last satellite pass: {new Date(satellite.date).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ===================== SOIL TAB ===================== */}
      {!loading && activeTab === "soil" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!agroMonitoringConfigured ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Mountain size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">AgroMonitoring not configured</p>
                <p className="text-sm">
                  Add AGROMONITORING_API_KEY to your environment variables to view soil data.
                </p>
              </CardContent>
            </Card>
          ) : !soil ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Mountain size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">No soil data available</p>
                <p className="text-sm">
                  Soil moisture data was not found for this field.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mountain size={16} className="text-emerald-500" />
                    Soil Moisture Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Surface Moisture</span>
                      <span className="text-lg font-bold">
                        {soil.moisture !== null ? `${Math.round(soil.moisture)}%` : "N/A"}
                      </span>
                    </div>
                    <Progress
                      value={soil.moisture ?? 0}
                      className="h-2.5"
                      variant={
                        soil.moisture !== null && soil.moisture > 60
                          ? "success"
                          : soil.moisture !== null && soil.moisture < 20
                          ? "danger"
                          : "default"
                      }
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Dry</span>
                      <span>Optimal</span>
                      <span>Wet</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">
                      Moisture by Depth
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: "10cm", value: soil.moisture10 },
                        { label: "20cm", value: soil.moisture20 },
                        { label: "40cm", value: soil.moisture40 },
                        { label: "60cm", value: soil.moisture60 },
                        { label: "100cm", value: soil.moisture100 },
                      ].map((layer) => (
                        <div key={layer.label} className="flex items-center gap-3">
                          <span className="text-xs font-medium w-10">{layer.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getSoilMoistureColor(layer.value)}`}
                              style={{ width: `${layer.value ?? 0}%` }}
                            />
                          </div>
                          <span className="text-xs w-10 text-right text-muted-foreground">
                            {layer.value !== null ? `${Math.round(layer.value)}%` : "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Thermometer size={16} className="text-orange-500" />
                    Soil Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {soil.surfaceTemp !== null ? (
                    <div className="glass rounded-2xl p-6 text-center">
                      <Thermometer size={32} className="mx-auto mb-3 text-orange-500" />
                      <p className="text-4xl font-bold">{formatTemperature(soil.surfaceTemp, unitSystem)}</p>
                      <p className="text-sm text-muted-foreground mt-1">Surface Temperature</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Thermometer size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No soil temperature data</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      )}

      {/* ===================== WEATHER TAB ===================== */}
      {!loading && activeTab === "weather" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {!agroMonitoringConfigured ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <CloudSun size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">AgroMonitoring not configured</p>
                <p className="text-sm">
                  Add AGROMONITORING_API_KEY to your environment variables to view field weather data.
                </p>
              </CardContent>
            </Card>
          ) : !current ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <CloudSun size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">No weather data available</p>
                <p className="text-sm">Weather data was not found for this field.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <ConditionIcon size={40} className="text-white" />
                      </div>
                      <div>
                        <p className="text-5xl font-bold">{formatTemperature(current.temperature, unitSystem)}</p>
                        <p className="text-muted-foreground mt-1">{current.condition}</p>
                        <p className="text-xs text-muted-foreground">
                          Feels like {formatTemperature(current.feelsLike, unitSystem)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: "Humidity", value: `${current.humidity}%`, icon: Droplets },
                        { label: "Rain", value: `${current.rain}%`, icon: CloudRain },
                        { label: "Wind", value: `${current.wind} km/h`, icon: Wind },
                        { label: "UV Index", value: current.uvIndex > 0 ? `${current.uvIndex}` : "N/A", icon: Sun },
                      ].map((stat, i) => (
                        <div key={i} className="glass rounded-2xl p-4 text-center min-w-[90px]">
                          <stat.icon size={16} className="mx-auto mb-1 text-blue-500" />
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-lg font-bold">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {forecast.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      7-Day Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                      {forecast.map((day, i) => {
                        const DayIcon = weatherIcons[day.condition] || Cloud;
                        return (
                          <div
                            key={i}
                            className={`glass rounded-2xl p-4 text-center transition-all ${
                              i === 0 ? "ring-2 ring-primary" : ""
                            }`}
                          >
                            <p className="text-sm font-medium mb-1">
                              {i === 0 ? "Today" : day.day}
                            </p>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto my-3">
                              <DayIcon size={18} className="text-primary" />
                            </div>
                            <p className="text-xl font-bold">{formatTemperature(day.temp, unitSystem)}</p>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-1">
                              <TrendingUp size={10} className="text-red-500" />
                              <span>{formatTemperature(day.tempMax, unitSystem)}</span>
                              <TrendingDown size={10} className="text-blue-500" />
                              <span>{formatTemperature(day.tempMin, unitSystem)}</span>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-center gap-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Droplets size={10} /> {day.humidity}%
                              </span>
                              <span className="flex items-center gap-1">
                                <CloudRain size={10} /> {day.rain}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ===================== HISTORY TAB ===================== */}
      {!loading && activeTab === "history" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!agroMonitoringConfigured ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <History size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">AgroMonitoring not configured</p>
                <p className="text-sm">
                  Add AGROMONITORING_API_KEY to your environment variables to view historical satellite data.
                </p>
              </CardContent>
            </Card>
          ) : !history || history.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <History size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">No historical data</p>
                <p className="text-sm">No past satellite images were found for this field.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <History size={16} className="text-primary" />
                  Historical Satellite Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history
                    .sort((a, b) => b.dt - a.dt)
                    .slice(0, 20)
                    .map((img) => {
                      const date = new Date(img.dt * 1000);
                      const cloudColor = img.cloud_coverage < 30
                        ? "text-green-500"
                        : img.cloud_coverage < 60
                        ? "text-yellow-500"
                        : "text-red-500";
                      return (
                        <div
                          key={img.id}
                          className="glass rounded-xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Satellite size={16} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {date.toLocaleDateString()} {date.toLocaleTimeString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Image ID: {img.id}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Cloud size={12} />
                              <span className={`text-sm font-semibold ${cloudColor}`}>
                                {Math.round(img.cloud_coverage)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Cloud coverage</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* ===================== PREDICTIVE ANALYTICS TAB ===================== */}
      {!loading && activeTab === "analytics" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!agroMonitoringConfigured ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <LineChartIcon size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">AgroMonitoring not configured</p>
                <p className="text-sm">
                  Add AGROMONITORING_API_KEY to your environment variables to enable predictive analytics.
                </p>
              </CardContent>
            </Card>
          ) : (
            <NdvAnalyticsDashboard
              analytics={analytics ?? null}
              loading={analyticsLoading}
              fieldName={field.name}
            />
          )}
        </motion.div>
      )}

      {/* Not configured banner for overview */}
      {!agroMonitoringConfigured && isOverviewTab && (
        <div className="glass rounded-xl p-4 flex items-start gap-3 border-primary/20 bg-primary/5">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-primary">AgroMonitoring not connected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Set the AGROMONITORING_API_KEY environment variable to enable satellite imagery, NDVI/EVI indices,
              soil moisture, and field-specific weather data for {field.name}.
            </p>
          </div>
        </div>
      )}

      {/* Last update footer */}
      {lastUpdate && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pb-4">
          <Calendar size={12} />
          Last data update: {new Date(lastUpdate).toLocaleString()}
          {field.agroMonitoringId && (
            <>
              <span>·</span>
              <span className="font-mono">AM Polygon: {field.agroMonitoringId}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

