# Playground — rules for agents

A design engineering playground: one static web app, a sidebar of small self-contained demos.
Each demo lives in its own folder, loads as its own page, and can be shared/recorded on its own.

## Stack (don't change without asking)
pnpm · Node 22+ · TypeScript strict · Vite · React 19 · React Router v7 framework mode, static prerender (`ssr: false`)
· Tailwind v4 (tokens as CSS custom properties) · Motion (never GSAP) · Biome · Vitest · Playwright
· Cloudflare Pages via GitHub Actions + Wrangler. Free/open source tools; no analytics.
Server-only work (AI calls, secrets) goes in Cloudflare Pages Functions: `functions/` (routes) + `server/` (shared logic,
also served by the Vite dev middleware). Never import `server/` or the Anthropic SDK from `app/`.

## Isolation rules
- A demo imports only from its own folder, `~/design-system` and `~/lib`. Never from another demo (tested).
- Demos render inside `<DemoContainer slug>` (`data-demo="<slug>"`, done by the route). Demo styles/tokens go on that
  container only — never `:root`, `html` or `body`. The shell is never restyled by a demo.
- Heavy libs (three.js, Wasm, audio, AI models) are imported only inside a demo folder (tested for the shell).
- `meta.mode: "iframe"` is reserved; don't implement it yet.

## Add a demo
`pnpm new:demo <slug> "<Title>"` → `app/demos/<slug>/{meta.ts,index.tsx}`. Nothing else to edit: the registry,
sidebar, home and prerender list are generated. Meta (zod-validated at build): `slug` (= folder, kebab-case), `title`,
`description`, `tags[]`, `order`, `status: "wip"|"ready"`, optional `ogImage` (`/og/<slug>.png`), `mode`,
`stage: "light"|"ink"` (full-screen background). Folders starting with `_` are ignored.

## Performance
Shell stays light. Heavy imports only inside demos; demos are lazy chunks. Clean up everything with `useDemoLifecycle`
(GPU resources, audio, workers, listeners). `pnpm build` prints the shell bundle size — don't let it grow without reason.

## Design system
- The style is the UX portfolio, copied as-is. Before any UI work read `docs/design-system-reference.md` AND
  `docs/design-decisions.md`. **The decisions file wins.**
- Raw values only in `app/design-system/tokens.css` and `portfolio.css`; components use utilities/tokens (tested).
- Colour roles cover light AND dark (`bg-bg`, `text-fg`, `text-contrast`, `text-secondary-text`, `border-line`, `text-brand`).
- New text/background pair in the shell → add it to `app/design-system/contrast-pairs.ts` (tested for AA in both themes).

## Working rules
- Don't read `node_modules`, `build`, `.react-router` or `pnpm-lock.yaml`. Don't print full files or diffs.
- Run `pnpm check` before saying done (`pnpm test:e2e` for shell changes).
- Reply in 5 lines max.
