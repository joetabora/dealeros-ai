-- DealerOS AI: campaign generation history
create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dealership_name text not null,
  campaign_type text not null,
  inputs_json jsonb not null,
  outputs_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_generations_user_id_created_at_idx
  on public.ai_generations (user_id, created_at desc);

alter table public.ai_generations enable row level security;

create policy "Users can view their own generations"
  on public.ai_generations
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own generations"
  on public.ai_generations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own generations"
  on public.ai_generations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
  on public.ai_generations
  for delete
  to authenticated
  using (auth.uid() = user_id);
