"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  sensorDevices,
  sensorTypeInfo,
  getLatestReading,
  getReadingsForChart,
  getSensorAlerts,
  getSensorStatusSummary,
  getAverageBattery,
  getFieldName,
  formatSensorValue,
} from "@/lib/sensor-data";
import {
  Radio,
  Search,
  AlertTriangle,
  BatteryLow,
  Battery,
  BatteryFull,
  Wifi,
  WifiOff,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  Leaf,
  Gauge,
  Sun,
  Cloud,
  MapPin,
  X,
  Cpu,
  Zap,
  Calendar,
  CheckCircle2,
  Signal,
  Plug,
  LayoutDashboard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sensor type icon mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typeIcons: Record<string, any> = {
  soil_moisture: Droplets,
  soil_temperature: Thermometer,
  soil_ec: Gauge,
  soil_ph: Leaf,
  soil_nitrogen: Leaf,
  soil_phosphorus: Leaf,
  soil_potassium: Leaf,
  air_temperature: Thermometer,
  air_humidity: Cloud,
  leaf_wetness: Droplets,
  wind_speed: Wind,
  wind_direction: Wind,
  rainfall: Cloud,
  solar_radiation: Sun,
  barometric_pressure: Gauge,
  co2: Activity,
};

const statusBadgeVariant: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  online: "success",
  offline: "destructive",
  error: "destructive",
  low_battery: "warning",
};

const fieldOptions = [
  { id: "f1", name: "North Field" },
  { id: "f2", name: "South Meadow" },
  { id: "f3", name: "East Orchard" },
  { id: "f4", name: "West Pasture" },
  { id: "f5", name: "Central Valley" },
];

