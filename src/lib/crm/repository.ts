import { createClient } from "@/lib/supabase/server";
import {
  enrichPipelineEntry,
  inferFollowUpForStage,
  inferPipelinePriority,
} from "@/lib/crm/follow-up-engine";
import { updateLeadStatus } from "@/lib/leads/repository";
import type {
  CreatePipelineInput,
  CrmNextAction,
  CrmPipelineEntry,
  CrmPipelineSummary,
  CrmPipelineWithLead,
  CrmPriority,
  CrmStage,
} from "@/types/crm";
import type { DealershipLead } from "@/types/leads";
import { CRM_STAGES } from "@/types/crm";

type PipelineRow = {
  id: string;
  user_id: string;
  lead_id: string;
  dealership_name: string;
  stage: string;
  priority: string;
  next_action: string;
  next_action_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: PipelineRow): CrmPipelineEntry {
  return {
    id: row.id,
    userId: row.user_id,
    leadId: row.lead_id,
    dealershipName: row.dealership_name,
    stage: row.stage as CrmStage,
    priority: row.priority as CrmPriority,
    nextAction: row.next_action as CrmNextAction,
    nextActionDate: row.next_action_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function attachLead(entry: CrmPipelineEntry, lead: DealershipLead): CrmPipelineWithLead {
  const enrichment = enrichPipelineEntry(entry, lead);
  return { ...entry, lead, ...enrichment };
}

export async function insertPipelineFromLead(input: CreatePipelineInput): Promise<CrmPipelineEntry> {
  const supabase = await createClient();
  const priority = inferPipelinePriority(input);
  const followUp = inferFollowUpForStage("new", input.lead);

  const { data, error } = await supabase
    .from("crm_pipeline")
    .insert({
      user_id: input.userId,
      lead_id: input.lead.id,
      dealership_name: input.lead.dealershipName,
      stage: "new",
      priority,
      next_action: followUp.nextAction,
      next_action_date: followUp.nextActionDate?.toISOString() ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as PipelineRow);
}

export async function getPipelineByLeadId(leadId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_pipeline")
    .select("*")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRow(data as PipelineRow) : null;
}

export async function listPipelineEntries(limit = 200): Promise<CrmPipelineEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_pipeline")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as PipelineRow[]).map(mapRow);
}

export async function listPipelineWithLeads(
  leads: DealershipLead[],
  limit = 200,
): Promise<CrmPipelineWithLead[]> {
  const entries = await listPipelineEntries(limit);
  const leadMap = new Map(leads.map((lead) => [lead.id, lead]));

  return entries
    .map((entry) => {
      const lead = leadMap.get(entry.leadId);
      if (!lead) return null;
      return attachLead(entry, lead);
    })
    .filter((entry): entry is CrmPipelineWithLead => entry !== null);
}

export async function updatePipelineStage({
  pipelineId,
  stage,
  lead,
}: {
  pipelineId: string;
  stage: CrmStage;
  lead: DealershipLead;
}) {
  const supabase = await createClient();
  const followUp = inferFollowUpForStage(stage, lead);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("crm_pipeline")
    .update({
      stage,
      next_action: followUp.nextAction,
      next_action_date: followUp.nextActionDate?.toISOString() ?? null,
      updated_at: now,
    })
    .eq("id", pipelineId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const entry = mapRow(data as PipelineRow);

  if (stage === "contacted" || stage === "qualified" || stage === "appointment_set") {
    await updateLeadStatus({ leadId: lead.id, status: "contacted" });
  } else if (stage === "converted") {
    await updateLeadStatus({ leadId: lead.id, status: "converted" });
  } else if (stage === "lost") {
    await updateLeadStatus({ leadId: lead.id, status: "lost" });
  } else if (stage === "new") {
    await updateLeadStatus({ leadId: lead.id, status: "new" });
  }

  return entry;
}

export async function updatePipelineNotes({
  pipelineId,
  notes,
}: {
  pipelineId: string;
  notes: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_pipeline")
    .update({
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pipelineId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as PipelineRow);
}

export async function schedulePipelineFollowUp({
  pipelineId,
  nextAction,
  nextActionDate,
}: {
  pipelineId: string;
  nextAction: CrmNextAction;
  nextActionDate: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_pipeline")
    .update({
      next_action: nextAction,
      next_action_date: nextActionDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pipelineId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as PipelineRow);
}

export function buildPipelineSummary(entries: CrmPipelineWithLead[]): CrmPipelineSummary {
  const byStage = CRM_STAGES.reduce(
    (map, stage) => {
      map[stage] = entries.filter((entry) => entry.stage === stage).length;
      return map;
    },
    {} as Record<CrmStage, number>,
  );

  const active = entries.filter(
    (entry) => entry.stage !== "converted" && entry.stage !== "lost",
  );
  const dueToday = active.filter((entry) => entry.urgencyLevel === "today").length;
  const highPriority = active.filter((entry) => entry.priority === "high").length;
  const converted = byStage.converted;
  const total = entries.length;

  return {
    total,
    byStage,
    dueToday,
    highPriority,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
  };
}

export function groupPipelineByBoardStage(entries: CrmPipelineWithLead[]) {
  return {
    new: entries.filter((entry) => entry.stage === "new"),
    contacted: entries.filter((entry) => entry.stage === "contacted"),
    qualified: entries.filter((entry) => entry.stage === "qualified"),
    appointment_set: entries.filter((entry) => entry.stage === "appointment_set"),
    converted: entries.filter((entry) => entry.stage === "converted"),
    lost: entries.filter((entry) => entry.stage === "lost"),
  };
}
