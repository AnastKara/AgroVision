# TODO: PWA / Offline Support

## Plan
- [x] Explore existing PWA/offline infrastructure
- [x] Create plan & get user approval

## Implementation Steps
- [x] 1. Create `src/app/manifest.ts` (Web App Manifest)
- [x] 2. Create `scripts/generate-icons.js` + generate PNG/SVG app icons into `public/icons/`
- [x] 3. Create `public/sw.js` (service worker: precache, offline fallback, API caching)
- [x] 4. Create `src/lib/offline/db.ts` (IndexedDB promise wrapper)
- [x] 5. Create `src/lib/offline/cache.ts` (offline cache helpers)
- [x] 6. Update `src/lib/fields-service.ts` (persist to IndexedDB, read cache offline)
- [x] 7. Update `src/lib/weather-service.ts` (fallback to IndexedDB cache offline)
- [x] 8. Create `src/components/pwa-provider.tsx` (register SW, online/offline, install prompt)
- [x] 9. Update `src/app/layout.tsx` (add PwaProvider + meta tags)
- [x] 10. Update `src/components/top-nav.tsx` (online/offline indicator + install button)
- [x] 11. Update `next.config.ts` (security headers for /sw.js)
- [ ] 12. Run lint/build & verify zero new errors

## Verification
- [ ] ESLint: 0 new errors, 0 new warnings
- [ ] TypeScript: no new errors
- [ ] Manifest + service worker registered
- [ ] App works offline (reload with network disabled)

---

# TODO: Satellite NDVI/Health Timeline + Predictive Analytics

## Plan
- [x] Explore existing AgroMonitoring/satellite infrastructure
- [x] Create plan & get user approval

## Implementation Steps
- [ ] 1. Create `src/lib/ndvi-analytics.ts` (core analytics engine: NDVI timeline, linear regression, forecasting, yield prediction, health score, trend classification)
- [ ] 2. Create `src/app/api/agromonitoring/satellite/route.ts` (API route: fetch NDVI timeline for a field over N days, compute stats for each cloud-free image, return time-series + predictions)
- [ ] 3. Create `src/components/ndvi-analytics-dashboard.tsx` (rich UI: NDVI/EVI/NDMI time-series charts, trend indicators, yield prediction cards, health forecast, satellite image gallery)
- [ ] 4. Update `src/components/field-details-dashboard.tsx` (add "Predictive Analytics" tab rendering the new component)
- [ ] 5. Update `src/app/dashboard/fields/[id]/page.tsx` (fetch NDVI timeline data, pass to dashboard, longer date range)
- [ ] 6. Update `src/lib/offline/cache.ts` (cache NDVI timeline + predictions to IndexedDB)

## Verification
- [ ] ESLint: 0 new errors, 0 new warnings
- [ ] TypeScript: no new errors
- [ ] NDVI timeline chart renders for fields with agroMonitoringId
- [ ] Predictions/yield forecast display correctly
- [ ] Works offline with cached data
