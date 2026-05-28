-- SaaS multi-tenant foundation: dealerships, roles, subscriptions, tenant RLS
-- Adds dealership_id to all tenant-scoped tables and backfills existing rows.

-- ---------------------------------------------------------------------------
-- Core tenant tables
-- ---------------------------------------------------------------------------

create table if not exists public.dealerships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dealership_members (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references public.dealerships (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (dealership_id, user_id),
  constraint dealership_members_role_check
    check (role in ('owner', 'manager', 'marketer', 'viewer'))
);

create index if not exists dealership_members_user_idx
  on public.dealership_members (user_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references public.dealerships (id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'growth',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_plan_check
    check (plan in ('starter', 'growth', 'pro')),
  constraint subscriptions_status_check
    check (status in ('active', 'canceled', 'past_due', 'trialing'))
);

-- ---------------------------------------------------------------------------
-- RLS helper: dealership IDs the current user belongs to
-- ---------------------------------------------------------------------------

create or replace function public.user_dealership_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select dealership_id from public.dealership_members where user_id = auth.uid();
$$;

create or replace function public.user_has_dealership_access(target_dealership_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dealership_members
    where user_id = auth.uid()
      and dealership_id = target_dealership_id
  );
$$;

-- ---------------------------------------------------------------------------
-- Add dealership_id columns (nullable for backfill)
-- ---------------------------------------------------------------------------

alter table public.campaigns add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.events add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.marketing_campaigns add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.scheduled_marketing_actions add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.campaign_analytics add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.dealership_memory add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.dealership_control_settings add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.marketing_approvals add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.approval_audit_log add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.leads add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;
alter table public.crm_pipeline add column if not exists dealership_id uuid references public.dealerships (id) on delete cascade;

-- ---------------------------------------------------------------------------
-- Backfill dealerships from existing (user_id, dealership_name) pairs
-- ---------------------------------------------------------------------------

create temp table if not exists _tenant_backfill as
select distinct user_id, dealership_name
from (
  select user_id, dealership_name from public.campaigns
  union
  select user_id, dealership_name from public.events
  union
  select user_id, dealership_name from public.marketing_campaigns
  union
  select user_id, dealership_name from public.scheduled_marketing_actions
  union
  select user_id, dealership_name from public.campaign_analytics
  union
  select user_id, dealership_name from public.dealership_memory
  union
  select user_id, dealership_name from public.dealership_control_settings
  union
  select user_id, dealership_name from public.marketing_approvals
  union
  select user_id, dealership_name from public.approval_audit_log
  union
  select user_id, dealership_name from public.leads
  union
  select user_id, dealership_name from public.crm_pipeline
) sources
where user_id is not null and dealership_name is not null;

create temp table if not exists _tenant_map as
select
  user_id,
  dealership_name,
  gen_random_uuid() as dealership_id,
  lower(regexp_replace(dealership_name, '[^a-zA-Z0-9]+', '-', 'g'))
    || '-'
    || substr(md5(user_id::text || dealership_name), 1, 8) as slug
from _tenant_backfill;

insert into public.dealerships (id, name, slug)
select dealership_id, dealership_name, slug
from _tenant_map
on conflict (slug) do nothing;

insert into public.dealership_members (dealership_id, user_id, role)
select tm.dealership_id, tm.user_id, 'owner'
from _tenant_map tm
join public.dealerships d on d.id = tm.dealership_id
on conflict (dealership_id, user_id) do nothing;

insert into public.subscriptions (dealership_id, plan, status)
select tm.dealership_id, 'growth', 'active'
from _tenant_map tm
join public.dealerships d on d.id = tm.dealership_id
on conflict (dealership_id) do nothing;

-- Propagate dealership_id to tenant tables
update public.campaigns t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.events t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.marketing_campaigns t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.scheduled_marketing_actions t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.campaign_analytics t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.dealership_memory t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.dealership_control_settings t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.marketing_approvals t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.approval_audit_log t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.leads t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

update public.crm_pipeline t
set dealership_id = tm.dealership_id
from _tenant_map tm
where t.user_id = tm.user_id and t.dealership_name = tm.dealership_name and t.dealership_id is null;

-- CRM pipeline can also inherit from leads
update public.crm_pipeline cp
set dealership_id = l.dealership_id
from public.leads l
where cp.lead_id = l.id and cp.dealership_id is null and l.dealership_id is not null;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists campaigns_dealership_idx on public.campaigns (dealership_id, created_at desc);
create index if not exists events_dealership_idx on public.events (dealership_id, created_at desc);
create index if not exists marketing_campaigns_dealership_idx on public.marketing_campaigns (dealership_id, created_at desc);
create index if not exists scheduled_actions_dealership_idx on public.scheduled_marketing_actions (dealership_id, scheduled_for);
create index if not exists campaign_analytics_dealership_idx on public.campaign_analytics (dealership_id, created_at desc);
create index if not exists dealership_memory_dealership_idx on public.dealership_memory (dealership_id, memory_type);
create index if not exists leads_dealership_idx on public.leads (dealership_id, created_at desc);
create index if not exists crm_pipeline_dealership_idx on public.crm_pipeline (dealership_id, stage);

-- ---------------------------------------------------------------------------
-- Tenant RLS on core tables
-- ---------------------------------------------------------------------------

alter table public.dealerships enable row level security;
alter table public.dealership_members enable row level security;
alter table public.subscriptions enable row level security;

create policy "Members can view their dealerships"
  on public.dealerships for select to authenticated
  using (id in (select public.user_dealership_ids()));

create policy "Members can view dealership membership"
  on public.dealership_members for select to authenticated
  using (dealership_id in (select public.user_dealership_ids()));

create policy "Owners can manage dealership membership"
  on public.dealership_members for all to authenticated
  using (
    dealership_id in (
      select dealership_id from public.dealership_members
      where user_id = auth.uid() and role = 'owner'
    )
  )
  with check (
    dealership_id in (
      select dealership_id from public.dealership_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

create policy "Members can view their subscription"
  on public.subscriptions for select to authenticated
  using (dealership_id in (select public.user_dealership_ids()));

-- Tenant-scoped policies (additive — keep user_id policies for backward compat)

create policy "Tenant isolation select campaigns"
  on public.campaigns for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation insert campaigns"
  on public.campaigns for insert to authenticated
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation update campaigns"
  on public.campaigns for update to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id))
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation select events"
  on public.events for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation insert events"
  on public.events for insert to authenticated
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation select marketing_campaigns"
  on public.marketing_campaigns for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation insert marketing_campaigns"
  on public.marketing_campaigns for insert to authenticated
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation select scheduled_marketing_actions"
  on public.scheduled_marketing_actions for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation insert scheduled_marketing_actions"
  on public.scheduled_marketing_actions for insert to authenticated
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation select campaign_analytics"
  on public.campaign_analytics for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation insert campaign_analytics"
  on public.campaign_analytics for insert to authenticated
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation select dealership_memory"
  on public.dealership_memory for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation insert dealership_memory"
  on public.dealership_memory for insert to authenticated
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation update dealership_memory"
  on public.dealership_memory for update to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id))
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation select leads"
  on public.leads for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation insert leads"
  on public.leads for insert to authenticated
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation update leads"
  on public.leads for update to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id))
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation select crm_pipeline"
  on public.crm_pipeline for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation insert crm_pipeline"
  on public.crm_pipeline for insert to authenticated
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation update crm_pipeline"
  on public.crm_pipeline for update to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id))
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation select marketing_approvals"
  on public.marketing_approvals for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation insert marketing_approvals"
  on public.marketing_approvals for insert to authenticated
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation update marketing_approvals"
  on public.marketing_approvals for update to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id))
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation select dealership_control_settings"
  on public.dealership_control_settings for select to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id));

create policy "Tenant isolation manage dealership_control_settings"
  on public.dealership_control_settings for all to authenticated
  using (dealership_id is null or public.user_has_dealership_access(dealership_id))
  with check (dealership_id is null or public.user_has_dealership_access(dealership_id));
