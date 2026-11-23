# Design decisions

How the portfolio style (`docs/design-system-reference.md`) is applied to the playground.
**When the two disagree, this file wins.** Copy the portfolio first; deviate only for the reasons below.

## 1. Source of truth
- The playground uses the UX portfolio's style system: tokens, system font, orb mark, buttons, rows, chips, footer,
  motion, sound, light/dark themes. Plus a minimal macOS-style projects sidebar (§2). Brand: "Playground" by Achraf Garai, the same orb.
- The earlier gallery reference (Putty/Ink, Fraunces/Inter, monumental wordmark) is dropped.
- Raw values live only in `app/design-system/tokens.css` and `portfolio.css` (copied from the portfolio, px included).
  Components use utilities and tokens; `tests/unit/tokens.test.ts` fails on raw hex, colour functions or px/rem elsewhere
  (exception: the two `theme-color` metas in `root.tsx`). Demos are excluded: they own their themes.

## 2. Playground additions (not in the portfolio)
- **Top bar (portfolio header)**: nav centred (Home, About), sound + theme toggles right; on mobile a menu button and the
  orb sit in the left slot. It scrolls away; the portfolio's floating pill (orb, nav, back-to-top) springs in once it's out
  of view, centred on the main column (`--main-offset`). The pill keeps the portfolio look (`bg-200`, hairline, soft
  shadow) so it reads as floating; the sidebar keeps the page background. On demo pages it spans the full main column so its controls line
  up with the demo toolbar.
- **Sidebar = macOS-style, minimal** (220px, md+). Same background as the page (`bg`); only a hairline separates them.
  Top: 20px orb + "Playground" (13px/600). "Projects" heading (11px/600 secondary), one 28px row per project (13px,
  6px radius, `bg-100` hover, `bg-200` + contrast text when current) with a 6px status dot on the right (ring = work in
  progress, filled = ready, plus screen-reader text). Bottom: author (11px). No site nav or toggles here (they're in the
  top bar). Keyboard: ↑/↓/Home/End move focus, Enter opens.
- **Mobile** (< 768px): the sidebar opens as a drawer from the top bar's menu button (slide-in, dim backdrop,
  Esc/backdrop/close button, focus moves into it).
- **Containers** size to their parent (`100%`), not the viewport, so the 700/900px column centres in the main area.
- **Home (portfolio home)**: orb, "Playground", one line + link to the latest demo; "Projects n" with tag-filter chips and the
  work list; **Selected work** (the four UX case studies, linking out to work.achrafgarai.com); **Elsewhere**; and the
  **"Let's work together"** contact block. Lower sections use the portfolio's scroll reveal.
- **About (portfolio About page, `/about`)**: portrait (160px, self-hosted), three paragraphs (who, InstaDeep + link to
  the UX portfolio, what the playground is), Experience, Capabilities (+ Engineering), Education & certifications,
  Languages, a playground Colophon, and "Say hello".
- **Scroll progress**: the floating pill's back-to-top button is a ring that fills with page progress (portfolio reading
  pill), updated with rAF straight on the SVG, no re-renders.
- **Demo page = workspace.** The demo opens directly and fills the viewport height minus the top bar, with an 8–12px
  inset, on `media-card` with `--radius-media`. No footer, no page scroll. The toolbar **floats over the demo** as two
  pills (`.float-pill`: `bg-200`, hairline, soft shadow): title + status chip + tags on the left, icon buttons for Info
  (`I`), Performance (`P`) and Full screen on the right. Demos should keep roughly the top 64px free of essential
  controls. Tags in the pill use `fg`, not `secondary` (secondary on `bg-200` is 4.42:1).
  Description, status, focus tags, shortcuts and "Next project" live in an **info popover** (native `popover`:
  light dismiss, Esc), opened from the toolbar or with `I`.
- **Full screen** (`?view=full`): sidebar, top bar and toolbar hidden (also before hydration via the pre-paint script).
  A ghost close button (top right) exits; it fades out after 2.5s without pointer/keyboard activity so recordings stay
  clean, and comes back on any movement, touch, key or focus. Esc still works.
  A demo with `stage: "ink"` gets the dark tokens by adding `.dark` to its wrapper.
- **Shadows**: one token, `--shadow-soft` (two tight, low-opacity layers; slightly stronger in dark so it still reads),
  for everything that floats: floating nav, toolbar pills, info popover, drawer. The orb's inner glow and outer shadow are much lighter
  than the portfolio's. No large, blurry shadows anywhere.
- **Shortcut keys** shown as small bordered `kbd`s (10px) that always repeat a visible label.
- **Performance stats**: 11px secondary text on a translucent background, bottom right, no border. Never interactive.

## 2b. Minimal controls (ChatGPT / Claude-app quiet)
- Controls recede, content leads. Body text stays 16px; everything else is small: nav 13px/500 in `secondary` (current =
  `contrast`, no outline), top bar 48px, icon buttons 28px with 15px icons and a `bg-100` hover only, buttons 32px tall /
  13px, chips 22px / 12px on `bg-100`, labels 13px.
- The demo toolbar is ghost: title 13px, status 11px, icons in `secondary`. No pill, no border, no shadow.
- Quiet comes from size and colour, never from opacity on text or icons, so contrast stays AA.

## 3. Accessibility (WCAG 2.2 AA)
Checked in both themes by `tests/unit/contrast.test.ts` from `contrast-pairs.ts`. Light-theme limits to respect:

