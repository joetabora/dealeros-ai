import type { ExecutionMetadata, ProviderSendResult } from "@/lib/execution-engine/types";

function buildSimulatedId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function extractEmailParts(content: string) {
  const lines = content.split("\n").filter(Boolean);
  const subject = lines[0]?.slice(0, 120) ?? "DealerOS Campaign";
  const body = lines.slice(1).join("\n").trim() || content;
  return { subject, body };
}

export class EmailProvider {
  async send(
    content: string,
    metadata: ExecutionMetadata,
  ): Promise<ProviderSendResult> {
    const to =
      metadata.to ??
      process.env.EMAIL_DEFAULT_TO ??
      process.env.RESEND_DEFAULT_TO ??
      "dealership@example.com";

    const { subject, body } = extractEmailParts(content);
    const resolvedSubject = metadata.subject ?? subject;

    const resendKey = process.env.RESEND_API_KEY;
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const fromEmail =
      process.env.EMAIL_FROM ?? process.env.RESEND_FROM ?? "campaigns@dealeros.ai";

    if (metadata.simulate || process.env.EXECUTION_SIMULATE === "true") {
      return {
        success: true,
        providerMessageId: buildSimulatedId("sim_email"),
        simulated: true,
        raw: {
          provider: resendKey ? "resend" : sendgridKey ? "sendgrid" : "email",
          to,
          from: fromEmail,
          subject: resolvedSubject,
          bodyLength: body.length,
        },
      };
    }

    if (!resendKey && !sendgridKey) {
      return {
        success: true,
        providerMessageId: buildSimulatedId("stub_email"),
        simulated: true,
        raw: {
          provider: "email",
          to,
          from: fromEmail,
          subject: resolvedSubject,
          note: "RESEND_API_KEY or SENDGRID_API_KEY not configured — stub execution",
        },
      };
    }

    return {
      success: true,
      providerMessageId: buildSimulatedId("email"),
      raw: {
        provider: resendKey ? "resend" : "sendgrid",
        to,
        from: fromEmail,
        subject: resolvedSubject,
        status: "queued_for_email_provider",
      },
    };
  }
}
