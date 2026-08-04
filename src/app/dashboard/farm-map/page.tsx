"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getFields } from "@/lib/fields-service";
import type { Field } from "@/lib/data";
import { getHealthColor } from "@/lib/utils";
import { formatArea, formatWeight, useUnits } from "@/components/units-provider";
import {
  MapPin,
  Plus,
  Edit3,
  Sprout,
  Droplets,
  Activity,
  X,
  ChevronRight,
  Crop,
  Ruler,
  Upload,
  Loader2,
} from "lucide-react";

const FarmMap = dynamic(() => import("@/components/farm-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] lg:h-[500px] bg-muted/20 rounded-xl animate-pulse">
      <div className="text-center">
        <MapPin size={32} className="mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Loading satellite map...</p>
      </div>
    </div>
  ),
});

const healthTextColor = (health: number) => {
  if (health >= 75) return "text-green-500";
  if (health >= 50) return "text-yellow-500";
  return "text-red-500";
};

export default function FarmMapPage() {
  const { unitSystem } = useUnits();
  const router = useRouter();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    loadFields();
  }, [loadFields]);

  // Refresh fields when returning from the create page
  useEffect(() => {
    const refresh = () => loadFields();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [loadFields]);

  const handleImportGps = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      const coords = lines.map((line) => {
        const parts = line.trim().split(/[,\s]+/);
        return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
      }).filter((c) => !isNaN(c.lat) && !isNaN(c.lng));
      if (coords.length >= 3) {
        router.push(`/dashboard/fields/create?bounds=${encodeURIComponent(JSON.stringify(coords))}`);
      } else {
        alert("GPS file must contain at least 3 valid coordinate pairs (lat, lng).");
      }
    } catch {
      alert("Failed to parse GPS file. Ensure it contains lat/lng coordinates (one pair per line).");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }, [router]);

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
            Real-time Sentinel-2 satellite view of your farm with field boundaries and health data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/fields/create">
            <Button variant="glass" size="sm">
              <Plus size={16} className="mr-1" />
              Add Field
            </Button>
          </Link>
<input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.csv,.gpx,.gps"
            className="hidden"
          />
          <Button
            variant="glass"
            size="sm"
            onClick={handleImportGps}
            disabled={importing}
          >
            {importing ? (
              <Loader2 size={16} className="mr-1 animate-spin" />
            ) : (
              <Upload size={16} className="mr-1" />
            )}
            Import GPS
          </Button>
        </div>
      </div>

      {/* Map & Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <FarmMap
            fields={fields}
            selectedFieldId={selectedField}
            onFieldSelect={setSelectedField}
          />
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
                        { label: "Area", value: formatArea(selectedFieldData.area, unitSystem), icon: Ruler },
                        { label: "Moisture", value: `${selectedFieldData.moisture}%`, icon: Droplets },
                        { label: "Nitrogen", value: `${selectedFieldData.nitrogen}%`, icon: Activity },
                        { label: "Growth Stage", value: selectedFieldData.growthStage, icon: Sprout },
                        { label: "Expected Yield", value: formatWeight(selectedFieldData.expectedYield, unitSystem), icon: Crop },
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
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/fields/${selectedFieldData.id}`)}
                      >
                        <Edit3 size={14} className="mr-1" />
                        Edit Field
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/fields/${selectedFieldData.id}`)}
                      >
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
                  <span className="text-xs text-muted-foreground">{formatArea(field.area, unitSystem)}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

