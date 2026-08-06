# AgroVision Production-Ready Auth & Billing — Task List

## Stripe Hosted Checkout (remove custom card form)

### Goal
Replace the custom in-app card payment form with the official Stripe Hosted Checkout UI. No card details are collected inside AgroVision.

### Steps
- [x] Replace `/checkout/page.tsx` — removed custom card form; now a "Redirecting to Stripe Checkout..." page that creates a Stripe Checkout Session on the server and redirects the browser to Stripe's hosted URL. No card details are collected inside AgroVision.
- [x] Update `/api/billing/checkout/route.ts` dev-mode branch to point to the redesigned `/checkout` page (real Stripe path already returns hosted URL — left unchanged).
- [x] Leave StripeProvider.createCheckoutSession, pricing page redirect, webhook verification, and DB subscription update unchanged (already correct).
- [x] Verify `npm run build` passes.

## Subscription Access Protection (paywall bypass fix)

### Persistence layer (Supabase)
- [x] `src/lib/supabase/admin.ts` — admin client using SUPABASE_SERVICE_ROLE_KEY (webhook writes)
- [x] `src/lib/billing/subscription-store.ts` — read/write subscription fields to Supabase user_metadata + in-memory dev fallback

### Webhook → Supabase sync
- [x] `src/lib/billing/webhook-handler.ts` — persist subscription_status/plan/stripe ids/period end to Supabase user_metadata

### Server-side gate
- [x] `src/app/dashboard/layout.tsx` — check Supabase subscription status; redirect unpaid to /pricing?accessDenied=true

### API reads
- [x] `src/app/api/billing/subscription/route.ts` — read subscription from Supabase user_metadata

### Registration init
- [x] `src/app/api/auth/register/route.ts` — initialize user_metadata subscription fields (status = incomplete)

### Additional paywall hardening (no free-access bypass)
- [x] `src/lib/billing/subscription-service.ts` — `getOrCreateDefaultSubscription()` now creates records with status `incomplete` (never auto-grants `active`)
- [x] `src/app/api/billing/subscription/route.ts` — dev-mode (no Supabase) branch now returns status `incomplete` instead of hardcoded `active`
- [x] `src/proxy.ts` — paywall enforced in BOTH dev mode (deny-by-default) and production; fixed TDZ ordering of `isProtectedPage`/`isProtectedApi`

### Pricing page banner
- [x] `src/app/pricing/page.tsx` — show "You need an active subscription to access AgroVision." when accessDenied

### Env
- [x] SUPABASE_SERVICE_ROLE_KEY already present in .env.example

### Defense-in-depth API route protection
The shared `requireApiAccess()` guard (auth + verified email + active subscription) is applied to every protected API route so no endpoint can be reached without payment:
- [x] `/api/fields`, `/api/fields/[id]` (GET/POST/PUT/DELETE)
- [x] `/api/sensors/ai`, `/api/sensors/sync` (GET/POST)
- [x] `/api/sensors/integrations` (GET/POST/DELETE), `/api/sensors/providers` (GET)
- [x] `/api/agromonitoring/polygons` (GET/POST/PUT/DELETE), `/api/agromonitoring/satellite` (GET)
- [x] `/api/weather` (GET), `/api/weather/satellite` (GET)

### Verification
- [x] Run `npm run build` — passes (TypeScript + all routes)
- [x] Run eslint on changed files — no errors reported

## Supabase Google OAuth Login

### Goal
Implement Google OAuth login using the AgroVision Supabase project credentials (URL + anon key), with a login button, redirect handler, and a session getter.

### Steps
- [x] `src/lib/supabase/client.ts` — hardcoded Supabase URL + anon key as defaults (env-var override still supported); browser client always created.
- [x] `src/lib/supabase/server.ts` — hardcoded Supabase URL + anon key as defaults for the server client.
- [x] `src/lib/supabase/auth-provider.tsx` — added `getSession()` to context (returns `Session | null`); set `isConfigured = true`.
- [x] `src/app/auth/callback/route.ts` — redirect handler robustly exchanges the OAuth `code` for a session and redirects to `/dashboard`.
- [x] `src/app/login/page.tsx` — Google login button wired to `signInWithProvider("google")` (already present, confirmed functional).
- [x] `src/proxy.ts` — hardcoded Supabase URL + anon key so the app recognizes Supabase as configured and enforces auth/paywall.

### How it works
- Clicking **"Continue with Google"** calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "/auth/callback" } })`.
- Google redirects back to `/auth/callback?code=...`, which calls `supabase.auth.exchangeCodeForSession(code)` and redirects to `/dashboard`.
- `useAuth().getSession()` retrieves the logged-in user's session anywhere in the app.
- The proxy ensures the user is authenticated, email-verified, and has an active subscription before accessing protected routes.

### Verification
- [x] TypeScript compiles (`npx tsc --noEmit`) with no errors.
