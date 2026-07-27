"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fields } from "@/lib/data";
import { getHealthColor, getFieldColor, getFieldBorderColor, formatNumber } from "@/lib/utils";
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Sprout,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  X,
  ChevronRight,
  Crop,
  Maximize2,
  Minus,
  Ruler,
} from "lucide-react";

const healthGradient = (health: number) => {
  if (health >= 75) return "from-green-500/20 to-green-500/5 border-green-500/30";
  if (health >= 50) return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
  return "from-red-500/20 to-red-500/5 border-red-500/30";
};

const healthTextColor = (health: number) => {
  if (health >= 75) return "text-green-500";
  if (health >= 50) return "text-yellow-500";
  return "text-red-500";
};

export default function FarmMapPage() {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const selectedFieldData = fields.find((f) => f.id === selectedField);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interactive Farm Map</h1>
          <p className="text-muted-foreground mt-1">
            Satellite view of your farm with field boundaries and health data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="glass" size="sm">
            <Plus size={16} className="mr-1" />
            Add Field
          </Button>
          <Button variant="glass" size="sm">
            Import GPS
          </Button>
        </div>
      </div>

      {/* Map & Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="relative bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 aspect-[4/3] lg:aspect-[16/9]">
              {/* Satellite background pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, rgba(22, 163, 74, 0.1) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(22, 163, 74, 0.1) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, rgba(22, 163, 74, 0.1) 75%),
                    linear-gradient(-45deg, transparent 75%, rgba(22, 163, 74, 0.1) 75%)
                  `,
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Grid lines */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Fields */}
              <div className="absolute inset-0 p-6">
                <div
                  className="relative w-full h-full"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.3s ease" }}
                >
                  {fields.map((field) => (
                    <motion.button
                      key={field.id}
                      onClick={() => setSelectedField(field.id)}
                      className={`absolute rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                        getFieldBorderColor(field.health)
                      } ${selectedField === field.id ? "ring-4 ring-primary/50 z-10" : "z-0"}`}
                      style={{
                        left: `${((field.longitude + 74.008) / 0.01) * 20}%`,
                        top: `${((40.7165 - field.latitude) / 0.005) * 20}%`,
                        width: `${field.area * 1.2}px`,
                        height: `${field.area * 0.8}px`,
                        background:
                          field.health >= 75
                            ? "rgba(34, 197, 94, 0.3)"
                            : field.health >= 50
                            ? "rgba(234, 179, 8, 0.3)"
                            : "rgba(239, 68, 68, 0.3)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <div className="p-2 text-left">
                        <p className="text-xs font-bold text-white drop-shadow-lg">{field.name}</p>
                        <p className="text-[10px] text-white/80">{field.cropType}</p>
                        <p className="text-[10px] text-white/80">{field.area} ha</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-1">
                <Button
                  variant="glass"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
                >
                  <Plus size={14} />
                </Button>
                <Button
                  variant="glass"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                >
                  <Minus size={14} />
                </Button>
                <Button
                  variant="glass"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setZoom(1)}
                >
                  <Maximize2 size={14} />
                </Button>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 glass rounded-xl p-3">
                <p className="text-xs font-medium mb-2">Field Health</p>
                <div className="space-y-1.5">
                  {[
                    { color: "bg-green-500", label: "Healthy (75%+)" },
                    { color: "bg-yellow-500", label: "Needs Attention (50-75%)" },
                    { color: "bg-red-500", label: "Critical (<50%)" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${item.color}`} />
                      <span className="text-[10px] text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Field Details Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedFieldData ? (
              <motion.div
                key={selectedFieldData.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{selectedFieldData.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedFieldData.cropType}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedField(null)}>
                      <X size={16} />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Health */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Field Health</span>
                        <span className={`text-lg font-bold ${healthTextColor(selectedFieldData.health)}`}>
                          {selectedFieldData.health}%
                        </span>
                      </div>
                      <Progress
                        value={selectedFieldData.health}
                        variant={
                          selectedFieldData.health >= 75
                            ? "success"
                            : selectedFieldData.health >= 50
                            ? "warning"
                            : "danger"
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Area", value: `${selectedFieldData.area} ha`, icon: Ruler },
                        { label: "Moisture", value: `${selectedFieldData.moisture}%`, icon: Droplets },
                        { label: "Nitrogen", value: `${selectedFieldData.nitrogen}%`, icon: Activity },
                        { label: "Growth Stage", value: selectedFieldData.growthStage, icon: Sprout },
                        { label: "Expected Yield", value: `${formatNumber(selectedFieldData.expectedYield)} kg`, icon: Crop },
                        { label: "Last Irrigation", value: selectedFieldData.lastIrrigation, icon: Droplets },
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

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="default" size="sm" className="flex-1">
                        <Edit3 size={14} className="mr-1" />
                        Edit Field
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                        <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Recommendation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">AI Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedFieldData.health < 60
                        ? `⚠️ ${selectedFieldData.name} needs attention. Consider irrigation and nitrogen application.`
                        : selectedFieldData.moisture < 50
                        ? `💧 Schedule irrigation for ${selectedFieldData.name} within 2 days.`
                        : `✅ ${selectedFieldData.name} is in good condition. Maintain current schedule.`}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-center"
              >
                <MapPin size={40} className="text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Select a field</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Click on any field on the map to view its details
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fields List */}
      <Card>
        <CardHeader>
          <CardTitle>All Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {fields.map((field) => (
              <motion.button
                key={field.id}
                onClick={() => setSelectedField(field.id)}
                className={`glass rounded-2xl p-4 text-left transition-all duration-200 hover:shadow-lg ${
                  selectedField === field.id ? "ring-2 ring-primary" : ""
                }`}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={
                      field.health >= 75
                        ? "success"
                        : field.health >= 50
                        ? "warning"
                        : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {field.health}%
                  </Badge>
                  <Sprout size={16} className="text-muted-foreground" />
                </div>
                <p className="font-semibold text-sm">{field.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{field.cropType}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Ruler size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{field.area} ha</span>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

