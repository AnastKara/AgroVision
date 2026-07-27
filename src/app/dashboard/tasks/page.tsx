"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { tasks } from "@/lib/data";
import {
  Calendar,
  Plus,
  ListTodo,
  Columns,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sprout,
  Droplets,
  Tractor,
  Activity,
} from "lucide-react";

const columns = [
  { id: "todo", title: "To Do", color: "bg-muted" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500/10" },
  { id: "review", title: "Review", color: "bg-yellow-500/10" },
  { id: "done", title: "Done", color: "bg-green-500/10" },
];

const priorityColors = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
  critical: "destructive",
} as const;

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

export default function TasksPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [taskList, setTaskList] = useState(tasks);

  const getTasksByStatus = (status: string) =>
    taskList.filter((t) => t.status === status);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your farm operations and tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass rounded-xl p-1 flex">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                view === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Columns size={14} className="inline mr-1" />
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <ListTodo size={14} className="inline mr-1" />
              List
            </button>
          </div>
          <Button>
            <Plus size={16} className="mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => {
          const count = getTasksByStatus(col.id).length;
          return (
            <Card key={col.id}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${col.id === "done" ? "text-green-500" : col.id === "in_progress" ? "text-blue-500" : col.id === "review" ? "text-yellow-500" : "text-muted-foreground"}`}>
                  {count}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{col.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {view === "kanban" ? (
        /* Kanban Board */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {columns.map((column) => (
            <div key={column.id}>
              <div className={`rounded-2xl p-4 ${column.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">{column.title}</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {getTasksByStatus(column.id).length}
                  </Badge>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {getTasksByStatus(column.id).map((task) => {
                    const TypeIcon = typeIcons[task.type] || Activity;
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={priorityColors[task.priority]} className="text-[10px]">
                            {task.priority}
                          </Badge>
                          <TypeIcon size={14} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium mb-1">{task.title}</p>
                        <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar fallback={task.assignedTo.split(" ").map((n) => n[0]).join("")} size="sm" />
                            <span>{task.assignedTo.split(" ")[0]}</span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {task.dueDate}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {taskList.map((task) => {
                const TypeIcon = typeIcons[task.type] || Activity;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      task.status === "done" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                    }`}>
                      {task.status === "done" ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <Badge variant={priorityColors[task.priority]} className="text-[10px]">
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <TypeIcon size={12} />
                          {task.type}
                        </span>
                        {task.field && (
                          <span className="flex items-center gap-1">
                            <Sprout size={12} />
                            {task.field}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {task.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Avatar fallback={task.assignedTo.split(" ").map((n) => n[0]).join("")} size="sm" />
                          {task.assignedTo}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.status === "done" ? "success" :
                        task.status === "in_progress" ? "info" :
                        task.status === "review" ? "warning" : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

