/**
 * ✏️  THE DESIGN GUIDE: edit this file to teach the model what good design is.
 *
 * Everything here is sent with every request (Ollama, Workers AI or Claude). The model may only pick fonts from
 * FONTS, should start from one of PALETTES, follows DO and AVOID, and copies the quality of EXAMPLES.
 * Examples are the strongest teacher for small models: add your favourite results here.
 *
 * Adding a font: add it to FONTS here AND to the loader list in fonts.ts (it must be free and self-hostable).
 */
import { accessibleShadesText, type Token } from "./palette";
import type { ShadcnTheme } from "./schema";

/** Principles: what good looks like. */
export const DO = [
  "One accent hue. Everything else is a neutral gently tinted toward it.",
  "Backgrounds sit near the extremes (very light or very dark) with low saturation; the card is one small step from the background.",
  "primary must read as clickable: clearly saturated, with a label (primaryForeground) that has strong contrast.",
  "secondary and accent are quiet tints of primary or of the neutral, never a new competing hue.",
  "mutedForeground is for meta text: clearly softer than cardForeground, but still easy to read.",
  "border is subtle: one small step from the card, never a strong line.",
  "Match radius to the mood: 0–0.375rem crisp and serious, 0.5–0.75rem friendly default, 1rem+ soft and playful.",
  "Pair two fonts: start from the FONT PAIRS for the closest mood. With no strong mood, use geist for both. Same font for both is fine for minimal brands.",
  "Do not get carried away by the first association (fashion does not always mean the same serif): use the style leanings as a compass, then make your own choices.",
  "Give out-of-the-ordinary briefs (games, fantasy, sci-fi, retro, luxury) real character: pick a shape, a border style and, when it is a game or a tactile world, a texture. A fantasy game menu might be gem + double + stone + caps; a cyberpunk HUD notch + glow + scanlines.",
  "Warm moods lean toward cream, amber, terracotta; cool moods toward slate, blue, teal; night moods go dark mode.",
];

/** Anti-patterns: what to never do. */
export const AVOID = [
  "Rainbow palettes or two saturated hues fighting each other.",
  "Saturated or mid-grey backgrounds: they look muddy and kill contrast.",
  "Neon on neon, or pure #000000 on pure #ffffff, unless the brief is explicitly loud or brutal.",
  "Muted text so faint it disappears, or borders so strong they become the design.",
  "Shapes, strong borders, textures or caps on ordinary product briefs (banking, SaaS, minimal, calm): keep round, subtle, none, normal.",
  "Decorative or display fonts for body text (fontBody must be one of the BODY fonts).",
  "Copying a real brand, game or film: never use its name, logo, slogans, exact colours, or the names of its places, characters or products (also not in the theme name). Capture its feeling instead.",
];

/**
 * The only fonts the model may choose (from the mood → font map; all free, OFL/Apache, self-hosted, ids must exist in
 * fonts.ts). `role`: "body" fonts carry text, "heading" fonts only headings, "both" either. Per-font type settings
 * travel with the font: heading `weight`, `bodyWeight`, `uppercase`, `tracking` and `glow`.
 */
