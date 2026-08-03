"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import type { AnalyticsResult } from "@/lib/ndvi-analytics";
import {
  classifyNdvi,
  getNdvColor,
  getNdvChartColor,
  formatTrend,
} from "@/lib/ndvi-analytics";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sprout,
  Satellite,
  Activity,
  Calendar,
  Droplets,
  Target,
  AlertTriangle,
  Info,
  Loader2,
  Image as ImageIcon,
  LineChart as LineChartIcon,
} from "lucide-react";

interface NdvAnalyticsDashboardProps {
  analytics: AnalyticsResult | null;
  loading?: boolean;
  fieldName?: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function TrendBadge({ direction }: { direction: string }) {
  if (direction === "improving") {
    return (
      <Badge variant="success" className="gap-1">
        <TrendingUp size={12} /> Improving
      </Badge>
    );
  }
  if (direction === "declining") {
    return (
      <Badge variant="destructive" className="gap-1">
        <TrendingDown size={12} /> Declining
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Minus size={12} /> Stable
    </Badge>
  );
}

function TrendArrow({ direction }: { direction: string }) {
  if (direction === "improving") return <TrendingUp size={14} className="text-green-500" />;
  if (direction === "declining") return <TrendingDown size={14} className="text-red-500" />;
  return <Minus size={14} className="text-muted-foreground" />;
}

export default function NdvAnalyticsDashboard({
  analytics,
  loading,
  fieldName,
}: NdvAnalyticsDashboardProps) {
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Computing satellite analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Satellite size={32} className="mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No satellite analytics available{fieldName ? ` for ${fieldName}` : ""}.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Ensure the field has an AgroMonitoring polygon ID and the API key is configured.
        </p>
      </div>
    );
  }

  const { timeline, latest, ndviPrediction, eviPrediction, ndmiPrediction, yieldPrediction, healthScore, healthTrend, insights, computedAt } = analytics;

  // Prepare chart data: combine timeline + forecast
  const chartData: { date: string; ndvi: number | null; evi: number | null; ndmi: number | null; forecast?: boolean }[] =
    timeline.map((p) => ({
      date: new Date(p.date).toLocaleDateString(),
      ndvi: p.ndvi,
      evi: p.evi,
      ndmi: p.ndmi,
    }));

  // Append forecast for NDVI
  if (ndviPrediction) {
    ndviPrediction.forecast.forEach((f) => {
      chartData.push({
        date: new Date(f.date + "T00:00:00").toLocaleDateString(),
        ndvi: f.value,
        forecast: true,
      });
    });
  }

  const latestNdvi = latest?.ndvi ?? null;
  const ndviColor = getNdvColor(latestNdvi);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Satellite size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Satellite Vegetation Analytics</h3>
            <p className="text-xs text-muted-foreground">
              {fieldName ? `${fieldName} · ` : ""}NDVI timeline & predictive model
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendBadge direction={healthTrend} />
          <span className="text-xs text-muted-foreground">
            Updated {new Date(computedAt).toLocaleTimeString()}
          </span>
        </div>
      </motion.div>

