# Design system reference: the UX portfolio

The playground copies Achraf Garai's UX portfolio style system as-is
(source: `~/Desktop/ux-portfolio`, mainly `src/styles/global.css` and `src/components/`).
Code lives in `app/design-system/tokens.css` (tokens) and `app/design-system/portfolio.css` (base, utilities, components).

> Quiet, fast, editorial. Apple-like system type, neutral greys, one blue accent, a living orb as the mark.

## Colour

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#fff` | `#18181a` | page |
| `--bg-100` | `#f6f6f6` | `hsl(240 2% 16%)` | row hover, copy button |
| `--bg-200` | `#f2f2f2` | `hsl(240 2% 19%)` | nav hover, chips, floating nav, active sidebar row |
| `--bg-300` | `#e5e5e5` | `hsl(240 2% 22%)` | hover inside bg-200 surfaces |
| `--fg` | `#4a4a4c` | `#b8b8ba` | body text (slightly muted under black headings) |
| `--contrast` | `#000` | `#fff` | headings, active, pressed buttons |
| `--secondary` | `#707070` | `#a5a5a5` | labels, meta, icon buttons |
| `--mute` | `#bdbdbd` | `#808080` | disabled, hairline icons, never text |
| `--line` / `--line-strong` | grey 12% / 20% | grey 40% / 60% | hairlines / button borders |
| `--accent` | `#1a6fe8` | `#6cb6ff` | links, focus ring, outline chip, hovered row number |
| `--media-card` | `#f6f6f6` | `#1c1c1f` | card behind demo stages |

Tailwind utilities: `bg-bg`, `bg-bg-100…300`, `text-fg`, `text-contrast`, `text-secondary-text`, `text-mute`,
`border-line`, `border-line-strong`, `text-brand` (accent), `bg-media-card`.

## Typography
- One family: the system UI font (`system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto…`). No web fonts.
- Scale: 13 (`text-xs`), 14 (`text-sm`), 15 (buttons), 16 (`text-base`, body), 18 (`text-lg`), 20 (`text-xl`, page titles).
  Titles are small on purpose: the page is quiet, hierarchy comes from colour (`contrast` vs `fg`) and weight.
- Weights: 400 body, 500 labels/nav/buttons, 550 headings (`font-semibold`), 650 (`font-bold`) rarely.
- `label` utility: 14px / 500 / secondary, for section labels ("Projects →", "Elsewhere", "At a glance").

## Layout
- Single centred column: `container-narrow` 700px, `container-wide` 900px (media/stages), 24px gutter.
  Containers size to their parent, so they work beside the sidebar.
- Header 60px: mark left · two nav items centred · sound + theme toggles right. It scrolls away; a floating pill
  (orb, nav, back-to-top) springs in once it's out of view. (Playground: the mark lives in the sidebar on desktop.)
- Generous vertical rhythm between sections: `mt-28`/`mt-32`. Footer: hairline top, © left, links right.
- Radii: 10px nav items and icon buttons, 12px buttons, 14px list rows, 16–20px cards, `--radius-media`
  (20→26px fluid) for media.

## Components
- **Orb**: animated light-blue sphere (two counter-rotating swirls, breathing core, shine). 28px in nav, 56px in the
  contact block, 80px as the home "avatar". Hover scales up, press squeezes.
- **Button `.btn`**: 40px tall, 12px radius, `line-strong` border, 15px/500 contrast text. Hover fills `bg-200` and lifts 1px.
  Pressed (`aria-pressed="true"`) / `.btn-solid`: contrast fill, bg text.
- **Icon button `.icon-btn`**: 32px, 10px radius, secondary icon, `bg-200` on hover. Theme toggle morphs sun/moon;
  sound toggle swaps speaker icons.
- **Nav link `.nav-link`**: 14px/500, 10px radius; current page gets a `line` outline.
- **Rows `.rows .row`**: numbered list rows; hovering one dims the others to 45%, fills it with `bg-100`, turns the number
  accent and slides an arrow in. Hairline between rows.
- **Chip `.chip`**: 24px, 8px radius, `bg-200`, 13px/500. Outline variant in accent. Pressed chip = contrast fill.
- **Link `.link`**: accent, underline at 40% that firms up and drops 1px on hover. `.link-quiet` for meta.
- **Copy email**: bordered field with a soft Copy button that swaps to "✓ Copied".
- **Contact block**: orb, title, one line, copy email, faint static accent glow behind.

## Motion
- Easings: `--ease-out`, `--ease-spring` (gentle overshoot), `--ease-snap` (springy lift).
- `lift`: −1px on hover with snap, 0.97 scale on press. `.rise` hero stagger (70ms). `.reveal` on scroll (CSS only).
- Theme switch crossfades colours for 300ms. Page changes crossfade in 0.22s (view transitions).
- Everything collapses under `prefers-reduced-motion`.

## Sound
- Opt-in, off by default, saved in `localStorage`. Web Audio synthesis, no files.
  Tick on hover (nav, rows, chips; mouse only), tap on click, chime on sound-on and theme switch.
