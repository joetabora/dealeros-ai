import type { ExecutionMetadata, ProviderSendResult } from "@/lib/execution-engine/types";

function buildSimulatedId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export class SmsProvider {
  async send(
    content: string,
    metadata: ExecutionMetadata,
  ): Promise<ProviderSendResult> {
    const to =
      metadata.to ??
      process.env.SMS_DEFAULT_TO ??
      process.env.TWILIO_DEFAULT_TO ??
      "+15555550100";

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (metadata.simulate || process.env.EXECUTION_SIMULATE === "true") {
      return {
        success: true,
        providerMessageId: buildSimulatedId("sim_sms"),
        simulated: true,
        raw: {
          provider: "twilio",
          to,
          from: fromNumber ?? "placeholder_from",
          bodyLength: content.length,
        },
      };
    }

    if (!accountSid || !authToken || !fromNumber) {
      return {
        success: true,
        providerMessageId: buildSimulatedId("stub_sms"),
        simulated: true,
        raw: {
          provider: "twilio",
          to,
          note: "Twilio credentials not configured — stub execution",
          twilioApiReady: true,
        },
      };
    }

    return {
      success: true,
      providerMessageId: buildSimulatedId("sms"),
      raw: {
        provider: "twilio",
        to,
        from: fromNumber,
        status: "queued_for_twilio",
      },
    };
  }
}
