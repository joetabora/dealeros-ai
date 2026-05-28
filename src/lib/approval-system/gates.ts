import {
  getApprovalByScheduledActionId,
  getControlMode,
} from "@/lib/approval-system/repository";
import type { ControlMode } from "@/types/approval";

const EXECUTABLE_STATUSES = new Set(["approved", "edited"]);

export async function canExecuteScheduledAction({
  scheduledActionId,
  userId,
  dealershipName,
  controlMode,
}: {
  scheduledActionId: string;
  userId?: string;
  dealershipName: string;
  controlMode?: ControlMode;
}): Promise<boolean> {
  const mode =
    controlMode ??
    (userId ? await getControlMode(userId, dealershipName) : "manual");

  if (mode !== "autopilot" && mode !== "assisted") {
    return false;
  }

  const approval = await getApprovalByScheduledActionId(scheduledActionId);
  if (!approval) {
    return mode === "autopilot";
  }

  return EXECUTABLE_STATUSES.has(approval.status);
}

export function requiresApprovalBeforeExecution(mode: ControlMode) {
  return mode === "manual" || mode === "assisted";
}

export function shouldAutoApproveOnSchedule(mode: ControlMode) {
  return mode === "autopilot";
}

export function shouldScheduleOnGenerate(mode: ControlMode) {
  return mode === "assisted" || mode === "autopilot";
}
