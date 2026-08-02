"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { machinery } from "@/lib/data";
import {
  Tractor,
  Plus,
  Search,
  Fuel,
  Clock,
  Wrench,
  User,
  MapPin,
  Activity,
  AlertTriangle,
  Gauge,
} from "lucide-react";

const statusColors = {
  active: "success",
  idle: "warning",
  maintenance: "destructive",
  offline: "secondary",
} as const;

const statusIcons = {
  active: Activity,
  idle: AlertTriangle,
  maintenance: Wrench,
  offline: AlertTriangle,
};

export default function MachineryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  const filteredMachinery = machinery.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMachineData = machinery.find((m) => m.id === selectedMachine);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Machinery</h1>
          <p className="text-muted-foreground mt-1">Manage your farm equipment and fleet</p>
        </div>
<Button onClick={() => router.push("/dashboard/machinery/add")}>
          <Plus size={16} className="mr-1" />
          Add Machine
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Machines", value: machinery.length, icon: Tractor, color: "text-primary" },
          { label: "Active", value: machinery.filter((m) => m.status === "active").length, icon: Activity, color: "text-green-500" },
          { label: "Avg Fuel", value: `${Math.round(machinery.reduce((a, b) => a + b.fuelLevel, 0) / machinery.length)}%`, icon: Fuel, color: "text-yellow-500" },
          { label: "Avg Efficiency", value: `${Math.round(machinery.reduce((a, b) => a + b.efficiency, 0) / machinery.length)}%`, icon: Gauge, color: "text-blue-500" },
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

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search machinery..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachinery.map((machine) => {
          const StatusIcon = statusIcons[machine.status];
          return (
            <motion.div
              key={machine.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedMachine(machine.id)}
              className={`glass-card p-5 cursor-pointer transition-all hover:shadow-lg ${
                selectedMachine === machine.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <Tractor size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{machine.name}</h3>
                    <p className="text-xs text-muted-foreground">{machine.type}</p>
                  </div>
                </div>
                <Badge variant={statusColors[machine.status]} className="text-[10px]">
                  {machine.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Fuel Level</span>
                    <span className={`font-medium ${machine.fuelLevel < 30 ? "text-red-500" : "text-green-500"}`}>
                      {machine.fuelLevel}%
                    </span>
                  </div>
                  <Progress
                    value={machine.fuelLevel}
                    variant={machine.fuelLevel < 30 ? "danger" : machine.fuelLevel < 60 ? "warning" : "success"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {machine.hoursUsed}h used
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User size={12} />
                    {machine.assignedWorker}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    {machine.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Wrench size={12} />
                    Next: {machine.nextService}
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="font-medium">{machine.efficiency}%</span>
                  </div>
                  <Progress value={machine.efficiency} variant="default" className="mt-1" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Machine Detail */}
      <AnimatePresence>
        {selectedMachineData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedMachine(null)} />
            <Card className="relative max-w-lg w-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <Tractor size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{selectedMachineData.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedMachineData.type}</p>
                  </div>
                  <Badge variant={statusColors[selectedMachineData.status]}>{selectedMachineData.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Hours Used", value: `${selectedMachineData.hoursUsed}h`, icon: Clock },
                    { label: "Fuel Level", value: `${selectedMachineData.fuelLevel}%`, icon: Fuel },
                    { label: "Efficiency", value: `${selectedMachineData.efficiency}%`, icon: Gauge },
                    { label: "Assigned To", value: selectedMachineData.assignedWorker, icon: User },
                    { label: "Location", value: selectedMachineData.location, icon: MapPin },
                    { label: "Last Service", value: selectedMachineData.lastMaintenance, icon: Wrench },
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

                <div className="glass rounded-2xl p-4 bg-yellow-500/5 border border-yellow-500/20">
                  <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} />
                    Upcoming Service
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Next maintenance scheduled for {selectedMachineData.nextService}.
                    {selectedMachineData.hoursUsed > 1000 && " Extended usage detected, consider early service."}
                  </p>
                </div>

<div className="flex gap-3">
                  <Button className="flex-1" onClick={() => router.push("/dashboard/workers")}>Assign Worker</Button>
                  <Button variant="outline" className="flex-1" onClick={() => router.push("#")}>Service Log</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

