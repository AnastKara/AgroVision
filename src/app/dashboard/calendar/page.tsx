"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tasks } from "@/lib/data";
import type { Field } from "@/lib/data";
import { getFields } from "@/lib/fields-service";
import { formatDate } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Droplets,
  Tractor,
  Activity,
  Clock,
  Plus,
  Sun,
} from "lucide-react";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typeIcons: Record<string, any> = {
  Irrigation: Droplets,
  Harvesting: Sprout,
  Fertilizing: Sprout,
  "Livestock Care": Activity,
  Monitoring: Activity,
  Maintenance: Tractor,
  Planting: Sprout,
  Spraying: Droplets,
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

function buildCalendarGrid(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days: (number | null)[] = Array.from({ length: firstDayOfWeek }, () => null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  const remainder = days.length % 7;
  if (remainder !== 0) {
    return [...days, ...Array.from({ length: 7 - remainder }, () => null)];
  }
  return days;
}

function getTasksForDate(dateStr: string) {
  return tasks.filter((t) => {
    const taskDate = new Date(t.dueDate);
    const formatted = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, "0")}-${String(taskDate.getDate()).padStart(2, "0")}`;
    return formatted === dateStr;
  });
}

function getSeasonInfo(m: number) {
  if (m >= 2 && m <= 4) return { season: "Spring", color: "text-green-500", icon: Sprout };
  if (m >= 5 && m <= 7) return { season: "Summer", color: "text-yellow-500", icon: Sun };
  if (m >= 8 && m <= 10) return { season: "Fall", color: "text-orange-500", icon: Sprout };
  return { season: "Winter", color: "text-blue-500", icon: Activity };
}

function getSeasonalTasks(m: number) {
  const planting: string[] = [];
  const harvesting: string[] = [];

  if (m >= 2 && m <= 4) {
    planting.push("Corn", "Soybeans", "Wheat (Spring)", "Sunflowers");
    harvesting.push("Winter Wheat", "Barley");
  } else if (m >= 5 && m <= 7) {
    planting.push("Rice", "Soybeans (Late)", "Tomatoes");
    harvesting.push("Wheat", "Barley", "Oats");
  } else if (m >= 8 && m <= 10) {
    planting.push("Winter Wheat", "Cover Crops", "Apples (Trees)");
    harvesting.push("Corn", "Soybeans", "Rice", "Sunflowers", "Apples");
  } else {
    planting.push("Cover Crops");
    harvesting.push("Apples (Late)", "Winter Squash");
  }

  return { planting, harvesting };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "agenda">("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const calendarDays = buildCalendarGrid(year, month);
  const seasonInfo = getSeasonInfo(month);
  const seasonalTasks = getSeasonalTasks(month);

  const selectedDateStr = selectedDate || `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const selectedTasks = getTasksForDate(selectedDateStr);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farm Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Seasonal planning, task scheduling, and crop management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass rounded-xl p-1 flex">
            {(["month", "week", "agenda"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                  viewMode === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button size="sm">
            <Plus size={14} className="mr-1" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Season Banner */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 p-4">
              <div className="flex items-center gap-3">
                <seasonInfo.icon size={24} className={seasonInfo.color} />
                <div>
                  <p className="text-sm font-medium">
                    {seasonInfo.season} {year}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {seasonInfo.season === "Spring"
                      ? "\u{1F331} Time for planting and field preparation"
                      : seasonInfo.season === "Summer"
                      ? "\u2600\uFE0F Growing season - monitor crops closely"
                      : seasonInfo.season === "Fall"
                      ? "\u{1F342} Harvest season - prepare equipment"
                      : "\u2744\uFE0F Off-season maintenance and planning"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft size={16} />
              </Button>
              <h2 className="text-lg font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight size={16} />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={today}>
              <CalendarIcon size={14} className="mr-1" />
              Today
            </Button>
          </div>

          {/* Month Grid */}
          {viewMode === "month" && (
            <Card>
              <CardContent className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    if (day === null) {
                      return <div key={`empty-${i}`} className="min-h-[80px]" />;
                    }

                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayTasks = getTasksForDate(dateStr);
                    const isToday =
                      new Date().getFullYear() === year &&
                      new Date().getMonth() === month &&
                      new Date().getDate() === day;
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`min-h-[80px] p-1.5 rounded-xl border text-left transition-all hover:shadow-sm ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : isToday
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`text-xs font-medium ${
                            isToday ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayTasks.slice(0, 3).map((task) => {
                            const TypeIcon = typeIcons[task.type] || Activity;
                            return (
                              <div
                                key={task.id}
                                className="flex items-center gap-1 text-[8px] px-1 py-0.5 rounded bg-primary/10"
                                title={task.title}
                              >
                                <TypeIcon size={8} className="text-primary flex-shrink-0" />
                                <span className="truncate">{task.title}</span>
                              </div>
                            );
                          })}
                          {dayTasks.length > 3 && (
                            <p className="text-[8px] text-muted-foreground pl-1">
                              +{dayTasks.length - 3} more
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agenda View */}
          {viewMode === "agenda" && (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {tasks
                  .slice()
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((task) => {
                    const TypeIcon = typeIcons[task.type] || Activity;
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${
                          isOverdue ? "border-l-2 border-destructive" : ""
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <TypeIcon size={18} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{task.title}</p>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-[9px]">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                            <span>{task.assignedTo}</span>
                            {task.field && <span>· {task.field}</span>}
                            <span>· Due: {formatDate(task.dueDate)}</span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            task.priority === "critical"
                              ? "destructive"
                              : task.priority === "high"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Seasonal Info + Selected Date Tasks */}
        <div className="space-y-4">
          {/* Seasonal Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sprout size={14} className="text-primary" />
                Seasonal Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                  <Sprout size={12} />
                  Planting
                </h4>
                <div className="flex flex-wrap gap-1">
                  {seasonalTasks.planting.map((crop, i) => (
                    <Badge key={i} variant="secondary" className="text-[9px]">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1">
                  <Tractor size={12} />
                  Harvesting
                </h4>
                <div className="flex flex-wrap gap-1">
                  {seasonalTasks.harvesting.map((crop, i) => (
                    <Badge key={i} variant="secondary" className="text-[9px]">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-3">
                <p className="text-xs font-medium mb-1">Field Status</p>
                <div className="space-y-1">
                  {fields.map((f) => (
                    <div key={f.id} className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">{f.name}</span>
                      <span
                        className={
                          f.health >= 75
                            ? "text-green-500"
                            : f.health >= 50
                            ? "text-yellow-500"
                            : "text-red-500"
                        }
                      >
                        {f.growthStage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock size={14} className="text-primary" />
                {selectedDate
                  ? formatDate(selectedDate)
                  : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedTasks.map((task) => {
                    const TypeIcon = typeIcons[task.type] || Activity;
                    return (
                      <div
                        key={task.id}
                        className="glass rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon size={12} className="text-primary" />
                          <p className="text-xs font-medium">{task.title}</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{task.assignedTo}</span>
                          <Badge
                            variant={
                              task.priority === "critical"
                                ? "destructive"
                                : task.priority === "high"
                                ? "warning"
                                : "secondary"
                            }
                            className="text-[8px] px-1"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarIcon size={24} className="mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    No tasks scheduled for this date
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    <Plus size={12} className="mr-1" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

