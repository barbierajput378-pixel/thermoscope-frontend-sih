"use client";

import { Hotspot } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/utils";

interface HotspotPopupProps {
  hotspot: Hotspot;
}

const classificationLabels: Record<string, string> = {
  industrial_fire: "Industrial Fire",
  gas_flare: "Gas Flare",
  wildfire: "Wildfire",
  agricultural_burning: "Agricultural Burning",
  unclassified: "Unclassified",
};

const classificationColors: Record<string, string> = {
  industrial_fire: "#ff4444",
  gas_flare: "#ff8800",
  wildfire: "#ff6600",
  agricultural_burning: "#ffcc00",
  unclassified: "#888888",
};

export default function HotspotPopup({ hotspot }: HotspotPopupProps) {
  const confidence = Math.round(hotspot.confidence * 100);
  const timeAgo = formatDistanceToNow(new Date(hotspot.created_at));
  const classColor = classificationColors[hotspot.classification] ?? "#888888";

  return (
    <div className="popup-card">
      <div className="popup-header">
        <span
          className="popup-type-badge"
          style={{ background: classColor + "22", color: classColor, borderColor: classColor + "55" }}
        >
          {classificationLabels[hotspot.classification] ?? hotspot.classification}
        </span>
        <span className={`popup-priority ${hotspot.priority}`}>
          {hotspot.priority.toUpperCase()}
        </span>
      </div>

      <div className="popup-grid">
        <div className="popup-stat">
          <span className="popup-stat-label">Confidence</span>
          <div className="confidence-bar-wrap">
            <div
              className="confidence-bar-fill"
              style={{
                width: `${confidence}%`,
                background: confidence > 75 ? "#ff4444" : confidence > 50 ? "#ff8800" : "#ffc107",
              }}
            />
          </div>
          <span className="popup-stat-value">{confidence}%</span>
        </div>

        {hotspot.nearest_facility && (
          <div className="popup-stat">
            <span className="popup-stat-label">Nearest Facility</span>
            <span className="popup-stat-value facility">{hotspot.nearest_facility}</span>
          </div>
        )}

        {hotspot.distance_m != null && (
          <div className="popup-stat">
            <span className="popup-stat-label">Distance</span>
            <span className="popup-stat-value">
              {hotspot.distance_m < 1000
                ? `${Math.round(hotspot.distance_m)} m`
                : `${(hotspot.distance_m / 1000).toFixed(2)} km`}
            </span>
          </div>
        )}

        <div className="popup-stat">
          <span className="popup-stat-label">Coordinates</span>
          <span className="popup-stat-value mono">
            {hotspot.lat.toFixed(4)}°N, {hotspot.lon.toFixed(4)}°E
          </span>
        </div>

        <div className="popup-stat">
          <span className="popup-stat-label">Detected</span>
          <span className="popup-stat-value">{timeAgo}</span>
        </div>
      </div>

      {hotspot.is_demo && (
        <div className="popup-demo-notice">⚠ Demo / Seed Data</div>
      )}
    </div>
  );
}
