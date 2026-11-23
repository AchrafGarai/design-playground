/**
 * The design system's half of Mood → UI: whatever config the AI proposes, every pair the card renders must meet
 * WCAG 2.2 AA. Colours are palette tokens, so a failing colour moves along its own scale (blue-500 → blue-600 …),
 * and to white or black only as a last resort. The theme never leaves the palette, and every change is reported.
 */
import { contrastOf, luminanceOf, scaleOf, type Token } from "./palette";
import type { ColorKey, ShadcnTheme } from "./schema";

const lum = luminanceOf;

/** WCAG contrast ratio of two palette tokens (or hex colours). */
export const contrast = contrastOf;

const bestInk = (bg: Token): "white" | "black" => (contrast("white", bg) >= contrast("black", bg) ? "white" : "black");

/** Steps `c` along its scale toward `end` ("white" = lighter, "black" = darker) until it reaches `min` against `other`. */
function step(c: Token, other: Token, min: number, end: "white" | "black"): Token {
  if (contrast(c, other) >= min) return c;
  const scale = scaleOf(c);
  const i = scale.indexOf(c);
  const path = end === "white" ? scale.slice(0, i).reverse() : scale.slice(i + 1);
  return path.find((t) => contrast(t, other) >= min) ?? end;
}

/** Moves `fg` toward the ink that suits `bg` until it reaches `min`. */
const fix = (fg: Token, bg: Token, min: number) => step(fg, bg, min, bestInk(bg));

/** Moves `c` away from `other` (to the opposite end) until it reaches `min`. */
const pushAway = (c: Token, other: Token, min: number) => step(c, other, min, lum(other) > 0.18 ? "black" : "white");

export type Check = { label: string; fg: ColorKey; bg: ColorKey; min: number };

/** The pairs the card actually renders. */
export const CHECKS: Check[] = [
  { label: "Title and body text", fg: "cardForeground", bg: "card", min: 7 },
  { label: "Meta text", fg: "mutedForeground", bg: "card", min: 4.5 },
  { label: "Outline button text", fg: "foreground", bg: "background", min: 4.5 },
  { label: "Primary button label", fg: "primaryForeground", bg: "primary", min: 4.5 },
  { label: "Secondary badge text", fg: "secondaryForeground", bg: "secondary", min: 4.5 },
  { label: "Accent badge text", fg: "accentForeground", bg: "accent", min: 4.5 },
  { label: "Primary button against card", fg: "primary", bg: "card", min: 3 },
];

export type Fix = { label: string; before: number; after: number; min: number };

/** A filled surface (primary, secondary, accent) whose label must reach 4.5:1. */
function labelOn(c: Record<ColorKey, Token>, fill: ColorKey, label: ColorKey) {
  c[label] = fix(c[label], c[fill], 4.5);
  if (contrast(c[label], c[fill]) < 4.5) {
    c[label] = bestInk(c[fill]);
    c[fill] = pushAway(c[fill], c[label], 4.5);
  }
}

export function guardTheme(theme: ShadcnTheme): { theme: ShadcnTheme; fixes: Fix[] } {
  const original = theme.colors;
  const c: Record<ColorKey, Token> = { ...original };

  for (let round = 0; round < 6; round++) {
    // A mid-tone card can't carry 7:1 text even in pure white or black: push it toward its nearer end.
    if (contrast(bestInk(c.card), c.card) < 7.5) c.card = pushAway(c.card, bestInk(c.card), 7.5);
    if (contrast(bestInk(c.background), c.background) < 7.5) {
      c.background = pushAway(c.background, bestInk(c.background), 7.5);
    }
    c.cardForeground = fix(c.cardForeground, c.card, 7);
    c.mutedForeground = fix(c.mutedForeground, c.card, 4.5);
    c.foreground = fix(c.foreground, c.background, 4.5);
    c.primary = fix(c.primary, c.card, 3);
    labelOn(c, "primary", "primaryForeground");
    labelOn(c, "secondary", "secondaryForeground");
    labelOn(c, "accent", "accentForeground");
    if (CHECKS.every((k) => contrast(c[k.fg], c[k.bg]) >= k.min)) break;
  }

  const fixes: Fix[] = [];
  for (const k of CHECKS) {
    const before = contrast(original[k.fg], original[k.bg]);
    if (before < k.min) fixes.push({ label: k.label, before, after: contrast(c[k.fg], c[k.bg]), min: k.min });
  }
  return { theme: { ...theme, colors: c }, fixes };
}
