# Code Quality Improvements

## Fixes
- [x] 1. README merge conflict markers — resolved
- [x] 2. Unused imports in dashboard — removed (RefreshCw, PieChart, Pie, Cell, Progress)
- [x] 3. Remove unused `taskStatusColors` constant in dashboard
- [x] 4. Add Open-Meteo keyless fallback to `/api/weather`
- [x] 5. Wire up social login buttons (Google/GitHub) — added `signInWithProvider` to auth provider and wired buttons in login page
- [x] 6. Verify PWA manifest — `manifest.ts` correctly generates `/manifest.webmanifest`, referenced in layout and SW precache
- [x] 7. Remove duplicate translation keys (`landing.heroTitle`/`landing.heroSubtitle`)
