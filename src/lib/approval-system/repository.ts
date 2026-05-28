import { createClient } from "@/lib/supabase/server";
import type {
  ApprovalContentSnapshot,
  ApprovalStatus,
  ControlMode,
  DealershipControlSettings,
  MarketingApproval,
  SubmitApprovalItem,
} from "@/types/approval";
import type { ScheduledPlatform } from "@/types/scheduling";

type ApprovalRow = {
  id: string;
  user_id: string;
  dealership_name: string;
  campaign_id: string | null;
  scheduled_action_id: string | null;
  content_snapshot: ApprovalContentSnapshot;
  platform: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ControlSettingsRow = {
  id: string;
  user_id: string;
  dealership_name: string;
  control_mode: string;
  created_at: string;
  updated_at: string;
};

function mapApproval(row: ApprovalRow): MarketingApproval {
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    campaignId: row.campaign_id,
    scheduledActionId: row.scheduled_action_id,
    contentSnapshot: row.content_snapshot,
    platform: row.platform as ScheduledPlatform,
    status: row.status as ApprovalStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildSnapshot(item: SubmitApprovalItem): ApprovalContentSnapshot {
  return {
    content: item.content,
    originalContent: item.content,
    scheduledFor: item.scheduledFor,
    contentType: item.contentType,
    campaignLabel: item.campaignLabel,
    eventName: item.eventName,
    eventId: item.eventId ?? null,
  };
}

export async function getControlMode(
  userId: string,
  dealershipName: string,
): Promise<ControlMode> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dealership_control_settings")
      .select("control_mode")
      .eq("user_id", userId)
      .eq("dealership_name", dealershipName)
      .maybeSingle();

    if (error || !data) return "manual";
    return data.control_mode as ControlMode;
  } catch {
    return "manual";
  }
}

export async function setControlMode({
  userId,
  dealershipName,
  controlMode,
}: {
  userId: string;
  dealershipName: string;
  controlMode: ControlMode;
}): Promise<DealershipControlSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dealership_control_settings")
    .upsert(
      {
        user_id: userId,
        dealership_name: dealershipName,
        control_mode: controlMode,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,dealership_name" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as ControlSettingsRow;
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    controlMode: row.control_mode as ControlMode,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertApproval({
  userId,
  item,
  status,
}: {
  userId: string;
  item: SubmitApprovalItem;
  status: ApprovalStatus;
}): Promise<MarketingApproval> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_approvals")
    .insert({
      user_id: userId,
      dealership_name: item.dealershipName,
      campaign_id: item.campaignId ?? null,
      scheduled_action_id: item.scheduledActionId ?? null,
      content_snapshot: buildSnapshot(item),
      platform: item.platform,
      status,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapApproval(data as ApprovalRow);
}

export async function getApprovalById(
  approvalId: string,
): Promise<MarketingApproval | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_approvals")
    .select("*")
    .eq("id", approvalId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapApproval(data as ApprovalRow) : null;
}

export async function getApprovalByScheduledActionId(
  scheduledActionId: string,
): Promise<MarketingApproval | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_approvals")
    .select("*")
    .eq("scheduled_action_id", scheduledActionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapApproval(data as ApprovalRow) : null;
}

export async function listPendingApprovals(
  limit = 50,
): Promise<MarketingApproval[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_approvals")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as ApprovalRow[]).map(mapApproval);
}

export async function listApprovals(limit = 100): Promise<MarketingApproval[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_approvals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as ApprovalRow[]).map(mapApproval);
}

export async function updateApprovalStatus({
  approvalId,
  status,
  contentSnapshot,
  scheduledActionId,
}: {
  approvalId: string;
  status: ApprovalStatus;
  contentSnapshot?: ApprovalContentSnapshot;
  scheduledActionId?: string | null;
}) {
  const supabase = await createClient();

  const payload: Record<string, unknown> = { status };
  if (contentSnapshot) payload.content_snapshot = contentSnapshot;
  if (scheduledActionId !== undefined) {
    payload.scheduled_action_id = scheduledActionId;
  }

  const { error } = await supabase
    .from("marketing_approvals")
    .update(payload)
    .eq("id", approvalId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function linkApprovalToScheduledAction({
  approvalId,
  scheduledActionId,
}: {
  approvalId: string;
  scheduledActionId: string;
}) {
  await updateApprovalStatus({
    approvalId,
    status: "pending",
    scheduledActionId,
  });
}
