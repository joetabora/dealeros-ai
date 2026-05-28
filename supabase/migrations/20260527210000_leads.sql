-- Lead capture layer — engagement to contacts pipeline
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dealership_name text not null,
  campaign_id uuid,
  event_id uuid references public.events (id) on delete set null,
  name text,
  phone text,
  email text,
  source text not null,
  interest_type text not null default 'general',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  last_contacted_at timestamptz,
  constraint leads_source_check
    check (source in ('facebook', 'instagram', 'sms', 'email', 'event', 'manual')),
  constraint leads_interest_type_check
    check (interest_type in ('service', 'sales', 'event', 'general')),
  constraint leads_status_check
    check (status in ('new', 'contacted', 'converted', 'lost'))
);

create index if not exists leads_user_created_idx
  on public.leads (user_id, created_at desc);

create index if not exists leads_dealership_status_idx
  on public.leads (user_id, dealership_name, status);

create index if not exists leads_campaign_idx
  on public.leads (campaign_id)
  where campaign_id is not null;

create index if not exists leads_event_idx
  on public.leads (event_id)
  where event_id is not null;

alter table public.leads enable row level security;

create policy "Users can view their own leads"
  on public.leads
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own leads"
  on public.leads
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own leads"
  on public.leads
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
