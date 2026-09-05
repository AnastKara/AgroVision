#  AgroVision

<p align="center">
  <img src="https://github.com/user-attachments/assets/5d5f224b-1f19-46cd-9587-6fb53cca812e" alt="AgroVision — The Digital Twin of Your Farm" width="100%" />
</p>

<p align="center">
  <strong>The Digital Twin of Your Farm</strong><br />
  A full‑stack smart farm‑management platform that fuses satellite intelligence, weather forecasting, IoT telemetry, AI assistance, and financial analytics into one connected workspace.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS%20v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white" alt="Resend" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#dashboard-modules">Dashboard Modules</a> •
  <a href="#plans-and-pricing">Plans & Pricing</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Configuration</a> •
  <a href="#integrations">Integrations</a> •
  <a href="#api-routes">API</a> •
  <a href="#live-demo">Live Demo</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

##  Overview

AgroVision turns scattered farm data — satellite imagery, weather, soil probes, machinery logs, and ledgers — into a single, decision-grade platform. Built on **Next.js 16 (App Router)** with React 19 and TypeScript, it pairs a **Supabase**-backed data layer with **Stripe** subscription billing and **Resend** transactional email, and ships with an AI agronomy assistant, NDVI analytics, IoT sensor integrations, and a fully responsive, themeable, installable **(PWA)** interface.

**Every external integration is optional.** When an API key is not configured, AgroVision gracefully falls back to realistic mock data — so the complete product experience is explorable from your very first `npm run dev`, with zero setup required.

##  Features

###  Farm Map & Field Management
- **Interactive satellite map** (Leaflet) with field boundaries and crop overlays.
- **Field management tools** — create fields, draw editable polygons directly on the map, or import GPS coordinates.
- **Per-field crop intelligence** — track crop health, soil moisture, nitrogen, and expected yield.
- **NDVI vegetation analytics** — monitor crop vigor over time and flag areas of concern.

###  Weather Intelligence
- **Hyper-local multi-day forecasts** backed by AgroMonitoring with an OpenWeatherMap fallback.
- **Soil moisture monitoring by depth** (10 cm–100 cm) to guide irrigation decisions.
- **Crop weather insights** — precipitation outlook, wind/humidity summaries, and recommended spraying/irrigation windows.

###  IoT Sensor Integration
- **Plug-and-play connectivity** with major IoT sensor providers (soil probes, weather stations, irrigation valves).
- **Live sensor dashboards** with real-time readings, status, and alerting.
- **AI-generated insights** over streaming sensor data.

###  AI Farming Assistant
- **Natural-language chat** over your farm data.
- **Actionable recommendations** for irrigation, fertilization, pest control, and yield optimization.

###  Analytics & Finance
- **Revenue vs. expenses tracking** with interactive charts built on Recharts.
- **Advanced analytics** — income, expenses, net profit, and yearly trends.
- **Exportable reports** and a financial dashboard designed for planning.

###  Operations Suite
- **Machinery & fleet management** — track hours, fuel, maintenance, and assignments.
- **Workers, tasks, calendar, inventory, notifications, and livestock** — one unified operations dashboard.

###  Platform Foundation
- **Full auth lifecycle** — registration, login, email verification, and password reset.
- **Subscription billing** — three plans, monthly/yearly billing, invoices, and Stripe webhooks.
- **11 languages** — English, Español, Français, Deutsch, Italiano, Português, Nederlands, العربية, Ελληνικά, 中文, 日本語.
- **Adaptable workspace** — light/dark theme, multi-currency, and metric/imperial units.
- **PWA-ready** — offline caching, installable manifest, and app shortcuts.
- **SaaS feature-gating** — capability flags and plan limits drive the UI on a per-account basis.

##  Dashboard Modules

AgroVision ships with a complete, modular dashboard. Each module is built on top of the same design system and feature-gating layer.

