"use client";

import { FilterState, Hotspot, Classification, Priority } from "@/lib/types";

interface SidebarProps {
  hotspots: Hotspot[];
  allHotspots: Hotspot[];
  demoCount: number;
  liveCount: number;
  filters: FilterState;
  onFilterChange: (f: FilterState) => void;
  loading: boolean;
  lastRefreshed: Date | null;
  secondsUntilRefresh: number;
  onRefresh: () => void;
}

const CLASSIFICATIONS: { value: Classification | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "industrial_fire", label: "Industrial Fire" },
  { value: "gas_flare", label: "Gas Flare" },
  { value: "wildfire", label: "Wildfire" },
  { value: "agricultural_burning", label: "Agricultural Burning" },
  { value: "unclassified", label: "Unclassified" },
];

const classIcons: Record<string, string> = {
  industrial_fire: "🏭",
  gas_flare: "🔥",
  wildfire: "🌲",
  agricultural_burning: "🌾",
  unclassified: "❓",
};

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="stat-pill" style={{ "--accent": accent } as React.CSSProperties}>
      <span className="stat-pill-value">{value}</span>
      <span className="stat-pill-label">{label}</span>
    </div>
  );
}

export default function Sidebar({
  hotspots,
  allHotspots,
  demoCount,
  liveCount,
  filters,
  onFilterChange,
  loading,
  lastRefreshed,
  secondsUntilRefresh,
  onRefresh,
}: SidebarProps) {
  const highCount = hotspots.filter((h) => h.priority === "high").length;
  const lowCount = hotspots.filter((h) => h.priority === "low").length;

  const classCounts = allHotspots.reduce<Record<string, number>>((acc, h) => {
    acc[h.classification] = (acc[h.classification] ?? 0) + 1;
    return acc;
  }, {});

  const refreshMin = Math.floor(secondsUntilRefresh / 60);
  const refreshSec = secondsUntilRefresh % 60;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" stroke="#ff6b35" strokeWidth="1.5" opacity="0.4" />
            <circle cx="16" cy="16" r="10" stroke="#ff6b35" strokeWidth="1.5" opacity="0.6" />
            <circle cx="16" cy="16" r="5" fill="#ff6b35" opacity="0.9" />
            <line x1="16" y1="1" x2="16" y2="6" stroke="#ff6b35" strokeWidth="1.5" />
            <line x1="16" y1="26" x2="16" y2="31" stroke="#ff6b35" strokeWidth="1.5" />
            <line x1="1" y1="16" x2="6" y2="16" stroke="#ff6b35" strokeWidth="1.5" />
            <line x1="26" y1="16" x2="31" y2="16" stroke="#ff6b35" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <h1 className="sidebar-title">Thermoscope</h1>
          <p className="sidebar-subtitle">SIH26162 · NTRO</p>
        </div>
      </div>

      {/* Data mode badges */}
      <div className="mode-badges">
        <span className={`mode-badge live ${liveCount > 0 ? "active" : ""}`}>
          <span className="mode-dot" />
          LIVE &nbsp;<strong>{liveCount}</strong>
        </span>
        <span className={`mode-badge demo ${demoCount > 0 && filters.showDemo ? "active" : ""}`}>
          DEMO &nbsp;<strong>{demoCount}</strong>
        </span>
      </div>

      {/* Stats */}
      <section className="sidebar-section">
        <h2 className="sidebar-section-title">Overview</h2>
        <div className="stats-grid">
          <StatPill label="Visible" value={hotspots.length} accent="#6e9fff" />
          <StatPill label="High Priority" value={highCount} accent="#ff4444" />
          <StatPill label="Low Priority" value={lowCount} accent="#5bc0f8" />
          <StatPill label="Total" value={allHotspots.length} accent="#aaa" />
        </div>
      </section>

      {/* Classification breakdown */}
      <section className="sidebar-section">
        <h2 className="sidebar-section-title">By Type</h2>
        <div className="class-breakdown">
          {CLASSIFICATIONS.slice(1).map((c) => (
            <div key={c.value} className="class-row">
              <span className="class-icon">{classIcons[c.value as string]}</span>
              <span className="class-label">{c.label}</span>
              <span className="class-count">{classCounts[c.value as string] ?? 0}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="sidebar-section">
        <h2 className="sidebar-section-title">Filters</h2>

        <label className="filter-label">Classification</label>
        <select
          className="filter-select"
          value={filters.classification}
          onChange={(e) =>
            onFilterChange({ ...filters, classification: e.target.value as Classification | "all" })
          }
        >
          {CLASSIFICATIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <label className="filter-label">Priority</label>
        <div className="priority-toggle">
          {(["all", "high", "low"] as const).map((p) => (
            <button
              key={p}
              className={`priority-btn ${p} ${filters.priority === p ? "active" : ""}`}
              onClick={() => onFilterChange({ ...filters, priority: p as Priority | "all" })}
            >
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <label className="filter-label">Data Source</label>
        <div className="toggle-row">
          <span className="toggle-label">Show Demo Data</span>
          <button
            className={`toggle-switch ${filters.showDemo ? "on" : "off"}`}
            onClick={() => onFilterChange({ ...filters, showDemo: !filters.showDemo })}
            aria-label="Toggle demo data"
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </section>

      {/* Refresh status */}
      <section className="sidebar-section refresh-section">
        <div className="refresh-info">
          {loading ? (
            <span className="refresh-loading">
              <span className="spinner" /> Refreshing…
            </span>
          ) : (
            <>
              <span className="refresh-next">
                Next refresh in {refreshMin}:{String(refreshSec).padStart(2, "0")}
              </span>
              {lastRefreshed && (
                <span className="refresh-last">
                  Last: {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
            </>
          )}
        </div>
        <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
          ↻ Refresh Now
        </button>
      </section>
    </aside>
  );
}
