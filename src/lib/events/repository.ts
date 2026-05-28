import { createClient } from "@/lib/supabase/server";
import type { DealershipEvent, EventInput, EventType } from "@/types/event";

type EventRow = {
  id: string;
  user_id: string;
  dealership_name: string;
  event_name: string;
  event_type: string;
  description: string;
  event_date: string;
  created_at: string;
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
  };
}

export async function listEvents(limit = 50): Promise<DealershipEvent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as EventRow[]).map(mapRow);
}

export async function createEvent({
  userId,
  dealershipName,
  input,
}: {
  userId: string;
  dealershipName: string;
  input: EventInput;
}): Promise<DealershipEvent> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: userId,
      dealership_name: dealershipName,
      event_name: input.eventName,
      event_type: input.eventType,
      description: input.description,
      event_date: input.eventDate,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as EventRow);
}