| Module                     | What you can do                                                                 |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Dashboard**              | Real-time overview of fields, weather, finances, tasks, and machinery status.     |
| **Farm Map**               | Interactive Leaflet map with editable field polygons and satellite basemaps.      |
| **Fields**                 | Create and edit fields, draw polygons, import GPS, and review NDVI/crop health.   |
| **Weather**                | Forecasts, soil moisture by depth, and irrigation/spraying recommendations.       |
| **Sensors**                | IoT provider integrations, live dashboards, and AI-powered sensor insights.       |
| **AI**                     | Natural-language assistant that answers questions about your farm data.           |
| **Analytics**              | Revenue/expenses, net profit, yearly trends, and exportable reports.              |
| **Finance**                | Budgeting and expense tracking with detailed reporting.                           |
| **Machinery**              | Fleet management — hours, fuel, maintenance, and assignments.                     |
| **Workers**                | Team directory with roles and contact details.                                    |
| **Tasks**                  | Drag-and-drop task boards to keep operations moving.                              |
| **Calendar**               | Farm activities and scheduling in one view.                                       |
| **Inventory**              | Track inputs, supplies, and stock levels.                                         |
| **Animals**                | Livestock and herd management.                                                    |
| **Marketplace**            | In-platform marketplace to connect growers with suppliers.                        |
| **Notifications**          | Alert center for weather, sensors, billing, and system events.                    |
| **Billing**                | Subscription management, invoices, and plan details.                              |
| **Settings**               | Profile, language, theme, currency, and units.                                    |
| **Pricing**                | Public pricing page with plan comparison and checkout.                            |

##  Plans and Pricing

Three subscription tiers, billed monthly or yearly, managed end-to-end through Stripe.

| Plan           | Price           | Best for                     | Highlights                                                                |
| -------------- | --------------- | ---------------------------- | ------------------------------------------------------------------------- |
| **Starter**    | $29/mo · $290/yr| Small family farms           | 50 acres · basic analytics · weather · tasks · satellite monitoring · limited AI |
| **Professional** | $79/mo · $790/yr | Growing operations        | 500 acres · AI assistant · satellite & crop-health monitoring · IoT sensors · API access · unlimited AI |
| **Enterprise** | $199/mo · $1,990/yr | Large-scale operations | Unlimited acres · premium AI models · custom integrations · white-label · on-premise option · SLA |

> A **demo/simulation endpoint** (`/api/billing/simulate`) makes it easy to exercise the full billing lifecycle during development.

##  Tech Stack

