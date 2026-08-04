import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            // This policy applies to the service-worker context. Allow the
            // external image/API hosts that the worker fetches and caches.
            value:
              "default-src 'self'; script-src 'self'; connect-src 'self' https://tiles.maps.eox.at https://*.tile.openstreetmap.org https://api.openweathermap.org https://*.openweathermap.org; img-src 'self' data: https://tiles.maps.eox.at https://*.tile.openstreetmap.org https://openweathermap.org https://*.openweathermap.org",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
