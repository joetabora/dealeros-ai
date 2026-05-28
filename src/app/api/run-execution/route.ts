import { NextResponse } from "next/server";

import { executeDueActions } from "@/lib/execution-engine/executor";
import { createAdminClient } from "@/lib/supabase/admin";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  return runExecution(request);
}

export async function POST(request: Request) {
  return runExecution(request);
}

async function runExecution(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is required for global cron execution.",
      },
      { status: 503 },
    );
  }

  try {
    const summary = await executeDueActions({ useAdmin: true });
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Execution run failed.",
      },
      { status: 500 },
    );
  }
}
