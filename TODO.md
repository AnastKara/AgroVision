# TODO: IoT Sensors & Field Monitoring Page

## Steps
- [x] 1. Explore codebase (iot-types, weather-service, data, UI components)
- [x] 2. Create plan & get user approval
- [x] 3. Create `src/lib/sensor-data.ts` (mock sensor devices + readings + helpers)
- [x] 4. Create `src/app/dashboard/sensors/page.tsx` (main feature page)
- [x] 5. Update `src/components/sidebar.tsx` (add Sensors nav item)
- [x] 6. Update `src/app/dashboard/fields/[id]/page.tsx` (connected sensors section)
- [x] 7. Run lint/build & verify

## Verification
- ✅ ESLint: 0 new errors, 0 new warnings (1 pre-existing warning in sidebar.tsx: unused `isConfigured`)
- ✅ TypeScript: `latest.quality` nullable guard fixed (`(latest.quality ?? 0) >= 0.85`)
- ✅ All files created: `sensor-data.ts`, `sensors/page.tsx`, sidebar updated, field detail updated
- ✅ No new TS/ESLint errors introduced

