// Cloudflare Workers AI provider (free daily allowance): used on the deployed site through the AI binding.
import { themeJsonSchema } from "../../app/demos/mood-ui/schema";
import { THEME_SYSTEM } from "../prompt";
import type { WorkersAI } from "./types";

export const WORKERS_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

export async function workersAiTheme(user: string, ai: WorkersAI): Promise<unknown> {
  const result = (await ai.run(WORKERS_AI_MODEL, {
    messages: [
      { role: "system", content: THEME_SYSTEM },
      { role: "user", content: user },
    ],
    response_format: { type: "json_schema", json_schema: themeJsonSchema },
    max_tokens: 1000,
  })) as { response?: unknown };
  // JSON mode returns either the parsed object or its JSON text.
  return typeof result.response === "string" ? JSON.parse(result.response) : result.response;
}
