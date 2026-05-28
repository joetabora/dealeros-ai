import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ExecutionStatus,
  ScheduledContentType,
  ScheduledMarketingAction,
  ScheduledPlatform,
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
  execution_status: string;
  executed_at: string | null;
  provider_response: Record<string, unknown> | null;
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
    executionStatus: row.execution_status as ExecutionStatus,
    executedAt: row.executed_at,
    providerResponse: row.provider_response,
    createdAt: row.created_at,
  };
}

async function getClient(useAdmin: boolean) {
  if (useAdmin) {
    const admin = createAdminClient();
    if (admin) return admin;
  }

  return createClient();
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

export async function listDuePendingActions({
  userId,
  limit = 50,
  includeFuture = false,
  useAdmin = false,
}: {
  userId?: string;
  limit?: number;
  includeFuture?: boolean;
  useAdmin?: boolean;
} = {}): Promise<ScheduledMarketingAction[]> {
  const supabase = await getClient(useAdmin);
  const now = new Date().toISOString();

  let query = supabase
    .from("scheduled_marketing_actions")
    .select("*")
    .eq("status", "pending")
    .eq("execution_status", "pending")
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (!includeFuture) {
    query = query.lte("scheduled_for", now);
  }

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

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
    execution_status: "pending",
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

export async function markActionExecutionSent({
  actionId,
  providerMessageId,
  providerResponse,
  simulated = false,
  useAdmin = false,
}: {
  actionId: string;
  providerMessageId?: string;
  providerResponse: Record<string, unknown>;
  simulated?: boolean;
  useAdmin?: boolean;
}) {
  const supabase = await getClient(useAdmin);
  const executedAt = new Date().toISOString();

  const { error } = await supabase
    .from("scheduled_marketing_actions")
    .update({
      status: "sent",
      execution_status: "sent",
      executed_at: executedAt,
      provider_response: {
        ...providerResponse,
        providerMessageId,
        simulated,
      },
    })
    .eq("id", actionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markActionExecutionFailed({
  actionId,
  error: failureMessage,
  providerResponse,
  useAdmin = false,
}: {
  actionId: string;
  error: string;
  providerResponse: Record<string, unknown>;
  useAdmin?: boolean;
}) {
  const supabase = await getClient(useAdmin);
  const executedAt = new Date().toISOString();

  const { error } = await supabase
    .from("scheduled_marketing_actions")
    .update({
      status: "failed",
      execution_status: "failed",
      executed_at: executedAt,
      provider_response: {
        ...providerResponse,
        error: failureMessage,
      },
    })
    .eq("id", actionId);

  if (error) {
    throw new Error(error.message);
  }
}