export default function SensorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [chartHours, setChartHours] = useState(24);

  const statusSummary = getSensorStatusSummary();
  const alerts = useMemo(() => getSensorAlerts(), []);
  const avgBattery = getAverageBattery();

  const filteredSensors = sensorDevices.filter((sensor) => {
    const info = sensorTypeInfo[sensor.type];
    const matchesSearch =
      sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = selectedField === "All" || sensor.fieldId === selectedField;
    const matchesStatus = selectedStatus === "All" || sensor.status === selectedStatus;
    return matchesSearch && matchesField && matchesStatus;
  });

  const selectedSensorData = sensorDevices.find((s) => s.id === selectedSensor);

  // Chart data for selected sensor
  const chartData = useMemo(() => {
    if (!selectedSensorData) return [];
    return getReadingsForChart(selectedSensorData.id, chartHours).map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: r.value,
      quality: r.quality,
    }));
  }, [selectedSensorData, chartHours]);

  // Field average comparison data (soil moisture per field)
  const fieldComparisonData = useMemo(() => {
    return fieldOptions.map((field) => {
      const fieldSensors = sensorDevices.filter(
        (s) => s.fieldId === field.id && s.type === "soil_moisture"
      );
      const avg = fieldSensors.length
        ? fieldSensors.reduce((acc, s) => {
            const reading = getLatestReading(s.id);
            return acc + (reading ? reading.value : 0);
          }, 0) / fieldSensors.length
        : 0;
      return {
        name: field.name.split(" ")[0],
        moisture: Math.round(avg * 100),
      };
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sensors & Field Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time IoT readings from soil, weather, and crop sensors across your farm
          </p>
</div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
          <Link href="/dashboard/sensors/dashboard">
            <Button variant="outline">
              <LayoutDashboard size={16} className="mr-1" />
              Monitoring Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/sensors/connect">
            <Button>
              <Plug size={16} className="mr-1" />
              Connect Sensors
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sensors", value: sensorDevices.length, icon: Radio, color: "text-primary" },
          { label: "Online", value: statusSummary.online, icon: Wifi, color: "text-green-500" },
          {
            label: "Active Alerts",
            value: alerts.length,
            icon: AlertTriangle,
            color: alerts.length > 0 ? "text-destructive" : "text-green-500",
          },
          { label: "Avg Battery", value: `${avgBattery}%`, icon: Battery, color: "text-yellow-500" },
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

      {/* Status Summary */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Online", value: statusSummary.online, color: "text-green-500", bg: "bg-green-500/10" },
              { label: "Offline", value: statusSummary.offline, color: "text-red-500", bg: "bg-red-500/10" },
              { label: "Error", value: statusSummary.error, color: "text-red-500", bg: "bg-red-500/10" },
              { label: "Low Battery", value: statusSummary.low_battery, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            ].map((status, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center">
                <p className={`text-2xl font-bold ${status.color}`}>{status.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{status.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-destructive" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  alert.severity === "critical"
                    ? "bg-destructive/5 border border-destructive/20"
                    : "bg-yellow-500/5 border border-yellow-500/20"
                }`}
              >
                <AlertTriangle
                  size={16}
                  className={`mt-0.5 flex-shrink-0 ${
                    alert.severity === "critical" ? "text-destructive" : "text-yellow-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.sensorName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{alert.fieldName}</p>
                </div>
                <Badge
                  variant={alert.severity === "critical" ? "destructive" : "warning"}
                  className="text-[9px] flex-shrink-0"
                >
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sensors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="All">All Fields</option>
          {fieldOptions.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="All">All Statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="error">Error</option>
          <option value="low_battery">Low Battery</option>
        </select>
      </div>

      {/* Sensors Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSensors.map((sensor) => {
          const info = sensorTypeInfo[sensor.type];
          const TypeIcon = typeIcons[sensor.type] || Cpu;
          const latest = getLatestReading(sensor.id);
const isNormal = latest ? (latest.quality ?? 0) >= 0.85 : false;
          const battery = sensor.metadata.batteryLevel ?? 0;
          const BatteryIcon = battery >= 60 ? BatteryFull : battery >= 20 ? Battery : BatteryLow;

          return (
            <motion.div
              key={sensor.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedSensor(sensor.id)}
              className={`glass-card p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedSensor === sensor.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 ${info.color}`}>
                    <TypeIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sensor.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {getFieldName(sensor.fieldId)} · {sensor.id}
                    </p>
                  </div>
                </div>
                <Badge variant={statusBadgeVariant[sensor.status]} className="text-[9px] px-1.5">
                  {sensor.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <p className={`text-xl font-bold ${info.color}`}>
                  {latest ? formatSensorValue(latest.value, latest.unit) : "—"}
                </p>
                {latest && (
                  <span className="text-[10px] text-muted-foreground">
                    {info.shortUnit}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <BatteryIcon size={12} className={battery < 20 ? "text-destructive" : battery < 60 ? "text-yellow-500" : "text-green-500"} />
                  {battery}%
                </span>
                <span className="flex items-center gap-1">
                  {sensor.status === "online" ? (
                    <Wifi size={12} className="text-green-500" />
                  ) : (
                    <WifiOff size={12} className="text-destructive" />
                  )}
                  {sensor.metadata.signalStrength ? `${sensor.metadata.signalStrength} dBm` : "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  {isNormal ? (
                    <CheckCircle2 size={12} className="text-green-500" />
                  ) : (
                    <AlertTriangle size={12} className="text-yellow-500" />
                  )}
                  {isNormal ? "Normal" : "Check"}
                </span>
              </div>

              <Progress
                value={Math.min(
                  ((latest?.value ?? 0) /
                    (info.max !== 0 ? info.max : 1)) *
                    100,
                  100
                )}
                variant={isNormal ? "success" : "danger"}
                className="h-1"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Field Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Droplets size={16} className="text-primary" />
            Soil Moisture by Field (current)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fieldComparisonData}>
                <defs>
                  <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={12} />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="moisture"
                  stroke="#22c55e"
                  fill="url(#moistureGrad)"
                  strokeWidth={2}
                  name="Moisture"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sensor Detail Modal */}
      <AnimatePresence>
        {selectedSensorData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedSensor(null)} />
            <Card className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      {(typeIcons[selectedSensorData.type] || Cpu)({ size: 22, className: sensorTypeInfo[selectedSensorData.type].color })}
                    </div>
                    <div>
                      <CardTitle className="text-base">{selectedSensorData.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {sensorTypeInfo[selectedSensorData.type].label} · {getFieldName(selectedSensorData.fieldId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadgeVariant[selectedSensorData.status]}>
                      {selectedSensorData.status.replace("_", " ")}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedSensor(null)}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Latest reading + quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
{(() => {
                    const latest = getLatestReading(selectedSensorData.id);
                    return [
                      {
                        label: "Latest Reading",
                        value: latest ? formatSensorValue(latest.value, latest.unit) : "—",
                        icon: Activity,
                      },
                      {
                        label: "Battery",
                        value: `${selectedSensorData.metadata.batteryLevel ?? 0}%`,
                        icon: Battery,
                      },
                      {
                        label: "Signal",
                        value: selectedSensorData.metadata.signalStrength
                          ? `${selectedSensorData.metadata.signalStrength} dBm`
                          : "N/A",
                        icon: Signal,
                      },
                      {
                        label: "Status",
                        value: selectedSensorData.status.replace("_", " "),
                        icon: Zap,
                      },
                    ].map((stat, i) => (
                      <div key={i} className="glass rounded-xl p-3 text-center">
                        <stat.icon size={14} className="mx-auto mb-1 text-primary" />
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        <p className="text-xs font-semibold">{stat.value}</p>
                      </div>
                    ));
                  })()}
                </div>

                {/* 24h chart */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">24-Hour Reading Trend</h4>
                    <div className="flex gap-1">
                      {[12, 24, 48].map((hours) => (
                        <button
                          key={hours}
                          onClick={() => setChartHours(hours)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] transition-all ${
                            chartHours === hours
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {hours}h
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="sensorGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                        <XAxis dataKey="time" stroke="currentColor" opacity={0.5} fontSize={10} interval="preserveStartEnd" />
                        <YAxis stroke="currentColor" opacity={0.5} fontSize={10} width={40} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--glass-bg)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid var(--glass-border)",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#22c55e"
                          fill="url(#sensorGrad)"
                          strokeWidth={2}
                          name="Value"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <Separator />

                {/* Device details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Sensor ID", value: selectedSensorData.id, icon: Cpu },
                    { label: "Protocol", value: selectedSensorData.protocol.toUpperCase(), icon: Signal },
                    { label: "Manufacturer", value: selectedSensorData.metadata.manufacturer || "—", icon: Zap },
                    { label: "Model", value: selectedSensorData.metadata.model || "—", icon: Cpu },
                    { label: "Firmware", value: selectedSensorData.metadata.firmwareVersion || "—", icon: Activity },
                    { label: "Installed", value: selectedSensorData.createdAt.split("T")[0], icon: Calendar },
                  ].map((stat, i) => (
                    <div key={i} className="glass rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <stat.icon size={12} className="text-primary" />
                        <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className="text-sm font-semibold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {selectedSensorData.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    <span>
                      {selectedSensorData.location.lat.toFixed(4)}, {selectedSensorData.location.lng.toFixed(4)}
                      {selectedSensorData.location.elevation
                        ? ` · ${selectedSensorData.location.elevation}m elevation`
                        : ""}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (selectedSensorData.fieldId) {
                        window.location.href = `/dashboard/farm-map`;
                      }
                    }}
                  >
                    <MapPin size={14} className="mr-1" />
                    View on Map
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Zap size={14} className="mr-1" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

