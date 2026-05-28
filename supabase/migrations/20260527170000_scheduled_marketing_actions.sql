-- Scheduled marketing actions (marketing calendar engine)
create table if not exists public.scheduled_marketing_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dealership_name text not null,
  campaign_id uuid,
  event_id uuid,
  platform text not null,
  content_type text not null,
  content text not null,
  scheduled_for timestamptz not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint scheduled_marketing_actions_status_check
    check (status in ('pending', 'sent', 'skipped'))
);

create index if not exists scheduled_actions_user_scheduled_idx
  on public.scheduled_marketing_actions (user_id, scheduled_for asc);

create index if not exists scheduled_actions_campaign_idx
  on public.scheduled_marketing_actions (campaign_id)
  where campaign_id is not null;

create index if not exists scheduled_actions_event_idx
  on public.scheduled_marketing_actions (event_id)
  where event_id is not null;

alter table public.scheduled_marketing_actions enable row level security;

drop policy if exists "Users can view their own scheduled actions" on public.scheduled_marketing_actions;
drop policy if exists "Users can insert their own scheduled actions" on public.scheduled_marketing_actions;
drop policy if exists "Users can update their own scheduled actions" on public.scheduled_marketing_actions;
drop policy if exists "Users can delete their own scheduled actions" on public.scheduled_marketing_actions;

create policy "Users can view their own scheduled actions"
  on public.scheduled_marketing_actions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own scheduled actions"
  on public.scheduled_marketing_actions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own scheduled actions"
  on public.scheduled_marketing_actions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own scheduled actions"
  on public.scheduled_marketing_actions
  for delete
  to authenticated
  using (auth.uid() = user_id);
