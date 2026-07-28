"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fields, type Field } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Maximize2, Satellite, Map as MapIcon } from "lucide-react";

// Fix Leaflet default icon issue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Sentinel-2 Cloudless tile layer (EOX - free, no API key)
const SENTINEL_TILES =
  "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2023_3857/default/g/{z}/{y}/{x}.jpg";

// OpenStreetMap standard tiles as fallback/base reference
const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const SENTINEL_ATTRIBUTION =
  '&copy; <a href="https://eox.at">EOX</a> Sentinel-2 Cloudless';

interface FarmMapProps {
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  className?: string;
}

function getHealthColor(health: number): string {
  if (health >= 75) return "#22c55e";
  if (health >= 50) return "#eab308";
  return "#ef4444";
}

function getHealthFillColor(health: number): string {
  if (health >= 75) return "rgba(34, 197, 94, 0.25)";
  if (health >= 50) return "rgba(234, 179, 8, 0.25)";
  return "rgba(239, 68, 68, 0.25)";
}

function getHealthBorderColor(health: number): string {
  if (health >= 75) return "#22c55e";
  if (health >= 50) return "#eab308";
  return "#ef4444";
}

// Map bounds setter component
function MapBoundsSetter({ fields }: { fields: Field[] }) {
  const map = useMap();

  useEffect(() => {
    if (fields.length === 0) return;

    const bounds = L.latLngBounds(
      fields.flatMap((f) =>
        f.boundaries.map((b) => [b.lat, b.lng] as [number, number])
      )
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    }
  }, [map, fields]);

  return null;
}

export default function FarmMap({
  selectedFieldId,
  onFieldSelect,
  className,
}: FarmMapProps) {
  const [satelliteMode, setSatelliteMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      mapRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const center: [number, number] = [
    fields.reduce((sum, f) => sum + f.latitude, 0) / fields.length,
    fields.reduce((sum, f) => sum + f.longitude, 0) / fields.length,
  ];

  const fieldStyles = (field: Field) => ({
    color: getHealthBorderColor(field.health),
    weight: selectedFieldId === field.id ? 4 : 2.5,
    opacity: 1,
    fillColor: getHealthFillColor(field.health),
    fillOpacity: selectedFieldId === field.id ? 0.4 : 0.25,
    dashArray: selectedFieldId === field.id ? undefined : "4 4",
  });

  const onEachField = (field: Field, layer: L.Layer) => {
    const healthColor = getHealthColor(field.health);
    const healthLabel =
      field.health >= 75 ? "Healthy" : field.health >= 50 ? "Needs Attention" : "Critical";

    layer.bindTooltip(
      `<div style="font-family: system-ui, sans-serif; min-width: 160px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${field.name}</div>
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${healthColor};"></span>
          <span style="font-size: 12px; color: #666;">${field.cropType} — ${healthLabel}</span>
        </div>
        <div style="font-size: 11px; color: #999;">${field.area} ha | ${field.health}% health</div>
      </div>`,
      {
        direction: "top",
        offset: L.point(0, -10),
        className: "field-tooltip",
      }
    );

    layer.on({
      click: () => {
        onFieldSelect(field.id);
      },
      mouseover: (e) => {
        const target = e.target as L.Path;
        target.setStyle({
          weight: 4,
          fillOpacity: 0.4,
          dashArray: undefined,
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        const target = e.target as L.Path;
        if (field.id !== selectedFieldId) {
          target.setStyle({
            weight: 2.5,
            fillOpacity: 0.25,
            dashArray: "4 4",
          });
        }
      },
    });
  };

  return (
    <div
      ref={mapRef}
      className={cn(
        "relative rounded-xl overflow-hidden border border-border",
        isFullscreen && "fixed inset-0 z-[9999] rounded-none",
        className
      )}
    >
      <MapContainer
        center={center}
        zoom={14}
        zoomControl={false}
        className="w-full h-full min-h-[400px] lg:min-h-[500px]"
        style={{ height: isFullscreen ? "100vh" : "100%", minHeight: 400 }}
      >
        <ZoomControl position="bottomright" />

        {/* Satellite or OSM tiles */}
        {satelliteMode ? (
          <TileLayer
            url={SENTINEL_TILES}
            attribution={SENTINEL_ATTRIBUTION}
            maxZoom={19}
          />
        ) : (
          <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} maxZoom={19} />
        )}

        {/* Auto-fit bounds */}
        <MapBoundsSetter fields={fields} />

        {/* Field polygons */}
        {fields.map((field) => {
          const coordinates: number[][] = [
            ...field.boundaries.map((b) => [b.lng, b.lat] as [number, number]),
            [field.boundaries[0].lng, field.boundaries[0].lat] as [number, number],
          ];
          const geojson = {
            type: "Feature" as const,
            properties: {} as Record<string, never>,
            geometry: {
              type: "Polygon" as const,
              coordinates: [coordinates],
            },
          };
          return (
            <GeoJSON
              key={field.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={geojson as any}
              style={() => fieldStyles(field)}
              onEachFeature={(_feature, layer) => onEachField(field, layer)}
            />
          );
        })}
      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5">
        <Button
          variant="glass"
          size="icon"
          className="w-9 h-9 shadow-lg"
          onClick={() => setSatelliteMode(!satelliteMode)}
          title={satelliteMode ? "Switch to Map view" : "Switch to Satellite view"}
        >
          {satelliteMode ? (
            <MapIcon size={16} className="text-primary" />
          ) : (
            <Satellite size={16} className="text-primary" />
          )}
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="w-9 h-9 shadow-lg"
          onClick={toggleFullscreen}
          title="Toggle fullscreen"
        >
          <Maximize2 size={16} />
        </Button>
      </div>

      {/* Layer indicator */}
      <div className="absolute bottom-4 left-4 z-[1000] glass rounded-xl px-3 py-2 text-xs text-muted-foreground shadow-lg">
        {satelliteMode ? "🛰️ Sentinel-2 Satellite" : "🗺️ OpenStreetMap"}
      </div>
    </div>
  );
}

