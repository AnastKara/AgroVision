"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notifications } from "@/lib/data";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  CloudRain,
  Bug,
  Droplets,
  CheckCircle,
  Wrench,
  Sprout,
  Trash2,
} from "lucide-react";

const notificationIcons: Record<string, any> = {
  weather: CloudRain,
  alert: Bug,
  warning: AlertTriangle,
  success: CheckCircle,
  maintenance: Wrench,
};

const notificationColors: Record<string, string> = {
  weather: "text-blue-500 bg-blue-500/10",
  alert: "text-red-500 bg-red-500/10",
  warning: "text-yellow-500 bg-yellow-500/10",
  success: "text-green-500 bg-green-500/10",
  maintenance: "text-orange-500 bg-orange-500/10",
};

export default function NotificationsPage() {
  const [notifList, setNotifList] = useState(notifications);
  const [filter, setFilter] = useState<string>("all");

  const filteredNotifs =
    filter === "all"
      ? notifList
      : filter === "unread"
      ? notifList.filter((n) => !n.read)
      : notifList.filter((n) => n.type === filter);

  const unreadCount = notifList.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifList([]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "No unread notifications"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck size={16} className="mr-1" />
            Mark all read
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 size={16} className="mr-1" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All", count: notifList.length },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "weather", label: "Weather", count: notifList.filter((n) => n.type === "weather").length },
          { id: "alert", label: "Alerts", count: notifList.filter((n) => n.type === "alert").length },
          { id: "warning", label: "Warnings", count: notifList.filter((n) => n.type === "warning").length },
          { id: "success", label: "Success", count: notifList.filter((n) => n.type === "success").length },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.id ? "bg-white/20" : "bg-background"
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifs.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredNotifs.map((notif, i) => {
                const Icon = notificationIcons[notif.type] || Bell;
                const colorClass = notificationColors[notif.type] || "text-muted-foreground bg-muted";
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-start gap-4 p-4 transition-colors ${
                      !notif.read ? "bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{notif.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell size={40} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                You're all caught up!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