type FontSpec = {
  id: string;
  family: string;
  role: "body" | "heading" | "both";
  weight: number;
  bodyWeight?: number;
  uppercase?: boolean;
  tracking?: string;
  glow?: boolean;
  use: string;
};
export const FONTS = [
  {
    id: "system",
    family: "var(--font-sans)",
    role: "heading",
    weight: 600,
    use: "neutral, product, Apple-like; safe for everything",
  },
  {
    id: "geist",
    family: '"Geist", var(--font-sans)',
    role: "both",
    weight: 600,
    use: "body: neutral sans, the default; headings: product, developer",
  },
  {
    id: "inter",
    family: '"Inter", var(--font-sans)',
    role: "both",
    weight: 600,
    use: "body: friendly neutral sans; headings: clean UI",
  },
  {
    id: "ibm-plex-sans",
    family: '"IBM Plex Sans", var(--font-sans)',
    role: "both",
    weight: 600,
    use: "body: technical, corporate sans; headings: fintech",
  },
  {
    id: "ibm-plex-serif",
    family: '"IBM Plex Serif", Georgia, serif',
    role: "both",
    weight: 600,
    use: "body: modern, sturdy serif; headings: editorial",
  },
  {
    id: "cormorant",
    family: '"Cormorant Garamond", Georgia, serif',
    role: "heading",
    weight: 700,
    use: "renaissance / gallery headings; romantic / wedding body",
  },
  {
    id: "eb-garamond",
    family: '"EB Garamond", Georgia, serif',
    role: "both",
    weight: 600,
    use: "body: classic book serif (fantasy, literary, romantic)",
  },
  {
    id: "crimson-pro",
    family: '"Crimson Pro", Georgia, serif',
    role: "heading",
    weight: 600,
    use: "dark gothic and horror body",
  },
  {
    id: "jost",
    family: '"Jost", var(--font-sans)',
    role: "heading",
    weight: 600,
    bodyWeight: 300,
    use: "luxury / fashion body (light)",
  },
  {
    id: "geist-mono",
    family: '"Geist Mono", ui-monospace, monospace',
    role: "heading",
    weight: 600,
    use: "developer / tech body",
  },
  {
    id: "chakra-petch",
    family: '"Chakra Petch", var(--font-sans)',
    role: "heading",
    weight: 600,
    use: "cyberpunk / sci-fi body",
  },
  {
    id: "vt323",
    family: '"VT323", ui-monospace, monospace',
    role: "heading",
    weight: 400,
    use: "retro arcade / pixel body",
  },
  { id: "exo-2", family: '"Exo 2", var(--font-sans)', role: "heading", weight: 600, use: "80s synthwave / neon body" },
  {
    id: "space-grotesk",
    family: '"Space Grotesk", var(--font-sans)',
    role: "heading",
    weight: 700,
    use: "brutalist body",
  },
  { id: "sora", family: '"Sora", var(--font-sans)', role: "heading", weight: 600, use: "futuristic clean body" },
  {
    id: "nunito",
    family: '"Nunito", var(--font-sans)',
    role: "heading",
    weight: 700,
    use: "playful / kids and organic / natural body",
  },
  {
    id: "shantell-sans",
    family: '"Shantell Sans", var(--font-sans)',
    role: "heading",
    weight: 600,
    use: "hand-drawn / sketchy body",
  },
  {
    id: "josefin-sans",
    family: '"Josefin Sans", var(--font-sans)',
    role: "heading",
    weight: 600,
    use: "art deco / 1920s body",
  },
  {
    id: "old-standard-tt",
    family: '"Old Standard TT", Georgia, serif',
    role: "heading",
    weight: 700,
    use: "western / saloon body",
  },
  {
    id: "libre-caslon-text",
    family: '"Libre Caslon Text", Georgia, serif',
    role: "both",
    weight: 700,
    use: "body: editorial serif (newspaper, western, heritage)",
  },
  {
    id: "barlow-condensed",
    family: '"Barlow Condensed", var(--font-sans)',
    role: "heading",
    weight: 600,
    use: "military / industrial body",
  },
  {
    id: "zen-kaku-gothic-new",
    family: '"Zen Kaku Gothic New", var(--font-sans)',
    role: "heading",
    weight: 700,
    use: "zen / Japanese minimal body",
  },
  { id: "cinzel", family: '"Cinzel", Georgia, serif', role: "heading", weight: 700, use: "fantasy RPG / medieval" },
  {
    id: "pirata-one",
    family: '"Pirata One", Georgia, serif',
    role: "heading",
    weight: 400,
    use: "dark gothic, blackletter",
  },
  {
    id: "fraunces",
    family: '"Fraunces", Georgia, serif',
    role: "heading",
    weight: 600,
    use: "renaissance / gallery, organic / natural",
  },
  {
    id: "playfair",
    family: '"Playfair Display", Georgia, serif',
    role: "heading",
    weight: 400,
    tracking: "-0.02em",
    use: "luxury / fashion (regular, tight tracking)",
  },
  { id: "manrope", family: '"Manrope", var(--font-sans)', role: "heading", weight: 700, use: "calm Nordic / bank" },
  { id: "tektur", family: '"Tektur", var(--font-sans)', role: "heading", weight: 700, use: "cyberpunk / sci-fi" },
  {
    id: "press-start-2p",
    family: '"Press Start 2P", monospace',
    role: "heading",
    weight: 400,
    use: "retro arcade / pixel",
  },
  {
    id: "tilt-neon",
    family: '"Tilt Neon", var(--font-sans)',
    role: "heading",
    weight: 400,
    glow: true,
    use: "80s synthwave / neon (glows in the primary colour)",
  },
  {
    id: "monoton",
    family: '"Monoton", var(--font-sans)',
    role: "heading",
    weight: 400,
    glow: true,
    use: "80s synthwave, neon sign (alternative)",
  },
  { id: "archivo-black", family: '"Archivo Black", var(--font-sans)', role: "heading", weight: 400, use: "brutalist" },
  {
    id: "syne",
    family: '"Syne", var(--font-sans)',
    role: "heading",
    weight: 700,
    use: "brutalist, experimental (alternative)",
  },
  { id: "unbounded", family: '"Unbounded", var(--font-sans)', role: "heading", weight: 600, use: "futuristic clean" },
  { id: "fredoka", family: '"Fredoka", var(--font-sans)', role: "heading", weight: 600, use: "playful / kids" },
  { id: "gochi-hand", family: '"Gochi Hand", cursive', role: "heading", weight: 400, use: "hand-drawn / sketchy" },
  {
    id: "pinyon-script",
    family: '"Pinyon Script", cursive',
    role: "heading",
    weight: 400,
    use: "romantic / wedding (script)",
  },
  {
    id: "federo",
    family: '"Federo", var(--font-sans)',
    role: "heading",
    weight: 400,
    uppercase: true,
    tracking: "0.08em",
    use: "art deco / 1920s (uppercase)",
  },
  { id: "sancreek", family: '"Sancreek", Georgia, serif', role: "heading", weight: 400, use: "western / saloon" },
  { id: "rye", family: '"Rye", Georgia, serif', role: "heading", weight: 400, use: "western / saloon (alternative)" },
  { id: "creepster", family: '"Creepster", var(--font-sans)', role: "heading", weight: 400, use: "horror" },
  {
    id: "saira-stencil-one",
    family: '"Saira Stencil One", var(--font-sans)',
    role: "heading",
    weight: 400,
    use: "military / industrial",
  },
  {
    id: "black-ops-one",
    family: '"Black Ops One", var(--font-sans)',
    role: "heading",
    weight: 400,
    use: "military / industrial (alternative)",
  },
  {
    id: "shippori-mincho",
    family: '"Shippori Mincho", Georgia, serif',
    role: "heading",
    weight: 700,
    use: "zen / Japanese minimal",
  },
] as const satisfies readonly FontSpec[];
export type FontId = (typeof FONTS)[number]["id"];
export type BodyFontId = Extract<(typeof FONTS)[number], { role: "body" | "both" }>["id"];
export const FONT_IDS = FONTS.map((f) => f.id) as [FontId, ...FontId[]];
export const BODY_FONT_IDS = FONTS.filter((f) => f.role !== "heading").map((f) => f.id) as [
  BodyFontId,
  ...BodyFontId[],
];
export const fontSpec = (id: FontId): FontSpec => FONTS.find((f) => f.id === id) ?? FONTS[0];