      {/* Key metric cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest NDVI */}
        <motion.div variants={fadeInUp}>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sprout size={12} /> Latest NDVI
                </span>
                <TrendArrow direction={ndviPrediction?.direction ?? "stable"} />
              </div>
              <p className={`text-3xl font-bold ${ndviColor}`}>
                {latestNdvi !== null ? latestNdvi.toFixed(2) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {latestNdvi !== null ? classifyNdvi(latestNdvi) : "No data"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Health score */}
        <motion.div variants={fadeInUp}>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity size={12} /> Health Score
                </span>
              </div>
              <p className="text-3xl font-bold">
                {healthScore !== null ? `${healthScore}/100` : "—"}
              </p>
              <Progress value={healthScore ?? 0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {healthScore !== null
                  ? healthScore >= 75 ? "Good" : healthScore >= 50 ? "Fair" : "At Risk"
                  : "No data"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Yield prediction */}
        <motion.div variants={fadeInUp}>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target size={12} /> Predicted Yield
                </span>
              </div>
              <p className="text-3xl font-bold">
                {yieldPrediction ? `${(yieldPrediction.predictedYield / 1000).toFixed(1)}t` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {yieldPrediction
                  ? `${(yieldPrediction.range[0] / 1000).toFixed(1)}t – ${(yieldPrediction.range[1] / 1000).toFixed(1)}t`
                  : "No data"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Observations */}
        <motion.div variants={fadeInUp}>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} /> Observations
                </span>
              </div>
              <p className="text-3xl font-bold">{timeline.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cloud-free images analyzed
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* NDVI Timeline Chart */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon size={16} className="text-primary" />
              NDVI / EVI / NDMI Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Satellite size={24} className="mx-auto mb-2 opacity-40" />
                No satellite data points available. Check back after the next satellite pass.
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="eviGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ndmiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="date" stroke="currentColor" opacity={0.5} fontSize={10} />
                    <YAxis domain={[-0.2, 1]} stroke="currentColor" opacity={0.5} fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="ndvi" name="NDVI" stroke="#22c55e" fill="url(#ndviGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="evi" name="EVI" stroke="#3b82f6" fill="url(#eviGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="ndmi" name="NDMI" stroke="#a855f7" fill="url(#ndmiGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Predictions Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* NDVI Forecast */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                NDVI Forecast (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ndviPrediction ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-2xl font-bold">{ndviPrediction.current.toFixed(2)}</p>
                    </div>
                    <TrendArrow direction={ndviPrediction.direction} />
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Forecast</p>
                      <p className="text-2xl font-bold text-primary">{ndviPrediction.predicted.toFixed(2)}</p>
                    </div>
                  </div>
                  {ndviPrediction.forecast.length > 0 && (
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ndviPrediction.forecast}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                          <XAxis dataKey="date" stroke="currentColor" opacity={0.5} fontSize={8} />
                          <YAxis domain={[0, 1]} stroke="currentColor" opacity={0.5} fontSize={8} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" name="NDVI" stroke="#22c55e" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>R² = {ndviPrediction.rSquared.toFixed(2)}</span>
                    <span>{ndviPrediction.dataPoints} data points</span>
                    <span>Slope: {ndviPrediction.slope.toFixed(4)}/day</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Not enough data for forecasting.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Yield Prediction */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target size={14} className="text-primary" />
                Yield Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              {yieldPrediction ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Predicted</p>
                      <p className="text-2xl font-bold">
                        {(yieldPrediction.predictedYield / 1000).toFixed(1)} t
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold text-primary">
                        {(yieldPrediction.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={yieldPrediction.confidence * 100} />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="glass rounded-lg p-2">
                      <p className="text-muted-foreground">Crop</p>
                      <p className="font-medium">{yieldPrediction.factors.cropType}</p>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <p className="text-muted-foreground">Area</p>
                      <p className="font-medium">{yieldPrediction.factors.areaHa.toFixed(1)} ha</p>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <p className="text-muted-foreground">Health Factor</p>
                      <p className="font-medium">{yieldPrediction.factors.currentHealth}%</p>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <p className="text-muted-foreground">Range</p>
                      <p className="font-medium">
                        {(yieldPrediction.range[0] / 1000).toFixed(1)}–{(yieldPrediction.range[1] / 1000).toFixed(1)}t
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Yield prediction requires NDVI data.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info size={14} className="text-primary" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <ul className="space-y-2">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No insights available.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Observation gallery */}
      {timeline.length > 0 && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon size={14} className="text-primary" />
                Satellite Image Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...timeline].reverse().slice(0, 6).map((point) => (
                  <button
                    key={point.imageId}
                    onClick={() => setActiveIndex(activeIndex === point.imageId ? null : point.imageId)}
                    className="glass rounded-xl overflow-hidden text-left hover:shadow-lg transition-all"
                  >
                    <div className="h-24 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      {point.ndviUrl ? (
                        <img
                          src={point.ndviUrl}
                          alt={`NDVI ${point.date}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Satellite size={24} className="text-primary/30" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">
                          {new Date(point.date).toLocaleDateString()}
                        </p>
                        <Badge variant="secondary" className="text-[10px]">
                          {point.cloudCoverage}% cloud
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className={`font-semibold ${getNdvColor(point.ndvi)}`}>
                          NDVI {point.ndvi !== null ? point.ndvi.toFixed(2) : "—"}
                        </span>
                        {point.evi !== null && (
                          <span className="text-muted-foreground">EVI {point.evi.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
