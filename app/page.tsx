"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Hotspot } from "@/lib/types";

interface LandingStats {
  total: number;
  highPriority: number;
  live: number;
  demo: number;
}

export default function LandingPage() {
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { data, error: supaErr } = await supabase
          .from("hotspots")
          .select("priority, is_demo");
        if (supaErr) throw supaErr;
        if (cancelled) return;
        const rows = (data as Pick<Hotspot, "priority" | "is_demo">[]) ?? [];
        setStats({
          total: rows.length,
          highPriority: rows.filter((r) => r.priority === "high").length,
          live: rows.filter((r) => !r.is_demo).length,
          demo: rows.filter((r) => r.is_demo).length,
        });
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load stats");
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

  const StatCard = ({
    label,
    value,
    icon,
    accent,
    skeleton,
  }: {
    label: string;
    value: number | string;
    icon: string;
    accent: string;
    skeleton?: boolean;
  }) => (
    <div className="stat-card" style={{ ["--accent" as any]: accent }}>
      <div className="stat-card-icon" style={{ color: accent, background: `${accent}18` }}>
        {skeleton ? <div className="skeleton" style={{ width: 24, height: 24 }} /> : icon}
      </div>
      {skeleton ? (
        <>
          <div className="skeleton value" />
          <div className="skeleton label" />
        </>
      ) : (
        <>
          <div className="stat-card-value">{value}</div>
          <div className="stat-card-label">{label}</div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            LIVE · Satellite Thermal Monitoring
          </div>
          <h1>
            See what is <span className="accent">actually burning</span> from space.
          </h1>
          <p className="hero-subtitle">
            Satellites detect heat, but not what is burning. Thermoscope tells an
            industrial fire from a gas flare, a wildfire or crop burning.
          </p>
          <div className="hero-buttons">
            <Link href="/dashboard" className="btn btn-primary">
              🗺 Open Dashboard
            </Link>
            <Link href="/how-it-works" className="btn btn-secondary">
              How it works →
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="stats-row">
        {loading ? (
          <>
            <StatCard label="" value="" icon="" accent="#4da6ff" skeleton />
            <StatCard label="" value="" icon="" accent="#ff4444" skeleton />
            <StatCard label="" value="" icon="" accent="#22c55e" skeleton />
          </>
        ) : error ? (
          <>
            <StatCard label="Total Hotspots" value="—" icon="🔥" accent="#4da6ff" />
            <StatCard label="High Priority" value="—" icon="⚠" accent="#ff4444" />
            <StatCard label="Live vs Demo" value="—" icon="📡" accent="#22c55e" />
          </>
        ) : (
          <>
            <StatCard
              label="Total Hotspots"
              value={stats!.total}
              icon="🔥"
              accent="#ff6b35"
            />
            <StatCard
              label="High Priority"
              value={stats!.highPriority}
              icon="⚠"
              accent="#ff4444"
            />
            <StatCard
              label={`Live · ${stats!.live}  |  Demo · ${stats!.demo}`}
              value={stats!.live}
              icon="📡"
              accent="#22c55e"
            />
          </>
        )}
      </section>

      {/* How It Works Strip */}
      <section className="how-strip">
        <h2 className="section-title" style={{ textAlign: "center" }}>
          How Thermoscope works
        </h2>
        <p className="section-subtitle" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          A four-step rule-based pipeline that turns raw satellite pixels into
          actionably classified hotspots.
        </p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">🛰</div>
            <h3 className="step-title">NASA FIRMS Detections</h3>
            <p className="step-desc">
              VIIRS thermal anomalies pulled every 3 hours — raw pixels where the
              surface is measurably hotter than its surroundings.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">🗺</div>
            <h3 className="step-title">OSM Context Layer</h3>
            <p className="step-desc">
              Overpass API fetches nearby industrial facilities and land-cover
              tags from OpenStreetMap to ground-truth each pixel.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">🧠</div>
            <h3 className="step-title">Rule-Based Classification</h3>
            <p className="step-desc">
              Distance thresholds, persistence checks and land-cover heuristics
              separate flares from fires, farms from forests.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-icon">📊</div>
            <h3 className="step-title">Live Map & Alerts</h3>
            <p className="step-desc">
              Classified hotspots land on a priority-ranked map with confidence
              scores, ready for analyst review and dispatch.
            </p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="why-section">
        <div className="why-inner">
          <h2 className="section-title" style={{ textAlign: "center" }}>
            Why it matters
          </h2>
          <p className="section-subtitle" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            Every second counts when a chemical plant or refinery catches fire.
            Thermoscope cuts through the noise.
          </p>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">🚨</div>
              <h3 className="why-title">Catch industrial accidents early</h3>
              <p className="why-desc">
                A new thermal spike within 1 km of a refinery is flagged as
                high-priority within minutes, giving fire services a crucial
                head start over traditional reporting.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🔥</div>
              <h3 className="why-title">Ignore always-on flares</h3>
              <p className="why-desc">
                Gas flares that burn at the same coordinates day after day are
                deliberately deprioritised, so responders are not desensitised
                by constant false positives.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">👀</div>
              <h3 className="why-title">Prioritise what needs a human check</h3>
              <p className="why-desc">
                Confidence scoring and classification sorting means analysts
                spend their time only on the detections where a human eye can
                actually change the outcome.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
