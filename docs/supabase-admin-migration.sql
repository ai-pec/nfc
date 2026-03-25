alter table public.users
add column if not exists role text not null default 'user'
check (role in ('user', 'admin'));

alter table public.users
add column if not exists account_status text not null default 'active'
check (account_status in ('active', 'paused', 'blocked'));

alter table public.users
add column if not exists supabase_auth_user_id text unique;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'better_auth_user_id'
  ) then
    update public.users
    set supabase_auth_user_id = better_auth_user_id
    where supabase_auth_user_id is null
      and better_auth_user_id is not null;
  end if;
end;
$$;

alter table public.portfolios
add column if not exists site_paused boolean not null default false;

alter table public.portfolios
add column if not exists admin_notes text;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_uid uuid not null references public.users(uid) on delete cascade,
  target_uid uuid references public.users(uid) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_account_status on public.users(account_status);
create index if not exists idx_users_supabase_auth_user_id on public.users(supabase_auth_user_id);
create index if not exists idx_portfolios_site_paused on public.portfolios(site_paused);
