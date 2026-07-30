"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Pen,
  Trash2,
  Save,
  Move,
  X,
  Map as MapIcon,
  Satellite,
  Maximize2,
} from "lucide-react";

// Fix Leaflet default icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const SENTINEL_TILES =
  "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2023_3857/default/g/{z}/{y}/{x}.jpg";

export type DrawingMode = "none" | "draw" | "edit" | "delete";

interface FieldPolygonDrawerProps {
  /** Initial boundaries to load (for editing) */
  initialBoundaries?: { lat: number; lng: number }[];
  /** Called when polygon changes */
  onBoundariesChange?: (boundaries: { lat: number; lng: number }[]) => void;
  /** Called when drawing mode changes */
  onModeChange?: (mode: DrawingMode) => void;
  /** Map center */
  center?: [number, number];
  /** Zoom level */
  zoom?: number;
  className?: string;
}

// Component that manages polygon drawing
function PolygonManager({
  mode,
  initialBoundaries,
  onBoundariesChange,
}: {
  mode: DrawingMode;
  initialBoundaries?: { lat: number; lng: number }[];
  onBoundariesChange?: (boundaries: { lat: number; lng: number }[]) => void;
}) {
  const map = useMap();
  const polygonRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const drawLayerRef = useRef<L.LayerGroup | null>(null);

  const emitBoundaries = useCallback(() => {
    if (!polygonRef.current) return;
    const latlngs = polygonRef.current.getLatLngs() as L.LatLng[];
    const bounds = (Array.isArray(latlngs[0]) ? latlngs[0] : latlngs).map(
      (ll) => ({ lat: ll.lat, lng: ll.lng })
    );
    onBoundariesChange?.(bounds);
  }, [onBoundariesChange]);

  // Initialize polygon from initial boundaries
  useEffect(() => {
    if (!initialBoundaries || initialBoundaries.length === 0) {
      // Create empty layer group for drawing
      drawLayerRef.current = L.layerGroup().addTo(map);
      return;
    }

    const latlngs = initialBoundaries.map((b) => [b.lat, b.lng] as [number, number]);
    polygonRef.current = L.polygon(latlngs, {
      color: "#16a34a",
      weight: 3,
      opacity: 1,
      fillColor: "rgba(22, 163, 74, 0.2)",
      fillOpacity: 0.3,
    }).addTo(map);

    map.fitBounds(polygonRef.current.getBounds(), { padding: [50, 50] });

    return () => {
      polygonRef.current?.remove();
      polygonRef.current = null;
    };
  }, [map, initialBoundaries]);

  // Handle mode changes
  useEffect(() => {
    if (!map) return;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (mode !== "draw") return;

      const latlng = e.latlng;

      // Create or update polygon
      if (!polygonRef.current) {
        polygonRef.current = L.polygon([latlng], {
          color: "#16a34a",
          weight: 3,
          opacity: 1,
          fillColor: "rgba(22, 163, 74, 0.2)",
          fillOpacity: 0.3,
        }).addTo(map);
      } else {
        const latlngs = polygonRef.current.getLatLngs() as L.LatLng[];
        const points = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
        points.push(latlng);
        polygonRef.current.setLatLngs(points);
      }

      // Add marker at click point
      const marker = L.circleMarker(latlng, {
        radius: 6,
        color: "#16a34a",
        fillColor: "#ffffff",
        fillOpacity: 1,
        weight: 3,
      }).addTo(map);

      markersRef.current.push(marker);
      emitBoundaries();
    };

    // Enable cursor style
    if (mode === "draw") {
      map.getContainer().style.cursor = "crosshair";
    } else if (mode === "edit") {
      map.getContainer().style.cursor = "grab";
    } else {
      map.getContainer().style.cursor = "";
    }

    map.on("click", onMapClick);

    return () => {
      map.off("click", onMapClick);
      map.getContainer().style.cursor = "";
    };
  }, [map, mode, emitBoundaries]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      polygonRef.current?.remove();
      polygonRef.current = null;
      drawLayerRef.current?.remove();
      drawLayerRef.current = null;
    };
  }, []);

  // Delete mode
  useEffect(() => {
    if (mode === "delete" && polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      onBoundariesChange?.([]);
    }
  }, [mode, map, onBoundariesChange]);

  return null;
}

