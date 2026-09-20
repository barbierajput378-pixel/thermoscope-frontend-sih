"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import { useHotspots } from "@/hooks/useHotspots";
import { FilterState } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const DEFAULT_FILTERS: FilterState = {
  classification: "all",
  priority: "all",
  showDemo: true,
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const {
    hotspots,
    allHotspots,
    demoCount,
    liveCount,
    loading,
    error,
    lastRefreshed,
    secondsUntilRefresh,
    refresh,
  } = useHotspots(filters);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dashboard-page">
      <div className="dashboard-root">
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        <div className={`sidebar-wrapper ${sidebarOpen ? "open" : "closed"}`}>
          <Sidebar
            hotspots={hotspots}
            allHotspots={allHotspots}
            demoCount={demoCount}
            liveCount={liveCount}
            filters={filters}
            onFilterChange={setFilters}
            loading={loading}
            lastRefreshed={lastRefreshed}
            secondsUntilRefresh={secondsUntilRefresh}
            onRefresh={refresh}
          />
        </div>

        <main className="map-wrapper">
          {error && (
            <div className="error-banner">
              <span>⚠ {error}</span>
              <button onClick={refresh}>Retry</button>
            </div>
          )}

          {loading && !allHotspots.length && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <p>Loading hotspot data…</p>
            </div>
          )}

          <Map hotspots={hotspots} />

          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-dot high" />
              High Priority
            </div>
            <div className="legend-item">
              <span className="legend-dot low" />
              Low Priority
            </div>
            <div className="legend-note">
              Size reflects confidence
            </div>
          </div>

          {!loading && (
            <div className="map-chip">
              {hotspots.length} hotspot{hotspots.length !== 1 ? "s" : ""} shown
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
