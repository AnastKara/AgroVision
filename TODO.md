# TODO: Real Auth + Data Wiring + Free Admin Access

## Goal
Wire real Supabase-backed auth/data persistence, show the real user, and grant
free (complimentary) access to the admin email `anast13kara@gmail.com`.

## Steps
- [x] 1. Add admin email allowlist + free-access bypass in `src/lib/billing/require-access.ts`
- [ ] 2. Persist user profile (name, email, farm, phone) to Supabase via `user-service.ts`
- [ ] 3. Show real user in `src/components/top-nav.tsx` (replace hardcoded "Alex Driver"/"AD")
- [ ] 4. Show & save real profile in `src/app/dashboard/settings/page.tsx`
- [ ] 5. Add `/api/profile` route for reading/updating the profile
- [ ] 6. Make fields per-user + persisted (fields-service + API routes)
- [ ] 7. Typecheck + lint