// Location search component
function LocationSearch() {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const markerRef = useRef<L.Marker | null>(null);

  const searchLocation = useCallback(async (q: string) => {
    if (!q || q.length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`
      );
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const selectResult = useCallback(
    (result: { display_name: string; lat: string; lon: string }) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      map.setView([lat, lng], 15);

      markerRef.current?.remove();
      markerRef.current = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(result.display_name)
        .openPopup();

      setResults([]);
      setQuery(result.display_name.split(",")[0]);
    },
    [map]
  );

  return (
    <div className="relative z-[1000]">
      <div className="flex gap-1">
        <input
          type="text"
          placeholder="Search location..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchLocation(e.target.value);
          }}
          className="w-full h-9 px-3 rounded-xl text-sm bg-background/90 backdrop-blur-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="p-2 rounded-xl hover:bg-muted"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 glass rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => selectResult(r)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-0"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FieldPolygonDrawer({
  initialBoundaries,
  onBoundariesChange,
  onModeChange,
  center = [40.7128, -74.006],
  zoom = 13,
  className,
}: FieldPolygonDrawerProps) {
  const [mode, setMode] = useState<DrawingMode>("none");
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
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleModeChange = (newMode: DrawingMode) => {
    setMode(newMode === mode ? "none" : newMode);
    onModeChange?.(newMode === mode ? "none" : newMode);
  };

  const handleClear = () => {
    setMode("none");
    onBoundariesChange?.([]);
  };

  // Vertex count & area display
  const vertexCount = initialBoundaries?.length || 0;

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
        zoom={zoom}
        zoomControl={false}
        className="w-full h-full min-h-[400px] lg:min-h-[500px]"
        style={{ height: isFullscreen ? "100vh" : "100%", minHeight: 400 }}
      >
        <ZoomControl position="bottomright" />

        {/* Tile layer */}
        {satelliteMode ? (
          <TileLayer
            url={SENTINEL_TILES}
            attribution='&copy; <a href="https://eox.at">EOX</a> Sentinel-2 Cloudless'
            maxZoom={19}
          />
        ) : (
          <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} maxZoom={19} />
        )}

        {/* Polygon manager */}
        <PolygonManager
          mode={mode}
          initialBoundaries={initialBoundaries}
          onBoundariesChange={onBoundariesChange}
        />

        {/* Location search control */}
        <div className="absolute top-4 left-4 z-[1000] w-72">
          <LocationSearch />
        </div>
      </MapContainer>

      {/* Top-right controls */}
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

      {/* Drawing toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] glass rounded-2xl p-1.5 shadow-lg flex items-center gap-1">
        <Button
          variant={mode === "draw" ? "default" : "ghost"}
          size="sm"
          className="h-9 px-3 text-xs"
          onClick={() => handleModeChange("draw")}
          title="Draw polygon"
        >
          <Pen size={14} className="mr-1" />
          Draw
        </Button>
        <Button
          variant={mode === "edit" ? "default" : "ghost"}
          size="sm"
          className="h-9 px-3 text-xs"
          onClick={() => handleModeChange("edit")}
          title="Edit polygon"
          disabled={vertexCount === 0}
        >
          <Move size={14} className="mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-xs text-destructive hover:text-destructive"
          onClick={handleClear}
          title="Clear polygon"
          disabled={vertexCount === 0}
        >
          <Trash2 size={14} className="mr-1" />
          Clear
        </Button>
      </div>

      {/* Info badge */}
      <div className="absolute bottom-4 right-4 z-[1000] glass rounded-xl px-3 py-1.5 text-xs text-muted-foreground shadow-lg flex items-center gap-2">
        <span>{satelliteMode ? "🛰️ Satellite" : "🗺️ Map"}</span>
        <span>·</span>
        <span>{vertexCount} vertices</span>
      </div>
    </div>
  );
}