/** Recommended heading + body pairs per mood (from the font map). The model should start from the closest one. */
export const FONT_PAIRS: { mood: string; heading: FontId; body: BodyFontId }[] = [
  { mood: "default / neutral (no strong mood)", heading: "geist", body: "geist" },
  { mood: "fantasy RPG / medieval", heading: "cinzel", body: "eb-garamond" },
  { mood: "dark gothic", heading: "pirata-one", body: "eb-garamond" },
  { mood: "renaissance / gallery", heading: "cormorant", body: "inter" },
  { mood: "luxury / fashion", heading: "playfair", body: "geist" },
  { mood: "calm Nordic / bank", heading: "manrope", body: "inter" },
  { mood: "corporate fintech", heading: "ibm-plex-sans", body: "ibm-plex-sans" },
  { mood: "developer / tech", heading: "geist", body: "geist" },
  { mood: "cyberpunk / sci-fi", heading: "tektur", body: "ibm-plex-sans" },
  { mood: "retro arcade / pixel", heading: "press-start-2p", body: "geist" },
  { mood: "80s synthwave / neon", heading: "tilt-neon", body: "inter" },
  { mood: "brutalist", heading: "archivo-black", body: "geist" },
  { mood: "futuristic clean", heading: "unbounded", body: "geist" },
  { mood: "playful / kids", heading: "fredoka", body: "inter" },
  { mood: "hand-drawn / sketchy", heading: "gochi-hand", body: "inter" },
  { mood: "romantic / wedding", heading: "pinyon-script", body: "eb-garamond" },
  { mood: "organic / natural", heading: "fraunces", body: "inter" },
  { mood: "art deco / 1920s", heading: "federo", body: "geist" },
  { mood: "western / saloon", heading: "sancreek", body: "libre-caslon-text" },
  { mood: "horror", heading: "creepster", body: "eb-garamond" },
  { mood: "newspaper / editorial", heading: "ibm-plex-serif", body: "libre-caslon-text" },
  { mood: "military / industrial", heading: "saira-stencil-one", body: "ibm-plex-sans" },
  { mood: "zen / Japanese minimal", heading: "shippori-mincho", body: "inter" },
];

