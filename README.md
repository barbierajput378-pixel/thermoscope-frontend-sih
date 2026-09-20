# Thermoscope — Live Dashboard for Industrial Fire Detection (SIH26162, NTRO)

A real-time satellite thermal hotspot monitoring dashboard built with **Next.js 14** and **Supabase**.

![Thermoscope Dashboard](./public/screenshot.png)

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/thermoscope-frontend-sih.git
cd thermoscope-frontend-sih
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase anon key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://otlukkpqvzbtcexasnrf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

> ⚠️ **Never commit `.env.local`** — it's already in `.gitignore`.

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Structure

```
thermoscope-frontend-sih/
├── app/
│   ├── layout.tsx          # Root layout — fonts, metadata, SEO
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Complete design system (tokens, components)
├── components/
│   ├── Map.tsx             # Leaflet map — SSR-disabled, Stadia dark tiles
│   ├── Sidebar.tsx         # Stats, filters, live/demo badges
│   └── HotspotPopup.tsx    # Popup card shown on pin click
├── hooks/
│   └── useHotspots.ts      # Supabase data fetching + 3-min auto-refresh
├── lib/
│   ├── supabase.ts         # Supabase client (env-var based, never hardcoded)
│   ├── types.ts            # TypeScript interfaces (Hotspot, FilterState)
│   └── utils.ts            # Formatters (time-ago, distance)
├── .env.example            # Template — copy to .env.local
└── next.config.ts
```

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🗺️ Full-screen map | React-Leaflet with Stadia Maps dark tiles, centered on Odisha |
| 📍 Color-coded pins | 🔴 Red = high priority · 🔵 Blue = low priority |
| 📐 Confidence sizing | Pin radius scales with confidence score |
| 💬 Rich popups | Classification badge, confidence bar, facility name, distance, time-ago |
| 🔍 Filters | By classification type, priority (high/low), demo/live data toggle |
| 📊 Live stats | Visible count, high/low breakdown, per-type counts |
| 🟢 Data-mode badge | Green LIVE badge vs amber DEMO badge |
| ⏱️ Auto-refresh | Re-fetches from Supabase every 3 minutes with countdown timer |
| 📱 Responsive | Mobile sidebar with slide-out toggle |

---

## 🔌 Supabase Integration

- **Read-only**: Only reads from the `hotspots` table — never writes
- **Client-side filtering**: Filters are applied in-memory after fetch
- **Polling**: Standard `setInterval` re-queries every 3 minutes
- **Error handling**: Shows an error banner with a Retry button on failed fetches

---

## 🚢 Deploy to Vercel

```bash
npm install -g vercel
vercel deploy
```

Set the same env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel dashboard under **Project Settings → Environment Variables**.

---

## 🗂️ Hotspot Table Schema

```sql
CREATE TABLE hotspots (
  id                SERIAL PRIMARY KEY,
  lat               FLOAT NOT NULL,
  lon               FLOAT NOT NULL,
  classification    TEXT NOT NULL,  -- industrial_fire | gas_flare | wildfire | agricultural_burning | unclassified
  confidence        FLOAT NOT NULL, -- 0 to 1
  priority          TEXT NOT NULL,  -- high | low
  nearest_facility  TEXT,
  distance_m        FLOAT,
  is_demo           BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🛠️ Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Supabase JS** (`@supabase/supabase-js`)
- **React-Leaflet** + Stadia Maps dark tiles
- **Vanilla CSS** (no Tailwind, no UI library — full custom design system)
