# TODO: Financial Ledger & Accounting Page

## Plan
- [x] Explore existing financial infrastructure (transactions, export-service, utils, analytics)
- [x] Create plan & get user approval

## Implementation Steps
- [x] 1. Create `src/lib/finance-data.ts` (extended mock data: accounts, invoices, budgets, recurring, helpers)
- [x] 2. Update `src/lib/data.ts` (add more mock transactions for richer data)
- [x] 3. Create `src/app/dashboard/finance/page.tsx` (full feature page)
- [x] 4. Update `src/components/sidebar.tsx` (add Finance nav item)
- [x] 5. Run lint/build & verify zero new errors

## Verification
- ESLint: 0 new errors, 0 new warnings
- TypeScript: no new errors
- `/dashboard/finance` renders correctly
