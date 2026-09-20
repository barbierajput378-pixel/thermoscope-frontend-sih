"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Hotspot } from "@/lib/types";
import HotspotPopup from "./HotspotPopup";

// Odisha centre
const ODISHA_CENTER: [number, number] = [20.5, 84.0];
const DEFAULT_ZOOM = 7;

// Priority → ring color
const PRIORITY_COLORS: Record<string, { fill: string; stroke: string }> = {
  high: { fill: "#ff4444", stroke: "#ff0000" },
  low: { fill: "#4da6ff", stroke: "#1a7fff" },
};

// Classification → inner color
const CLASS_INNER: Record<string, string> = {
  industrial_fire: "#ff4444",
  gas_flare: "#ff8c00",
  wildfire: "#ff6600",
  agricultural_burning: "#ffd700",
  unclassified: "#aaaaaa",
};

interface MapProps {
  hotspots: Hotspot[];
}

function getRadius(priority: string, confidence: number) {
  const base = priority === "high" ? 14 : 10;
  return base + confidence * 6;
}

// Invisible helper — brings map view to Odisha on first load
function MapInit() {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (!done.current) {
      map.setView(ODISHA_CENTER, DEFAULT_ZOOM);
      done.current = true;
    }
  }, [map]);
  return null;
}

export default function Map({ hotspots }: MapProps) {
  return (
    <MapContainer
      center={ODISHA_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      style={{ height: "100%", width: "100%", background: "#0a0f1e" }}
      className="leaflet-map"
    >
      <MapInit />
      <ZoomControl position="bottomright" />

      {/* OpenStreetMap — no API key required */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {hotspots.map((h) => {
        const colors = PRIORITY_COLORS[h.priority] ?? PRIORITY_COLORS.low;
        const innerColor = CLASS_INNER[h.classification] ?? "#aaa";
        const radius = getRadius(h.priority, h.confidence);

        return (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lon]}
            radius={radius}
            pathOptions={{
              color: colors.stroke,
              fillColor: innerColor,
              fillOpacity: 0.85,
              weight: h.priority === "high" ? 2.5 : 1.5,
              opacity: 0.9,
            }}
          >
            <Popup
              className="thermoscope-popup"
              minWidth={260}
              maxWidth={320}
            >
              <HotspotPopup hotspot={h} />
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
