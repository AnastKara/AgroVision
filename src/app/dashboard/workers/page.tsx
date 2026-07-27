"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { workers } from "@/lib/data";
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  Award,
  MapPin,
  Phone,
  Mail,
  Briefcase,
} from "lucide-react";

const availabilityColors = {
  available: "success",
  busy: "warning",
  offline: "secondary",
} as const;

export default function WorkersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedWorkerData = workers.find((w) => w.id === selectedWorker);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workers</h1>
          <p className="text-muted-foreground mt-1">Manage your farm workforce</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Worker Marketplace</Button>
          <Button>
            <Plus size={16} className="mr-1" />
            Hire Worker
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Workers", value: workers.length, icon: Users, color: "text-primary" },
          { label: "Available", value: workers.filter((w) => w.availability === "available").length, icon: Users, color: "text-green-500" },
          { label: "Avg Rating", value: (workers.reduce((a, b) => a + b.rating, 0) / workers.length).toFixed(1), icon: Star, color: "text-yellow-500" },
          { label: "Avg Rate", value: `$${(workers.reduce((a, b) => a + b.hourlyRate, 0) / workers.length).toFixed(0)}/h`, icon: DollarSign, color: "text-blue-500" },
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
          placeholder="Search workers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Workers Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((worker) => (
          <motion.div
            key={worker.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedWorker(worker.id)}
            className={`glass-card p-5 cursor-pointer transition-all hover:shadow-lg ${
              selectedWorker === worker.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={worker.name.split(" ").map((n) => n[0]).join("")}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold">{worker.name}</h3>
                  <p className="text-xs text-muted-foreground">{worker.role}</p>
                </div>
              </div>
              <Badge variant={availabilityColors[worker.availability]} className="text-[10px]">
                {worker.availability}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={14} className="fill-yellow-500" />
                <span className="text-sm font-medium">{worker.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Briefcase size={12} />
                {worker.experience} years
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs ml-auto">
                <DollarSign size={12} />
                ${worker.hourlyRate}/hr
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {worker.skills.slice(0, 4).map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">
                  {skill}
                </Badge>
              ))}
              {worker.skills.length > 4 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{worker.skills.length - 4}
                </Badge>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Worker Detail */}
      {selectedWorkerData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedWorker(null)} />
          <Card className="relative max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={selectedWorkerData.name.split(" ").map((n) => n[0]).join("")}
                  size="xl"
                />
                <div className="flex-1">
                  <CardTitle>{selectedWorkerData.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedWorkerData.role}</p>
                </div>
                <Badge variant={availabilityColors[selectedWorkerData.availability]}>
                  {selectedWorkerData.availability}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Experience", value: `${selectedWorkerData.experience} years`, icon: Briefcase },
                  { label: "Hourly Rate", value: `$${selectedWorkerData.hourlyRate}`, icon: DollarSign },
                  { label: "Rating", value: selectedWorkerData.rating, icon: Star },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-xl p-3 text-center">
                    <stat.icon size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Skills */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Award size={14} className="text-primary" />
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkerData.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Assignments */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  Assigned To
                </h4>
                {selectedWorkerData.assignedTo.length > 0 ? (
                  <div className="space-y-2">
                    {selectedWorkerData.assignedTo.map((assignment, i) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/50 text-sm">
                        Machine #{assignment}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No current assignments</p>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Joined: {selectedWorkerData.joinedDate}</span>
                <span>ID: {selectedWorkerData.id}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1">Assign Task</Button>
                <Button variant="outline" className="flex-1">View Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

