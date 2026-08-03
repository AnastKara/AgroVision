/**
 * AgroVision Service Worker
 *
 * Provides offline support via:
 * - App-shell precaching (static assets, icons, manifest)
 * - Network-first strategy for navigations (fallback to cache when offline)
 * - Network-first strategy for API calls (fallback to cache when offline)
 * - Cache-first strategy for static assets (icons, fonts, images)
 */

const CACHE_VERSION = "agrovision-v1";
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Core app shell assets to precache on install
const APP_SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/icon.svg",
  "/favicon.ico",
];

// API routes that should be cached for offline access
const API_ROUTES = ["/api/fields", "/api/weather", "/api/weather/satellite"];

// ============================================================
// Install: precache app shell
// ============================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// Activate: clean up old caches
// ============================================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ============================================================
// Fetch: offline-first strategies
// ============================================================
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin requests (e.g., OpenWeatherMap icons, Leaflet tiles)
  if (url.origin !== self.location.origin) {
    // Cache-first for cross-origin static assets (weather icons, map tiles)
    if (
      request.destination === "image" ||
      url.hostname.includes("openweathermap.org") ||
      url.hostname.includes("tile.openstreetmap.org")
    ) {
      event.respondWith(
        caches.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
              }
              return response;
            })
            .catch(() => cached);
        })
      );
    }
    return;
  }

  // ==========================================================
  // API requests: network-first with cache fallback
  // ==========================================================
  if (
    url.pathname.startsWith("/api/") &&
    API_ROUTES.some((route) => url.pathname.startsWith(route))
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return a JSON error response so the app can fall back to mock data
            return new Response(
              JSON.stringify({ error: "offline", offline: true }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          })
        )
    );
    return;
  }

  // ==========================================================
  // Static assets (JS, CSS, images, fonts): cache-first
  // ==========================================================
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // ==========================================================
  // Navigations (HTML pages): network-first with cache fallback
  // ==========================================================
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            // Fall back to the cached home page for any navigation
            return caches.match("/");
          })
        )
    );
    return;
  }
});

// ============================================================
// Message: skip waiting (for immediate updates)
// ============================================================
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
