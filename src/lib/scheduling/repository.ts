import { createClient } from "@/lib/supabase/server";
import type {
  ScheduledMarketingAction,
  ScheduledPlatform,
  ScheduledContentType,
  ScheduledStatus,
} from "@/types/scheduling";

type ScheduledActionRow = {
  id: string;
  user_id: string;
  dealership_name: string;
  campaign_id: string | null;
  event_id: string | null;
  platform: string;
  content_type: string;
  content: string;
  scheduled_for: string;
  status: string;
  created_at: string;
};

type InsertAction = {
  dealershipName: string;
  campaignId?: string | null;
  eventId?: string | null;
  platform: ScheduledPlatform;
  contentType: ScheduledContentType;
  content: string;
  scheduledFor: string;
  status?: ScheduledStatus;
};

function mapRow(row: ScheduledActionRow): ScheduledMarketingAction {
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    campaignId: row.campaign_id,
    eventId: row.event_id,
    platform: row.platform as ScheduledPlatform,
    contentType: row.content_type as ScheduledContentType,
    content: row.content,
    scheduledFor: row.scheduled_for,
    status: row.status as ScheduledStatus,
    createdAt: row.created_at,
  };
}

export async function listScheduledActions(
  limit = 100,
): Promise<ScheduledMarketingAction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scheduled_marketing_actions")
    .select("*")
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as ScheduledActionRow[]).map(mapRow);
}

export async function insertScheduledActions({
  userId,
  actions,
}: {
  userId: string;
  actions: InsertAction[];
}): Promise<ScheduledMarketingAction[]> {
  if (actions.length === 0) return [];

  const supabase = await createClient();

  const rows = actions.map((action) => ({
    user_id: userId,
    dealership_name: action.dealershipName,
    campaign_id: action.campaignId ?? null,
    event_id: action.eventId ?? null,
    platform: action.platform,
    content_type: action.contentType,
    content: action.content,
    scheduled_for: action.scheduledFor,
    status: action.status ?? "pending",
  }));

  const { data, error } = await supabase
    .from("scheduled_marketing_actions")
    .insert(rows)
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (data as ScheduledActionRow[]).map(mapRow);
}
