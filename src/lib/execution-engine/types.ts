export type ProviderSendResult = {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  simulated?: boolean;
  raw?: Record<string, unknown>;
};

export type ExecutionMetadata = {
  platform: string;
  dealershipName: string;
  campaignId?: string | null;
  eventId?: string | null;
  contentType: string;
  actionId: string;
  simulate?: boolean;
  pageId?: string;
  to?: string;
  subject?: string;
};

export interface ExecutionProvider {
  send(content: string, metadata: ExecutionMetadata): Promise<ProviderSendResult>;
}

export type ExecutionRunResult = {
  actionId: string;
  platform: string;
  success: boolean;
  providerMessageId?: string;
  error?: string;
  simulated?: boolean;
};

export type ExecutionRunSummary = {
  processed: number;
  sent: number;
  failed: number;
  results: ExecutionRunResult[];
};
