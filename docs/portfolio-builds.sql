create table if not exists public.portfolio_builds (
  id uuid primary key default gen_random_uuid(),
  portfolio_uid uuid not null references public.portfolios(uid) on delete cascade,
  requested_by_uid uuid references public.users(uid) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  stage text not null default 'intake' check (stage in ('intake', 'layout', 'validation', 'ready', 'publish')),
  schema_version text not null default 'portfolio_schema_v2',
  style_prompt text not null,
  provider text not null default 'gemini',
  model_plan jsonb not null default '{}'::jsonb,
  intake_payload jsonb not null default '{}'::jsonb,
  intake_result jsonb,
  blueprint jsonb,
  validation_result jsonb,
  public_url text,
  error_message text,
  requested_at timestamp with time zone not null default timezone('utc'::text, now()),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  published_at timestamp with time zone,
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.portfolio_build_steps (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references public.portfolio_builds(id) on delete cascade,
  step_key text not null check (step_key in ('intake', 'layout', 'validation', 'revision')),
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  provider text,
  model text,
  attempt integer not null default 1,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.portfolio_reviews (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references public.portfolio_builds(id) on delete cascade,
  reviewer_type text not null default 'ai' check (reviewer_type in ('ai', 'admin')),
  status text not null check (status in ('approved', 'rejected', 'needs_revision')),
  score integer check (score between 0 and 100),
  findings jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.portfolio_versions (
  id uuid primary key default gen_random_uuid(),
  portfolio_uid uuid not null references public.portfolios(uid) on delete cascade,
  build_id uuid references public.portfolio_builds(id) on delete set null,
  version_number integer not null,
  schema_version text not null default 'portfolio_schema_v2',
  blueprint jsonb not null,
  is_active boolean not null default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create unique index if not exists idx_portfolio_versions_portfolio_uid_version_number
on public.portfolio_versions(portfolio_uid, version_number);

create index if not exists idx_portfolio_builds_portfolio_uid on public.portfolio_builds(portfolio_uid);
create index if not exists idx_portfolio_builds_requested_by_uid on public.portfolio_builds(requested_by_uid);
create index if not exists idx_portfolio_builds_status on public.portfolio_builds(status);
create index if not exists idx_portfolio_builds_requested_at on public.portfolio_builds(requested_at desc);
create index if not exists idx_portfolio_build_steps_build_id on public.portfolio_build_steps(build_id);
create index if not exists idx_portfolio_build_steps_step_key on public.portfolio_build_steps(step_key);
create index if not exists idx_portfolio_reviews_build_id on public.portfolio_reviews(build_id);
create index if not exists idx_portfolio_versions_portfolio_uid on public.portfolio_versions(portfolio_uid);
