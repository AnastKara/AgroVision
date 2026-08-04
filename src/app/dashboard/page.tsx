"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "recharts";
import {
  Map,
  Sprout,
  Thermometer,
  DollarSign,
  TrendingUp,
  Droplets,
  Tractor,
  Activity,
  Sun,
  Cloud,
  CloudRain,
  Wind,
} from "lucide-react";
import { tasks, transactions, notifications, weatherData as mockWeatherData, analyticsData } from "@/lib/data";
import type { Field } from "@/lib/data";
import { getFields } from "@/lib/fields-service";
import { fetchWeatherData, WeatherData } from "@/lib/weather-service";
import { formatArea, formatTemperature, useUnits } from "@/components/units-provider";
import { useCurrency } from "@/components/currency-provider";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const weatherIcons: Record<string, any> = {
  Sunny: Sun,
  "Partly Cloudy": Cloud,
  Rainy: CloudRain,
  Stormy: CloudRain,
  Cloudy: Cloud,
};

const taskTypeIcons: Record<string, any> = {
  Irrigation: Droplets,
  Harvesting: Sprout,
  Fertilizing: Sprout,
  "Livestock Care": Activity,
  Monitoring: Activity,
  Maintenance: Tractor,
  Planting: Sprout,
  Spraying: Droplets,
};

export default function DashboardPage() {
  const { unitSystem } = useUnits();
  const { formatCurrency } = useCurrency();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [fields, setFields] = useState<Field[]>([]);

  const loadWeatherData = useCallback(async () => {
    try {
      setWeatherLoading(true);
      const { data } = await fetchWeatherData();
      setWeatherData(data);
    } catch {
      // Fallback to mock data silently
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const loadFields = useCallback(async () => {
    try {
      const data = await getFields();
      setFields(data);
    } catch {
      setFields([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWeatherData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFields();
  }, [loadWeatherData, loadFields]);

  // Use live data if available, otherwise fall back to mock
  const displayWeather = weatherData || {
    current: mockWeatherData.current,
    forecast: mockWeatherData.forecast,
    advisory: mockWeatherData.forecast[0]?.condition ? { type: "info" as const, message: "" } : { type: "info" as const, message: "" },
    location: { lat: 0, lon: 0, timezone: "" },
  };

  const totalFields = fields.length;
  const totalArea = fields.reduce((acc, f) => acc + f.area, 0);
  const avgHealth = fields.length
    ? Math.round(fields.reduce((acc, f) => acc + f.health, 0) / fields.length)
    : 0;
  const totalRevenue = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const recentTransactions = transactions.slice(0, 5);
  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const recentNotifications = notifications.slice(0, 4);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, Alex. Here's your farm overview.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Fields", value: totalFields, icon: Map, change: "+2 this month", color: "from-emerald-400 to-green-500" },
          { label: "Total Area", value: formatArea(totalArea, unitSystem), icon: Map, change: `Across ${totalFields} fields`, color: "from-blue-400 to-indigo-500" },
          { label: "Farm Health", value: `${avgHealth}%`, icon: Activity, change: `${avgHealth > 70 ? '+5%' : '-3%'} vs last month`, color: avgHealth > 70 ? "from-green-400 to-emerald-500" : "from-yellow-400 to-orange-500" },
          { label: "Est. Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, change: "+15% vs forecast", color: "from-purple-400 to-pink-500" },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} p-2 flex items-center justify-center`}>
                  <stat.icon size={16} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={fadeInUp} className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.revenue}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="month" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--glass-bg)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "12px",
                      boxShadow: "var(--glass-shadow)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Crop Health Chart */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle>Crop Health Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.cropHealth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="month" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--glass-bg)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "12px",
                      boxShadow: "var(--glass-shadow)",
                    }}
                  />
                  <Bar dataKey="wheat" name="Wheat" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="corn" name="Corn" fill="#eab308" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="soybeans" name="Soybeans" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Grid */}
      <motion.div variants={fadeInUp} className="grid lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer size={18} className="text-primary" />
              Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-3 flex items-center justify-center">
                <Sun size={32} className="text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{formatTemperature(displayWeather.current.temperature, unitSystem)}</p>
                <p className="text-sm text-muted-foreground">{displayWeather.current.condition}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3 text-center">
                <Droplets size={16} className="mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="font-semibold">{displayWeather.current.humidity}%</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <CloudRain size={16} className="mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">Rain</p>
                <p className="font-semibold">{displayWeather.current.rain}%</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <Wind size={16} className="mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">Wind</p>
                <p className="font-semibold">{displayWeather.current.wind} km/h</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <Thermometer size={16} className="mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">Feels Like</p>
                <p className="font-semibold">{formatTemperature(displayWeather.current.temperature - 2, unitSystem)}</p>
              </div>
            </div>
            {/* Forecast */}
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">7-Day Forecast</p>
              <div className="flex justify-between">
                {displayWeather.forecast.slice(0, 5).map((day, i) => {
                  const Icon = weatherIcons[day.condition] || Cloud;
                  return (
                    <div key={i} className="text-center">
                      <p className="text-xs text-muted-foreground">{day.day}</p>
                      <Icon size={16} className="mx-auto my-1 text-yellow-500" />
                      <p className="text-xs font-medium">{formatTemperature(day.temp, unitSystem)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} className="text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        t.type === "income"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.type === "income" ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingUp size={16} className="rotate-180" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{t.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        t.type === "income" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </p>
                    <Badge
                      variant={
                        t.status === "completed"
                          ? "success"
                          : t.status === "pending"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-[10px] px-1.5 py-0"
                    >
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingTasks.slice(0, 5).map((task) => {
                const TypeIcon = taskTypeIcons[task.type] || Activity;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TypeIcon size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.field || task.assignedTo}</p>
                    </div>
                    <Badge
                      variant={
                        task.priority === "critical"
                          ? "destructive"
                          : task.priority === "high"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px] px-1.5 py-0"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Machinery Status */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tractor size={18} className="text-primary" />
              Machinery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active", value: 2, color: "text-green-500", bg: "bg-green-500/10" },
                { label: "Idle", value: 1, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                { label: "Maintenance", value: 1, color: "text-orange-500", bg: "bg-orange-500/10" },
                { label: "Offline", value: 1, color: "text-red-500", bg: "bg-red-500/10" },
              ].map((status, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl p-4 text-center"
                >
                  <p className={`text-2xl font-bold ${status.color}`}>{status.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{status.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    !n.read ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      !n.read ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

