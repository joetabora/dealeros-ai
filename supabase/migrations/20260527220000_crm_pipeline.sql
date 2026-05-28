-- CRM Lite layer — sales pipeline from captured leads
create table if not exists public.crm_pipeline (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  dealership_name text not null,
  stage text not null default 'new',
  priority text not null default 'medium',
  next_action text not null default 'call',
  next_action_date timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_pipeline_lead_unique unique (lead_id),
  constraint crm_pipeline_stage_check
    check (stage in ('new', 'contacted', 'qualified', 'appointment_set', 'converted', 'lost')),
  constraint crm_pipeline_priority_check
    check (priority in ('low', 'medium', 'high')),
  constraint crm_pipeline_next_action_check
    check (next_action in ('call', 'text', 'email', 'none'))
);

create index if not exists crm_pipeline_user_stage_idx
  on public.crm_pipeline (user_id, stage, updated_at desc);

create index if not exists crm_pipeline_dealership_idx
  on public.crm_pipeline (user_id, dealership_name, stage);

create index if not exists crm_pipeline_next_action_date_idx
  on public.crm_pipeline (user_id, next_action_date)
  where next_action_date is not null;

alter table public.crm_pipeline enable row level security;

create policy "Users can view their own CRM pipeline"
  on public.crm_pipeline
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own CRM pipeline"
  on public.crm_pipeline
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own CRM pipeline"
  on public.crm_pipeline
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
