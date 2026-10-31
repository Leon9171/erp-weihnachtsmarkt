create table if not exists public.erp_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.erp_members enable row level security;

create or replace function public.is_erp_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.erp_members
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_erp_member() from public;
grant execute on function public.is_erp_member() to authenticated;

drop policy if exists "Members can read their own membership" on public.erp_members;
create policy "Members can read their own membership"
  on public.erp_members
  for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.erp_members from anon, authenticated;
grant select on public.erp_members to authenticated;

create table if not exists public.erp_workspace_data (
  id smallint primary key default 1 check (id = 1),
  articles jsonb not null default '[]'::jsonb,
  toppings jsonb not null default '[]'::jsonb,
  orders jsonb not null default '[]'::jsonb,
  expenses jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.erp_workspace_data enable row level security;

drop policy if exists "ERP members can read workspace data" on public.erp_workspace_data;
create policy "ERP members can read workspace data"
  on public.erp_workspace_data
  for select
  to authenticated
  using ((select public.is_erp_member()));

drop policy if exists "ERP members can create workspace data" on public.erp_workspace_data;
create policy "ERP members can create workspace data"
  on public.erp_workspace_data
  for insert
  to authenticated
  with check ((select public.is_erp_member()));

drop policy if exists "ERP members can update workspace data" on public.erp_workspace_data;
create policy "ERP members can update workspace data"
  on public.erp_workspace_data
  for update
  to authenticated
  using ((select public.is_erp_member()))
  with check ((select public.is_erp_member()));

revoke all on public.erp_workspace_data from anon, authenticated;
grant select, insert, update on public.erp_workspace_data to authenticated;
