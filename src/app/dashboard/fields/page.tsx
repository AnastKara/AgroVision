"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getFields } from "@/lib/fields-service";
import type { Field } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { Sprout, Plus, Search, Droplets, Thermometer, Ruler, Activity, Calendar, DollarSign, TrendingUp, MapPin, Loader2, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatArea, formatTemperature, formatWeight, useUnits } from "@/components/units-provider";

export default function FieldsPage() {
  const { unitSystem } = useUnits();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadFields = useCallback(async () => {
    try {
      const data = await getFields();
      setFields(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  // Refresh fields when returning from the create page
  useEffect(() => {
    const refresh = () => loadFields();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [loadFields]);

  const filteredFields = fields.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.cropType.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "healthy") matchesStatus = f.health >= 75;
    else if (statusFilter === "warning") matchesStatus = f.health >= 50 && f.health < 75;
    else if (statusFilter === "critical") matchesStatus = f.health < 50;

    return matchesSearch && matchesStatus;
  });

  const selectedFieldData = fields.find((f) => f.id === selectedField);

  const avgHealth =
    fields.length > 0
      ? Math.round(fields.reduce((a, f) => a + f.health, 0) / fields.length)
      : 0;

  const renderContent = () => {
    // Loading State
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={40} className="mx-auto mb-3 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading fields...</p>
          </div>
        </div>
      );
    }

    // Empty State - no fields at all
    if (fields.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Sprout size={48} className="mx-auto mb-4 text-muted-foreground/40" />
            <h2 className="text-xl font-semibold mb-2">No fields yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by adding your first field. Draw its boundaries on the satellite map and set the crop type.
            </p>
            <Link href="/dashboard/fields/create">
              <Button size="lg">
                <Plus size={16} className="mr-2" />
                Add Your First Field
              </Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    // No Results State - fields exist but none match filters
    if (filteredFields.length === 0) {
      return (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold mb-2">No fields match your search</h2>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search query or filter criteria.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      );
    }

    // Fields Grid
    return (
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFields.map((field) => (
          <motion.div
            key={field.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedField(field.id)}
            className={`glass-card p-5 cursor-pointer transition-all ${
              selectedField === field.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold">{field.name}</h3>
                <p className="text-sm text-muted-foreground">{field.cropType}</p>
              </div>
              <Badge
                variant={
                  field.health >= 75 ? "success" : field.health >= 50 ? "warning" : "destructive"
                }
              >
                {field.health}% Health
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Health</span>
                  <span className={field.health >= 75 ? "text-green-500" : field.health >= 50 ? "text-yellow-500" : "text-red-500"}>
                    {field.health}%
                  </span>
                </div>
                <Progress
                  value={field.health}
                  variant={field.health >= 75 ? "success" : field.health >= 50 ? "warning" : "danger"}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="glass rounded-xl p-2 text-center">
                  <Droplets size={12} className="mx-auto mb-1 text-blue-500" />
                  <p className="text-[10px] text-muted-foreground">Moisture</p>
                  <p className="text-xs font-medium">{field.moisture}%</p>
                </div>
                <div className="glass rounded-xl p-2 text-center">
                  <Activity size={12} className="mx-auto mb-1 text-primary" />
                  <p className="text-[10px] text-muted-foreground">Nitrogen</p>
                  <p className="text-xs font-medium">{field.nitrogen}%</p>
                </div>
                <div className="glass rounded-xl p-2 text-center">
                  <Ruler size={12} className="mx-auto mb-1 text-purple-500" />
                  <p className="text-[10px] text-muted-foreground">Area</p>
                  <p className="text-xs font-medium">{formatArea(field.area, unitSystem)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Irrigated: {field.lastIrrigation}
                </span>
                <span className="font-medium text-foreground">
                  {field.growthStage}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fields</h1>
          <p className="text-muted-foreground mt-1">Manage your fields and monitor crop health</p>
        </div>
        <Link href="/dashboard/fields/create">
          <Button>
            <Plus size={16} className="mr-1" />
            Add Field
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={16} />
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Health Status:</span>
            {["all", "healthy", "warning", "critical"].map((option) => (
              <button
                key={option}
                onClick={() => setStatusFilter(option)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === option
                    ? option === "healthy"
                      ? "bg-green-500/20 text-green-600 border border-green-500/30"
                      : option === "warning"
                      ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30"
                      : option === "critical"
                      ? "bg-red-500/20 text-red-600 border border-red-500/30"
                      : "bg-primary/20 text-primary border border-primary/30"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
                }`}
              >
                {option === "all" ? "All Fields" : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Fields", value: fields.length, icon: Sprout },
          { label: "Total Area", value: formatArea(fields.reduce((a, f) => a + f.area, 0), unitSystem), icon: Ruler },
          { label: "Avg Health", value: `${avgHealth}%`, icon: Activity },
          { label: "Est. Revenue", value: `$${formatNumber(123000)}`, icon: DollarSign },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic Content: Loading / Empty / No Results / Grid */}
      {renderContent()}

      {/* Field Detail Modal / Panel */}
      {selectedFieldData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedField(null)} />
          <Card className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedFieldData.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedFieldData.cropType}</p>
                </div>
                <Badge
                  variant={
                    selectedFieldData.health >= 75
                      ? "success"
                      : selectedFieldData.health >= 50
                      ? "warning"
                      : "destructive"
                  }
                  className="text-sm px-3 py-1"
                >
                  {selectedFieldData.health}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Field Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Area", value: formatArea(selectedFieldData.area, unitSystem), icon: Ruler },
                  { label: "Moisture", value: `${selectedFieldData.moisture}%`, icon: Droplets },
                  { label: "Nitrogen", value: `${selectedFieldData.nitrogen}%`, icon: Activity },
                  { label: "Growth Stage", value: selectedFieldData.growthStage, icon: Sprout },
                  { label: "Expected Yield", value: formatWeight(selectedFieldData.expectedYield, unitSystem), icon: TrendingUp },
                  { label: "Temperature", value: formatTemperature(22, unitSystem), icon: Thermometer },
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

              <Separator />

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
                <div className="space-y-3">
                  {[
                    { action: "Irrigation applied", date: selectedFieldData.lastIrrigation, by: "John Smith" },
                    { action: "Fertilization applied", date: selectedFieldData.lastFertilization, by: "John Smith" },
                    { action: "Drone scan completed", date: "2024-03-14", by: "Sarah Wilson" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary/50 mt-1.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date} · {activity.by}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* AI Recommendation */}
              <div className="glass rounded-2xl p-4 border-primary/20 bg-primary/5">
                <h4 className="text-sm font-medium text-primary mb-2">AI Recommendation</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedFieldData.health < 60
                    ? `⚠️ ${selectedFieldData.name} requires immediate attention. Consider increasing irrigation frequency and applying nitrogen-rich fertilizer.`
                    : selectedFieldData.moisture < 50
                    ? `💧 Soil moisture is below optimal levels. Schedule irrigation for ${selectedFieldData.name} within the next 48 hours.`
                    : `✅ ${selectedFieldData.name} is in excellent condition. Continue current management practices. The yield projection looks promising.`}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={() => router.push(`/dashboard/fields/${selectedFieldData.id}`)}>
                  View Details
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard/farm-map")}
                >
                  View on Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
