import { EmailProvider } from "@/lib/execution-engine/providers/email.provider";
import { MetaProvider } from "@/lib/execution-engine/providers/meta.provider";
import { SmsProvider } from "@/lib/execution-engine/providers/sms.provider";
import type { ExecutionProvider } from "@/lib/execution-engine/types";
import type { ScheduledPlatform } from "@/types/scheduling";

const metaProvider = new MetaProvider();
const smsProvider = new SmsProvider();
const emailProvider = new EmailProvider();

export function getProviderForPlatform(
  platform: ScheduledPlatform,
): ExecutionProvider {
  switch (platform) {
    case "facebook":
    case "instagram":
      return metaProvider;
    case "sms":
      return smsProvider;
    case "email":
      return emailProvider;
  }
}

export { MetaProvider, SmsProvider, EmailProvider };
