-- Human override + sales control layer
create table if not exists public.dealership_control_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dealership_name text not null,
  control_mode text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dealership_name),
  constraint dealership_control_settings_mode_check
    check (control_mode in ('manual', 'assisted', 'autopilot'))
);

create table if not exists public.marketing_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dealership_name text not null,
  campaign_id uuid,
  scheduled_action_id uuid references public.scheduled_marketing_actions (id) on delete set null,
  content_snapshot jsonb not null,
  platform text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_approvals_status_check
    check (status in ('pending', 'approved', 'rejected', 'edited'))
);

create table if not exists public.approval_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  approval_id uuid references public.marketing_approvals (id) on delete set null,
  dealership_name text not null,
  action text not null,
  actor_label text not null default 'user',
  original_content text,
  updated_content text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists marketing_approvals_user_status_idx
  on public.marketing_approvals (user_id, status, created_at desc);

create index if not exists marketing_approvals_scheduled_action_idx
  on public.marketing_approvals (scheduled_action_id)
  where scheduled_action_id is not null;

create index if not exists approval_audit_log_user_created_idx
  on public.approval_audit_log (user_id, created_at desc);

alter table public.dealership_control_settings enable row level security;
alter table public.marketing_approvals enable row level security;
alter table public.approval_audit_log enable row level security;

create policy "Users can manage their control settings"
  on public.dealership_control_settings
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view their marketing approvals"
  on public.marketing_approvals
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their marketing approvals"
  on public.marketing_approvals
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their marketing approvals"
  on public.marketing_approvals
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view their approval audit log"
  on public.approval_audit_log
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their approval audit log"
  on public.approval_audit_log
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create or replace function public.set_dealership_control_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dealership_control_settings_updated_at
  on public.dealership_control_settings;

create trigger dealership_control_settings_updated_at
before update on public.dealership_control_settings
for each row
execute function public.set_dealership_control_settings_updated_at();

create or replace function public.set_marketing_approvals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists marketing_approvals_updated_at on public.marketing_approvals;

create trigger marketing_approvals_updated_at
before update on public.marketing_approvals
for each row
execute function public.set_marketing_approvals_updated_at();
