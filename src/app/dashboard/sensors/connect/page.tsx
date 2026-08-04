"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  getProviders,
  getIntegrations,
  addIntegration,
  removeIntegration,
  syncIntegration,
} from "@/lib/sensor-integration-service";
import type {
  SensorProvider,
  SensorIntegration,
  SensorTypeCategory,
} from "@/lib/sensor-integrations";
import { getIntegrationFieldName } from "@/lib/sensor-integrations-data";
import {
  CloudSun,
  Thermometer,
  Droplets,
  Activity,
  Tractor,
  Cpu,
  ShieldCheck,
  KeyRound,
  Unplug,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowLeft,
  LayoutDashboard,
ExternalLink,
  Lock,
  Loader2,
  ListChecks,
  Plug,
  BarChart3,
  Sparkles,
  Wifi,
} from "lucide-react";

// Map lucide icon name -> component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providerIcons: Record<string, any> = {
  CloudSun,
  Thermometer,
  Droplets,
  Activity,
  Tractor,
  Cpu,
};

const sensorTypeLabels: Record<SensorTypeCategory, string> = {
  weather_station: "Weather Station",
  soil_sensor: "Soil Sensor",
  irrigation_controller: "Irrigation Controller",
  machinery: "Machinery",
};

const statusBadgeVariant: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  connected: "success",
  error: "destructive",
  syncing: "warning",
  disconnected: "secondary",
};