/**
 * Character beyond colour and type. Most briefs want the quiet defaults (round, subtle, none, normal); shapes,
 * strong borders and textures are for briefs that are out of the ordinary: games, fantasy, sci-fi, retro, luxury.
 */
export const SHAPES = [
  { id: "round", use: "default: corners follow radius; almost every product UI" },
  { id: "pill", use: "fully round buttons, badges and inputs: friendly, consumer, playful" },
  { id: "squircle", use: "smooth continuous corners: premium, Apple-like, calm" },
  { id: "sharp", use: "square corners: brutalist, editorial, swiss, terminal" },
  { id: "bevel", use: "cut (chamfered) corners: sci-fi, military, mecha, industrial" },
  { id: "notch", use: "notched inner corners: cyberpunk HUD, tech, arcade" },
  { id: "scoop", use: "scooped inner corners: ornate, fantasy, medieval, tickets" },
  { id: "gem", use: "pointed hexagon buttons with tip ornaments: fantasy RPG, epic game menus" },
] as const;

export const BORDERS = [
  { id: "subtle", use: "default hairline in the border colour" },
  { id: "none", use: "no lines, soft shadows only: minimal, calm, airy" },
  { id: "strong", use: "2px lines: brutalist, playful, comic, bold" },
  {
    id: "double",
    use: "double frame lines (set border to a metallic or accent tone): fantasy, luxury, art deco, game",
  },
  { id: "raised", use: "embossed, carved edges: retro game UI, stone, wood, skeuomorphic" },
  { id: "glow", use: "primary-coloured line with a soft glow: neon, synthwave, sci-fi" },
] as const;

export const TEXTURES = [
  { id: "none", use: "default; any ordinary product UI must use none" },
  { id: "grain", use: "fine film grain: analog, editorial, cozy, retro photo" },
  { id: "paper", use: "soft paper fibres: stationery, journal, wedding, handmade" },
  { id: "stone", use: "rough stone/metal plate: fantasy, medieval, dungeon, game menus" },
  { id: "scanlines", use: "CRT lines: retro arcade, terminal, cyberpunk" },
  { id: "grid", use: "blueprint grid: engineering, sci-fi HUD, technical" },
  { id: "halftone", use: "comic dots: pop art, comics, zines" },
] as const;

export const BUTTON_TEXT = [
  { id: "normal", use: "default sentence case" },
  { id: "caps", use: "spaced capitals in the heading font: epic, luxury, game menus, art deco" },
] as const;

export const DEPTHS = [
  { id: "flat", use: "default: plain fills, no lift" },
  {
    id: "lifted",
    use: "barely-there elevation on buttons (faint top sheen, 1px light inner edge, soft tinted shadow): polished product UI, premium dark apps. Use sometimes, not by default",
  },
] as const;

export type ShapeId = (typeof SHAPES)[number]["id"];
export type BorderId = (typeof BORDERS)[number]["id"];
export type TextureId = (typeof TEXTURES)[number]["id"];
export type ButtonTextId = (typeof BUTTON_TEXT)[number]["id"];
const ids = <T extends readonly { id: string }[]>(list: T) =>
  list.map((x) => x.id) as [T[number]["id"], ...T[number]["id"][]];
