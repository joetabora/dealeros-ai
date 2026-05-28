type LogLevel = "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

function writeLog(level: LogLevel, event: string, payload: LogPayload = {}) {
  const entry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? "development",
    ...payload,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  info(event: string, payload?: LogPayload) {
    writeLog("info", event, payload);
  },
  warn(event: string, payload?: LogPayload) {
    writeLog("warn", event, payload);
  },
  error(event: string, payload?: LogPayload) {
    writeLog("error", event, payload);
  },
  campaignCreated(payload: LogPayload) {
    writeLog("info", "campaign.created", payload);
  },
  executionFailed(payload: LogPayload) {
    writeLog("error", "execution.failed", payload);
  },
  executionRun(payload: LogPayload) {
    writeLog("info", "execution.run", payload);
  },
  schedulingRun(payload: LogPayload) {
    writeLog("info", "scheduling.run", payload);
  },
};