| Layer            | Technology                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| **Framework**    | [Next.js](https://nextjs.org) 16 (App Router) + Server Components          |
| **UI Runtime**   | [React](https://react.dev) 19                                               |
| **Language**     | [TypeScript](https://www.typescriptlang.org)                                |
| **Styling**      | [Tailwind CSS](https://tailwindcss.com) v4 + `tailwindcss-animate` + `class-variance-authority` |
| **UI Kit**       | [Radix UI](https://www.radix-ui.com) primitives, [lucide-react](https://lucide.dev) icons, [Framer Motion](https://www.framer.com/motion/) animations |
| **Charts**       | [Recharts](https://recharts.org)                                            |
| **Maps**         | [Leaflet](https://leafletjs.com) + `react-leaflet`                           |
| **Drag & Drop**  | `@hello-pangea/dnd`                                                          |
| **Backend**      | Next.js Route Handlers + [Supabase](https://supabase.com) (auth & data)     |
| **Payments**     | [Stripe](https://stripe.com) — checkout, subscriptions, invoices, webhooks  |
| **Email**        | [Resend](https://resend.com) + [React Email](https://react.email) templates |
| **i18n**         | [i18next](https://www.i18next.com) + `react-i18next` (11 languages, LibreTranslate fallback) |
| **PWA**          | Custom service worker (`public/sw.js`) + generated web manifest             |

##  Architecture

AgroVision is a full-stack application built on the Next.js App Router. Server components render the dashboard shells, while route handlers under `src/app/api` act as a single origin — they protect integration keys, enforce **authentication and plan gates**, and proxy third-party services. Supabase handles authentication and data persistence, Stripe reconciles subscriptions through a dedicated Edge Function webhook, and a provider-based composable UI layer keeps the experience consistent across every module.

```
agrovizion/
├── public/                        # Static assets, PWA icons, service worker (sw.js)
├── scripts/
│   └── generate-icons.js          # PWA icon generation
├── src/
│   ├── app/
│   │   ├── (marketing)/           # Landing, pricing, login/register, forgot-password
│   │   ├── auth/callback          # Supabase auth redirect handling
│   │   ├── dashboard/             # All 19 modules: farm-map, fields, weather, sensors,
│   │   │                          #   ai, analytics, finance, machinery, workers, tasks,
│   │   │                          #   calendar, inventory, animals, marketplace,
│   │   │                          #   notifications, billing, settings, ...
│   │   ├── api/                   # Route handlers (see API Routes below)
│   │   ├── checkout/              # Stripe checkout page
│   │   ├── verify-email/          # Email verification flow
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx             # Root layout
│   │   ├── manifest.ts            # PWA web manifest
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # Radix-based primitives (button, card, dialog, ...)
│   │   ├── billing/               # Feature-gate, plan-badge, subscription UI
│   │   ├── demo-video.tsx         # Cinematic "Watch Demo" walkthrough
│   │   ├── farm-map.tsx           # Leaflet satellite map
│   │   ├── ndvi-analytics-dashboard.tsx
│   │   ├── sidebar.tsx            # Dashboard navigation
│   │   └── *_provider.tsx         # Theme, language, currency, units, PWA providers
│   └── lib/
│       ├── billing/               # Stripe provider, plans, subscriptions, webhooks, gates
│       ├── email/                 # Resend provider + React Email templates
│       ├── supabase/              # Auth + database clients
│       ├── offline/               # Service-worker offline cache
│       ├── *.service.ts           # Weather, agro-monitoring, sensors, NDVI, export
│       └── data.ts                # Mock data & shared types
├── supabase/
│   ├── config.toml
│   └── functions/stripe-webhook/  # Stripe webhook Edge Function
├── .env.example                   # Environment template
├── next.config.ts
├── package.json
└── tsconfig.json
```

##  Getting Started

### Prerequisites

- **Node.js** `>= 20.9.0` (LTS 22 recommended)
- **npm** (or yarn / pnpm / bun)
- Optional accounts for live integrations: Supabase, Stripe, Resend, AgroMonitoring, OpenWeatherMap

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AnastKara/AgroVision.git
cd AgroVision

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local
# (Windows PowerShell: Copy-Item .env.example .env.local)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. The app runs fully on mock data until you add API keys.

### Available Scripts

| Command         | Description                                |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Start the development server (hot reload)  |
| `npm run build` | Build the application for production       |
| `npm start`     | Start the production server                |
| `npm run lint`  | Run ESLint across the codebase             |

##  Environment Variables

Copy `.env.example` to `.env.local` and fill in the values you need. **All variables are optional** — the app falls back to demo data for any service that is not configured.

| Variable                                    | Required | Description                                            |
| ------------------------------------------- | -------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`                  | Opt.     | Supabase project URL                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`             | Opt.     | Supabase public anon key                               |
| `SUPABASE_SERVICE_ROLE_KEY`                 | Opt.     | Supabase service-role key (server-only)                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`        | Opt.     | Stripe publishable key                                 |
| `STRIPE_SECRET_KEY`                         | Opt.     | Stripe secret key                                      |
| `STRIPE_WEBHOOK_SECRET`                     | Opt.     | Stripe webhook signing secret                          |
| `STRIPE_PRICE_STARTER/PROFESSIONAL/ENTERPRISE_{MONTHLY,YEARLY}` | Opt. | Stripe Price IDs for the three plans and two billing cycles |
| `PAYMENT_PROVIDER`                          | Opt.     | `stripe` (default) — reserved for future providers      |
| `AGROMONITORING_API_KEY`                    | Opt.     | AgroMonitoring satellite & weather API key             |
| `OPENWEATHER_API_KEY`                       | Opt.     | OpenWeatherMap fallback key                            |
| `DEFAULT_FARM_LAT` / `DEFAULT_FARM_LON`     | Opt.     | Default farm coordinates for the map                   |
| `NEXT_PUBLIC_APP_URL`                       | Opt.     | Public app URL (defaults to `http://localhost:3000`)   |
| `RESEND_API_KEY`                            | Opt.     | Resend API key for transactional email                 |
| `EMAIL_FROM`                                | Opt.     | Sender address for outgoing email                      |

## 🔌 Integrations

| Service           | Role                                                            | Used When                                      |
| ----------------- | --------------------------------------------------------------- | ---------------------------------------------- |
| **Supabase**      | Authentication (email OTP/verify) & database                    | Keys configured                                |
| **Stripe**        | Subscriptions, checkout, invoices, customer portal, webhooks    | Keys configured                                |
| **Resend**        | Transactional email (verification, welcome, invoice, payments)  | `RESEND_API_KEY` set                           |
| **AgroMonitoring**| Satellite (Sentinel-2) imagery & weather polygons               | `AGROMONITORING_API_KEY` set                   |
| **OpenWeatherMap**| Weather forecast fallback                                       | `OPENWEATHER_API_KEY` set                      |
| **Leaflet / EOX** | Satellite & street basemap tiles                                | Always (with graceful fallbacks)               |
| **LibreTranslate**| On-the-fly translation for non-English locales                  | Language switch used                           |

## 📡 API Routes

All handlers live under `src/app/api` and share the same auth, feature-gate, and error-handling conventions.

| Route                                                  | Purpose                                    |
| ------------------------------------------------------ | ------------------------------------------ |
| `GET/POST /api/fields`, `/api/fields/[id]`            | Field CRUD and analytics                   |
| `/api/agromonitoring/polygons`, `/api/agromonitoring/satellite` | Satellite polygon & imagery proxies |
| `GET /api/weather`, `/api/weather/satellite`           | Weather forecasts and satellite imagery    |
| `/api/sensors/providers`, `/api/sensors/integrations`  | Sensor provider & integration registry     |
| `POST /api/sensors/sync`                               | Synchronize sensor readings                |
| `POST /api/sensors/ai`                                 | AI insights over sensor data               |
| `POST /api/auth/register`, `verify-email`, `resend-verification` | Authentication flows              |
| `GET/PATCH /api/profile`                               | User profile retrieval & update            |
| `POST /api/billing/checkout`                           | Create a Stripe checkout session           |
| `POST /api/billing/webhook`                            | Stripe webhook handler                     |
| `GET /api/billing/subscription`                          | Current plan & limits                      |
| `/api/billing/invoices`, `/api/billing/invoices/[id]/download` | Invoice listing & PDF download    |
| `POST /api/billing/portal`                             | Stripe customer portal session             |
| `POST /api/billing/simulate`                           | Simulate billing states (development)      |

##  Live Demo

The landing page includes a cinematically animated **"Watch Demo"** walkthrough. It showcases realistic mockups of the real AgroVision screens — Dashboard, Farm Map, Weather, IoT Sensors, AI Assistant, and Analytics — with a continuous Ken Burns camera effect, play/pause, a progress bar, and prev/next controls. No account or API keys required.

##  Contributing

AgroVision is under active development. Contributions that improve reliability, documentation, or the developer experience are welcome.

1. Fork the repository and create a feature branch.
2. Follow the existing code conventions (TypeScript, ESLint, and the provider-component patterns).
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Reference the relevant issue or feature in your PR description.

The repository also tracks current work in `TODO.md` — a great starting point for your first contribution.

##  License

This project is proprietary software. All rights reserved. © 2024 AgroVision.

---

<p align="center">
  Built with 💚 by <strong>Anastasios Karaivazoglou</strong><br />
  <a href="https://github.com/AnastKara/AgroVision">github.com/AnastKara/AgroVision</a>
</p>