"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import WeatherAlerts from "@/components/weather-alerts";
import {
  fetchWeatherData,
  getWeatherIconUrl,
  getTemperatureColor,
  getWindDirection,
  WeatherData,
  mockWeatherData,
} from "@/lib/weather-service";
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  RefreshCw,
  Cloud,
  Eye,
  Gauge,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CloudSun,
  CloudSnow,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const weatherConditionIcons: Record<string, any> = {
  Sunny: Sun,
  "Partly Cloudy": CloudSun,
  Cloudy: Cloud,
  Rainy: CloudRain,
  Stormy: CloudRain,
  Snowy: CloudSnow,
  Foggy: Eye,
};

const weatherColors: Record<string, string> = {
  Sunny: "from-yellow-400 to-orange-500",
  "Partly Cloudy": "from-blue-400 to-purple-500",
  Cloudy: "from-gray-400 to-gray-600",
  Rainy: "from-blue-500 to-indigo-600",
  Stormy: "from-purple-600 to-red-600",
  Snowy: "from-blue-200 to-white",
  Foggy: "from-gray-300 to-gray-500",
};

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData>(mockWeatherData);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeather = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const { data, isLive: live } = await fetchWeatherData();
      setWeather(data);
      setIsLive(live);
    } catch (err) {
      setError("Failed to load weather data");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadWeather(); }, []);

  const current = weather.current;
  const forecast = weather.forecast;
  const advisory = weather.advisory;

  const ConditionIcon = weatherConditionIcons[current.condition] || Sun;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Weather</h1>
            <Badge
              variant={isLive ? "success" : "secondary"}
              className="text-[10px]"
            >
              {isLive ? "Live" : "Demo Data"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Real-time weather data and crop-specific advisories for your farm
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadWeather(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={14}
            className={`mr-1 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Weather Alert Banner */}
      <WeatherAlerts alert={advisory} />

      {/* Current Weather Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div
            className={`bg-gradient-to-br ${weatherColors[current.condition] || "from-blue-400 to-purple-500"} p-6 lg:p-8`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left: Main temp */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ConditionIcon size={48} className="text-white" />
                </div>
                <div>
                  <p className="text-6xl font-bold text-white">
                    {current.temperature}°
                  </p>
                  <p className="text-white/80 text-lg mt-1">{current.condition}</p>
                  <p className="text-white/60 text-sm mt-0.5">
                    Feels like {current.feelsLike}°
                  </p>
                </div>
              </div>

              {/* Right: Quick stats */}
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    label: "Humidity",
                    value: `${current.humidity}%`,
                    icon: Droplets,
                  },
                  {
                    label: "Rain",
                    value: `${current.rain}%`,
                    icon: CloudRain,
                  },
                  {
                    label: "Wind",
                    value: `${current.wind} km/h`,
                    icon: Wind,
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]"
                  >
                    <stat.icon size={18} className="mx-auto mb-1 text-white/80" />
                    <p className="text-xs text-white/60">{stat.label}</p>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "UV Index",
                  value: current.uvIndex > 0 ? `${current.uvIndex}` : "N/A",
                  icon: Sun,
                  color: "text-yellow-500",
                },
                {
                  label: "Wind Direction",
                  value: getWindDirection(12),
                  icon: Wind,
                  color: "text-blue-500",
                },
                {
                  label: "Visibility",
                  value: ">10 km",
                  icon: Eye,
                  color: "text-green-500",
                },
                {
                  label: "Pressure",
                  value: "1013 hPa",
                  icon: Gauge,
                  color: "text-purple-500",
                },
              ].map((stat, i) => (
                <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.color} bg-current/10 flex items-center justify-center`}
                  >
                    <stat.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-semibold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 7-Day Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon />
              7-Day Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {forecast.map((day, i) => {
                const DayIcon = weatherConditionIcons[day.condition] || Cloud;
                return (
                  <div
                    key={i}
                    className={`glass rounded-2xl p-4 text-center transition-all hover:shadow-md ${
                      i === 0 ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">{i === 0 ? "Today" : day.day}</p>
                    <p className="text-[10px] text-muted-foreground mb-3">{day.date}</p>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-3">
                      <DayIcon size={20} className="text-primary" />
                    </div>
                    <p className="text-xl font-bold">{day.temp}°</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-1">
                      <TrendingUp size={10} className="text-red-500" />
                      <span>{day.tempMax}°</span>
                      <TrendingDown size={10} className="text-blue-500" />
                      <span>{day.tempMin}°</span>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Droplets size={10} />
                        {day.humidity}%
                      </div>
                      <div className="flex items-center gap-1">
                        <CloudRain size={10} />
                        {day.rain}%
                      </div>
                      <div className="flex items-center gap-1 col-span-2">
                        <Wind size={10} />
                        {day.wind} km/h
                      </div>
                    </div>
                    {day.description && (
                      <p className="text-[10px] text-muted-foreground mt-2 capitalize">
                        {day.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weather Details & Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Temperature Range Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Thermometer size={16} className="text-primary" />
              7-Day Temperature Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecast.map((day, i) => {
                const minTemp = Math.min(...forecast.map((d) => d.tempMin));
                const maxTemp = Math.max(...forecast.map((d) => d.tempMax));
                const range = maxTemp - minTemp || 1;
                const minPos = ((day.tempMin - minTemp) / range) * 100;
                const maxPos = ((day.tempMax - minTemp) / range) * 100;
                const barWidth = maxPos - minPos;

                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-8 text-right">
                      {day.day}
                    </span>
                    <span className="text-[10px] text-blue-500 w-6 text-right">
                      {day.tempMin}°
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted relative overflow-hidden">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
                        style={{
                          left: `${minPos}%`,
                          width: `${Math.max(barWidth, 5)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-red-500 w-6">
                      {day.tempMax}°
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Weather Insights / Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-primary" />
              Crop Weather Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Precipitation outlook */}
            <div className="glass rounded-2xl p-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CloudRain size={14} className="text-blue-500" />
                Precipitation Outlook
              </h4>
              <div className="flex items-end gap-1 h-16">
                {forecast.slice(0, 7).map((day, i) => {
                  const height = Math.max(day.rain, 5);
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-[10px] text-muted-foreground">
                        {day.rain}%
                      </span>
                      <div
                        className="w-full rounded-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all"
                        style={{ height: `${height * 0.8}px` }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {day.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Humidity & Wind summary */}
            <div className="glass rounded-2xl p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Wind size={14} className="text-blue-500" />
                Wind & Humidity Summary
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Avg Wind</span>
                    <span className="font-medium">
                      {Math.round(
                        forecast.reduce((a, d) => a + d.wind, 0) /
                          forecast.length
                      )}{" "}
                      km/h
                    </span>
                  </div>
                  <Progress
                    value={
                      (Math.round(
                        forecast.reduce((a, d) => a + d.wind, 0) /
                          forecast.length
                      ) /
                        50) *
                      100
                    }
                    variant="default"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Avg Humidity</span>
                    <span className="font-medium">
                      {Math.round(
                        forecast.reduce((a, d) => a + d.humidity, 0) /
                          forecast.length
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      Math.round(
                        forecast.reduce((a, d) => a + d.humidity, 0) /
                          forecast.length
                      )
                    }
                    variant="default"
                  />
                </div>
              </div>
            </div>

            {/* Farm Activity Recommendation */}
            <div
              className={`rounded-2xl p-4 border ${
                advisory.type === "danger"
                  ? "bg-red-500/5 border-red-500/20"
                  : advisory.type === "warning"
                  ? "bg-yellow-500/5 border-yellow-500/20"
                  : "bg-blue-500/5 border-blue-500/20"
              }`}
            >
              <h4
                className={`text-sm font-medium mb-2 ${
                  advisory.type === "danger"
                    ? "text-red-500"
                    : advisory.type === "warning"
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
              >
                {advisory.type === "danger"
                  ? "🚨 Action Required"
                  : advisory.type === "warning"
                  ? "⚡ Recommended Action"
                  : "✅ All Clear"}
              </h4>
              <p className="text-sm text-muted-foreground">{advisory.message}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

