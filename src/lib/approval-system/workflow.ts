import { logApprovalAudit } from "@/lib/approval-system/audit";
import {
  shouldAutoApproveOnSchedule,
  shouldScheduleOnGenerate,
} from "@/lib/approval-system/gates";
import {
  getApprovalById,
  getControlMode,
  insertApproval,
  updateApprovalStatus,
} from "@/lib/approval-system/repository";
import {
  insertScheduledActions,
  updateScheduledActionContent,
  markScheduledActionSkipped,
} from "@/lib/scheduling/repository";
import type {
  ApprovalEditChanges,
  ApprovalStatus,
  ControlMode,
  MarketingApproval,
  SubmitApprovalItem,
} from "@/types/approval";
import type { ScheduledMarketingAction } from "@/types/scheduling";

function resolveInitialStatus(controlMode: ControlMode): ApprovalStatus {
  return shouldAutoApproveOnSchedule(controlMode) ? "approved" : "pending";
}

export async function submitForApproval({
  userId,
  item,
  controlMode,
}: {
  userId: string;
  item: SubmitApprovalItem;
  controlMode?: ControlMode;
}): Promise<MarketingApproval> {
  const mode =
    controlMode ?? (await getControlMode(userId, item.dealershipName));
  const status = resolveInitialStatus(mode);

  const approval = await insertApproval({ userId, item, status });

  await logApprovalAudit({
    userId,
    approvalId: approval.id,
    dealershipName: item.dealershipName,
    action: status === "approved" ? "auto_approved" : "submitted",
    originalContent: item.content,
    updatedContent: item.content,
    metadata: {
      platform: item.platform,
      scheduledFor: item.scheduledFor,
      controlMode: mode,
    },
  });

  return approval;
}

export async function submitBatchForApproval({
  userId,
  items,
  controlMode,
}: {
  userId: string;
  items: SubmitApprovalItem[];
  controlMode?: ControlMode;
}) {
  const approvals: MarketingApproval[] = [];

  for (const item of items) {
    const approval = await submitForApproval({ userId, item, controlMode });
    approvals.push(approval);
  }

  return approvals;
}

export async function approveItem({
  userId,
  approvalId,
  actorLabel = "user",
  force = false,
}: {
  userId: string;
  approvalId: string;
  actorLabel?: string;
  force?: boolean;
}): Promise<MarketingApproval> {
  const approval = await getApprovalById(approvalId);
  if (!approval) {
    throw new Error("Approval item not found.");
  }

  let scheduledActionId = approval.scheduledActionId;

  if (!scheduledActionId) {
    const snapshot = approval.contentSnapshot;
    const [saved] = await insertScheduledActions({
      userId,
      actions: [
        {
          dealershipName: approval.dealershipName,
          campaignId: approval.campaignId,
          eventId: snapshot.eventId ?? null,
          platform: approval.platform,
          contentType: snapshot.contentType,
          content: snapshot.content,
          scheduledFor: snapshot.scheduledFor,
          status: "pending",
        },
      ],
    });
    scheduledActionId = saved?.id ?? null;
  }

  await updateApprovalStatus({
    approvalId,
    status: "approved",
    scheduledActionId,
  });

  await logApprovalAudit({
    userId,
    approvalId,
    dealershipName: approval.dealershipName,
    action: force ? "force_approved" : "approved",
    actorLabel,
    originalContent: approval.contentSnapshot.originalContent,
    updatedContent: approval.contentSnapshot.content,
    metadata: { scheduledActionId },
  });

  const updated = await getApprovalById(approvalId);
  if (!updated) {
    throw new Error("Unable to load updated approval.");
  }

  return updated;
}

export async function rejectItem({
  userId,
  approvalId,
  actorLabel = "user",
}: {
  userId: string;
  approvalId: string;
  actorLabel?: string;
}) {
  const approval = await getApprovalById(approvalId);
  if (!approval) {
    throw new Error("Approval item not found.");
  }

  if (approval.scheduledActionId) {
    await markScheduledActionSkipped(approval.scheduledActionId);
  }

  await updateApprovalStatus({
    approvalId,
    status: "rejected",
  });

  await logApprovalAudit({
    userId,
    approvalId,
    dealershipName: approval.dealershipName,
    action: "rejected",
    actorLabel,
    originalContent: approval.contentSnapshot.originalContent,
    updatedContent: approval.contentSnapshot.content,
  });

  return getApprovalById(approvalId);
}

export async function editItem({
  userId,
  approvalId,
  changes,
  actorLabel = "user",
}: {
  userId: string;
  approvalId: string;
  changes: ApprovalEditChanges;
  actorLabel?: string;
}) {
  const approval = await getApprovalById(approvalId);
  if (!approval) {
    throw new Error("Approval item not found.");
  }

  const snapshot = {
    ...approval.contentSnapshot,
    content: changes.content ?? approval.contentSnapshot.content,
    scheduledFor:
      changes.scheduledFor ?? approval.contentSnapshot.scheduledFor,
  };

  if (approval.scheduledActionId) {
    await updateScheduledActionContent({
      actionId: approval.scheduledActionId,
      content: snapshot.content,
      scheduledFor: snapshot.scheduledFor,
    });
  }

  await updateApprovalStatus({
    approvalId,
    status: "edited",
    contentSnapshot: snapshot,
  });

  await logApprovalAudit({
    userId,
    approvalId,
    dealershipName: approval.dealershipName,
    action: "edited",
    actorLabel,
    originalContent: approval.contentSnapshot.originalContent,
    updatedContent: snapshot.content,
    metadata: {
      scheduledFor: snapshot.scheduledFor,
    },
  });

  return getApprovalById(approvalId);
}

export async function processScheduledActionsWithApproval({
  userId,
  savedActions,
  controlMode,
  context,
}: {
  userId: string;
  savedActions: ScheduledMarketingAction[];
  controlMode: ControlMode;
  context?: { campaignLabel?: string; eventName?: string };
}) {
  for (const action of savedActions) {
    await submitForApproval({
      userId,
      item: {
        dealershipName: action.dealershipName,
        campaignId: action.campaignId,
        eventId: action.eventId,
        scheduledActionId: action.id,
        platform: action.platform,
        contentType: action.contentType,
        content: action.content,
        scheduledFor: action.scheduledFor,
        campaignLabel: context?.campaignLabel,
        eventName: context?.eventName,
      },
      controlMode,
    });
  }

  return savedActions;
}

export async function queueItemsForManualApproval({
  userId,
  items,
  controlMode,
  context,
}: {
  userId: string;
  items: Array<{
    dealershipName: string;
    campaignId?: string | null;
    eventId?: string | null;
    platform: SubmitApprovalItem["platform"];
    contentType: SubmitApprovalItem["contentType"];
    content: string;
    scheduledFor: string;
  }>;
  controlMode: ControlMode;
  context?: { campaignLabel?: string; eventName?: string };
}) {
  const submitItems: SubmitApprovalItem[] = items.map((item) => ({
    ...item,
    campaignLabel: context?.campaignLabel,
    eventName: context?.eventName,
  }));

  return submitBatchForApproval({
    userId,
    items: submitItems,
    controlMode,
  });
}
