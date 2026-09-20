"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Hotspot, Classification } from "@/lib/types";

const CLASS_LABELS: Record<Classification, string> = {
  industrial_fire: "Industrial Fire",
  gas_flare: "Gas Flare",
  wildfire: "Wildfire",
  agricultural_burning: "Agricultural",
  unclassified: "Unclassified",
};

const CLASS_COLORS: Record<Classification, string> = {
  industrial_fire: "#ff4444",
  gas_flare: "#ff8c00",
  wildfire: "#ff6600",
  agricultural_burning: "#ffd700",
  unclassified: "#888888",
};

const PRIORITY_COLORS = {
  high: "#ff4444",
  low: "#4da6ff",
};

function AnalyticsCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string;
  unit?: string;
}) {
  return (
    <div className="analytics-card">
      <div className="analytics-card-label">{label}</div>
      <div className="analytics-card-value">
        {value}
        {unit && <span className="unit"> {unit}</span>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="analytics-card">
      <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 32, width: "75%" }} />
    </div>
  );
}

function SkeletonChart({ tall }: { tall?: boolean }) {
  return (
    <div className="chart-card">
      <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 20 }} />
      <div
        className="skeleton"
        style={{ height: tall ? 360 : 320, width: "100%", borderRadius: 8 }}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  const [includeDemo, setIncludeDemo] = useState(false);
  const [allRows, setAllRows] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { data, error: supaErr } = await supabase
          .from("hotspots")
          .select("*")
          .order("created_at", { ascending: false });
        if (supaErr) throw supaErr;
        if (!cancelled) {
          setAllRows((data as Hotspot[]) ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(
    () => (includeDemo ? allRows : allRows.filter((r) => !r.is_demo)),
    [allRows, includeDemo]
  );

  const total = rows.length;
  const highPriority = rows.filter((r) => r.priority === "high").length;
  const avgConfidence = total
    ? Math.round((rows.reduce((s, r) => s + r.confidence, 0) / total) * 100)
    : 0;
  const classifiedCount = rows.filter((r) => r.classification !== "unclassified").length;
  const pctClassified = total ? Math.round((classifiedCount / total) * 100) : 0;

  const barData = useMemo(() => {
    const map: Record<string, number> = {
      industrial_fire: 0,
      gas_flare: 0,
      wildfire: 0,
      agricultural_burning: 0,
      unclassified: 0,
    };
    for (const r of rows) map[r.classification] = (map[r.classification] ?? 0) + 1;
    return Object.entries(map).map(([k, v]) => ({
      key: k,
      name: CLASS_LABELS[k as Classification],
      count: v,
    }));
  }, [rows]);

  const donutData = useMemo(() => {
    const high = rows.filter((r) => r.priority === "high").length;
    const low = rows.filter((r) => r.priority === "low").length;
    return [
      { name: "High Priority", value: high, color: PRIORITY_COLORS.high },
      { name: "Low Priority", value: low, color: PRIORITY_COLORS.low },
    ].filter((d) => d.value > 0 || total === 0);
  }, [rows, total]);

  const lineData = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const r of rows) {
      const date = r.acq_date ?? (r.created_at ? r.created_at.slice(0, 10) : "unknown");
      byDate.set(date, (byDate.get(date) ?? 0) + 1);
    }
    const entries = Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([date, count]) => ({ date, count }));
  }, [rows]);

  return (
    <div className="page-container wide">
      <h1 className="section-title">Analytics</h1>
      <p className="section-subtitle">
        Classified hotspot trends and overview statistics from the Thermoscope pipeline.
      </p>

      <div className="analytics-toolbar">
        <div className="demo-toggle-group" role="tablist" aria-label="Data mode">
          <button
            className={`demo-toggle-btn ${!includeDemo ? "active" : ""}`}
            onClick={() => setIncludeDemo(false)}
          >
            Live only
          </button>
          <button
            className={`demo-toggle-btn ${includeDemo ? "active" : ""}`}
            onClick={() => setIncludeDemo(true)}
          >
            Include demo data
          </button>
        </div>
        <div className="alerts-count">
          Showing <strong>{total}</strong> hotspot{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Stats */}
      <div className="analytics-stats">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <>
            <AnalyticsCard label="Total Hotspots" value="—" />
            <AnalyticsCard label="High Priority" value="—" />
            <AnalyticsCard label="Avg Confidence" value="—" />
            <AnalyticsCard label="% Classified" value="—" />
          </>
        ) : (
          <>
            <AnalyticsCard label="Total Hotspots" value={total} />
            <AnalyticsCard label="High Priority" value={highPriority} />
            <AnalyticsCard label="Avg Confidence" value={avgConfidence} unit="%" />
            <AnalyticsCard label="% Classified" value={pctClassified} unit="%" />
          </>
        )}
      </div>

      {/* Charts */}
      {error ? (
        <div className="error-state">
          <div className="error-state-icon">⚠</div>
          <h3>Could not load analytics data</h3>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="charts-grid">
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart tall />
        </div>
      ) : total === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No data to display</h3>
          <p>
            No hotspots match the current filter. Try toggling &quot;Include demo data&quot; to see
            seed data.
          </p>
        </div>
      ) : (
        <div className="charts-grid">
          {/* Bar chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Hotspots by Classification</div>
                <div className="chart-subtitle">Breakdown across the 5 rule-based classes</div>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 16, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-bright)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      boxShadow: "var(--shadow-card)",
                    }}
                    cursor={{ fill: "var(--bg-elevated)" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={CLASS_COLORS[entry.key as Classification]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Priority Distribution</div>
                <div className="chart-subtitle">High vs low priority hotspots</div>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-bright)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val: string) => (
                      <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{val}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line chart */}
          <div className="chart-card full">
            <div className="chart-header">
              <div>
                <div className="chart-title">Detections per Day</div>
                <div className="chart-subtitle">
                  Hotspot counts grouped by acquisition date (acq_date)
                </div>
              </div>
            </div>
            <div className="chart-container tall">
              {lineData.length === 0 ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    fontSize: 13,
                  }}
                >
                  No date information available for this dataset.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 8, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-bright)",
                        borderRadius: 8,
                        color: "var(--text-primary)",
                        boxShadow: "var(--shadow-card)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--accent-fire)"
                      strokeWidth={2.5}
                      dot={{
                        fill: "var(--accent-fire)",
                        r: 4,
                        strokeWidth: 2,
                        stroke: "var(--bg-card)",
                      }}
                      activeDot={{ r: 6, fill: "var(--accent-red)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
