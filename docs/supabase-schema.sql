create extension if not exists pgcrypto;

create type public.profile_role as enum ('user', 'admin');
create type public.portfolio_status as enum ('draft', 'active', 'paused', 'archived');
create type public.upload_visibility as enum ('public', 'private');

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text unique not null,
  email text unique not null,
  full_name text not null,
  slug text unique,
  date_of_birth date,
  age_group text generated always as (
    case
      when date_of_birth is null then null
      when date_part('year', age(current_date, date_of_birth)) >= 18 then 'adult'
      else 'minor'
    end
  ) stored,
  profession text,
  industry text,
  corporate_bio text,
  education text,
  institution text,
  hobbies text[],
  phone text,
  whatsapp text,
  github_url text,
  instagram_url text,
  linkedin_url text,
  personalization_prompt text,
  avatar_path text,
  cover_image_path text,
  role public.profile_role not null default 'user',
  is_active boolean not null default true,
  is_site_paused boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subdomain text unique,
  status public.portfolio_status not null default 'draft',
  theme_name text,
  theme_config jsonb not null default '{}'::jsonb,
  layout_config jsonb not null default '{}'::jsonb,
  ai_generation_config jsonb not null default '{}'::jsonb,
  ai_generation_version text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_sections (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  section_key text not null,
  display_order integer not null default 0,
  is_enabled boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id, section_key)
);

create table if not exists public.nfc_cards (
  id uuid primary key default gen_random_uuid(),
  tag_uid text unique not null,
  claim_token text unique not null,
  profile_id uuid references public.profiles(id) on delete set null,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  is_claimed boolean not null default false,
  locked_at timestamptz,
  claimed_at timestamptz,
  last_tapped_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  bucket_name text not null,
  storage_path text not null,
  visibility public.upload_visibility not null,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.document_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets(id) on delete cascade,
  requested_by_email text,
  access_reason text,
  approved_by uuid references public.profiles(id) on delete set null,
  signed_url_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_profile_id uuid references public.profiles(id) on delete set null,
  target_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists portfolios_set_updated_at on public.portfolios;
create trigger portfolios_set_updated_at
before update on public.portfolios
for each row execute function public.set_updated_at();

drop trigger if exists portfolio_sections_set_updated_at on public.portfolio_sections;
create trigger portfolio_sections_set_updated_at
before update on public.portfolio_sections
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_sections enable row level security;
alter table public.nfc_cards enable row level security;
alter table public.media_assets enable row level security;
alter table public.document_requests enable row level security;
alter table public.admin_audit_logs enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (
  auth.jwt() ->> 'email' = email
  or exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.email = auth.jwt() ->> 'email'
      and admin_profile.role = 'admin'
  )
);

create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (
  auth.jwt() ->> 'email' = email
  or exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.email = auth.jwt() ->> 'email'
      and admin_profile.role = 'admin'
  )
)
with check (
  auth.jwt() ->> 'email' = email
  or exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.email = auth.jwt() ->> 'email'
      and admin_profile.role = 'admin'
  )
);

create policy "portfolios_select_public_or_owner_or_admin"
on public.portfolios
for select
using (
  status = 'active'
  or exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and (
        p.email = auth.jwt() ->> 'email'
        or exists (
          select 1
          from public.profiles admin_profile
          where admin_profile.email = auth.jwt() ->> 'email'
            and admin_profile.role = 'admin'
        )
      )
  )
);

create policy "portfolios_write_owner_or_admin"
on public.portfolios
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and (
        p.email = auth.jwt() ->> 'email'
        or exists (
          select 1
          from public.profiles admin_profile
          where admin_profile.email = auth.jwt() ->> 'email'
            and admin_profile.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and (
        p.email = auth.jwt() ->> 'email'
        or exists (
          select 1
          from public.profiles admin_profile
          where admin_profile.email = auth.jwt() ->> 'email'
            and admin_profile.role = 'admin'
        )
      )
  )
);

create policy "portfolio_sections_select_if_portfolio_visible"
on public.portfolio_sections
for select
using (
  exists (
    select 1
    from public.portfolios pf
    where pf.id = portfolio_id
      and (
        pf.status = 'active'
        or exists (
          select 1
          from public.profiles p
          where p.id = pf.profile_id
            and (
              p.email = auth.jwt() ->> 'email'
              or exists (
                select 1
                from public.profiles admin_profile
                where admin_profile.email = auth.jwt() ->> 'email'
                  and admin_profile.role = 'admin'
              )
            )
        )
      )
  )
);

create policy "portfolio_sections_write_owner_or_admin"
on public.portfolio_sections
for all
using (
  exists (
    select 1
    from public.portfolios pf
    join public.profiles p on p.id = pf.profile_id
    where pf.id = portfolio_id
      and (
        p.email = auth.jwt() ->> 'email'
        or exists (
          select 1
          from public.profiles admin_profile
          where admin_profile.email = auth.jwt() ->> 'email'
            and admin_profile.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.portfolios pf
    join public.profiles p on p.id = pf.profile_id
    where pf.id = portfolio_id
      and (
        p.email = auth.jwt() ->> 'email'
        or exists (
          select 1
          from public.profiles admin_profile
          where admin_profile.email = auth.jwt() ->> 'email'
            and admin_profile.role = 'admin'
        )
      )
  )
);

create policy "nfc_cards_admin_only"
on public.nfc_cards
for all
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.email = auth.jwt() ->> 'email'
      and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.email = auth.jwt() ->> 'email'
      and admin_profile.role = 'admin'
  )
);

create policy "media_assets_owner_or_admin"
on public.media_assets
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and (
        p.email = auth.jwt() ->> 'email'
        or exists (
          select 1
          from public.profiles admin_profile
          where admin_profile.email = auth.jwt() ->> 'email'
            and admin_profile.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and (
        p.email = auth.jwt() ->> 'email'
        or exists (
          select 1
          from public.profiles admin_profile
          where admin_profile.email = auth.jwt() ->> 'email'
            and admin_profile.role = 'admin'
        )
      )
  )
);

create policy "document_requests_owner_or_admin"
on public.document_requests
for all
using (
  exists (
    select 1
    from public.media_assets asset
    join public.profiles p on p.id = asset.profile_id
    where asset.id = asset_id
      and (
        p.email = auth.jwt() ->> 'email'
        or exists (
          select 1
          from public.profiles admin_profile
          where admin_profile.email = auth.jwt() ->> 'email'
            and admin_profile.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.media_assets asset
    join public.profiles p on p.id = asset.profile_id
    where asset.id = asset_id
      and (
        p.email = auth.jwt() ->> 'email'
        or exists (
          select 1
          from public.profiles admin_profile
          where admin_profile.email = auth.jwt() ->> 'email'
            and admin_profile.role = 'admin'
        )
      )
  )
);

create policy "admin_audit_logs_admin_only"
on public.admin_audit_logs
for all
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.email = auth.jwt() ->> 'email'
      and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.email = auth.jwt() ->> 'email'
      and admin_profile.role = 'admin'
  )
);
