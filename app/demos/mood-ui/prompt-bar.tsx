// The floating prompt bar pinned to the bottom of the canvas. Always dark (the `dark` class swaps in the
// playground's dark tokens for this subtree only), with the Orb, round suggestion chips and a round submit button.
import { AnimatePresence, m } from "motion/react";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { Orb } from "~/design-system";
import { fontFamily } from "./fonts";
import type { Fix } from "./guard";
import { hexOf } from "./palette";
import { MAX_WORDS, normaliseMood, type ShadcnTheme, themeToCss } from "./schema";

const SUGGESTIONS = ["Dragon fire", "Premium minimal", "Premium fashion", "Autumn café", "Samurai ink"];
const spring = { type: "spring", stiffness: 420, damping: 30 } as const;

/** Keeps at most MAX_WORDS words (a trailing space is allowed so the next word can be typed). */
function limitWords(value: string): string {
  const words = value.trimStart().split(/\s+/);
  if (words.filter(Boolean).length <= MAX_WORDS) return value.trimStart();
  return words.slice(0, MAX_WORDS).join(" ");
}

export type Result = { theme: ShadcnTheme; fixes: Fix[]; source: string };

export function PromptBar({
  busy,
  result,
  error,
  notice,
  triesLeft,
  onSubmit,
  onReset,
}: {
  busy: boolean;
  result: Result | null;
  error: string | null;
  /** A non-blocking note (e.g. out of AI tries, built offline instead). */
  notice: string | null;
  /** AI tries left in this session (null = unlimited, in local dev). */
  triesLeft: number | null;
  onSubmit: (mood: string) => void;
  onReset: () => void;
}) {
  const [mood, setMood] = useState("");
  const [panel, setPanel] = useState<"details" | "config" | null>(null);
  const [copied, setCopied] = useState(false);
  const open = panel !== null;
  const setOpen = (v: boolean) => setPanel(v ? "details" : null);
  const toggle = (p: "details" | "config") => setPanel((cur) => (cur === p ? null : p));
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const detailsId = useId();
  const count = mood.trim() ? mood.trim().split(/\s+/).length : 0;
  const valid = normaliseMood(mood) !== null;

  // "/" focuses the prompt from anywhere on the canvas.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit(e?: FormEvent, value = mood) {
    e?.preventDefault();
    const clean = normaliseMood(value);
    if (!clean || busy) return;
    setOpen(false);
    onSubmit(clean);
  }

  const showChips = !busy && !mood && !result;

  return (
    <div className="dark pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2.5 px-4 pb-5">
      {/* What happened: result pill (with details), or an error */}
      <AnimatePresence mode="popLayout">
        {error && !busy && (
          <m.p
            key="error"
            role="alert"
            className="m-glass pointer-events-auto rounded-full px-4 py-2 text-xs text-contrast"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={spring}
          >
            {error}
          </m.p>
        )}
        {notice && !busy && (
          <m.p
            key="notice"
            role="status"
            className="m-glass pointer-events-auto max-w-[min(28rem,100%)] rounded-full px-4 py-2 text-center text-xs text-secondary-text"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={spring}
          >
            {notice}
          </m.p>
        )}
        {result && !busy && (
          <m.div
            key={result.theme.name + result.source}
            className="pointer-events-auto flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={spring}
          >
            <AnimatePresence>
              {open && (
                <m.div
                  id={detailsId}
                  className="m-glass w-[min(26rem,calc(100vw-2rem))] rounded-3xl p-4 text-xs text-secondary-text"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={spring}
                >
                  {panel === "config" ? (
                    <ConfigPanel
                      css={themeToCss(result.theme, {
                        heading: fontFamily(result.theme.fontHeading),
                        body: fontFamily(result.theme.fontBody),
                      })}
                      copied={copied}
                      onCopy={async (css) => {
                        try {
                          await navigator.clipboard.writeText(css);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1600);
                        } catch {
                          setCopied(false);
                        }
                      }}
                    />
                  ) : (
                    <>
                      <p className="text-sm text-contrast">{result.theme.rationale}</p>
                      <p className="mt-2">
                        {result.theme.fontHeading} / {result.theme.fontBody} · radius {result.theme.radius}rem ·{" "}
                        {result.theme.mode}
                      </p>
                      {result.theme.leaning !== "none" && (
                        <p className="mt-2">Leaning: {result.theme.leaning} (followed loosely)</p>
                      )}
                      <p className="mt-1">
                        {result.theme.colors.primary} on {result.theme.colors.card}
                      </p>
                      <p className="mt-1">
                        {result.theme.shape} shape · {result.theme.border} border · {result.theme.texture} texture ·{" "}
                        {result.theme.buttonText} labels · {result.theme.depth}
                      </p>
                      <p className="mt-3 text-contrast">Design system check</p>
                      {result.fixes.length === 0 ? (
                        <p className="mt-1">Every pair passed WCAG AA as proposed.</p>
                      ) : (
                        <ul className="mt-1 flex flex-col gap-0.5 tabular-nums">
                          {result.fixes.map((f) => (
                            <li key={f.label}>
                              <span className="text-contrast">{f.label}</span>: {f.before.toFixed(1)}:1 →{" "}
                              {f.after.toFixed(1)}:1 (min {f.min})
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </m.div>
              )}
            </AnimatePresence>
            <div className="m-glass flex items-center gap-1 rounded-full p-1 pl-3 text-xs">
              <span className="flex -space-x-1" aria-hidden="true">
                {(["primary", "accent", "card", "foreground"] as const).map((k) => (
                  <span
                    key={k}
                    className="size-3.5 rounded-full ring-2 ring-bg-200"
                    style={{ background: hexOf(result.theme.colors[k]) }}
                  />
                ))}
              </span>
              <button
                type="button"
                className="m-pill-btn"
                aria-expanded={panel === "details"}
                aria-controls={detailsId}
                onClick={() => toggle("details")}
              >
                <span className="text-contrast">{result.theme.name}</span>
                <span className="text-secondary-text"> · {result.source}</span>
              </button>
              <button
                type="button"
                className="m-pill-btn gap-1 font-mono text-secondary-text"
                aria-label="shadcn config"
                title="Show and copy the shadcn config"
                aria-expanded={panel === "config"}
                aria-controls={detailsId}
                onClick={() => toggle("config")}
              >
                {"{ }"}
              </button>
              <button
                type="button"
                className="m-pill-btn size-6 justify-center p-0 text-secondary-text"
                aria-label="Reset to default theme"
                onClick={() => {
                  setOpen(false);
                  setMood("");
                  onReset();
                }}
              >
                ✕
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Round suggestion chips */}
      <AnimatePresence>
        {showChips && (
          <m.ul
            key="chips"
            className="pointer-events-auto flex flex-wrap justify-center gap-1.5"
            aria-label="Suggestions"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{ show: { transition: { staggerChildren: 0.045 } }, hidden: {} }}
          >
            {SUGGESTIONS.map((s) => (
              <m.li
                key={s}
                variants={{
                  hidden: { opacity: 0, y: 10, scale: 0.9 },
                  show: { opacity: 1, y: 0, scale: 1, transition: spring },
                }}
              >
                <m.button
                  type="button"
                  className="m-glass m-chip rounded-full px-3.5 py-1.5 text-xs text-contrast"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  transition={spring}
                  onClick={() => {
                    setMood(s);
                    submit(undefined, s);
                  }}
                >
                  {s}
                </m.button>
              </m.li>
            ))}
          </m.ul>
        )}
      </AnimatePresence>

      {/* The bar */}
      <m.form
        onSubmit={submit}
        className="m-prompt pointer-events-auto relative flex w-[min(34rem,100%)] items-center gap-2 rounded-full p-1.5 pl-2"
        data-busy={busy || undefined}
        data-focused={focused || undefined}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...spring, delay: 0.1 }}
      >
        <m.span
          className="grid size-9 shrink-0 place-items-center"
          animate={busy ? { scale: [1, 1.12, 1], rotate: [0, 8, 0] } : { scale: 1, rotate: 0 }}
          transition={busy ? { duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" } : spring}
        >
          <Orb size="sm" className={busy ? "m-orb-busy" : undefined} />
        </m.span>
        <input
          ref={input}
          value={mood}
          onChange={(e) => setMood(limitWords(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Describe a mood"
          aria-describedby={hintId}
          placeholder={busy ? "Writing a theme…" : "Describe a mood…"}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-contrast outline-none placeholder:text-secondary-text"
        />
        <span id={hintId} className="shrink-0 text-[11px] text-secondary-text tabular-nums">
          <span className="sr-only">Up to {MAX_WORDS} words. </span>
          {count}/{MAX_WORDS}
          {triesLeft !== null && (
            <span className="ml-2" title="AI tries left in this session">
              {triesLeft > 0 ? `${triesLeft} AI` : "offline"}
            </span>
          )}
        </span>
        <m.button
          type="submit"
          aria-label={busy ? "Thinking…" : "Apply"}
          disabled={!valid || busy}
          className="m-send relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full"
          data-ready={valid || undefined}
          animate={{ scale: valid || busy ? 1 : 0.88 }}
          whileHover={valid && !busy ? { scale: 1.07 } : undefined}
          whileTap={valid && !busy ? { scale: 0.9 } : undefined}
          transition={spring}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {busy ? (
              <m.span
                key="spin"
                className="grid"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <span className="m-spinner size-4 rounded-full" />
              </m.span>
            ) : (
              <m.svg
                key="arrow"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={spring}
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </m.svg>
            )}
          </AnimatePresence>
        </m.button>
      </m.form>
    </div>
  );
}

/** The generated theme as a shadcn globals.css snippet, with a copy button. */
function ConfigPanel({ css, copied, onCopy }: { css: string; copied: boolean; onCopy: (css: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-contrast">shadcn config</p>
        <button
          type="button"
          className="m-pill-btn bg-bg-300 text-contrast"
          aria-label={copied ? "Copied" : "Copy config"}
          onClick={() => onCopy(css)}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-1">Paste into your globals.css. Tokens are Tailwind colours.</p>
      <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-bg p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words text-fg select-text">
        {css}
      </pre>
    </div>
  );
}