export const SHAPE_IDS = ids(SHAPES);
export const BORDER_IDS = ids(BORDERS);
export const TEXTURE_IDS = ids(TEXTURES);
export const BUTTON_TEXT_IDS = ids(BUTTON_TEXT);
export const DEPTH_IDS = ids(DEPTHS);

/**
 * Style leanings (archetypes): a vocabulary that helps the model read a brief without getting carried away. They are
 * hints, never presets: the model may follow one loosely, blend two, or ignore them, and it still chooses every value
 * itself (which serif, which hue, which radius). Each leaning is written in terms of the switches above.
 */
export const LEANINGS = [
  {
    id: "minimal-precision",
    feel: "precise product tools, settings screens; quiet and exact",
    leans:
      "round shape, radius 0.5-0.625rem, subtle border, flat or lifted, neutral sans (geist, inter), zinc/neutral greys with one near-black (dark: near-white) primary",
  },
  {
    id: "material-expressive",
    feel: "expressive, friendly, tonal colour instead of shadows",
    leans:
      "pill or round, radius 1-1.5rem, border none, tonal tinted surfaces from one hue family (secondary/accent as tints), a rounded or geometric sans",
  },
  {
    id: "glass",
    feel: "frosted, luminous, dark-first",
    leans:
      "round, radius ~1rem, subtle or glow border, lifted, clean sans, cool vivid primary (sky/violet/pink); keep text on solid enough surfaces",
  },
  {
    id: "fashion-editorial",
    feel: "lookbooks, runway, image-led and airy",
    leans:
      "sharp shape, radius 0, subtle hairlines, flat, caps labels, a light high-contrast display (a serif or a thin geometric) with a sans body, black/white only, no accent hue",
  },
  {
    id: "luxury-premium",
    feel: "high-end hospitality, jewellery; slow and generous",
    leans:
      "sharp or squircle, radius 0-0.125rem, double or subtle hairlines in a gold tone, flat, serif display with a sans body, stone darks or creams with a gold (amber/yellow) primary",
  },
  {
    id: "web2-gloss",
    feel: "2000s glossy web, Y2K optimism",
    leans: "round or pill, radius ~0.5rem, lifted depth, bright sky/lime primary on light slate, rounded friendly sans",
  },
  {
    id: "fantasy-rpg",
    feel: "epic game menus, taverns, quests",
    leans:
      "gem or scoop shape, double or raised border in gold, stone or paper texture, caps buttons, carved serif display with a serif body, dark stone with gold primary (light: parchment)",
  },
  {
    id: "neo-brutal",
    feel: "loud, honest, poster-like",
    leans:
      "sharp or small radius, strong border (hard offset shadow), flat, heavy grotesk display, bright flat fills (yellow/pink/lime/sky 300) on a warm off-white",
  },
  {
    id: "retro-pixel",
    feel: "8/16-bit arcade menus",
    leans:
      "sharp, radius 0, strong or raised border, scanlines optional, pixel display for headings only with a sans body, near-black with a limited bright palette",
  },
  {
    id: "cyber-hud",
    feel: "sci-fi heads-up display, cyberpunk",
    leans:
      "bevel or notch shape, glow border, scanlines or grid texture, techno display with a sans body, zinc-950 with cyan or fuchsia primary",
  },
  {
    id: "editorial-news",
    feel: "newspapers, long-form magazines",
    leans:
      "sharp, radius 0, subtle or double rules, flat, serif headings and a serif body, paper stone-50 with ink stone-950 and a red accent",
  },
  {
    id: "swiss-grid",
    feel: "international typographic style; strict and bold",
    leans:
      "sharp, radius 0, subtle border, flat, bold neo-grotesk headings with a sans body, white/near-black with one red accent",
  },
  {
    id: "clay-playful",
    feel: "toy-like learning apps; bouncy and friendly",
    leans:
      "pill or round, radius 1-1.5rem, raised border (chunky bottom edge), rounded display with a sans body, bright green/sky/amber on white",
  },
  {
    id: "calm-trust",
    feel: "Nordic banks, health; airy and reassuring",
    leans:
      "round, radius ~0.75rem, subtle border, flat or lifted, calm geometric sans heading with a sans body, slate/stone with a muted teal or sky primary",
  },
  {
    id: "terminal",
    feel: "CLI tools, dev consoles",
    leans:
      "sharp, radius 0, strong or subtle border, flat, scanlines optional, mono headings and a sans body, neutral-950 with a green primary (light: neutral-50 with dark green)",
  },
] as const;
export const LEANING_IDS = ["none", ...LEANINGS.map((l) => l.id)] as [string, ...string[]];

