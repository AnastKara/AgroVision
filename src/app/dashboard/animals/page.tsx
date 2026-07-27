"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { animals } from "@/lib/data";
import { getHealthColor } from "@/lib/utils";
import {
  PawPrint,
  Plus,
  Search,
  Filter,
  Heart,
  Weight,
  Calendar,
  MapPin,
  Syringe,
  Activity,
  Milk,
  Egg,
  Scissors,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AnimalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

  const filteredAnimals = animals.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedAnimalData = animals.find((a) => a.id === selectedAnimal);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Animal Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage your livestock</p>
        </div>
        <Button>
          <Plus size={16} className="mr-1" />
          Add Animal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Animals", value: animals.length, icon: PawPrint, color: "text-primary" },
          { label: "Avg Health", value: `${Math.round(animals.reduce((a, b) => a + b.health, 0) / animals.length)}%`, icon: Heart, color: "text-green-500" },
          { label: "Species", value: new Set(animals.map((a) => a.species)).size, icon: Activity, color: "text-blue-500" },
          { label: "Active", value: animals.filter((a) => a.status !== "Sick").length, icon: MapPin, color: "text-purple-500" },
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search animals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Animals Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAnimals.map((animal) => (
          <motion.div
            key={animal.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedAnimal(animal.id)}
            className={`glass-card p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedAnimal === animal.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar fallback={animal.name[0]} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{animal.name}</p>
                <p className="text-xs text-muted-foreground">
                  {animal.breed} · {animal.species}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Health</span>
                  <span className="font-medium">{animal.health}%</span>
                </div>
                <Progress
                  value={animal.health}
                  variant={animal.health >= 75 ? "success" : animal.health >= 50 ? "warning" : "danger"}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Weight size={12} />
                  {animal.weight} kg
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {animal.age} yrs
                </span>
              </div>
              <Badge
                variant={
                  animal.status === "Grazing" || animal.status === "Laying" || animal.status === "Lactating"
                    ? "success"
                    : animal.status === "Growing"
                    ? "info"
                    : "secondary"
                }
                className="text-[10px]"
              >
                {animal.status}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Animal Detail */}
      {selectedAnimalData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedAnimal(null)} />
          <Card className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar fallback={selectedAnimalData.name[0]} size="lg" />
                <div className="flex-1">
                  <CardTitle>{selectedAnimalData.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedAnimalData.breed} · {selectedAnimalData.species}
                  </p>
                </div>
                <Badge
                  variant={selectedAnimalData.health >= 75 ? "success" : selectedAnimalData.health >= 50 ? "warning" : "destructive"}
                  className="text-sm px-3 py-1"
                >
                  {selectedAnimalData.health}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Age", value: `${selectedAnimalData.age} years`, icon: Calendar },
                  { label: "Weight", value: `${selectedAnimalData.weight} kg`, icon: Weight },
                  { label: "Location", value: selectedAnimalData.location, icon: MapPin },
                  { label: "Status", value: selectedAnimalData.status, icon: Activity },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-xl p-3 text-center">
                    <stat.icon size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className="text-xs font-medium">{stat.value}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Vaccinations */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Syringe size={14} className="text-primary" />
                  Vaccinations
                </h4>
                <div className="space-y-2">
                  {selectedAnimalData.vaccinations.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <span className="text-sm font-medium">{v.name}</span>
                      <span className="text-xs text-muted-foreground">{v.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Production History */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  {selectedAnimalData.species === "Cow" ? <Milk size={14} className="text-primary" /> :
                   selectedAnimalData.species === "Chicken" ? <Egg size={14} className="text-primary" /> :
                   <Scissors size={14} className="text-primary" />}
                  Production History
                </h4>
                <div className="space-y-2">
                  {selectedAnimalData.productionHistory.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <span className="text-sm">{p.date}</span>
                      <span className="text-sm font-medium">{p.amount} {p.product === "Eggs" ? "eggs" : p.product === "Wool" ? "kg" : "L"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1">Edit Profile</Button>
                <Button variant="outline" className="flex-1">Medical Records</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

