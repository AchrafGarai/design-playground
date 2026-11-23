// Mood → shadcn theme config. Shared by the Cloudflare Pages Function (functions/api/theme.ts) and the Vite dev
// middleware (vite.config.ts), so dev and production run the same code.
//
// Provider chain (first one available wins):
//   0. Claude CLI        dev only, THEME_PROVIDER=claude: your Claude Code login, no API key (see providers/claude-cli.ts)
//   1. OpenRouter        if OPEN_ROUTER_API_KEY is set (model: OPENROUTER_MODEL, default a free Ernie model)
//   2. Gemini            if GEMINI_API_KEY is set (model: GEMINI_MODEL); THEME_PROVIDER=gemini puts it first
//   3. Claude            if ANTHROPIC_API_KEY is set (optional, paid)
//   4. Workers AI        on Cloudflare, through the AI binding (free daily allowance)
//   5. Ollama            on your machine, if the Ollama app is running (free, local)
//   6. Offline generator always available (no AI)
// If a provider fails or returns an invalid config, the chain moves on, so the demo always answers.
import { offlineTheme } from "../app/demos/mood-ui/offline";
import { clampTheme, MAX_WORDS, normaliseMood, type ShadcnTheme, themeSchema } from "../app/demos/mood-ui/schema";
import { themeUserMessage } from "./prompt";
import { claudeTheme } from "./providers/claude";
import { GEMINI_MODEL, geminiTheme } from "./providers/gemini";
import { OLLAMA_MODEL, ollamaAvailable, ollamaTheme } from "./providers/ollama";
import { OPENROUTER_MODEL, openRouterTheme } from "./providers/openrouter";
import { ProviderError, type WorkersAI } from "./providers/types";
import { WORKERS_AI_MODEL, workersAiTheme } from "./providers/workers-ai";
import { createLimiter, visitorKey } from "./rate-limit";

export type ThemeEnv = {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  ANTHROPIC_API_KEY?: string;
  OPEN_ROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  /** "gemini" tries Gemini before OpenRouter (OpenRouter is first by default). */
  THEME_PROVIDER?: string;
  AI?: WorkersAI;
  /** Dev only: Claude through the local Claude Code CLI (injected by the dev middleware, never on Cloudflare). */
  localClaude?: (user: string) => Promise<unknown>;
  CLAUDE_CLI_MODEL?: string;
  /** Dev only: try a local Ollama server. */
  useOllama?: boolean;
  OLLAMA_URL?: string;
  OLLAMA_MODEL?: string;
  /** Dev only: skip the rate limit (the dev server sets this unless RATE_LIMIT=on). */
  noRateLimit?: boolean;
};

// One limiter per server instance: 6 AI requests per visitor per 10 minutes, 500 per day in total.
const limit = createLimiter();

export type ThemeSource = {
  id: "gemini" | "openrouter" | "claude" | "claude-cli" | "workers-ai" | "ollama" | "offline";
  label: string;
};
export type ThemeResponse = ShadcnTheme & { source: ThemeSource };

type Attempt = { source: ThemeSource; run: () => Promise<unknown> };

function attempts(user: string, env: ThemeEnv): Attempt[] {
  const list: Attempt[] = [];
  if (env.localClaude) {
    const run = env.localClaude;
    list.push({
      source: { id: "claude-cli", label: `Claude ${env.CLAUDE_CLI_MODEL || "Sonnet"} via Claude Code (local)` },
      run: () => run(user),
    });
  }
  // OpenRouter first by default, Gemini as the alternative (THEME_PROVIDER=gemini swaps them).
  const first: Attempt[] = [];
  if (env.OPEN_ROUTER_API_KEY) {
    const key = env.OPEN_ROUTER_API_KEY;
    const model = env.OPENROUTER_MODEL || OPENROUTER_MODEL;
    first.push({
      source: { id: "openrouter", label: `${model} via OpenRouter` },
      run: () => openRouterTheme(user, key, model),
    });
  }
  if (env.GEMINI_API_KEY) {
    const key = env.GEMINI_API_KEY;
    const model = env.GEMINI_MODEL || GEMINI_MODEL;
    first.push({ source: { id: "gemini", label: model }, run: () => geminiTheme(user, key, model) });
  }
  if (env.THEME_PROVIDER === "gemini") first.reverse();
  list.push(...first);
  if (env.ANTHROPIC_API_KEY) {
    const key = env.ANTHROPIC_API_KEY;
    list.push({ source: { id: "claude", label: "Claude Opus 5.5" }, run: () => claudeTheme(user, key) });
  }
  if (env.AI) {
    const ai = env.AI;
    list.push({ source: { id: "workers-ai", label: "Llama 3.3 on Cloudflare" }, run: () => workersAiTheme(user, ai) });
  }
  if (env.useOllama) {
    const model = env.OLLAMA_MODEL || OLLAMA_MODEL;
    list.push({
      source: { id: "ollama", label: `${model} on this Mac` },
      run: async () => {
        if (!(await ollamaAvailable(env.OLLAMA_URL))) throw new Error("Ollama is not running");
        return ollamaTheme(user, env.OLLAMA_URL, model);
      },
    });
  }
  return list;
}

