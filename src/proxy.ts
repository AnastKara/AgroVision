import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Paths that are always public (no auth / subscription required).
 */
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/pricing",
  "/checkout",
];

/**
 * Public API routes that never require auth.
 * The Stripe webhook is public (verifies via signature). Auth APIs are public.
 */
const PUBLIC_API_PREFIXES = ["/api/billing/webhook", "/api/auth"];

/**
 * Billing APIs required to ACQUIRE or MANAGE a subscription.
 * These must be reachable by authenticated + email-verified users even when
 * they do NOT have an active subscription yet (otherwise they could never pay).
 * They still require authentication and email verification (checked below).
 */
const BILLING_ACQUISITION_PREFIXES = [
  "/api/billing/checkout",
  "/api/billing/portal",
  "/api/billing/subscription",
  "/api/billing/simulate",
];

export async function proxy(request: NextRequest) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "https://nbmcnvqgwemzltfdgpbb.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibWNudnFnd2Vtemx0ZmRncGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMTk3MjEsImV4cCI6MjEwMDc5NTcyMX0.u9CRuQUBLppGwjcFxDTmf8xd6G0nKFVcc9clSdX_XRg";

  // If Supabase is not configured, the app has no auth/subscription system to
  // enforce. Deny access to protected areas so the app is never "open by default".
  // Public pages (login, register, pricing) remain accessible.
  const isDevNoSupabase = Boolean(
    !supabaseUrl ||
      !supabaseAnonKey ||
      supabaseUrl === "your_supabase_project_url_here"
);

  const pathname = request.nextUrl.pathname;

  // Billing acquisition APIs (used to purchase/acquire a plan) must remain
  // reachable. They still require auth + email verification (enforced in the
  // route handler / below), but are exempt from the active-subscription
  // requirement so a user can actually pay.
  const isBillingAcquisition = BILLING_ACQUISITION_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );

  // Allow public pages and public API routes through.
  const isPublicPage = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isPublicApi =
    PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p)) ||
    isBillingAcquisition;

if (isPublicPage || isPublicApi) {
    return NextResponse.next({ request });
  }

  // Determine whether this is a protected page/API before the dev-mode check.
  const isProtectedPage = pathname.startsWith("/dashboard");
  const isProtectedApi = pathname.startsWith("/api/");

  // If Supabase is not configured, there is no way to positively verify an
  // active subscription — deny access to protected areas so the paywall can
  // never be bypassed. Public pages (login, register, pricing) remain open.
  if (isDevNoSupabase) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: "You need an active subscription to access AgroVision.", code: "inactive_subscription" },
        { status: 403 }
      );
    }
    if (isProtectedPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      url.search = "accessDenied=true";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  // At this point Supabase is configured, so the URL/key are defined.
  const supabaseUrlDefined: string = supabaseUrl as string;
  const supabaseAnonKeyDefined: string = supabaseAnonKey as string;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrlDefined,
    supabaseAnonKeyDefined,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

// ---------------------------------------------------------------
  // PROTECTED ROUTES (dashboard + all non-public API routes)
  // ---------------------------------------------------------------
  // `isProtectedPage` / `isProtectedApi` are defined above (before the
  // dev-mode check). For the configured path, API routes that are public
  // (e.g. webhook) were already returned above, so any remaining /api/ route
  // here is protected.
  if (!isProtectedPage && !isProtectedApi) {
    return supabaseResponse;
  }

  // 1) Must be authenticated
  if (!user) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2) Email must be verified
  if (!user.email_confirmed_at) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: "Please verify your email before continuing." },
        { status: 403 }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/verify-email";
    return NextResponse.redirect(url);
  }

// 3) The ACTIVE SUBSCRIPTION gate is enforced by the dashboard layout
  //    (`checkAccess()`) and the `requireApiAccess()` guard, both of which run
  //    in the Node runtime and read the consistent subscription store.
  //    The proxy only handles auth + email verification + redirects, so a
  //    completed payment is recognized immediately (the Edge proxy cannot
  //    share the in-memory subscription store with the Node webhook).

  // Redirect logged-in users away from auth pages
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
