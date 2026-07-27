"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { fields } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { Sprout, Plus, Search, Filter, Droplets, Thermometer, Ruler, Activity, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function FieldsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const filteredFields = fields.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.cropType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFieldData = fields.find((f) => f.id === selectedField);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fields</h1>
          <p className="text-muted-foreground mt-1">Manage your fields and monitor crop health</p>
        </div>
        <Button>
          <Plus size={16} className="mr-1" />
          Add Field
        </Button>
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
        </div>
        <Button variant="outline" size="icon">
          <Filter size={16} />
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Fields", value: fields.length, icon: Sprout },
          { label: "Total Area", value: `${fields.reduce((a, f) => a + f.area, 0)} ha`, icon: Ruler },
          { label: "Avg Health", value: `${Math.round(fields.reduce((a, f) => a + f.health, 0) / fields.length)}%`, icon: Activity },
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

      {/* Fields Grid */}
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
                  <p className="text-xs font-medium">{field.area} ha</p>
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
                  { label: "Area", value: `${selectedFieldData.area} ha`, icon: Ruler },
                  { label: "Moisture", value: `${selectedFieldData.moisture}%`, icon: Droplets },
                  { label: "Nitrogen", value: `${selectedFieldData.nitrogen}%`, icon: Activity },
                  { label: "Growth Stage", value: selectedFieldData.growthStage, icon: Sprout },
                  { label: "Expected Yield", value: `${formatNumber(selectedFieldData.expectedYield)} kg`, icon: TrendingUp },
                  { label: "Temperature", value: "22°C", icon: Thermometer },
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
                <Button className="flex-1">Edit Field</Button>
                <Button variant="outline" className="flex-1">View on Map</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

