export {
  getCrmDashboardAction,
  markPipelineContactedAction,
  scheduleFollowUpAction,
  updatePipelineNotesAction,
  updatePipelineStageAction,
} from "@/lib/crm/actions";
export {
  buildPipelineSummary,
  getPipelineByLeadId,
  groupPipelineByBoardStage,
  insertPipelineFromLead,
  listPipelineEntries,
  listPipelineWithLeads,
  schedulePipelineFollowUp,
  updatePipelineNotes,
  updatePipelineStage,
} from "@/lib/crm/repository";
export {
  buildRecommendedAction,
  enrichPipelineEntry,
  estimateConversionLikelihood,
  inferFollowUpForStage,
  inferPipelinePriority,
  mapStageToLeadStatus,
  resolveUrgencyLevel,
} from "@/lib/crm/follow-up-engine";
export { syncCrmMemory } from "@/lib/crm/memory";
