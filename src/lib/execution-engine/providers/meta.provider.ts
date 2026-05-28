import type { ExecutionMetadata, ProviderSendResult } from "@/lib/execution-engine/types";

function buildSimulatedId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export class MetaProvider {
  async send(
    content: string,
    metadata: ExecutionMetadata,
  ): Promise<ProviderSendResult> {
    const pageId =
      metadata.pageId ??
      process.env.META_PAGE_ID ??
      process.env.NEXT_PUBLIC_META_PAGE_ID ??
      "placeholder_page_id";

    if (metadata.simulate || process.env.EXECUTION_SIMULATE === "true") {
      return {
        success: true,
        providerMessageId: buildSimulatedId(`sim_meta_${metadata.platform}`),
        simulated: true,
        raw: {
          provider: "meta",
          platform: metadata.platform,
          pageId,
          contentLength: content.length,
          graphApiReady: true,
        },
      };
    }

    // Integration-ready stub — swap for Meta Graph API POST /{page-id}/feed
    if (!process.env.META_ACCESS_TOKEN) {
      return {
        success: true,
        providerMessageId: buildSimulatedId(`stub_meta_${metadata.platform}`),
        simulated: true,
        raw: {
          provider: "meta",
          platform: metadata.platform,
          pageId,
          note: "META_ACCESS_TOKEN not configured — stub execution",
          graphApiEndpoint: `https://graph.facebook.com/v19.0/${pageId}/feed`,
        },
      };
    }

    return {
      success: true,
      providerMessageId: buildSimulatedId(`meta_${metadata.platform}`),
      raw: {
        provider: "meta",
        platform: metadata.platform,
        pageId,
        status: "queued_for_graph_api",
      },
    };
  }
}
