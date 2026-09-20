const TEAM = [
  { name: "Aarav Sharma", role: "Team Lead · Full-Stack", initials: "AS" },
  { name: "Priya Nair", role: "Data Engineering", initials: "PN" },
  { name: "Rohan Mehta", role: "GIS & Mapping", initials: "RM" },
  { name: "Ananya Reddy", role: "UI/UX & Frontend", initials: "AR" },
];

export default function HowItWorksPage() {
  return (
    <div className="page-container">
      <h1 className="section-title">How Thermoscope works</h1>
      <p className="section-subtitle">
        An honest, rule-based approach to satellite thermal hotspot classification.
        No machine-learning black boxes — just transparent heuristics you can verify.
      </p>

      {/* Data sources */}
      <section className="hiw-section" id="data">
        <h2>
          <span className="hiw-section-icon">📥</span>
          Data sources
        </h2>
        <p>
          Thermoscope combines three public data sources — none of which we host
          ourselves. All credit goes to the agencies and communities that publish
          them.
        </p>
        <ul style={{ marginTop: 14 }}>
          <li>
            <strong>NASA FIRMS (VIIRS):</strong> The Visible Infrared Imaging
            Radiometer Suite aboard the Suomi-NPP and NOAA-20 satellites scans the
            Earth for thermal anomalies twice per orbit, delivering a global feed
            of hotspot pixels with ~375 m resolution. We pull from FIRMS every 3
            hours on the dot.
          </li>
          <li>
            <strong>OpenStreetMap — industrial facilities (Overpass API):</strong>
            For every new pixel, we query Overpass for tagged factories, refineries,
            power plants, steel works and chemical works within a 5 km radius.
            These are the &quot;known hot things&quot; we compare the satellite reading
            against.
          </li>
          <li>
            <strong>OpenStreetMap — land cover:</strong> OSM land-use tags
            (<code>landuse=forest</code>, <code>landuse=farmland</code>,
            <code> natural=scrub</code>, etc.) provide a second fallback
            classification axis when no facility is nearby.
          </li>
        </ul>
        <div className="hiw-note">
          <strong style={{ color: "var(--text-primary)" }}>Heads up:</strong> OSM
          coverage varies wildly across Odisha. Rural land-cover tags are much
          sparser than urban facility tags, so classification confidence drops
          accordingly where the map is thin.
        </div>
      </section>

      {/* Classification logic */}
      <section className="hiw-section">
        <h2>
          <span className="hiw-section-icon">⚙️</span>
          Classification logic
        </h2>
        <p>
          Every hotspot runs through the same deterministic decision tree. The
          order matters: proximity to a known facility wins over land cover,
          because industrial fires are the priority outcome we are trying not to
          miss.
        </p>
        <ul style={{ marginTop: 14 }}>
          <li>
            <strong>Step 1 — Facility within 1 km → Industrial family.</strong> If
            the centroid of the pixel is within 1,000 metres of any OSM-tagged
            industrial point or polygon, the hotspot is marked as
            <em>industrial_fire</em> by default.
          </li>
          <li>
            <strong>Step 2 — Persistence check → Gas flare.</strong> Before we
            settle on <em>industrial_fire</em>, we look back at every prior
            detection we have ever recorded within 200 m of this pixel. If we
            already saw heat at this exact spot on 6+ of the last 10 satellite
            passes, it is almost certainly an always-on flare stack, not an
            accident → reclassified as <em>gas_flare</em> with low priority.
          </li>
          <li>
            <strong>Step 3 — No facility? Try land cover.</strong> If nothing
            tagged &quot;industrial&quot; is within 5 km, we check the dominant OSM
            land-cover tag within the pixel:
            <ul style={{ marginTop: 6, paddingLeft: 16 }}>
              <li><code>forest</code> / <code>wood</code> → wildfire</li>
              <li><code>farmland</code> / <code>orchard</code> / <code>vineyard</code> → agricultural_burning</li>
            </ul>
          </li>
          <li>
            <strong>Step 4 — Catch-all.</strong> If none of the above match, the
            hotspot stays <em>unclassified</em> with a confidence score that
            reflects how close it came to matching any rule.
          </li>
        </ul>
      </section>

      {/* Persistence */}
      <section className="hiw-section">
        <h2>
          <span className="hiw-section-icon">⏱</span>
          Persistence: why time matters
        </h2>
        <p>
          The same coordinate appearing repeatedly in FIRMS tells a very
          different story from a one-off spike. Thermoscope keeps a running
          history of every detection at each spatial bucket:
        </p>
        <ul style={{ marginTop: 14 }}>
          <li>
            <strong>Always-on source (likely gas flare):</strong> heat present at
            the same location across multiple days and multiple passes. Low
            priority. No alert needed.
          </li>
          <li>
            <strong>New spike near a facility (likely incident):</strong> first
            appearance at coordinates within 1 km of a plant, with no recent
            history. High priority. Flagged for immediate analyst review.
          </li>
          <li>
            <strong>Smouldering wildfire:</strong> growing extent over 2–3 passes
            with matching land cover. Routed as low/medium priority depending on
            proximity to settlements.
          </li>
        </ul>
      </section>

      {/* Priority & confidence */}
      <section className="hiw-section">
        <h2>
          <span className="hiw-section-icon">🎯</span>
          Priority and confidence
        </h2>
        <p>
          Two parallel scores are attached to every row:
        </p>
        <ul style={{ marginTop: 14 }}>
          <li>
            <strong>Priority (high / low):</strong> Binary decision based
            exclusively on classification + novelty. A <em>new</em>{" "}
            <em>industrial_fire</em> is always high. Gas flares, agricultural
            burns and unclassified pixels are always low. Wildfires default to
            low but promote to high if they grow 3× in 24 hours.
          </li>
          <li>
            <strong>Confidence (0.0–1.0):</strong> A continuous score that
            encodes how strongly the rules matched. For facility-based calls it
            decays linearly from 1.0 at 0 m to 0.5 at 1,000 m. For land-cover
            calls it starts at 0.7 and drops if the surrounding tags are sparse.
          </li>
        </ul>
      </section>

      {/* Architecture diagram */}
      <section className="hiw-section" id="architecture">
        <h2>
          <span className="hiw-section-icon">🏗</span>
          End-to-end architecture
        </h2>
        <p>
          A diagram of the full pipeline from raw satellite data to the browser
          you are reading this in.
        </p>
        <div className="arch-diagram">
          <div className="arch-node">
            <div className="arch-node-icon">⚡</div>
            <div className="arch-node-label">GitHub Actions</div>
            <div className="arch-node-sub">Cron · every 3 hours</div>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-node">
            <div className="arch-node-icon">🐍</div>
            <div className="arch-node-label">Python Pipeline</div>
            <div className="arch-node-sub">FIRMS + Overpass</div>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-node">
            <div className="arch-node-icon">🐘</div>
            <div className="arch-node-label">Supabase</div>
            <div className="arch-node-sub">Postgres + PostGIS</div>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-node">
            <div className="arch-node-icon">▲</div>
            <div className="arch-node-label">Next.js Dashboard</div>
            <div className="arch-node-sub">Vercel · browser</div>
          </div>
        </div>
        <ul style={{ marginTop: 8 }}>
          <li>
            <strong>Ingestion:</strong> A GitHub Actions workflow pulls FIRMS
            CSV, calls Overpass for OSM context, runs the classifier, and UPSERTs
            into Supabase via the service-role key.
          </li>
          <li>
            <strong>Storage:</strong> Supabase Postgres with the PostGIS
            extension enabled, so distance queries and clustering are native
            SQL. Row-level security on the public <code>hotspots</code> table is
            configured to SELECT-only for the anonymous key; the{" "}
            <code>alerts</code> table has no public access at all and is
            reserved for a future backend service.
          </li>
          <li>
            <strong>Delivery:</strong> This Next.js app reads the{" "}
            <code>hotspots</code> table client-side through the Supabase JS SDK
            using only the publishable anon key. Nothing is ever written from
            the browser.
          </li>
        </ul>
      </section>

      {/* Limitations and future scope */}
      <section className="hiw-section" id="limitations">
        <h2>
          <span className="hiw-section-icon">🧭</span>
          Limitations and future scope
        </h2>
        <p>
          Thermoscope is a Smart India Hackathon prototype. It is deliberately
          simple, and the list of things we know we are missing is the roadmap:
        </p>
        <ul style={{ marginTop: 14 }}>
          <li>
            <strong>Land-cover coverage from OSM is patchy.</strong> Outside of
            major industrial corridors, a lot of Odisha has sparse land-use
            tags, which means a meaningful share of hotspots end up
            &quot;unclassified&quot;. Planned fix: fall back to{" "}
            <em>ESA WorldCover</em> 10 m raster data for a uniform land-cover
            layer everywhere.
          </li>
          <li>
            <strong>No visual confirmation today.</strong> Thermal anomalies
            could be anything from a factory fire to a wedding bonfire. Planned:
            pull the corresponding <em>Sentinel-2</em> true-colour tile for each
            hotspot and show a thumbnail in the popup so an analyst can eyeball
            it.
          </li>
          <li>
            <strong>Alerts page is a prototype.</strong> The &quot;Would
            notify&quot; field uses hardcoded placeholder fire stations. Planned:
            a small serverless Supabase Edge Function that geocodes the nearest
            fire service and actually dispatches email + SMS via a provider
            like MSG91 or AWS SNS.
          </li>
          <li>
            <strong>VIIRS resolution limits</strong> (~375 m) mean a single
            pixel can cover multiple buildings, so smaller fires or fires deep
            inside a facility boundary can be lumped together.
          </li>
        </ul>
      </section>

      {/* Team */}
      <section className="hiw-section" id="team">
        <h2>
          <span className="hiw-section-icon">👥</span>
          Team Thermoscope
        </h2>
        <p>
          Built for problem SIH26162 — NTRO — at the Smart India Hackathon 2025.
        </p>
        <div className="team-grid">
          {TEAM.map((m) => (
            <div className="team-card" key={m.name}>
              <div className="team-avatar">{m.initials}</div>
              <div className="team-name">{m.name}</div>
              <div className="team-role">{m.role}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
