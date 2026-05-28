-- Dealership events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dealership_name text not null,
  event_name text not null,
  event_type text not null,
  description text not null default '',
  event_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists events_user_id_event_date_idx
  on public.events (user_id, event_date desc);

create index if not exists events_user_id_created_at_idx
  on public.events (user_id, created_at desc);

alter table public.events enable row level security;

drop policy if exists "Users can view their own events" on public.events;
drop policy if exists "Users can insert their own events" on public.events;
drop policy if exists "Users can update their own events" on public.events;
drop policy if exists "Users can delete their own events" on public.events;

create policy "Users can view their own events"
  on public.events
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own events"
  on public.events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own events"
  on public.events
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own events"
  on public.events
  for delete
  to authenticated
  using (auth.uid() = user_id);
