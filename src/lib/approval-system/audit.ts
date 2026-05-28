import { createClient } from "@/lib/supabase/server";
import type { ApprovalAuditEntry } from "@/types/approval";

type AuditRow = {
  id: string;
  user_id: string;
  approval_id: string | null;
  dealership_name: string;
  action: string;
  actor_label: string;
  original_content: string | null;
  updated_content: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function mapRow(row: AuditRow): ApprovalAuditEntry {
  return {
    id: row.id,
    userId: row.user_id,
    approvalId: row.approval_id,
    dealershipName: row.dealership_name,
    action: row.action,
    actorLabel: row.actor_label,
    originalContent: row.original_content,
    updatedContent: row.updated_content,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

export async function logApprovalAudit({
  userId,
  approvalId,
  dealershipName,
  action,
  actorLabel = "user",
  originalContent,
  updatedContent,
  metadata,
}: {
  userId: string;
  approvalId?: string | null;
  dealershipName: string;
  action: string;
  actorLabel?: string;
  originalContent?: string | null;
  updatedContent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("approval_audit_log").insert({
    user_id: userId,
    approval_id: approvalId ?? null,
    dealership_name: dealershipName,
    action,
    actor_label: actorLabel,
    original_content: originalContent ?? null,
    updated_content: updatedContent ?? null,
    metadata: metadata ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function listApprovalAuditLog(
  limit = 50,
): Promise<ApprovalAuditEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("approval_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as AuditRow[]).map(mapRow);
}