/** Curated starting palettes (palette tokens): the model should pick the closest one and adapt it to the brief. */
export const PALETTES = [
  {
    name: "Paper & Ink",
    mode: "light",
    feel: "editorial, calm, literary",
    background: "stone-50",
    foreground: "stone-900",
    primary: "stone-900",
    accent: "stone-100",
  },
  {
    name: "Graphite Pro",
    mode: "light",
    feel: "minimal, product, premium",
    background: "white",
    foreground: "neutral-950",
    primary: "neutral-950",
    accent: "neutral-100",
  },
  {
    name: "Nordic Fjord",
    mode: "light",
    feel: "cool, trustworthy, clear",
    background: "slate-50",
    foreground: "slate-900",
    primary: "blue-600",
    accent: "blue-50",
  },
  {
    name: "Sea Glass",
    mode: "light",
    feel: "fresh, ocean, calm",
    background: "teal-50",
    foreground: "teal-950",
    primary: "teal-700",
    accent: "teal-100",
  },
  {
    name: "Forest Floor",
    mode: "light",
    feel: "natural, grounded, organic",
    background: "stone-50",
    foreground: "green-950",
    primary: "green-700",
    accent: "green-100",
  },
  {
    name: "Terracotta Sun",
    mode: "light",
    feel: "warm, cozy, autumn, earthy",
    background: "orange-50",
    foreground: "stone-900",
    primary: "orange-700",
    accent: "orange-100",
  },
  {
    name: "Lavender Haze",
    mode: "light",
    feel: "dreamy, soft, creative",
    background: "violet-50",
    foreground: "violet-950",
    primary: "violet-600",
    accent: "violet-100",
  },
  {
    name: "Midnight Ink",
    mode: "dark",
    feel: "night, focus, calm tech",
    background: "slate-950",
    foreground: "slate-100",
    primary: "indigo-400",
    accent: "slate-800",
  },
  {
    name: "Ember Night",
    mode: "dark",
    feel: "fantasy, fire, games, drama",
    background: "stone-950",
    foreground: "stone-100",
    primary: "amber-500",
    accent: "stone-800",
  },
  {
    name: "Neon Pulse",
    mode: "dark",
    feel: "arcade, nightlife, loud",
    background: "zinc-950",
    foreground: "zinc-50",
    primary: "pink-500",
    accent: "zinc-800",
  },
] as const satisfies readonly {
  name: string;
  mode: "light" | "dark";
  feel: string;
  background: Token;
  foreground: Token;
  primary: Token;
  accent: Token;
}[];

