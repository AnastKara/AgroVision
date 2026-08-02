"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  Users,
  Palette,
  Ruler,
  Thermometer,
  Save,
  User,
  Mail,
  Lock,
  Monitor,
  Smartphone,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "team", label: "Team", icon: Users },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="hidden md:flex flex-col gap-1 w-48">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={16} className="text-primary" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Theme</label>
                  <div className="flex gap-3">
                    {[
                      { mode: "light", label: "Light", icon: Sun, desc: "Light mode for daytime" },
                      { mode: "dark", label: "Dark", icon: Moon, desc: "Dark mode for nighttime" },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isActive = theme === t.mode;
                      return (
                        <button
                          key={t.mode}
                          onClick={() => setTheme(t.mode as "light" | "dark")}
                          className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                            isActive
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <Icon size={24} className={`mb-2 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                          <p className="text-sm font-medium">{t.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-3 block">Language</label>
                  <div className="relative max-w-xs">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select className="w-full h-11 rounded-xl border border-border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-3 block">Units</label>
                  <div className="flex gap-3">
                    {[
                      { value: "metric", label: "Metric", icon: Thermometer, desc: "Celsius, hectares, kg" },
                      { value: "imperial", label: "Imperial", icon: Ruler, desc: "Fahrenheit, acres, lbs" },
                    ].map((u) => (
                      <button
                        key={u.value}
                        className="flex-1 p-4 rounded-2xl border border-border hover:border-muted-foreground/30 transition-all"
                      >
                        <u.icon size={24} className="mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">{u.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{u.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={16} className="text-primary" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Weather Alerts", desc: "Get notified about weather changes affecting your farm", enabled: true },
                  { label: "Task Reminders", desc: "Receive reminders for upcoming tasks", enabled: true },
                  { label: "Field Health", desc: "Alerts when field health drops below threshold", enabled: true },
                  { label: "Equipment Maintenance", desc: "Reminders for machinery servicing", enabled: false },
                  { label: "Market Updates", desc: "Price changes and new listings in marketplace", enabled: false },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{notif.label}</p>
                      <p className="text-xs text-muted-foreground">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Profile Settings */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name</label>
                    <Input defaultValue="Alex Driver" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <Input defaultValue="alex@farm.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Farm Name</label>
                    <Input defaultValue="Green Valley Farm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone</label>
                    <Input defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
                <Button>
                  <Save size={16} className="mr-1" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={16} className="text-primary" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Current Password</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">New Password</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                    <Input type="password" />
                  </div>
                  <div className="flex items-end">
                    <Button>Update Password</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team */}
          {activeTab === "team" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Alex Driver", role: "Farm Manager", email: "alex@farm.com" },
                  { name: "Sarah Wilson", role: "Drone Operator", email: "sarah@farm.com" },
                  { name: "John Smith", role: "Senior Operator", email: "john@farm.com" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role} · {member.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                ))}
                <Button variant="outline">Invite Team Member</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}