export default function ConnectSensorsPage() {
  const [providers, setProviders] = useState<SensorProvider[]>([]);
  const [integrations, setIntegrations] = useState<SensorIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<SensorProvider | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // API Key form state
  const [apiKey, setApiKey] = useState("");
  const [farmId, setFarmId] = useState("farm_greenvalley");
  const [sensorId, setSensorId] = useState("");
  const [sensorType, setSensorType] = useState<SensorTypeCategory>("soil_sensor");

  const loadData = useCallback(async () => {
    try {
      const [p, i] = await Promise.all([getProviders(), getIntegrations()]);
      setProviders(p);
      setIntegrations(i);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sensor providers");
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const isConnected = (providerId: string) =>
    integrations.some((i) => i.providerId === providerId);

  const handleConnectOAuth = async (provider: SensorProvider) => {
    setConnecting(true);
    setError(null);
    setSuccess(null);
    try {
      // Simulate OAuth flow — in production this redirects to provider's OAuth
      // Use first available field as default when connecting via OAuth
      const fieldId = farmId ? "f1" : "f1";
      await addIntegration({
        providerId: provider.id,
        sensorType: provider.sensorTypes[0],
        farmId,
        fieldId,
        oauthTokenRef: `kms://${provider.id}/token/oauth-${Date.now()}`,
      });
      setSuccess(`${provider.name} account connected successfully.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect account");
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectAPI = async (provider: SensorProvider) => {
    setConnecting(true);
    setError(null);
    setSuccess(null);
    try {
      if (!apiKey.trim()) {
        setError("API Key is required.");
        setConnecting(false);
        return;
      }
await addIntegration({
        providerId: provider.id,
        sensorType,
        farmId,
        fieldId: "f1",
        apiKey,
        externalSensorIds: sensorId.trim() ? [sensorId.trim()] : [],
      });
      setSuccess(`${provider.name} connected securely. Your API key is encrypted at rest.`);
      setApiKey("");
      setSensorId("");
      setSelectedProvider(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect provider");
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async (integration: SensorIntegration) => {
    setSyncingId(integration.id);
    setError(null);
    try {
      await syncIntegration(integration.id);
      setSuccess(`Synced ${integration.providerName} successfully.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncingId(null);
    }
  };

  const handleRemove = async (integration: SensorIntegration) => {
    setError(null);
    try {
      await removeIntegration(integration.id);
      setSuccess(`Disconnected ${integration.providerName}.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/sensors"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-3xl font-bold">Connect Sensors</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Connect your existing agricultural sensors from third-party providers
          </p>
        </div>
        <Link href="/dashboard/sensors/dashboard">
          <Button variant="outline">
            <LayoutDashboard size={16} className="mr-1" />
            Monitoring Dashboard
          </Button>
        </Link>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5"
          >
            <AlertTriangle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-muted-foreground">
              <X size={16} />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/5"
          >
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm flex-1">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-muted-foreground">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security banner */}
      <div className="glass rounded-xl p-4 flex items-start gap-3 border-primary/20 bg-primary/5">
        <ShieldCheck size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-primary text-sm mb-0.5">Enterprise-grade security</p>
          <p>
            API keys are encrypted at rest (AES-256-GCM) and stored as references — never in plaintext.
            OAuth tokens are managed by a secure key-management service.
          </p>
        </div>
      </div>

      {/* Connected integrations summary */}
      {integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              Connected Providers ({integrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
{integrations.map((integration) => {
              const provider = providers.find((p) => p.id === integration.providerId);
              const ProviderIcon = providerIcons[provider?.iconName || ""] || Cpu;
              return (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${provider?.brandColor || "#64748b"}15`, color: provider?.brandColor }}
                    >
                      <ProviderIcon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{integration.providerName}</p>
                        <Badge variant={statusBadgeVariant[integration.status]} className="text-[9px] px-1.5">
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {sensorTypeLabels[integration.sensorType]} ·{" "}
                        {getIntegrationFieldName(integration.fieldId)}
                        {integration.lastSyncAt && (
                          <> · Last sync {new Date(integration.lastSyncAt).toLocaleString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(integration)}
                      disabled={syncingId === integration.id}
                    >
                      {syncingId === integration.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      Sync
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(integration)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Unplug size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Providers grid */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Supported Providers</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select a provider to connect your existing sensors
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => {
            const ProviderIcon = providerIcons[provider.iconName] || Cpu;
            const connected = isConnected(provider.id);
            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 cursor-pointer transition-all hover:shadow-lg"
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${provider.brandColor}15`, color: provider.brandColor }}
                  >
                    <ProviderIcon size={20} />
                  </div>
                  {connected && (
                    <Badge variant="success" className="text-[9px] px-1.5">
                      <CheckCircle2 size={10} className="mr-0.5" />
                      Connected
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold">{provider.name}</h3>
                <p className="text-xs text-muted-foreground">{provider.tagline}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{provider.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {provider.capabilities.slice(0, 3).map((cap, i) => (
                    <Badge key={i} variant="secondary" className="text-[9px] px-1.5">
                      {cap}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Badge
                    variant={provider.authType === "oauth" ? "info" : "secondary"}
                    className="text-[9px] px-1.5"
                  >
                    {provider.authType === "oauth" ? (
                      <>
                        <ExternalLink size={10} className="mr-0.5" /> OAuth
                      </>
                    ) : (
                      <>
                        <KeyRound size={10} className="mr-0.5" /> API Key
                      </>
                    )}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {provider.sensorTypes.map((t) => sensorTypeLabels[t]).join(", ")}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Provider detail / connect modal */}
      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedProvider(null)} />
            <Card className="relative max-w-lg w-full max-h-[85vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
<div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedProvider.brandColor}15`, color: selectedProvider.brandColor }}
                    >
                      {(() => {
                        const ModalIcon = providerIcons[selectedProvider.iconName] || Cpu;
                        return <ModalIcon size={22} />;
                      })()}
                    </div>
                    <div>
                      <CardTitle className="text-base">{selectedProvider.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedProvider.tagline}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedProvider(null)}>
                    <X size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedProvider.description}
                </p>

                {selectedProvider.authType === "oauth" ? (
                  <div className="space-y-4">
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink size={14} className="text-primary" />
                        <p className="text-sm font-medium">OAuth 2.0 Connection</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You&apos;ll be redirected to {selectedProvider.name} to authorize AgroVision
                        to access your sensor data.
                      </p>
                      {selectedProvider.oauthScopes && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {selectedProvider.oauthScopes.map((scope, i) => (
                            <Badge key={i} variant="secondary" className="text-[9px] px-1.5 font-mono">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      disabled={connecting || isConnected(selectedProvider.id)}
                      onClick={() => handleConnectOAuth(selectedProvider)}
                    >
                      {connecting ? (
                        <Loader2 size={16} className="animate-spin mr-1" />
                      ) : (
                        <ExternalLink size={16} className="mr-1" />
                      )}
                      {isConnected(selectedProvider.id) ? "Already Connected" : "Connect Account"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="glass rounded-xl p-4 flex items-start gap-3 border-primary/20 bg-primary/5">
                      <Lock size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {selectedProvider.apiFormHelp ||
                          "Provide your API credentials. They will be encrypted (AES-256-GCM) before storage."}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Sensor Type</label>
                      <select
                        value={sensorType}
                        onChange={(e) => setSensorType(e.target.value as SensorTypeCategory)}
                        className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {selectedProvider.sensorTypes.map((t) => (
                          <option key={t} value={t}>{sensorTypeLabels[t]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">API Key</label>
                      <div className="relative">
                        <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your API key"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="pl-9 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Farm ID</label>
                      <Input
                        placeholder="e.g. farm_greenvalley"
                        value={farmId}
                        onChange={(e) => setFarmId(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Sensor ID</label>
                      <Input
                        placeholder="e.g. CX-SOIL-1188"
                        value={sensorId}
                        onChange={(e) => setSensorId(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <Button
                      className="w-full"
                      disabled={connecting || isConnected(selectedProvider.id)}
                      onClick={() => handleConnectAPI(selectedProvider)}
                    >
                      {connecting ? (
                        <Loader2 size={16} className="animate-spin mr-1" />
                      ) : (
                        <ShieldCheck size={16} className="mr-1" />
                      )}
                      {isConnected(selectedProvider.id) ? "Already Connected" : "Connect Securely"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
