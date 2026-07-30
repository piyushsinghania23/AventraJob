# Bug Fix TODO List

## Backend
- [x] Fix 1: Fix TypeScript version in `backend/package.json` (v7 → v5.7.3)
- [x] Fix 2: Fix `dev` script to compile before running
- [x] Fix 3: Fix `backend/src/lib/prisma.ts` - broken singleton/fallback pattern
- [x] Fix 4: Remove duplicate `dotenv.config()` from `app.ts`
- [x] Fix 5: Add server error handling in `server.ts`
- [x] Fix 6: Fix mock-data.ts Prisma fallback typing issues (removed broken fallback)
- [x] Fix 8: Generate initial Prisma migration

## Frontend
- [x] Fix 7: Persist JWT token on frontend login/register
- [x] Fix 9: Remove `experimental.typedRoutes` from next.config.ts (incompatible with Next.js 16)


