"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createField, calculateArea } from "@/lib/fields-service";
import { createPolygon } from "@/lib/agromonitoring-service";
import {
  ArrowLeft,
  Save,
  MapPin,
  Ruler,
  Sprout,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const FieldPolygonDrawer = dynamic(
  () => import("@/components/field-polygon-drawer"),
  { ssr: false }
);

const CROP_TYPES = [
  "Wheat",
  "Corn",
  "Soybeans",
  "Rice",
  "Apples",
  "Cotton",
  "Barley",
  "Oats",
  "Potatoes",
  "Tomatoes",
  "Grapes",
  "Alfalfa",
  "Sunflowers",
  "Canola",
  "Sugarcane",
];

export default function CreateFieldPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cropType, setCropType] = useState("");
  const [boundaries, setBoundaries] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const area = boundaries.length >= 3 ? calculateArea(boundaries) : 0;
  const canSave =
    name.trim().length > 0 && cropType.length > 0 && boundaries.length >= 3;

  const handleBoundariesChange = useCallback(
    (nb: { lat: number; lng: number }[]) => {
      setBoundaries(nb);
    },
    []
  );

const handleSave = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const clat =
        boundaries.reduce((s, b) => s + b.lat, 0) / boundaries.length;
      const clng =
        boundaries.reduce((s, b) => s + b.lng, 0) / boundaries.length;

      let agroMonitoringId: string | undefined;
      try {
        const p = await createPolygon(name, boundaries);
        agroMonitoringId = p.id;
      } catch (e) {
        console.warn("AgroMonitoring polygon creation failed:", e);
      }

      const field = await createField({
        name: name.trim(),
        cropType,
        boundaries,
        latitude: clat,
        longitude: clng,
        agroMonitoringId,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/fields/" + field.id);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create field"
      );
    } finally {
      setSaving(false);
    }
  }, [canSave, name, cropType, boundaries, router]);

  // Warn about unsaved changes when navigating away
  const hasUnsavedChanges = (name.trim().length > 0 || cropType.length > 0 || boundaries.length > 0) && !success;
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Field</h1>
            <p className="text-muted-foreground mt-1">
              Draw field boundaries on the map
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">1. Draw</Badge>
          <Badge variant="secondary">2. Details</Badge>
        </div>
      </div>

      {success ? (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-12 text-center">
            <CheckCircle2
              size={64}
              className="mx-auto mb-4 text-green-500"
            />
            <h2 className="text-2xl font-bold mb-2">
              Field Created Successfully!
            </h2>
            <p className="text-muted-foreground mb-4">
              {name} created with {area} ha.
            </p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              <div className="relative">
                <FieldPolygonDrawer
                  onBoundariesChange={handleBoundariesChange}
                  center={[40.7128, -74.006]}
                  zoom={13}
                />
              </div>
            </Card>

            {boundaries.length === 0 && (
              <div className="mt-4 glass rounded-xl p-4 text-center">
                <MapPin
                  size={24}
                  className="mx-auto mb-2 text-primary"
                />
                <p className="text-sm font-medium">
                  Click <strong>Draw</strong> on the map toolbar, then click
                  the map to add vertices
                </p>
              </div>
            )}

            {boundaries.length > 0 && boundaries.length < 3 && (
              <div className="mt-4 glass rounded-xl p-4 flex items-center gap-3 text-yellow-500">
                <AlertTriangle size={18} />
                <p className="text-sm">
                  Need at least 3 points to form a polygon. Currently{" "}
                  {boundaries.length}.
                </p>
              </div>
            )}

            {boundaries.length >= 3 && (
              <div className="mt-4 glass rounded-xl p-4 flex items-center gap-3 text-green-500">
                <CheckCircle2 size={18} />
                <p className="text-sm">
                  Polygon complete: {boundaries.length} vertices, {area} ha.
                </p>
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sprout size={16} className="text-primary" />
                  Field Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Field Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. North Field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Crop Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select crop...</option>
                    {CROP_TYPES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <Separator />

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Field Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3 text-center">
                      <MapPin
                        size={14}
                        className="mx-auto mb-1 text-primary"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Vertices
                      </p>
                      <p className="text-sm font-bold">
                        {boundaries.length}
                      </p>
                    </div>
                    <div className="glass rounded-xl p-3 text-center">
                      <Ruler
                        size={14}
                        className="mx-auto mb-1 text-purple-500"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Area
                      </p>
                      <p className="text-sm font-bold">{area} ha</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="glass rounded-xl p-3 border-destructive/20 bg-destructive/5 flex items-start gap-3">
                <AlertTriangle
                  size={14}
                  className="text-destructive mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-medium text-destructive">
                    Error
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!canSave || saving}
              onClick={handleSave}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Field
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

