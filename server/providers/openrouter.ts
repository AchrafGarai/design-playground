// OpenRouter provider: one key, many models (OpenAI-compatible chat API, plain fetch). Optional; enabled when
// OPEN_ROUTER_API_KEY is set. Model is configurable with OPENROUTER_MODEL (free models end in ":free").
import { themeJsonSchema } from "../../app/demos/mood-ui/schema";
import { THEME_SYSTEM } from "../prompt";
import { ProviderError } from "./types";

// Free models come and go and can be rate limited upstream; this one answered reliably in a local comparison.
export const OPENROUTER_MODEL = "baidu/ernie-5.5-flash-preview:free";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

type ChatResponse = {
  choices?: { message?: { content?: string | null }; finish_reason?: string }[];
  error?: { code?: number; message?: string };
};

async function call(user: string, apiKey: string, model: string, structured: boolean): Promise<Response> {
  return fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      "x-title": "Playground", // shown in your OpenRouter dashboard; no personal data
    },
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      model,
      temperature: 1,
      messages: [
        { role: "system", content: THEME_SYSTEM },
        { role: "user", content: user },
      ],
      response_format: structured
        ? { type: "json_schema", json_schema: { name: "shadcn_theme", strict: true, schema: themeJsonSchema } }
        : { type: "json_object" },
    }),
  });
}

export async function openRouterTheme(user: string, apiKey: string, model = OPENROUTER_MODEL): Promise<unknown> {
  let res = await call(user, apiKey, model, true);
  // Models without structured outputs reject the schema: retry in plain JSON mode (the prompt describes the shape).
  if (res.status === 400) res = await call(user, apiKey, model, false);

  const body = (await res.json().catch(() => ({}))) as ChatResponse;
  if (res.status === 401 || res.status === 402 || res.status === 403) {
    throw new ProviderError("OpenRouter rejected the request: check OPEN_ROUTER_API_KEY and credits.", 503);
  }
  if (res.status === 429) throw new ProviderError("OpenRouter rate limit reached. Try again soon.", 429);
  if (!res.ok || body.error) throw new Error(`OpenRouter ${res.status}: ${body.error?.message ?? "error"}`);
  const text = body.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error(`OpenRouter returned no text (${body.choices?.[0]?.finish_reason ?? "unknown"})`);
  // Some models wrap JSON in a code fence or add a sentence around it: keep the outermost object.
  const json = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1");
  return JSON.parse(json);
}
