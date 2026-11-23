// Google Gemini provider: used first when GEMINI_API_KEY is set. Plain REST (fetch), so it runs in both
// Cloudflare Workers and Node without an extra SDK. Model is configurable with GEMINI_MODEL.
import { themeJsonSchema } from "../../app/demos/mood-ui/schema";
import { THEME_SYSTEM } from "../prompt";
import { ProviderError } from "./types";

export const GEMINI_MODEL = "gemini-3.5-flash-lite";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string };
};

async function call(user: string, apiKey: string, model: string, withSchema: boolean): Promise<Response> {
  return fetch(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: THEME_SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
        // Structured output: the reply must match the shadcn config schema.
        ...(withSchema ? { responseJsonSchema: themeJsonSchema } : {}),
      },
    }),
  });
}

export async function geminiTheme(user: string, apiKey: string, model = GEMINI_MODEL): Promise<unknown> {
  let res = await call(user, apiKey, model, true);
  // Some models/API versions reject a schema field: retry once in plain JSON mode (the prompt describes the shape).
  if (res.status === 400) res = await call(user, apiKey, model, false);
  // 503 "high demand" spikes are usually brief: retry twice with a short pause before falling back.
  for (let attempt = 1; attempt <= 2 && res.status === 503; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
    res = await call(user, apiKey, model, true);
  }

  const body = (await res.json().catch(() => ({}))) as GeminiResponse;
  if (res.status === 400 || res.status === 401 || res.status === 403) {
    throw new ProviderError("Gemini rejected the request: check GEMINI_API_KEY and GEMINI_MODEL.", 503);
  }
  if (res.status === 429) throw new ProviderError("Gemini rate limit reached. Try again soon.", 429);
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${body.error?.message ?? "error"}`);
  if (body.promptFeedback?.blockReason) {
    throw new ProviderError("Gemini declined this brief. Try different words.", 422);
  }
  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error(`Gemini returned no text (${body.candidates?.[0]?.finishReason ?? "unknown"})`);
  // JSON mode sometimes wraps the object in a code fence.
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
}
