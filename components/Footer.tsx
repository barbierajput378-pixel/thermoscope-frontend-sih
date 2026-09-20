import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="navbar-logo" style={{ width: 32, height: 32 }}>
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="15" stroke="#ff6b35" strokeWidth="1.5" opacity="0.4" />
                  <circle cx="16" cy="16" r="10" stroke="#ff6b35" strokeWidth="1.5" opacity="0.6" />
                  <circle cx="16" cy="16" r="5" fill="#ff6b35" opacity="0.9" />
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Thermoscope</div>
            </div>
            <p>
              Satellite thermal hotspot classification for early industrial fire
              detection and response. Built for SIH 2025 problem SIH26162.
            </p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-links">
              <h4>Navigate</h4>
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/analytics">Analytics</Link>
            </div>
            <div className="footer-links">
              <h4>Learn</h4>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/how-it-works#data">Data sources</Link>
              <Link href="/how-it-works#architecture">Architecture</Link>
            </div>
            <div className="footer-links">
              <h4>More</h4>
              <Link href="/alerts">Alerts</Link>
              <Link href="/how-it-works#limitations">Limitations</Link>
              <Link href="/how-it-works#team">Team</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            <span className="footer-tag">SIH26162</span> · NTRO · Team Thermoscope
          </span>
          <span>
            Built with Next.js, Supabase, and NASA FIRMS data
          </span>
        </div>
      </div>
    </footer>
  );
}
