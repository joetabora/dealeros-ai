-- Event promotion packs stored as JSON on events
alter table public.events
  add column if not exists promotion_pack_json jsonb;

create index if not exists events_promotion_pack_idx
  on public.events using gin (promotion_pack_json);
