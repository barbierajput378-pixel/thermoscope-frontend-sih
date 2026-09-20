import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thermoscope — Industrial Fire Detection Dashboard",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
