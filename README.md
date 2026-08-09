![AgroVision](https://github.com/user-attachments/assets/5d5f224b-1f19-46cd-9587-6fb53cca812e)

<h1 align="center">🌱 AgroVision</h1>

<p align="center">
  <strong>The Digital Twin of Your Farm</strong><br />
  A smart farm-management platform powered by AI and real-time data.
</p>

<p align="center">
  <a href="#✨-features">Features</a> •
  <a href="#🚀-getting-started">Getting Started</a> •
  <a href="#🔧-configuration">Configuration</a> •
  <a href="#🧱-project-structure">Project Structure</a> •
  <a href="#📚-tech-stack">Tech Stack</a> •
  <a href="#📄-license">License</a>
</p>

---

## ✨ Features

AgroVision brings your entire operation into one intelligent, data-driven platform:

### 🗺️ Farm Map & Fields
- **Interactive satellite map** — real-time Sentinel-2 imagery with field boundaries.
- **Field management** — create fields, draw polygons, import GPS files, and track crop health, moisture, nitrogen, and expected yield.
- **NDVI & vegetation analytics** — monitor crop health through satellite vegetation indices.

### 🌦️ Weather Intelligence
- **Hyper-local weather forecasts** integrated with AgroMonitoring.
- **Soil moisture monitoring** by depth (10cm–100cm).
- **Crop weather insights** — precipitation outlook, wind/humidity summaries, and irrigation/spraying recommendations.

### 📡 IoT Sensors
- **Sensor integration** with major IoT providers.
- **Live sensor dashboards** — soil probes, weather stations, irrigation valves.
- **Real-time AI insights** on sensor data.

### 🤖 AI Assistant
- **Intelligent recommendations** for irrigation, fertilization, pest control, and yield optimization.
- **Natural-language insights** based on your farm data.

### 📊 Analytics & Finance
- **Revenue vs. expenses** tracking with interactive charts.
- **Advanced analytics** — income, expenses, net profit, and yearly trends.
- **Exportable reports** and finance dashboards.

### 🚜 Operations
- **Machinery & fleet management** — track hours, fuel, maintenance, and assignments.
- **Workers, tasks, calendar, and inventory** in one unified dashboard.

### 🛡️ Platform
- **Authentication & email** — register, login, password reset, and verification via Resend.
- **Billing & subscriptions** — Stripe integration with plans, checkout, invoices, and webhooks.
- **Multi-language** — 11 languages (EN, ES, FR, DE, IT, PT, NL, AR, EL, ZH, JA).
- **Theming & units** — light/dark theme, multiple currencies, and metric/imperial units.
- **PWA-ready** — offline caching and installable.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.18+ (or 20+ recommended)
- **npm** (or yarn/pnpm/bun)
- A **Supabase** project (optional for auth/data)
- **Stripe** account (optional for billing)
- **Resend** account (optional for email)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/agrovizion.git
cd agrovizion

# 2. Install dependencies
npm install

# 3. Set up environment variables (see Configuration below)
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Available Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the development server         |
| `npm run build`    | Build the application for production |
| `npm run start`    | Start the production server          |
| `npm run lint`     | Run ESLint                           |

---

## 🔧 Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# --- Stripe (Billing) ---
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# --- Resend (Email) ---
RESEND_API_KEY=

# --- AgroMonitoring (Weather / Satellite) ---
AGROMONITORING_API_KEY=
AGROMONITORING_BASE_URL=

# --- App URL ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** All services are optional. The app gracefully falls back to **mock/demo data** when an integration isn't configured, so you can explore the full UI without any keys.

---

## 🧱 Project Structure

```
├── public/                  # Static assets, icons, service worker
├── scripts/
│   └── generate-icons.js    # PWA icon generation
├── src/
│   ├── app/
│   │   ├── api/             # Route handlers (auth, billing, weather, fields, sensors...)
│   │   ├── auth/            # Auth callback
│   │   ├── dashboard/       # Dashboard pages (farm-map, weather, sensors, ai, analytics...)
│   │   ├── checkout/        # Checkout page
│   │   ├── login/           # Login page
│   │   ├── pricing/         # Pricing page
│   │   ├── register/        # Register page
│   │   ├── verify-email/    # Email verification
│   │   ├── page.tsx         # Landing page (with "Watch Demo" button)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives (button, card, badge...)
│   │   ├── billing/         # Billing components (feature-gate, plan-badge)
│   │   ├── demo-video.tsx   # Animated "Watch Demo" video modal
│   │   ├── farm-map.tsx     # Leaflet satellite map
│   │   ├── sidebar.tsx      # Dashboard navigation
│   │   └── ...              # Providers, charts, widgets
│   └── lib/
│       ├── billing/         # Stripe, plans, subscriptions, webhooks
│       ├── email/           # Resend provider + React email templates
│       ├── supabase/        # Auth + data clients
│       ├── offline/         # PWA offline cache & IndexedDB
│       ├── *.service.ts     # Integrations (weather, agromonitoring, sensors, fields)
│       └── data.ts          # Mock data & types
├── supabase/
│   ├── config.toml
│   └── functions/
│       └── stripe-webhook/  # Stripe webhook edge function
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 🧪 Live Demo

The **"Watch Demo"** button on the landing page (hero section) opens a cinematic, code-based animated walkthrough of the platform. It showcases realistic mockups of the actual AgroVision pages — Dashboard, Farm Map, Weather, IoT Sensors, AI Assistant, and Analytics — with a continuous Ken Burns camera effect, a progress bar, play/pause, and prev/next controls.

---

## 📚 Tech Stack

| Layer        | Technology                                                       |
| ------------ | ---------------------------------------------------------------- |
| **Framework**| [Next.js](https://nextjs.org) (App Router) + React 19             |
| **Language** | TypeScript                                                        |
| **Styling**  | Tailwind CSS v4 + `tailwindcss-animate`                          |
| **UI Kit**   | Radix UI primitives + custom components + lucide-react icons      |
| **Motion**   | Framer Motion                                                     |
| **Charts**   | Recharts                                                          |
| **Maps**     | Leaflet + react-leaflet                                           |
| **Backend**  | Next.js Route Handlers + Supabase (auth, data)                    |
| **Payments** | Stripe (subscriptions, checkout, invoices, webhooks)              |
| **Email**    | Resend + React Email                                              |
| **i18n**     | i18next (11 languages)                                            |
| **PWA**      | Custom service worker + manifest                                  |

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<p align="center">
  Built with 💚 by <strong>Anastasios Karaivazoglou</strong><br />
  © 2024 AgroVision. All rights reserved.
</p>
