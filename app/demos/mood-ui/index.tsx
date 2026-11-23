import { type CSSProperties, useEffect, useState } from "react";
import { useDemoLifecycle } from "~/lib/useDemoLifecycle";
import { Canvas } from "./canvas";
import { fontFamily, loadFonts } from "./fonts";
import { GALLERY_WIDTH, Gallery } from "./gallery";
import { guardTheme } from "./guard";
import "./mood.css";
import { offlineTheme } from "./offline";
import { PromptBar, type Result } from "./prompt-bar";
import { clampTheme, type ShadcnTheme, themeSchema, themeToCssVars } from "./schema";

// Rendered inside <DemoContainer slug="mood-ui"> by the demo route.
// A canvas of stock shadcn/ui components (pan, zoom), like shadcn's own theme playground. Nothing is built from
// scratch: the AI writes a shadcn theme config (POST /api/theme, guided by design-guide.ts), the design-system
// guard fixes contrast, and the config is swapped in as CSS variables on the canvas, so every component re-themes.

/** AI tries per browser session. Past this, themes are built offline (the server also rate-limits). */
export const MAX_AI_TRIES = 3;
/** Local dev (pnpm dev) is unlimited, for you; the built site keeps the limit. */
const UNLIMITED = import.meta.env.DEV;
const TRIES_KEY = "mood-ui:ai-tries";
function readTries(): number {
  try {
    return Number(sessionStorage.getItem(TRIES_KEY)) || 0;
  } catch {
    return 0;
  }
}
function writeTries(n: number) {
  try {
    sessionStorage.setItem(TRIES_KEY, String(n));
  } catch {
    // Storage blocked (private mode): the server limit still applies.
  }
}

function finish(raw: ShadcnTheme, source: string): Result {
  const { theme, fixes } = guardTheme(clampTheme(raw));
  return { theme, fixes, source };
}

export default function MoodUi() {
  const life = useDemoLifecycle();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  useEffect(() => setTries(readTries()), []);
  const [busy, setBusy] = useState(false);
  const [runs, setRuns] = useState(0);
  const theme = result?.theme ?? null;

  useEffect(() => {
    if (theme) void loadFonts(theme.fontHeading, theme.fontBody);
  }, [theme]);

  async function apply(mood: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    let next: Result | null = null;
    let message: string | null = null;
    let note: string | null = null;
    if (!UNLIMITED && readTries() >= MAX_AI_TRIES) {
      // Out of AI tries for this session: build it offline, instantly.
      next = finish(offlineTheme(mood), "Offline generator");
      note = `You've used your ${MAX_AI_TRIES} AI tries for this session, so this one was made offline.`;
      setBusy(false);
      setNotice(note);
      setResult(next);
      setRuns((n) => n + 1);
      return;
    }
    try {
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mood }),
        signal: life.signal, // cancelled if you leave the demo mid-request
      });
      const body: unknown = await res.json().catch(() => null);
      if (res.status === 404 || res.status === 405 || (res.ok && body === null)) {
        // No API at all (e.g. a static preview): generate offline in the browser so the demo still works.
        next = finish(offlineTheme(mood), "Offline generator");
      } else if (res.status === 429) {
        // Rate limited (by us or the AI provider): still give a theme, built offline.
        next = finish(offlineTheme(mood), "Offline generator");
        note = `${(body as { error?: string } | null)?.error ?? "The AI is busy."} This one was made offline.`;
      } else if (!res.ok) {
        message = (body as { error?: string } | null)?.error ?? `Request failed (${res.status}).`;
      } else {
        const parsed = themeSchema.safeParse(body);
        if (parsed.success) {
          const source = (body as { source?: { id?: string; label?: string } }).source;
          next = finish(parsed.data, source?.label ?? "AI");
          if (source?.id !== "offline") {
            const used = readTries() + 1;
            writeTries(used);
            setTries(used);
          }
        } else message = "The theme came back malformed.";
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      next = finish(offlineTheme(mood), "Offline generator"); // offline or the request failed outright
    }
    setBusy(false);
    setError(message);
    setNotice(note);
    if (next) {
      setResult(next);
      setRuns((n) => n + 1);
    }
  }

  const vars = theme
    ? themeToCssVars(theme, { heading: fontFamily(theme.fontHeading), body: fontFamily(theme.fontBody) })
    : undefined;

  return (
    <div className="m-root absolute inset-0">
      <div
        className="shadcn-theme absolute inset-0"
        data-busy={busy || undefined}
        data-mode={theme?.mode}
        data-theme-name={theme?.name ?? "default"}
        data-shape={theme?.shape ?? "round"}
        data-border={theme?.border ?? "subtle"}
        data-texture={theme?.texture ?? "none"}
        data-button-text={theme?.buttonText ?? "normal"}
        data-depth={theme?.depth ?? "flat"}
        style={vars as CSSProperties | undefined}
      >
        <Canvas contentWidth={GALLERY_WIDTH} life={life}>
          <Gallery run={runs} />
          <div className="h-48" aria-hidden="true" />
        </Canvas>
      </div>
      <PromptBar
        busy={busy}
        result={result}
        error={error}
        notice={notice}
        triesLeft={UNLIMITED ? null : Math.max(0, MAX_AI_TRIES - tries)}
        onSubmit={apply}
        onReset={() => {
          setResult(null);
          setError(null);
          setNotice(null);
          setRuns((n) => n + 1);
        }}
      />
    </div>
  );
}
