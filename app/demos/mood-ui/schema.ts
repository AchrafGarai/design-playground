import { z } from "zod";
import {
  BODY_FONT_IDS,
  BORDER_IDS,
  BUTTON_TEXT_IDS,
  DEPTH_IDS,
  FONT_IDS,
  fontSpec,
  LEANING_IDS,
  SHAPE_IDS,
  TEXTURE_IDS,
} from "./design-guide";
import { hexOf, isToken, type Token, toToken } from "./palette";

/** Mood input rules, shared by the browser and the server: 1–5 words; letters, numbers and symbols (no markup). */
export const MAX_WORDS = 5;
export const MAX_CHARS = 60;

export function normaliseMood(input: string): string | null {
  const mood = input.trim().replace(/\s+/g, " ");
  if (!mood || mood.length > MAX_CHARS) return null;
  if (mood.split(" ").length > MAX_WORDS) return null;
  // Any letters, numbers, punctuation or symbols; never control characters or angle brackets (no markup).
  if (!/^[\p{L}\p{M}\p{N}\p{P}\p{S} ]+$/u.test(mood) || /[<>]/.test(mood)) return null;
  return mood;
}

/** A palette token ("blue-600", "white"). A hex colour is accepted and snapped to the nearest token. */
const color = z.preprocess(
  (v) => toToken(v) ?? v,
  z.custom<Token>((v) => typeof v === "string" && isToken(v), "Tailwind palette token like blue-600"),
);
const text = (max: number, fallback: string) =>
  z
    .string()
    .transform((v) => v.trim().slice(0, max) || fallback)
    .catch(fallback);

/** shadcn/ui theme tokens (camelCase here; written as --card-foreground etc. on the card). */
export const COLOR_KEYS = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "border",
  "ring",
] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];

/**
 * A shadcn theme config, as a model returns it. Only the colours are strict (the contrast guard needs them);
 * everything else falls back to a default if a model slips.
 */
export const themeSchema = z.object({
  name: text(40, "Untitled"),
  rationale: text(200, ""),
  mode: z.enum(["light", "dark"]).catch("light"),
  colors: z.object(Object.fromEntries(COLOR_KEYS.map((k) => [k, color])) as Record<ColorKey, typeof color>),
  radius: z.coerce.number().catch(0.625),
  fontHeading: z.enum(FONT_IDS).catch("geist"),
  fontBody: z.enum(BODY_FONT_IDS).catch("geist"),
  shape: z.enum(SHAPE_IDS).catch("round"),
  border: z.enum(BORDER_IDS).catch("subtle"),
  texture: z.enum(TEXTURE_IDS).catch("none"),
  buttonText: z.enum(BUTTON_TEXT_IDS).catch("normal"),
  depth: z.enum(DEPTH_IDS).catch("flat"),
  /** Which style leaning the model followed (a helper it reports, never a preset). */
  leaning: z.enum(LEANING_IDS).catch("none"),
});

export type ShadcnTheme = z.output<typeof themeSchema>;

/** JSON Schema for structured output (all providers). */
export const themeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "name",
    "rationale",
    "mode",
    "colors",
    "radius",
    "fontHeading",
    "fontBody",
    "shape",
    "border",
    "texture",
    "buttonText",
  ],
  properties: {
    name: {
      type: "string",
      description:
        "Theme name: 2 plain English words describing the look (like 'Low Tide', 'Ember Keep'). No proper nouns.",
    },
    rationale: { type: "string", description: "One sentence: which palette you started from and why it fits" },
    mode: { type: "string", enum: ["light", "dark"] },
    colors: {
      type: "object",
      additionalProperties: false,
      required: COLOR_KEYS,
      properties: Object.fromEntries(
        COLOR_KEYS.map((k) => [
          k,
          { type: "string", description: "Tailwind palette token: <hue>-<50..950>, white or black" },
        ]),
      ),
    },
    radius: { type: "number", description: "shadcn --radius in rem, 0 to 1.5" },
    fontHeading: { type: "string", enum: FONT_IDS },
    fontBody: { type: "string", enum: BODY_FONT_IDS },
    shape: { type: "string", enum: SHAPE_IDS },
    border: { type: "string", enum: BORDER_IDS },
    texture: { type: "string", enum: TEXTURE_IDS },
    buttonText: { type: "string", enum: BUTTON_TEXT_IDS },
    depth: { type: "string", enum: DEPTH_IDS },
    leaning: { type: "string", enum: LEANING_IDS, description: "The style leaning you followed loosely, or none" },
  },
} as const;

/** Keeps values in range: radius 0–1.5rem, and only body fonts carry body text. */
export function clampTheme(t: ShadcnTheme): ShadcnTheme {
  const radius = Math.round(Math.min(1.5, Math.max(0, t.radius)) * 1000) / 1000;
  const fontBody = (BODY_FONT_IDS as readonly string[]).includes(t.fontBody) ? t.fontBody : "geist";
  return { ...t, radius, fontBody };
}

/** The theme as shadcn CSS variables (--card-foreground, --radius, --font-sans…). */
export function themeToCssVars(t: ShadcnTheme, families: { heading: string; body: string }): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const k of COLOR_KEYS) vars[`--${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = hexOf(t.colors[k]);
  vars["--radius"] = `${t.radius}rem`;
  vars["--font-heading"] = families.heading;
  vars["--font-body"] = families.body;
  // Per-font type settings from the font map (weight, case, tracking, neon glow).
  const h = fontSpec(t.fontHeading);
  const b = fontSpec(t.fontBody);
  vars["--font-heading-weight"] = String(h.weight);
  vars["--font-heading-case"] = h.uppercase ? "uppercase" : "none";
  vars["--font-heading-tracking"] = h.tracking ?? "normal";
  vars["--font-heading-glow"] = h.glow
    ? "0 0 6px color-mix(in oklab, var(--primary) 70%, transparent), 0 0 18px color-mix(in oklab, var(--primary) 45%, transparent)"
    : "none";
  vars["--font-body-weight"] = String(b.bodyWeight ?? 400);
  return vars;
}

/**
 * The theme as a shadcn globals.css snippet, ready to paste: a scoped theme class with the standard variables (hex, with the Tailwind token in a
 * comment), radius and fonts, plus this demo's extra switches as a comment.
 */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "mood";

export function themeToCss(t: ShadcnTheme, families: { heading: string; body: string }): string {
  const name = (k: ColorKey) => `--${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
  const lines = [
    `/* ${t.name}: shadcn theme generated by Mood → UI (${t.mode}).`,
    "   Add the class to <html>, or use these variables as your root theme. */",
    `.theme-${slug(t.name)} {`,
    `  --radius: ${t.radius}rem;`,
    ...COLOR_KEYS.map((k) => `  ${name(k)}: ${hexOf(t.colors[k])}; /* ${t.colors[k]} */`),
    `  --font-heading: ${families.heading};`,
    `  --font-sans: ${families.body};`,
    "}",
    `/* Style: ${t.shape} shape, ${t.border} border, ${t.texture} texture, ${t.buttonText} button text, ${t.depth} depth */`,
  ];
  return lines.join("\n");
}
