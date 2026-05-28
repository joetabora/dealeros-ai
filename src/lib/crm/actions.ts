"use server";

import { revalidatePath } from "next/cache";

import { syncCrmMemory } from "@/lib/crm/memory";
import {
  buildPipelineSummary,
  groupPipelineByBoardStage,
  listPipelineWithLeads,
  schedulePipelineFollowUp,
  updatePipelineNotes,
  updatePipelineStage,
} from "@/lib/crm/repository";
import { listLeads } from "@/lib/leads/repository";
import { requireSession } from "@/lib/auth/session";
import type { CrmNextAction, CrmStage } from "@/types/crm";

function revalidateCrmRoutes() {
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/autopilot");
}

export async function getCrmDashboardAction() {
  try {
    const session = await requireSession();
    const leads = await listLeads(200, session.tenant.dealershipId);
    const pipeline = await listPipelineWithLeads(leads, 200);
    const summary = buildPipelineSummary(pipeline);
    const board = groupPipelineByBoardStage(pipeline);

    return { pipeline, summary, board };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to load CRM pipeline.",
    };
  }
}

export async function updatePipelineStageAction(pipelineId: string, stage: CrmStage) {
  try {
    const session = await requireSession();
    const leads = await listLeads(200, session.tenant.dealershipId);
    const pipeline = await listPipelineWithLeads(leads, 200);
    const entry = pipeline.find((item) => item.id === pipelineId);

    if (!entry) {
      return { error: "Pipeline entry not found." };
    }

    await updatePipelineStage({
      pipelineId,
      stage,
      lead: entry.lead,
    });

    const refreshed = await listPipelineWithLeads(
      await listLeads(200, session.tenant.dealershipId),
      200,
    );
    await syncCrmMemory({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      entries: refreshed,
    });

    revalidateCrmRoutes();
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update pipeline stage.",
    };
  }
}

export async function updatePipelineNotesAction(pipelineId: string, notes: string) {
  try {
    const session = await requireSession();
    await updatePipelineNotes({ pipelineId, notes });

    const refreshed = await listPipelineWithLeads(
      await listLeads(200, session.tenant.dealershipId),
      200,
    );
    await syncCrmMemory({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      entries: refreshed,
    });

    revalidateCrmRoutes();
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save notes.",
    };
  }
}

export async function scheduleFollowUpAction({
  pipelineId,
  nextAction,
  nextActionDate,
}: {
  pipelineId: string;
  nextAction: CrmNextAction;
  nextActionDate: string;
}) {
  try {
    const session = await requireSession();
    await schedulePipelineFollowUp({ pipelineId, nextAction, nextActionDate });

    const refreshed = await listPipelineWithLeads(
      await listLeads(200, session.tenant.dealershipId),
      200,
    );
    await syncCrmMemory({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      entries: refreshed,
    });

    revalidateCrmRoutes();
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to schedule follow-up.",
    };
  }
}

export async function markPipelineContactedAction(pipelineId: string) {
  return updatePipelineStageAction(pipelineId, "contacted");
}
