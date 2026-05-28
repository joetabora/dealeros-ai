-- One-click marketing campaigns
create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dealership_name text not null,
  campaign_type text not null,
  event_or_offer_name text not null,
  inputs_json jsonb not null,
  outputs_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists marketing_campaigns_user_created_idx
  on public.marketing_campaigns (user_id, created_at desc);

alter table public.marketing_campaigns enable row level security;

drop policy if exists "Users can view their own marketing campaigns" on public.marketing_campaigns;
drop policy if exists "Users can insert their own marketing campaigns" on public.marketing_campaigns;
drop policy if exists "Users can update their own marketing campaigns" on public.marketing_campaigns;
drop policy if exists "Users can delete their own marketing campaigns" on public.marketing_campaigns;

create policy "Users can view their own marketing campaigns"
  on public.marketing_campaigns
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own marketing campaigns"
  on public.marketing_campaigns
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own marketing campaigns"
  on public.marketing_campaigns
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own marketing campaigns"
  on public.marketing_campaigns
  for delete
  to authenticated
  using (auth.uid() = user_id);