| Pair | Ratio | Rule |
|---|---|---|
| secondary on bg / bg-100 | 4.95 / 4.58 | OK for meta text |
| **secondary on bg-200** | **4.42** | **no secondary text on bg-200** (use `fg` or `contrast`) |
| accent on bg | 4.68 | links OK on the page background |
| **accent on bg-100** | **4.33** | **no links on bg-100** |
| **mute on bg** | **1.88** | **never text** |

- Dark theme passes every pair the shell uses (fg 7.3:1, secondary 5.8:1, accent 8.25:1 on bg).
- Focus: the portfolio's 2px accent ring with the `focus-in` animation, never removed.
- Sound is opt-in, off by default. The `AudioContext` starts only from a user gesture.
- Reduced motion: animations and transitions collapse, the orb stops swirling, view transitions are disabled.

## 4. Theme
- Dark text is softened from the portfolio to reduce glare: `--contrast` #fff → #e4e4e6, `--fg` #b8b8ba → #a6a6a9,
  `--secondary` #a5a5a5 → #939396. Still AA: contrast 14:1, fg 7.3:1, secondary 5.8:1 on the dark background.
- `html.dark`, as in the portfolio, with the same `localStorage` key (`theme`), so a visitor's choice carries over.
  Default = OS preference. Applied before first paint (`root.tsx`), so there is no flash.

## 5. Typography: system sans only
- Headings stay in the portfolio's system sans (20px / 550 page titles). No web fonts are loaded.
- A serif test was run (Kalice from styles.refero.design is commercial; free lookalikes Newsreader and Instrument Serif
  were tried) and dropped in favour of the original sans. Don't reintroduce a serif without asking.

## 6. Mood → UI
- **Nothing is built from scratch.** The preview is a pan/zoom canvas of stock **shadcn/ui** components (Radix-based,
  `app/demos/mood-ui/ui/`, copied in the shadcn way), with a floating dark prompt bar. The AI only writes a **shadcn theme config**. Colours are **Tailwind palette tokens only** (the shadcn colours, e.g.
  `blue-600`, `white`): never hard-coded colours; a stray hex is snapped to the nearest token, and the guard fixes
  contrast by stepping along a token's own scale, so themes never leave the palette (`palette.ts`). The config holds: the standard tokens
  (background, foreground, card, primary, secondary, muted, accent, border, ring + their foregrounds), `--radius`, a
  heading font and a body font, plus four character switches: `shape` (round, pill, squircle, sharp, bevel, notch,
  scoop, gem), `border` (subtle, none, strong, double, raised, glow), `texture` (none, grain, paper, stone, scanlines,
  grid, halftone) and `buttonText` (normal, caps). They are data attributes styled in `mood.css` (CSS `corner-shape`,
  Chromium only; elsewhere they fall back to rounded corners). The guide keeps ordinary briefs plain; textures and
  ornate shapes are for games, fantasy, sci-fi and retro. The config is swapped in as CSS variables on the card's wrapper, and the card re-renders.
  The default (unthemed) config maps to the playground's own tokens, in light and dark.
- **One input, no presets.** 1–5 words (letters, numbers and symbols, no markup); a few suggestion chips fill the field.
- **The design guide teaches the model** (`app/demos/mood-ui/design-guide.ts`, meant to be edited by hand): DO and AVOID
  rules, the only fonts allowed (the mood → font map: 44 free fonts; body text only from six safe faces, Geist, Inter, IBM Plex Sans, IBM Plex Serif, EB Garamond and Libre Caslon Text, so experiments stay in headings; recommended heading/body pairs per mood, and per-font type settings such as uppercase, tracking and neon glow; self-hosted, loaded on demand), 10 curated starting palettes, and worked
  examples. All of it is sent with every request to every provider. Examples are the strongest lever for small models;
  vary them, because a model will copy an example whose brief is close to the one it gets.
- **The guard** (`guard.ts`) then fixes any pair below AA: card text 7:1, meta text 4.5:1, every foreground on its fill
  4.5:1, primary vs card 3:1. A unit test also checks that the guide's own examples are valid and AA-clean.
- **Providers** (`server/mood-theme.ts`, first available wins): Gemini if `GEMINI_API_KEY` is set (`GEMINI_MODEL`,
  default `gemini-3.5-flash-lite`, REST + JSON schema output) → Claude Opus 5.5 if a key is set → Workers AI on
  Cloudflare (free allowance) → Ollama on this Mac (`qwen2.5:7b`, free) → offline generator (picks a guide palette from
  the brief's words). Only colours are strict when parsing; anything else falls back to a default.
- **Fine-tuning (later):** a LoRA on Qwen with MLX, imported into Ollama, would need a few hundred good examples.
  Collecting themes you like is the way to build that dataset; the guide + examples + guard cover most of the gain first.
- Abuse limits: POST only, same-origin only, input validated, the brief passed as data, never as instructions.
- **Overuse protection:** the browser allows 3 AI tries per session (sessionStorage), then builds themes offline with a
  quiet note. The server (`server/rate-limit.ts`) allows 6 AI requests per visitor (IP) per 10 minutes and 500 per day
  in total, answering 429 + Retry-After (the page then builds offline too). In-memory, so best effort on Cloudflare:
  for hard limits add a Cloudflare rate limiting rule on `/api/theme` and a daily quota on the Gemini key. Local dev (`pnpm dev`) is unlimited: the browser skips the
  3-try limit, and the server limit is off unless `RATE_LIMIT=on`.
