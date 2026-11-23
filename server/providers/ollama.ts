// Ollama provider (free, local): used in development when the Ollama app is running on this machine.
import { themeJsonSchema } from "../../app/demos/mood-ui/schema";
import { THEME_SYSTEM } from "../prompt";

export const OLLAMA_URL = "http://127.0.0.1:11434";
export const OLLAMA_MODEL = "qwen2.5:7b";

export async function ollamaTheme(user: string, baseUrl = OLLAMA_URL, model = OLLAMA_MODEL): Promise<unknown> {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model,
      stream: false,
      format: themeJsonSchema, // Ollama structured outputs: the reply must match this schema
      options: { temperature: 0.7, num_ctx: 8192 }, // the design guide makes the prompt long
      messages: [
        { role: "system", content: THEME_SYSTEM },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  const body = (await res.json()) as { message?: { content?: string } };
  return JSON.parse(body.message?.content ?? "");
}

/** True when an Ollama server answers on this machine (quick check, no model load). */
export async function ollamaAvailable(baseUrl = OLLAMA_URL): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(800) });
    return res.ok;
  } catch {
    return false;
  }
}
