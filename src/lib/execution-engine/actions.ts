"use server";

import { revalidatePath } from "next/cache";

import {
  executeDueActions,
  simulateAllPendingForUser,
} from "@/lib/execution-engine/executor";
import { requireSession } from "@/lib/auth/session";
import type { ExecutionRunSummary } from "@/lib/execution-engine/types";

function revalidateExecutionRoutes() {
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/calendar/preview");
  revalidatePath("/dashboard/autopilot");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/crm");
}

export async function runExecutionForUserAction(): Promise<{
  error?: string;
  summary?: ExecutionRunSummary;
}> {
  try {
    const session = await requireSession();
    const summary = await executeDueActions({ userId: session.user.id });
    revalidateExecutionRoutes();
    return { summary };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to run execution. Confirm migrations are applied.",
    };
  }
}

export async function simulateExecutionForUserAction(): Promise<{
  error?: string;
  summary?: ExecutionRunSummary;
}> {
  try {
    const session = await requireSession();
    const summary = await simulateAllPendingForUser(session.user.id);
    revalidateExecutionRoutes();
    return { summary };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to simulate execution.",
    };
  }
}
