# Vercel deployment integration

When you send the Vercel API credentials, add these env vars:

- `VERCEL_API_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID` optional
- `NEXT_PUBLIC_APP_URL` for building hosted URLs

Planned deployment flow:

1. User generates portfolio blueprint.
2. User publishes portfolio.
3. App stores the published state in Supabase.
4. Vercel project integration confirms the publish target.
5. Portfolio URL is exposed in admin using the current hosted base URL.

Important:

- With only `https://nfc-x6e2.vercel.app`, portfolios should use path URLs like `/p/{slug}`.
- True per-user subdomains require your own custom domain on Vercel, for example `pavitr.yourdomain.com`.
