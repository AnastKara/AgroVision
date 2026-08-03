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
