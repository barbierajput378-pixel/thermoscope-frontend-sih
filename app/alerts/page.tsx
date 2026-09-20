"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Hotspot } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/utils";

const CLASS_LABELS: Record<string, string> = {
  industrial_fire: "Industrial Fire",
  gas_flare: "Gas Flare",
  wildfire: "Wildfire",
  agricultural_burning: "Agricultural Burning",
  unclassified: "Unclassified",
};

const CLASS_ICONS: Record<string, string> = {
  industrial_fire: "🏭",
  gas_flare: "🔥",
  wildfire: "🌲",
  agricultural_burning: "🌾",
  unclassified: "❓",
};

// Dummy list of nearest fire stations for simulated notifications
const DUMMY_STATIONS = [
  "Bhubaneswar Central Fire Station",
  "Cuttack Fire & Emergency Services",
  "Rourkela Steel Plant Fire Brigade",
  "Paradip Port Fire Station",
  "Puri Town Fire Office",
  "Berhampur Municipal Fire Station",
  "Sambalpur District Emergency Services",
  "Balasore Fire & Rescue",
];

function pickStation(lat: number, lon: number, id: number) {
  const idx = (Math.abs(Math.round((lat + lon) * 1000)) + id) % DUMMY_STATIONS.length;
  return DUMMY_STATIONS[idx];
}

export default function AlertsPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { data, error: supaErr } = await supabase
          .from("hotspots")
          .select("*")
          .eq("priority", "high")
          .order("created_at", { ascending: false });
        if (supaErr) throw supaErr;
        if (!cancelled) {
          setHotspots((data as Hotspot[]) ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load alerts");
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const sendTestAlert = () => {
    showToast("Demo only — no message sent. Live routing is future scope.");
  };

  return (
    <div className="page-container wide">
      <h1 className="section-title">Alerts</h1>
      <p className="section-subtitle">
        Simulated dispatch feed for high-priority hotspots. Live routing to fire
        services is planned work.
      </p>

      <div className="alerts-banner">
        <div className="alerts-banner-icon">⚠</div>
        <div className="alerts-banner-text">
          <div className="alerts-banner-title">Prototype — simulated alerts</div>
          <div className="alerts-banner-desc">
            Rows below are pulled from high-priority hotspots in the database,
            but the &quot;Would notify&quot; field uses placeholder fire-station
            names. No email, SMS or public-safety message is sent anywhere.
          </div>
        </div>
      </div>

      <div className="alerts-toolbar">
        <div className="alerts-count">
          <strong>{hotspots.length}</strong> high-priority alert
          {hotspots.length !== 1 ? "s" : ""}
          {loading && <> · loading…</>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={sendTestAlert}>
          🔔 Send test alert
        </button>
      </div>

      {error ? (
        <div className="error-state">
          <div className="error-state-icon">⚠</div>
          <h3>Could not load alerts</h3>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="alerts-list" style={{ opacity: 0.6 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="alert-card" key={i} style={{ opacity: 0.6 }}>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%" }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 14, width: "55%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : hotspots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No high-priority alerts right now</h3>
          <p>
            All clear — the pipeline has not flagged any new industrial fires or
            escalated wildfires in the latest batch.
          </p>
        </div>
      ) : (
        <div className="alerts-list">
          {hotspots.map((h) => {
            const station = pickStation(h.lat, h.lon, h.id);
            const timeAgo = h.created_at
              ? formatDistanceToNow(new Date(h.created_at))
              : "unknown";
            return (
              <article className="alert-card" key={h.id}>
                <div className="alert-icon">{CLASS_ICONS[h.classification] ?? "🚨"}</div>
                <div className="alert-body">
                  <div className="alert-top-row">
                    <span className="alert-type">
                      {CLASS_LABELS[h.classification] ?? h.classification}
                    </span>
                    <span className="status-badge simulated">
                      <span className="status-badge-dot" />
                      Simulated
                    </span>
                    {h.is_demo && (
                      <span
                        className="status-badge"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.3)",
                          color: "var(--accent-amber)",
                        }}
                      >
                        Demo
                      </span>
                    )}
                  </div>
                  <div className="alert-location">
                    {h.nearest_facility
                      ? `Near ${h.nearest_facility} · ${h.distance_m != null ? (h.distance_m < 1000 ? `${Math.round(h.distance_m)} m` : `${(h.distance_m / 1000).toFixed(2)} km`) : "facility proximity"}`
                      : `${h.lat.toFixed(3)}°N, ${h.lon.toFixed(3)}°E`}
                    {h.acq_date && ` · detected ${h.acq_date}`}
                  </div>
                  <div className="alert-notify">
                    📢 Would notify: <strong>{station}</strong>
                  </div>
                </div>
                <div className="alert-time">{timeAgo}</div>
              </article>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <div className="toast-icon">ℹ</div>
          <div className="toast-text">{toast}</div>
        </div>
      )}
    </div>
  );
}
