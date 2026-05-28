-- Execution layer fields for scheduled marketing actions
alter table public.scheduled_marketing_actions
  add column if not exists executed_at timestamptz,
  add column if not exists execution_status text not null default 'pending',
  add column if not exists provider_response jsonb;

alter table public.scheduled_marketing_actions
  drop constraint if exists scheduled_marketing_actions_status_check;

alter table public.scheduled_marketing_actions
  add constraint scheduled_marketing_actions_status_check
    check (status in ('pending', 'sent', 'skipped', 'failed'));

alter table public.scheduled_marketing_actions
  drop constraint if exists scheduled_marketing_actions_execution_status_check;

alter table public.scheduled_marketing_actions
  add constraint scheduled_marketing_actions_execution_status_check
    check (execution_status in ('pending', 'sent', 'failed'));

create index if not exists scheduled_actions_due_execution_idx
  on public.scheduled_marketing_actions (status, scheduled_for)
  where status = 'pending' and execution_status = 'pending';
