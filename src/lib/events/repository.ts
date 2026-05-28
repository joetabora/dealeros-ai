import { createClient } from "@/lib/supabase/server";
import { clampPageSize } from "@/lib/tenant/scoped-query";
import type {
  DealershipEvent,
  EventInput,
  EventPromotionPack,
  EventType,
} from "@/types/event";

type EventRow = {
  id: string;
  user_id: string;
  dealership_name: string;
  event_name: string;
  event_type: string;
  description: string;
  event_date: string;
  created_at: string;
  promotion_pack_json: EventPromotionPack | null;
};

function mapRow(row: EventRow): DealershipEvent {
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    eventName: row.event_name,
    eventType: row.event_type as EventType,
    description: row.description,
    eventDate: row.event_date,
    createdAt: row.created_at,
    promotionPack: row.promotion_pack_json,
  };
}

export async function listEvents(limit = 50, dealershipId?: string): Promise<DealershipEvent[]> {
  const supabase = await createClient();
  const pageSize = clampPageSize(limit);

  let query = supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(pageSize);

  if (dealershipId) {
    query = query.eq("dealership_id", dealershipId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as EventRow[]).map(mapRow);
}

export async function getEvent(id: string): Promise<DealershipEvent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRow(data as EventRow) : null;
}

export async function createEvent({
  userId,
  dealershipId,
  dealershipName,
  input,
  promotionPack,
}: {
  userId: string;
  dealershipId?: string;
  dealershipName: string;
  input: EventInput;
  promotionPack?: EventPromotionPack;
}): Promise<DealershipEvent> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: userId,
      dealership_id: dealershipId ?? null,
      dealership_name: dealershipName,
      event_name: input.eventName,
      event_type: input.eventType,
      description: input.description,
      event_date: input.eventDate,
      promotion_pack_json: promotionPack ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as EventRow);
}

export async function updateEventPromotionPack(
  id: string,
  promotionPack: EventPromotionPack,
): Promise<DealershipEvent> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update({ promotion_pack_json: promotionPack })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as EventRow);
}

export async function saveEventPromotionPackItem({
  eventId,
  itemId,
  content,
}: {
  eventId: string;
  itemId: string;
  content: string;
}): Promise<DealershipEvent> {
  const event = await getEvent(eventId);

  if (!event?.promotionPack) {
    throw new Error("Promotion pack not found for this event.");
  }

  const nextPack: EventPromotionPack = {
    ...event.promotionPack,
    items: event.promotionPack.items.map((item) =>
      item.id === itemId ? { ...item, content } : item,
    ),
  };

  return updateEventPromotionPack(eventId, nextPack);
}
