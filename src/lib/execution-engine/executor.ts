import { runAutopilotForExecutedDealerships } from "@/lib/autopilot/service";
import { getProviderForPlatform } from "@/lib/execution-engine/providers";
import type {
  ExecutionMetadata,
  ExecutionRunSummary,
} from "@/lib/execution-engine/types";
import {
  listDuePendingActions,
  markActionExecutionFailed,
  markActionExecutionSent,
} from "@/lib/scheduling/repository";
import type { ScheduledMarketingAction } from "@/types/scheduling";

type ExecuteOptions = {
  userId?: string;
  simulate?: boolean;
  actionIds?: string[];
  useAdmin?: boolean;
};

function buildMetadata(
  action: ScheduledMarketingAction,
  simulate: boolean,
): ExecutionMetadata {
  return {
    platform: action.platform,
    dealershipName: action.dealershipName,
    campaignId: action.campaignId,
    eventId: action.eventId,
    contentType: action.contentType,
    actionId: action.id,
    simulate,
  };
}

export async function executeDueActions(
  options: ExecuteOptions = {},
): Promise<ExecutionRunSummary> {
  const { userId, simulate = false, actionIds, useAdmin = false } = options;

  let actions = await listDuePendingActions({
    userId,
    limit: actionIds?.length ? 100 : 50,
    useAdmin,
    includeFuture: Boolean(actionIds?.length),
  });

  if (actionIds?.length) {
    const idSet = new Set(actionIds);
    actions = actions.filter((action) => idSet.has(action.id));
  }

  const summary: ExecutionRunSummary = {
    processed: 0,
    sent: 0,
    failed: 0,
    results: [],
  };

  const affectedDealerships = new Set<string>();

  for (const action of actions) {
    summary.processed += 1;
    affectedDealerships.add(action.dealershipName);

    const provider = getProviderForPlatform(action.platform);
    const metadata = buildMetadata(action, simulate);

    try {
      const result = await provider.send(action.content, metadata);

      if (result.success) {
        await markActionExecutionSent({
          actionId: action.id,
          providerMessageId: result.providerMessageId,
          providerResponse: result.raw ?? {},
          simulated: result.simulated ?? simulate,
          useAdmin,
        });

        summary.sent += 1;
        summary.results.push({
          actionId: action.id,
          platform: action.platform,
          success: true,
          providerMessageId: result.providerMessageId,
          simulated: result.simulated ?? simulate,
        });
      } else {
        await markActionExecutionFailed({
          actionId: action.id,
          error: result.error ?? "Provider returned unsuccessful response.",
          providerResponse: result.raw ?? {},
          useAdmin,
        });

        summary.failed += 1;
        summary.results.push({
          actionId: action.id,
          platform: action.platform,
          success: false,
          error: result.error ?? "Execution failed.",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected execution error.";

      await markActionExecutionFailed({
        actionId: action.id,
        error: message,
        providerResponse: { provider: action.platform },
        useAdmin,
      });

      summary.failed += 1;
      summary.results.push({
        actionId: action.id,
        platform: action.platform,
        success: false,
        error: message,
      });
    }
  }

  if (userId && summary.processed > 0) {
    await runAutopilotForExecutedDealerships({
      userId,
      dealershipNames: [...affectedDealerships],
    });
  }

  return summary;
}

export async function simulateAllPendingForUser(
  userId: string,
): Promise<ExecutionRunSummary> {
  const pending = await listDuePendingActions({
    userId,
    includeFuture: true,
    limit: 100,
  });

  return executeDueActions({
    userId,
    simulate: true,
    actionIds: pending.map((action) => action.id),
  });
}
