"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/alerts", label: "Alerts" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("thermoscope-theme");
      const initial: "dark" | "light" =
        saved === "light" || saved === "dark" ? saved : "dark";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("thermoscope-theme", next);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <div className="navbar-logo">
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
              <div className="navbar-title">Thermoscope</div>
              <div className="navbar-subtitle">SIH26162 · NTRO</div>
            </div>
          </Link>

          <div className="navbar-nav">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-link ${isActive ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="navbar-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? "☀" : "🌙"}
            </button>
            <button
              className="hamburger-btn"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}>
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-nav-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
