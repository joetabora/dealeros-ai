"use server";

import { revalidatePath } from "next/cache";

import { listApprovalAuditLog } from "@/lib/approval-system/audit";
import {
  getControlMode,
  listApprovals,
  listPendingApprovals,
  setControlMode,
} from "@/lib/approval-system/repository";
import {
  approveItem,
  editItem,
  rejectItem,
} from "@/lib/approval-system/workflow";
import { executeDueActions } from "@/lib/execution-engine/executor";
import { requireSession } from "@/lib/auth/session";
import type {
  ApprovalEditChanges,
  ControlMode,
  MarketingApproval,
} from "@/types/approval";

function revalidateApprovalRoutes() {
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/marketing");
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/settings");
}

export async function getApprovalsDashboardAction() {
  try {
    const session = await requireSession();
    const [pending, recent, auditLog, controlMode] = await Promise.all([
      listPendingApprovals(50),
      listApprovals(30),
      listApprovalAuditLog(20),
      getControlMode(session.user.id, session.dealer.name),
    ]);

    return { pending, recent, auditLog, controlMode };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to load approvals.",
    };
  }
}

export async function approveItemAction(approvalId: string) {
  try {
    const session = await requireSession();
    const approval = await approveItem({
      userId: session.user.id,
      approvalId,
    });
    revalidateApprovalRoutes();
    return { approval };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to approve item.",
    };
  }
}

export async function rejectItemAction(approvalId: string) {
  try {
    const session = await requireSession();
    const approval = await rejectItem({
      userId: session.user.id,
      approvalId,
    });
    revalidateApprovalRoutes();
    return { approval };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to reject item.",
    };
  }
}

export async function editItemAction(
  approvalId: string,
  changes: ApprovalEditChanges,
) {
  try {
    const session = await requireSession();
    const approval = await editItem({
      userId: session.user.id,
      approvalId,
      changes,
    });
    revalidateApprovalRoutes();
    return { approval };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to edit item.",
    };
  }
}

export async function forceApproveAndExecuteAction(approvalId: string) {
  try {
    const session = await requireSession();
    const approval = await approveItem({
      userId: session.user.id,
      approvalId,
      force: true,
    });

    if (approval?.scheduledActionId) {
      await executeDueActions({
        userId: session.user.id,
        actionIds: [approval.scheduledActionId],
        simulate: false,
      });
    }

    revalidateApprovalRoutes();
    return { approval };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to force approve and execute.",
    };
  }
}

export async function updateControlModeAction(controlMode: ControlMode) {
  try {
    const session = await requireSession();
    const settings = await setControlMode({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      controlMode,
    });
    revalidateApprovalRoutes();
    return { settings };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update control mode.",
    };
  }
}

export async function getControlModeAction() {
  try {
    const session = await requireSession();
    const controlMode = await getControlMode(
      session.user.id,
      session.dealer.name,
    );
    return { controlMode };
  } catch (error) {
    return { controlMode: "manual" as ControlMode };
  }
}

export type { MarketingApproval } from "@/types/approval";