/** Replaces a theme name that echoes the brief ("RuneScape" → "Scapers Realm") with the palette-style fallback. */
export function cleanName(name: string, mood: string, fallback: string): string {
  const n = name.toLowerCase().replace(/[^a-z]/g, "");
  const echoes = mood
    .toLowerCase()
    .split(/[\s-]+/)
    .filter((w) => w.length >= 4)
    .some((w) => {
      for (let i = 0; i + 4 <= w.length; i++) if (n.includes(w.slice(i, i + 4))) return true;
      return false;
    });
  return echoes ? fallback : name;
}

export async function generateMoodTheme(
  rawMood: unknown,
  env: ThemeEnv,
): Promise<{ ok: true; theme: ThemeResponse } | { ok: false; status: number; error: string }> {
  const mood = typeof rawMood === "string" ? normaliseMood(rawMood) : null;
  if (!mood) return { ok: false, status: 400, error: `Use up to ${MAX_WORDS} words.` };

  for (const attempt of attempts(themeUserMessage(mood), env)) {
    try {
      const parsed = themeSchema.safeParse(await attempt.run());
      if (parsed.success) {
        const theme = clampTheme(parsed.data);
        // Plain moods may echo themselves ("calm ocean" → "Calm Ocean"); only brand-like single words are scrubbed.
        const name = mood.includes(" ")
          ? theme.name
          : cleanName(
              theme.name,
              mood,
              `${theme.mode === "dark" ? "Night" : "Day"} ${theme.fontHeading === "cinzel" ? "Keep" : "Studio"}`,
            );
        return { ok: true, theme: { ...theme, name, source: attempt.source } };
      }
      console.warn(`[theme] ${attempt.source.id} returned an invalid config`);
    } catch (error) {
      // A declined brief is an answer, not an outage: report it instead of silently falling back.
      if (error instanceof ProviderError && error.status === 422)
        return { ok: false, status: 422, error: error.message };
      console.warn(`[theme] ${attempt.source.id} failed:`, error instanceof Error ? error.message : error);
    }
  }
  return {
    ok: true,
    theme: { ...clampTheme(offlineTheme(mood)), source: { id: "offline", label: "Offline generator" } },
  };
}

/** Fetch-style handler used by both runtimes. POST { mood } → 200 ThemeResponse | 4xx { error }. */
export async function handleThemeRequest(request: Request, env: ThemeEnv): Promise<Response> {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });

  if (request.method !== "POST") return json({ error: "Use POST." }, 405);
  // Only this site's pages may call it (blocks drive-by use of the AI quota from other origins).
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: "Forbidden." }, 403);

  // Protect the AI quota: too many requests get a 429 (the page then builds the theme offline).
  if (!env.noRateLimit) {
    const verdict = limit(visitorKey(request));
    if (!verdict.ok) {
      const minutes = Math.max(1, Math.round(verdict.retryAfterSeconds / 60));
      const error =
        verdict.scope === "global"
          ? "The AI has reached today's limit. Try again tomorrow."
          : `You've reached the AI limit for now. Try again in ${minutes} min.`;
      return new Response(JSON.stringify({ error, limited: true }), {
        status: 429,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
          "retry-after": String(verdict.retryAfterSeconds),
        },
      });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Send JSON: { "mood": "…" }.' }, 400);
  }
  const result = await generateMoodTheme((body as { mood?: unknown } | null)?.mood, env);
  return result.ok ? json(result.theme) : json({ error: result.error }, result.status);
}

export { WORKERS_AI_MODEL };
