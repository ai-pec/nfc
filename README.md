# NFC Portfolio Platform

This project now includes:

- a BharatTouch-inspired public marketing site
- Supabase Auth wiring for email/password and Google sign-in
- Supabase-backed app user sync and portfolio bootstrap
- a protected dashboard and low-profile admin route
- AI portfolio blueprint generation with fixed brand/system rules

## Main routes

- `/`
- `/about`
- `/buy`
- `/contact`
- `/login`
- `/signup`
- `/dashboard`
- `/admin`

## Important docs

- `docs/supabase-admin-migration.sql`
- `docs/supabase-storage-plan.md`
- `docs/ai-portfolio-rules.md`

## Required environment

- `NEXT_PUBLIC_SUPABASE_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `ADMIN_EMAILS`
- `DEEPSEEK_API_KEY` for live AI generation
- `DEEPSEEK_MODEL` optional

## Status

- Supabase auth server/client wiring is in the app
- sign-up/sign-in syncs into your app tables through Supabase-backed user sync
- dashboard AI generation is wired to your portfolio row
- homepage/admin metrics read from Supabase
- lint and TypeScript checks pass

## Next required step in Supabase

Run these SQL files in order:

1. `docs/supabase-admin-migration.sql`
