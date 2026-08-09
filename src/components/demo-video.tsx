"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Map,
  CloudSun,
  Cpu,
  Bot,
  BarChart3,
Sprout,
  Droplets,
  Wind,
  Thermometer,
  MapPin,
  Sun,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Wifi,
  Gauge,
  Leaf,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock "screenshots" of the actual AgroVision pages                 */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  change,
  color,
}: {
  label: string;
  value: string;
  change: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
      <p className="text-[10px] text-white/60 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-emerald-300">{change}</p>
      <div className={`h-1.5 rounded-full mt-2 opacity-70 ${color}`} />
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="w-full text-left space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Fields" value="5" change="+2 this month" color="bg-gradient-to-r from-emerald-400 to-green-500" />
        <StatCard label="Total Area" value="195 ha" change="Across 5 fields" color="bg-gradient-to-r from-blue-400 to-indigo-500" />
        <StatCard label="Farm Health" value="76%" change="+8% vs last month" color="bg-gradient-to-r from-green-400 to-emerald-500" />
        <StatCard label="Est. Revenue" value="$124K" change="+15% vs forecast" color="bg-gradient-to-r from-purple-400 to-pink-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
          <p className="text-[10px] text-white/60 mb-2">Revenue vs Expenses</p>
          <div className="flex items-end gap-1 h-16">
            {[40, 55, 45, 70, 60, 85, 75, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                <div className="w-full rounded bg-red-400/70" style={{ height: `${h * 0.4}px` }} />
                <div className="w-full rounded bg-emerald-400/80" style={{ height: `${h * 0.7}px` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2 text-[9px] text-white/60">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Income</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Expenses</span>
          </div>
        </div>
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
          <p className="text-[10px] text-white/60 mb-2">Crop Health Overview</p>
          <div className="space-y-2">
            {[["Wheat", 85], ["Corn", 78], ["Soybeans", 70], ["Apples", 64]].map(([crop, val], i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] w-14 text-white/70">{crop}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i === 0 ? "bg-emerald-400" : i === 1 ? "bg-lime-400" : i === 2 ? "bg-yellow-400" : "bg-orange-400"}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/70 w-7 text-right">{val}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
          <p className="text-[10px] text-white/60 mb-2">Weather</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Sun size={16} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">22°C</p>
              <p className="text-[9px] text-white/60">Partly Cloudy</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
          <p className="text-[10px] text-white/60 mb-2">Active Tasks</p>
          <p className="text-lg font-bold text-white">6</p>
          <p className="text-[9px] text-white/60">2 critical priority</p>
        </div>
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
          <p className="text-[10px] text-white/60 mb-2">Machinery</p>
          <p className="text-lg font-bold text-white">2/5</p>
          <p className="text-[9px] text-white/60">active now</p>
        </div>
      </div>
    </div>
  );
}

function MockFarmMap() {
  return (
    <div className="w-full text-left flex gap-3">
      {/* Map */}
      <div className="flex-1 rounded-xl bg-emerald-950/60 border border-white/10 overflow-hidden relative h-56">
        {/* grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* field polygons */}
        <div className="absolute left-6 top-6 w-24 h-20 rounded-md bg-emerald-500/30 border-2 border-emerald-400 rotate-6" />
        <div className="absolute right-8 top-10 w-28 h-24 rounded-md bg-lime-500/30 border-2 border-lime-400 -rotate-3" />
        <div className="absolute left-16 bottom-4 w-32 h-20 rounded-md bg-amber-500/30 border-2 border-amber-400 rotate-3" />
        {/* pins */}
        <div className="absolute left-6 top-6 -translate-x-1/2 -translate-y-1/2">
          <MapPin size={18} className="text-emerald-300" />
        </div>
        <div className="absolute right-8 top-10 translate-x-1/2 -translate-y-1/2">
          <MapPin size={18} className="text-lime-300" />
        </div>
        <div className="absolute left-16 bottom-4 translate-x-1/2 translate-y-1/2">
          <MapPin size={18} className="text-amber-300" />
        </div>
        <div className="absolute bottom-2 left-2 text-[9px] text-white/50 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Sentinel-2 Live
        </div>
      </div>
      {/* Details panel */}
      <div className="w-40 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3 space-y-2">
        <p className="text-[10px] font-semibold text-white">North Field</p>
        <p className="text-[9px] text-white/60">Wheat · 32 ha</p>
        <div>
          <div className="flex justify-between text-[9px] text-white/60 mb-1">
            <span>Health</span>
            <span className="text-emerald-300 font-semibold">85%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[85%] rounded-full bg-emerald-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <div className="rounded-lg bg-white/5 p-1.5">
            <p className="text-[8px] text-white/50">Moisture</p>
            <p className="text-[10px] font-semibold text-white">62%</p>
          </div>
          <div className="rounded-lg bg-white/5 p-1.5">
            <p className="text-[8px] text-white/50">Yield est.</p>
            <p className="text-[10px] font-semibold text-white">4.2 t</p>
          </div>
        </div>
        <div className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 p-2">
          <p className="text-[8px] text-emerald-200">✅ In good condition.</p>
        </div>
      </div>
    </div>
  );
}

function MockWeather() {
  return (
    <div className="w-full text-left space-y-3">
      <div className="rounded-xl bg-gradient-to-br from-blue-500/40 to-indigo-600/40 border border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Sun size={26} className="text-yellow-300" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white">22°C</p>
            <p className="text-xs text-white/70">Partly Cloudy · Feels like 21°</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Humidity", value: "65%", icon: Droplets },
            { label: "Rain", value: "30%", icon: Droplets },
            { label: "Wind", value: "12 km/h", icon: Wind },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-lg px-2 py-1.5">
              <s.icon size={12} className="mx-auto text-blue-200 mb-0.5" />
              <p className="text-[9px] text-white/60">{s.label}</p>
              <p className="text-[10px] font-semibold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/10 border border-white/10 p-3">
          <p className="text-[10px] text-white/60 mb-2 flex items-center gap-1"><Sprout size={10} className="text-emerald-300" />Soil Moisture</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/70">Surface</span>
            <span className="text-sm font-bold text-white">58%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[58%] bg-gradient-to-r from-blue-400 to-emerald-400" />
          </div>
          <div className="flex justify-between text-[8px] text-white/40 mt-1">
            <span>Dry</span><span>Optimal</span><span>Wet</span>
          </div>
        </div>
        <div className="rounded-xl bg-white/10 border border-white/10 p-3">
          <p className="text-[10px] text-white/60 mb-2 flex items-center gap-1"><Leaf size={10} className="text-green-300" />NDVI Satellite</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/70">Vegetation</span>
            <span className="text-sm font-bold text-green-300">0.72</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-yellow-400 via-green-400 to-emerald-300" />
          </div>
          <p className="text-[9px] text-white/50 mt-1">Dense vegetation health</p>
        </div>
      </div>
    </div>
  );
}

function MockSensors() {
  return (
    <div className="w-full text-left space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Online", value: "12", color: "text-emerald-300", bg: "bg-emerald-500/20", icon: Wifi },
          { label: "Alerting", value: "2", color: "text-amber-300", bg: "bg-amber-500/20", icon: AlertTriangle },
          { label: "Offline", value: "1", color: "text-red-300", bg: "bg-red-500/20", icon: Thermometer },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl ${s.bg} border border-white/10 p-3 text-center`}>
            <s.icon size={16} className={`mx-auto mb-1 ${s.color}`} />
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-white/60">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white/10 border border-white/10 p-3">
        <p className="text-[10px] text-white/60 mb-2 flex items-center gap-1"><Gauge size={10} className="text-blue-300" />Live Sensor Readings</p>
        <div className="space-y-2">
          {[
            { name: "Soil Probe A", value: "58% moisture", pct: 58, color: "from-blue-400 to-emerald-400" },
            { name: "Weather Station", value: "22°C · 12 km/h", pct: 44, color: "from-yellow-400 to-orange-400" },
            { name: "Irrigation Valve", value: "Open · 82% flow", pct: 82, color: "from-cyan-400 to-blue-400" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] w-24 text-white/70">{s.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${s.color}`} style={{ width: `${s.pct}%` }} />
              </div>
              <span className="text-[9px] text-white/60 w-24 text-right">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockAI() {
  return (
    <div className="w-full text-left space-y-3">
      <div className="rounded-xl border border-white/10 bg-white/10 p-3 flex items-start gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Bot size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] text-white/70">AgroVision AI</p>
          <p className="text-[11px] text-white mt-0.5">
            Based on your soil moisture and 7-day forecast, I recommend irrigating North Field tomorrow morning. Rain is expected in 3 days, so a light pass will suffice. Estimated water savings: 30%.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Droplets, title: "Irrigation", desc: "North Field · tomorrow", color: "text-blue-300" },
          { icon: Leaf, title: "Fertilizer", desc: "Nitrogen due in 5 days", color: "text-emerald-300" },
          { icon: AlertTriangle, title: "Pest Alert", desc: "Scout East Field", color: "text-amber-300" },
          { icon: TrendingUp, title: "Yield Forecast", desc: "+8% vs last season", color: "text-purple-300" },
        ].map((c, i) => (
          <div key={i} className="rounded-xl bg-white/10 border border-white/10 p-3">
            <c.icon size={16} className={`mb-1 ${c.color}`} />
            <p className="text-[10px] font-semibold text-white">{c.title}</p>
            <p className="text-[9px] text-white/60">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockAnalytics() {
  return (
    <div className="w-full text-left space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Revenue", value: "$124,500", delta: "+15%", icon: DollarSign },
          { label: "Expenses", value: "$86,200", delta: "-8%", icon: TrendingUp },
          { label: "Net Profit", value: "$38,300", delta: "+22%", icon: BarChart3 },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-white/10 border border-white/10 p-3">
            <s.icon size={14} className="mb-1 text-white/70" />
            <p className="text-[9px] text-white/60">{s.label}</p>
            <p className="text-sm font-bold text-white">{s.value}</p>
            <p className={`text-[9px] ${s.delta.startsWith("+") ? "text-emerald-300" : "text-red-300"}`}>{s.delta}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white/10 border border-white/10 p-3">
        <p className="text-[10px] text-white/60 mb-2">Income vs Expenses (Yearly)</p>
        <div className="flex items-end gap-1.5 h-20">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end items-center">
              <div className="w-full rounded bg-emerald-400/80" style={{ height: `${(35 + ((i * 13) % 50))}px` }} />
              <div className="w-full rounded bg-red-400/60 mt-0.5" style={{ height: `${(20 + ((i * 9) % 30))}px` }} />
              {i % 2 === 0 && <span className="text-[7px] text-white/40 mt-0.5">{m}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene definitions                                                  */
/* ------------------------------------------------------------------ */

const scenes = [
  {
    id: "dashboard",
    title: "Farm Dashboard",
    subtitle: "Your entire operation at a glance",
    color: "from-emerald-500 via-green-600 to-emerald-800",
    icon: LayoutDashboard,
    render: () => <MockDashboard />,
  },
  {
    id: "map",
    title: "Interactive Farm Map",
    subtitle: "Satellite view with field boundaries",
    color: "from-blue-600 via-indigo-700 to-slate-900",
    icon: Map,
    render: () => <MockFarmMap />,
  },
  {
    id: "weather",
    title: "Weather & Crop Monitor",
    subtitle: "Live forecasts, soil & satellite data",
    color: "from-cyan-500 via-blue-600 to-indigo-900",
    icon: CloudSun,
    render: () => <MockWeather />,
  },
  {
    id: "sensors",
    title: "IoT Sensors",
    subtitle: "Stream real-time field data",
    color: "from-amber-500 via-orange-600 to-red-900",
    icon: Cpu,
    render: () => <MockSensors />,
  },
  {
    id: "ai",
    title: "AI Assistant",
    subtitle: "Intelligent, actionable recommendations",
    color: "from-purple-500 via-fuchsia-600 to-slate-900",
    icon: Bot,
    render: () => <MockAI />,
  },
  {
    id: "analytics",
    title: "Advanced Analytics",
    subtitle: "Track income, expenses & yield",
    color: "from-rose-500 via-pink-600 to-slate-900",
    icon: BarChart3,
    render: () => <MockAnalytics />,
  },
];

const SCENE_DURATION = 7000; // ms per scene

/* ------------------------------------------------------------------ */
/*  DemoVideo component                                                */
/* ------------------------------------------------------------------ */

export default function DemoVideo({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  // Scene advance timer
  useEffect(() => {
    if (!open || !playing) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % scenes.length);
      setProgress(0);
    }, SCENE_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, playing, current]);

  // Progress bar animation
  useEffect(() => {
    if (!open || !playing) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(Math.min((elapsed / SCENE_DURATION) * 100, 100));
      if (elapsed < SCENE_DURATION) {
        progressRef.current = requestAnimationFrame(tick);
      }
    };
    progressRef.current = requestAnimationFrame(tick);
    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [open, playing, current]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const scene = scenes[current];
  const SceneIcon = scene.icon;

  const goTo = (index: number) => {
    setCurrent(((index % scenes.length) + scenes.length) % scenes.length);
    setProgress(0);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full glass text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Close demo"
          >
            <X size={22} />
          </button>

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scene background with Ken Burns animation */}
            <motion.div
              key={scene.id}
              className={`absolute inset-0 bg-gradient-to-br ${scene.color}`}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1, x: [0, -12], y: [0, 8] }}
              transition={{ duration: SCENE_DURATION / 1000, ease: "linear" }}
            />

            {/* Animated decorative grid */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                backgroundSize: "52px 52px",
              }}
            />

            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-black/20 blur-3xl" />

            {/* Top-left badge */}
            <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sprout size={16} className="text-white" />
              </div>
              <span className="text-sm font-bold text-white">AgroVision</span>
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80">Demo</span>
            </div>

            {/* Scene content - phone/browser mockup */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 lg:px-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-3xl"
                >
                  {/* Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                      <SceneIcon size={22} className="lg:w-26 lg:h-26 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl lg:text-3xl font-bold text-white drop-shadow-lg">
                        {scene.title}
                      </h3>
                      <p className="text-xs lg:text-sm text-white/80">{scene.subtitle}</p>
                    </div>
                  </div>

                  {/* Browser-chrome mock "screenshot" */}
                  <div className="rounded-2xl bg-slate-900/80 border border-white/15 shadow-2xl overflow-hidden">
                    <div className="px-3 py-2 bg-slate-800/80 border-b border-white/10 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex-1 mx-2 px-3 py-0.5 rounded-md bg-slate-900/60 text-center text-[9px] text-white/50">
                        dashboard.agrovizion.com
                      </div>
                    </div>
                    <div className="p-3 lg:p-4">
                      <scene.render />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 inset-x-0 z-10 p-4 lg:p-5 bg-gradient-to-t from-black/80 to-transparent">
              {/* Progress bar */}
              <div className="flex gap-1.5 mb-3">
                {scenes.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden cursor-pointer"
                    onClick={() => goTo(i)}
                  >
                    <motion.div
                      className="h-full bg-white rounded-full"
                      animate={{
                        width: i < current ? "100%" : i === current ? `${progress}%` : "0%",
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goTo(current - 1)}
                    className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                    aria-label="Previous scene"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setPlaying((p) => !p)}
                    className="w-11 h-11 rounded-full bg-white text-slate-900 hover:bg-white/90 flex items-center justify-center transition-colors"
                    aria-label={playing ? "Pause" : "Play"}
                  >
                    {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>
                  <button
                    onClick={() => goTo(current + 1)}
                    className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                    aria-label="Next scene"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-sm text-white/80">
                  <span className="font-semibold">{scene.title}</span>
                  <span className="text-white/50">
                    {current + 1} / {scenes.length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
