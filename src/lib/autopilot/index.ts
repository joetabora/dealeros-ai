export { analyzePerformanceHistory } from "@/lib/autopilot/analyzer";
export { recommendNextCampaign } from "@/lib/autopilot/recommender";
export {
  generateWeeklyPlan,
  updateWeeklyPlanDay,
} from "@/lib/autopilot/planner";
export {
  buildAutopilotDashboard,
  refreshAutopilotPlan,
  runAutopilotCycle,
  runAutopilotForExecutedDealerships,
  saveWeeklyPlanUpdate,
} from "@/lib/autopilot/service";
