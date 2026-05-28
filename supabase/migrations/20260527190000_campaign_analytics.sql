-- Revenue intelligence layer — simulated campaign performance analytics
create table if not exists public.campaign_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid,
  event_id uuid references public.events (id) on delete set null,
  dealership_name text not null,
  campaign_label text not null default '',
  campaign_type text not null default 'event',
  estimated_reach integer not null default 0,
  estimated_engagement integer not null default 0,
  estimated_traffic_lift numeric(5, 2) not null default 0,
  estimated_leads integer not null default 0,
  estimated_revenue_impact integer not null default 0,
  performance_score integer not null default 0,
  created_at timestamptz not null default now(),
  constraint campaign_analytics_performance_score_check
    check (performance_score >= 0 and performance_score <= 100)
);

create index if not exists campaign_analytics_user_created_idx
  on public.campaign_analytics (user_id, created_at desc);

create index if not exists campaign_analytics_dealership_idx
  on public.campaign_analytics (user_id, dealership_name, performance_score desc);

create index if not exists campaign_analytics_campaign_idx
  on public.campaign_analytics (campaign_id)
  where campaign_id is not null;

alter table public.campaign_analytics enable row level security;

drop policy if exists "Users can view their own campaign analytics" on public.campaign_analytics;
drop policy if exists "Users can insert their own campaign analytics" on public.campaign_analytics;

create policy "Users can view their own campaign analytics"
  on public.campaign_analytics
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own campaign analytics"
  on public.campaign_analytics
  for insert
  to authenticated
  with check (auth.uid() = user_id);
