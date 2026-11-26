/**
 * Offline generator: no AI, no network. Picks the curated palette whose "feel" best matches the brief's words
 * (falling back to a hash), then derives a full shadcn config from it. The guard checks it like any other.
 */
import { PALETTES } from "./design-guide";
import { type Shade, scaleOf, type Token } from "./palette";
import type { ShadcnTheme } from "./schema";

/** The same hue at another shade ("stone-900" at 400 → "stone-400"); white/black stay as they are. */
function shade(t: Token, to: Shade): Token {
  const scale = scaleOf(t);
  return scale.length > 2 ? (scale[[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].indexOf(to)] ?? t) : t;
}
/** Moves `t` n steps along its scale (positive = darker). */
function shift(t: Token, n: number): Token {
  const scale = scaleOf(t);
  return scale[Math.min(scale.length - 1, Math.max(0, scale.indexOf(t) + n))] ?? t;
}

const KEYWORDS: Record<string, string[]> = {
  "Paper & Ink": ["editorial", "paper", "book", "literary", "journal", "news", "classic"],
  "Graphite Pro": ["apple", "minimal", "premium", "pro", "clean", "product", "sleek", "modern", "tech"],
  "Nordic Fjord": ["cool", "trust", "clear", "nordic", "winter", "sky", "corporate", "bank"],
  "Sea Glass": ["ocean", "sea", "calm", "water", "fresh", "mint", "beach", "wave"],
  "Forest Floor": ["forest", "nature", "green", "moss", "earth", "garden", "organic", "plant"],
  "Terracotta Sun": ["autumn", "cozy", "warm", "sun", "desert", "coffee", "clay", "spice", "runescape", "quest"],
  "Lavender Haze": ["dream", "dreamy", "soft", "lavender", "magic", "creative", "spring"],
  "Midnight Ink": ["night", "midnight", "focus", "space", "deep", "rain", "moon"],
  "Ember Night": ["fire", "dragon", "epic", "fantasy", "warcraft", "war", "gold", "ember", "legend"],
  "Neon Pulse": ["neon", "arcade", "party", "club", "electric", "cyber", "game", "gaming"],
};

function pickPalette(mood: string) {
  const words = mood.toLowerCase().split(/[\s-]+/);
  const hit = Object.entries(KEYWORDS).find(([, keys]) => keys.some((k) => words.includes(k)));
  if (hit) return PALETTES.find((p) => p.name === hit[0]) ?? PALETTES[0];
  let h = 2166136261;
  for (const ch of mood.toLowerCase()) h = Math.imul(h ^ (ch.codePointAt(0) ?? 0), 16777619);
  return PALETTES[Math.abs(h) % PALETTES.length] ?? PALETTES[0];
}

/** A heading + body pairing per palette, from the design guide's font list. */
const PAIRS: Record<string, [ShadcnTheme["fontHeading"], ShadcnTheme["fontBody"]]> = {
  "Paper & Ink": ["ibm-plex-serif", "libre-caslon-text"],
  "Graphite Pro": ["geist", "geist"],
  "Nordic Fjord": ["manrope", "inter"],
  "Sea Glass": ["manrope", "inter"],
  "Forest Floor": ["fraunces", "inter"],
  "Terracotta Sun": ["fraunces", "inter"],
  "Lavender Haze": ["cormorant", "inter"],
  "Midnight Ink": ["unbounded", "geist"],
  "Ember Night": ["cinzel", "eb-garamond"],
  "Neon Pulse": ["tilt-neon", "inter"],
};

type Style = Pick<ShadcnTheme, "shape" | "border" | "texture" | "buttonText" | "depth">;
const PLAIN: Style = { shape: "round", border: "subtle", texture: "none", buttonText: "normal", depth: "flat" };
/** Character per palette: ordinary palettes stay plain; game-like ones get shape, frame and texture. */
const STYLES: Record<string, Style> = {
  "Paper & Ink": { ...PLAIN, shape: "sharp", texture: "paper" },
  "Graphite Pro": { ...PLAIN, shape: "squircle", depth: "lifted" },
  "Midnight Ink": { ...PLAIN, depth: "lifted" },
  "Lavender Haze": { ...PLAIN, shape: "pill" },
  "Ember Night": { shape: "gem", border: "double", texture: "stone", buttonText: "caps", depth: "flat" },
  "Neon Pulse": { shape: "notch", border: "glow", texture: "scanlines", buttonText: "normal", depth: "flat" },
};

const title = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

export function offlineTheme(mood: string): ShadcnTheme {
  const p = pickPalette(mood);
  const dark = p.mode === "dark";
  const { background, foreground, primary, accent } = p;
  const style = STYLES[p.name] ?? PLAIN;
  const framed = style.border === "double" || style.border === "glow";
  const card: Token = dark ? shift(background, -1) : "white";
  return {
    reading: { reference: "", visualLanguage: "", translation: "" },
    name: title(mood),
    rationale: `Built offline from the "${p.name}" palette (${p.feel}).`,
    mode: dark ? "dark" : "light",
    colors: {
      background,
      foreground,
      card,
      cardForeground: foreground,
      primary,
      primaryForeground: dark ? background : "white",
      secondary: accent,
      secondaryForeground: foreground,
      muted: dark ? shade(foreground, 800) : shade(foreground, 100),
      mutedForeground: dark ? shade(foreground, 400) : shade(foreground, 600),
      accent,
      accentForeground: foreground,
      border: framed ? shift(primary, dark ? 2 : -2) : shade(foreground, dark ? 800 : 200),
      ring: primary,
    },
    radius: dark ? 0.375 : 0.75,
    fontHeading: PAIRS[p.name]?.[0] ?? "geist",
    fontBody: PAIRS[p.name]?.[1] ?? "geist",
    ...style,
    leaning: "none",
  };
}
