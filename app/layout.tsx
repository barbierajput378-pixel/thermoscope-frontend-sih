import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Thermoscope — Industrial Fire Detection Dashboard",
    template: "%s · Thermoscope",
  },
  description:
    "Live satellite thermal hotspot monitoring dashboard for NTRO's SIH26162 industrial fire detection system over Odisha, India.",
  keywords: ["fire detection", "thermal monitoring", "NASA FIRMS", "NTRO", "SIH", "Odisha"],
  authors: [{ name: "NTRO SIH Team" }],
  openGraph: {
    title: "Thermoscope — Industrial Fire Detection",
    description: "Live satellite thermal hotspot monitoring for Odisha, India",
    type: "website",
  },
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('thermoscope-theme');
    var theme = saved === 'light' || saved === 'dark' ? saved : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <div className="app-layout">
          <Navbar />
          <main className="app-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
