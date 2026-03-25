# Vercel deployment integration

When you send the Vercel API credentials, add these env vars:

- `VERCEL_API_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID` optional
- `NEXT_PUBLIC_APP_DOMAIN` for building hosted URLs

Planned deployment flow:

1. User generates portfolio blueprint.
2. User publishes portfolio.
3. App stores the published state in Supabase.
4. Vercel deployment hook receives the slug and portfolio UID.
5. Subdomain or hosted path can be attached for the published portfolio.
