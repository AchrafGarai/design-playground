/** A provider failure with a user-facing message. Unknown errors make the chain move on to the next provider. */
export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Cloudflare Workers AI binding (only the method we use). */
export type WorkersAI = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };
