// Claude provider (optional, paid): used only when ANTHROPIC_API_KEY is set.
import Anthropic from "@anthropic-ai/sdk";
import { themeJsonSchema } from "../../app/demos/mood-ui/schema";
import { THEME_SYSTEM } from "../prompt";
import { ProviderError } from "./types";

export async function claudeTheme(user: string, apiKey: string): Promise<unknown> {
  const client = new Anthropic({ apiKey });
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 8000,
      // Refusals are rerouted server-side to Anthropic's recommended fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // A small creative task: low effort keeps it quick; thinking stays adaptive (always on for this model).
      output_config: { effort: "low", format: { type: "json_schema", schema: themeJsonSchema } },
      system: THEME_SYSTEM,
      messages: [{ role: "user", content: user }],
    });
    if (response.stop_reason === "refusal")
      throw new ProviderError("Claude declined this mood. Try different words.", 422);
    const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text");
    if (!text) throw new ProviderError("No theme came back.", 502);
    return JSON.parse(text.text);
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (error instanceof Anthropic.AuthenticationError) throw new ProviderError("Invalid Anthropic API key.", 503);
    if (error instanceof Anthropic.RateLimitError) throw new ProviderError("Too many requests. Try again soon.", 429);
    if (error instanceof Anthropic.APIError) throw new ProviderError(`Claude is unavailable (${error.status}).`, 502);
    throw error;
  }
}
