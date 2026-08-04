"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { useUnits, type UnitSystem } from "@/components/units-provider";
import {
  currencyCodes,
  getCurrencyName,
  getCurrencySymbol,
  useCurrency,
} from "@/components/currency-provider";
import { languageOptions, useLanguage } from "@/components/language-provider";
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
  Lock,
  Radio,
  Plug,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { unitSystem, setUnitSystem } = useUnits();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");

const tabs = [
    { id: "general", label: t("tabs.general"), icon: Settings },
    { id: "profile", label: t("tabs.profile"), icon: User },
    { id: "notifications", label: t("tabs.notifications"), icon: Bell },
    { id: "security", label: t("tabs.security"), icon: Shield },
    { id: "team", label: t("tabs.team"), icon: Users },
    { id: "sensors", label: "Sensors", icon: Radio },
  ];
  const unitOptions: { value: UnitSystem; label: string; icon: typeof Thermometer; desc: string }[] = [
    { value: "metric", label: "Metric", icon: Thermometer, desc: "Celsius, hectares, kg" },
    { value: "imperial", label: "Imperial", icon: Ruler, desc: "Fahrenheit, acres, lbs" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings.description")}</p>
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
                  {t("appearance.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">{t("appearance.theme")}</label>
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
                  <label htmlFor="currency" className="text-sm font-medium mb-3 block">{t("appearance.currency")}</label>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                    <select
                      id="currency"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                      className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {currencyCodes.map((code) => (
                        <option key={code} value={code}>{code} — {getCurrencyName(code)}</option>
                      ))}
                    </select>
                    <div className="min-w-56 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 flex items-center gap-3" aria-live="polite">
                      <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                        {getCurrencySymbol(currency)}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{getCurrencyName(currency)}</p>
                        <p className="text-xs text-muted-foreground">{currency} · {getCurrencySymbol(currency)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Changes how monetary values are displayed across the dashboard.</p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-3 block">{t("appearance.language")}</label>
                  <div className="relative max-w-xs">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={language}
                      onChange={(event) => setLanguage(event.target.value as typeof language)}
                      className="w-full h-11 rounded-xl border border-border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {languageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.nativeLabel} ({option.label})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{t("appearance.languageHint")}</p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-3 block">{t("appearance.units")}</label>
                  <div className="flex gap-3" role="radiogroup" aria-label="Units">
                    {unitOptions.map((u) => (
                      <label
                        key={u.value}
                        data-testid={`unit-${u.value}`}
                        className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                          unitSystem === u.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/30"
                        } cursor-pointer`}
                      >
                        <input
                          type="radio"
                          name="unit-system"
                          value={u.value}
                          checked={unitSystem === u.value}
                          onChange={() => setUnitSystem(u.value)}
                          className="sr-only"
                        />
                        <u.icon size={24} className={`mb-2 ${unitSystem === u.value ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="text-sm font-medium">{u.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{u.desc}</p>
                      </label>
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

          {/* Sensors */}
          {activeTab === "sensors" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio size={16} className="text-primary" />
                  Sensors & Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="glass rounded-2xl p-4 bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Plug size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
<p className="text-sm font-medium">Connect third-party farmer sensors</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Link your existing agricultural sensors from METOS, Davis Instruments, CropX,
                        Sencrop, and John Deere — or use our Custom API for any other provider.
                        Credentials are encrypted before storage and synchronizations are logged.
                      </p>
                      <Link href="/dashboard/sensors/connect">
                        <Button size="sm" className="mt-3">
                          Connect Sensors
                          <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    SUPPORTED PROVIDERS
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      "METOS",
                      "Davis Instruments",
                      "CropX",
                      "Sencrop",
                      "John Deere",
                      "Custom API",
                    ].map((provider) => (
                      <div
                        key={provider}
                        className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50"
                      >
                        <span className="text-sm font-medium">{provider}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          Available
                        </Badge>
                      </div>
                    ))}
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