/** Worked examples of good output (few-shot). Replace with themes you love. */
export const EXAMPLES: { brief: string; theme: ShadcnTheme }[] = [
  {
    brief: "calm ocean",
    theme: {
      name: "Low Tide",
      rationale: "Sea Glass base: teal-700 accent on teal-50, soft radius, unhurried and clear.",
      mode: "light",
      colors: {
        background: "teal-50",
        foreground: "teal-950",
        card: "white",
        cardForeground: "teal-950",
        primary: "teal-700",
        primaryForeground: "white",
        secondary: "teal-100",
        secondaryForeground: "teal-900",
        muted: "teal-50",
        mutedForeground: "slate-600",
        accent: "teal-100",
        accentForeground: "teal-900",
        border: "teal-100",
        ring: "teal-600",
      },
      radius: 0.75,
      fontHeading: "manrope",
      fontBody: "inter",
      shape: "round",
      border: "subtle",
      texture: "none",
      buttonText: "normal",
      depth: "flat",
      leaning: "calm-trust",
    },
  },
  {
    brief: "dragon fire",
    theme: {
      name: "Ember Keep",
      rationale: "Ember Night base: deep charcoal-brown, molten gold primary, carved serif headings, crisp corners.",
      mode: "dark",
      colors: {
        background: "stone-950",
        foreground: "stone-100",
        card: "stone-900",
        cardForeground: "stone-100",
        primary: "amber-500",
        primaryForeground: "stone-950",
        secondary: "stone-800",
        secondaryForeground: "stone-100",
        muted: "stone-800",
        mutedForeground: "stone-400",
        accent: "amber-950",
        accentForeground: "amber-200",
        border: "amber-700",
        ring: "amber-500",
      },
      radius: 0.25,
      fontHeading: "cinzel",
      fontBody: "eb-garamond",
      shape: "gem",
      border: "double",
      texture: "stone",
      buttonText: "caps",
      depth: "flat",
      leaning: "fantasy-rpg",
    },
  },
  {
    brief: "premium minimal",
    theme: {
      name: "Quiet Pro",
      rationale:
        "Graphite Pro base: near-white and near-black, one confident black button, system type, generous radius.",
      mode: "light",
      colors: {
        background: "neutral-50",
        foreground: "neutral-950",
        card: "white",
        cardForeground: "neutral-950",
        primary: "neutral-950",
        primaryForeground: "neutral-50",
        secondary: "neutral-100",
        secondaryForeground: "neutral-900",
        muted: "neutral-100",
        mutedForeground: "neutral-600",
        accent: "neutral-100",
        accentForeground: "neutral-900",
        border: "neutral-200",
        ring: "neutral-950",
      },
      radius: 1,
      fontHeading: "geist",
      fontBody: "geist",
      shape: "squircle",
      border: "subtle",
      texture: "none",
      buttonText: "normal",
      depth: "lifted",
      leaning: "minimal-precision",
    },
  },
];

/** The guide as text for the prompt. */
export function guideText(): string {
  return [
    "DO:",
    ...DO.map((d) => `- ${d}`),
    "",
    "AVOID:",
    ...AVOID.map((a) => `- ${a}`),
    "",
    "FONT PAIRS BY MOOD (start from the closest pair: fontHeading / fontBody):",
    ...FONT_PAIRS.map((p) => `- ${p.mood}: ${p.heading} / ${p.body}`),
    "",
    "BODY FONTS (fontBody must be one of these six; body text is never experimental: three sans, three serifs):",
    ...FONTS.filter((f) => f.role !== "heading").map((f) => `- ${f.id}: ${f.use}`),
    "",
    "HEADING FONTS (fontHeading; this is where the mood shows):",
    ...FONTS.filter((f) => f.role === "heading").map((f) => `- ${f.id}: ${f.use}`),
    "",
    "SHAPE (corners of buttons, badges, inputs and cards):",
    ...SHAPES.map((x) => `- ${x.id}: ${x.use}`),
    "",
    "BORDER (style of card, input and button lines):",
    ...BORDERS.map((x) => `- ${x.id}: ${x.use}`),
    "",
    "TEXTURE (surface of cards and main buttons):",
    ...TEXTURES.map((x) => `- ${x.id}: ${x.use}`),
    "",
    "BUTTON TEXT:",
    ...BUTTON_TEXT.map((x) => `- ${x.id}: ${x.use}`),
    "",
    "DEPTH (buttons):",
    ...DEPTHS.map((x) => `- ${x.id}: ${x.use}`),
    "",
    "COLOURS: use only Tailwind palette tokens (the shadcn colours): <hue>-<shade> with hue in slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose and shade in 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950; or white / black. Never hex.",
    "Accessible text shades per hue (4.5:1):",
    accessibleShadesText(),
    "",
    "STYLE LEANINGS (helpers, not presets: pick the closest leaning if one fits, follow it loosely, blend two or ignore them; you still choose every concrete value, e.g. which serif or which hue. Report it in leaning, or none):",
    ...LEANINGS.map((l) => `- ${l.id} (${l.feel}): ${l.leans}`),
    "",
    "PALETTES (start from the closest one, then adapt hue and warmth to the brief):",
    ...PALETTES.map(
      (p) =>
        `- ${p.name} (${p.mode}; ${p.feel}): background ${p.background}, foreground ${p.foreground}, primary ${p.primary}, accent ${p.accent}`,
    ),
    "",
    "EXAMPLES OF GOOD OUTPUT:",
    ...EXAMPLES.map((e) => `Brief "${e.brief}" →\n${JSON.stringify(e.theme)}`),
  ].join("\n");
}
