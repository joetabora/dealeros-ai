-- Rename legacy table if present, then ensure campaigns exists.
do $$
begin
  if exists (
    select 1
    from pg_tables
    where schemaname = 'public'
      and tablename = 'ai_generations'
  ) and not exists (
    select 1
    from pg_tables
    where schemaname = 'public'
      and tablename = 'campaigns'
  ) then
    alter table public.ai_generations rename to campaigns;
  end if;
end $$;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dealership_name text not null,
  campaign_type text not null,
  inputs_json jsonb not null,
  outputs_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists campaigns_user_id_created_at_idx
  on public.campaigns (user_id, created_at desc);

create index if not exists campaigns_user_dealership_idx
  on public.campaigns (user_id, dealership_name);

alter table public.campaigns enable row level security;

drop policy if exists "Users can view their own generations" on public.campaigns;
drop policy if exists "Users can insert their own generations" on public.campaigns;
drop policy if exists "Users can update their own generations" on public.campaigns;
drop policy if exists "Users can delete their own generations" on public.campaigns;
drop policy if exists "Users can view their own campaigns" on public.campaigns;
drop policy if exists "Users can insert their own campaigns" on public.campaigns;
drop policy if exists "Users can update their own campaigns" on public.campaigns;
drop policy if exists "Users can delete their own campaigns" on public.campaigns;

create policy "Users can view their own campaigns"
  on public.campaigns
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own campaigns"
  on public.campaigns
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own campaigns"
  on public.campaigns
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own campaigns"
  on public.campaigns
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Dealership memory layer
create table if not exists public.dealership_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dealership_name text not null,
  memory_type text not null,
  memory_value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dealership_name, memory_type)
);

create index if not exists dealership_memory_lookup_idx
  on public.dealership_memory (user_id, dealership_name);

alter table public.dealership_memory enable row level security;

create policy "Users can view their own dealership memory"
  on public.dealership_memory
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own dealership memory"
  on public.dealership_memory
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own dealership memory"
  on public.dealership_memory
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own dealership memory"
  on public.dealership_memory
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_dealership_memory_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dealership_memory_updated_at on public.dealership_memory;

create trigger dealership_memory_updated_at
before update on public.dealership_memory
for each row
execute function public.set_dealership_memory_updated_at();
