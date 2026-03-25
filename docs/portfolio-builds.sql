create table if not exists public.portfolio_builds (
  id uuid primary key default gen_random_uuid(),
  portfolio_uid uuid not null references public.portfolios(uid) on delete cascade,
  requested_by_uid uuid references public.users(uid) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  stage text not null default 'intake' check (stage in ('intake', 'generation', 'ready', 'publish')),
  style_prompt text not null,
  intake_payload jsonb not null default '{}'::jsonb,
  blueprint jsonb,
  public_url text,
  error_message text,
  requested_at timestamp with time zone not null default timezone('utc'::text, now()),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  published_at timestamp with time zone,
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_portfolio_builds_portfolio_uid on public.portfolio_builds(portfolio_uid);
create index if not exists idx_portfolio_builds_requested_by_uid on public.portfolio_builds(requested_by_uid);
create index if not exists idx_portfolio_builds_status on public.portfolio_builds(status);
create index if not exists idx_portfolio_builds_requested_at on public.portfolio_builds(requested_at desc);
