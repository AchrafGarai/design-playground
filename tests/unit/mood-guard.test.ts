import { describe, expect, it } from "vitest";
import { EXAMPLES, FONT_IDS, PALETTES } from "~/demos/mood-ui/design-guide";
import { CHECKS, contrast, guardTheme } from "~/demos/mood-ui/guard";
import { offlineTheme } from "~/demos/mood-ui/offline";
import { isToken, nearestToken, TOKENS, toToken } from "~/demos/mood-ui/palette";
import {
  COLOR_KEYS,
  clampTheme,
  normaliseMood,
  type ShadcnTheme,
  themeSchema,
  themeToCssVars,
} from "~/demos/mood-ui/schema";
import { THEME_SYSTEM } from "../../server/prompt";

const base = EXAMPLES[0]?.theme as ShadcnTheme;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const hex = (r: () => number) =>
  `#${Array.from({ length: 3 }, () =>
    Math.floor(r() * 256)
      .toString(16)
      .padStart(2, "0"),
  ).join("")}`;

const passes = (t: ShadcnTheme) => CHECKS.every((c) => contrast(t.colors[c.fg], t.colors[c.bg]) >= c.min);

describe("design guide", () => {
  it.each(EXAMPLES.map((e) => [e.brief, e.theme] as const))(
    "example %j is a valid config that already passes AA",
    (_, theme) => {
      expect(themeSchema.safeParse(theme).success).toBe(true);
      expect(guardTheme(theme).fixes).toEqual([]);
    },
  );

  it("only offers fonts the loader knows, and palettes made of palette tokens", () => {
    for (const e of EXAMPLES) expect(FONT_IDS).toEqual(expect.arrayContaining([e.theme.fontHeading, e.theme.fontBody]));
    for (const p of PALETTES)
      for (const c of [p.background, p.foreground, p.primary, p.accent]) expect(isToken(c)).toBe(true);
  });

  it("is in the prompt: rules, fonts, palettes, examples", () => {
    expect(THEME_SYSTEM).toMatch(/DO:[\s\S]*AVOID:[\s\S]*FONTS[\s\S]*PALETTES[\s\S]*EXAMPLES/);
    for (const p of PALETTES) expect(THEME_SYSTEM).toContain(p.name);
  });
});

describe("guard", () => {
  it("leaves a passing theme untouched", () => {
    expect(guardTheme(base)).toEqual({ theme: base, fixes: [] });
  });

  it.each(Array.from({ length: 200 }, (_, i) => i))("random config %i passes every check after guarding", (seed) => {
    const r = rng(seed + 1);
    const colors = Object.fromEntries(COLOR_KEYS.map((k) => [k, hex(r)])) as ShadcnTheme["colors"];
    expect(passes(guardTheme({ ...base, colors }).theme)).toBe(true);
  });
});

describe("offline generator", () => {
  it.each(["calm ocean", "dragon fire", "Apple", "neon arcade", "zanzibar", "été doux"])(
    "%j passes the guard",
    (mood) => {
      const t = offlineTheme(mood);
      expect(themeSchema.safeParse(t).success).toBe(true);
      expect(passes(guardTheme(t).theme)).toBe(true);
    },
  );
});

describe("schema", () => {
  it.each([
    ["calm ocean", "calm ocean"],
    ["  cozy   autumn  ", "cozy autumn"],
    ["été doux", "été doux"],
    ["1920s jazz club, NYC!", "1920s jazz club, NYC!"],
    ["neon #2077 rain & chrome", "neon #2077 rain & chrome"],
  ])("accepts %j", (input, out) => expect(normaliseMood(input)).toBe(out));

  it.each(["", "one two three four five six", "<script>", "a".repeat(61), "bell\u0007"])("rejects %j", (input) =>
    expect(normaliseMood(input)).toBeNull(),
  );

  it("snaps hex to the nearest palette token and falls back on odd fonts and radius", () => {
    const t = themeSchema.parse({
      ...base,
      colors: { ...base.colors, primary: "#F00", border: "ABC" },
      fontHeading: "Comic Sans",
      radius: "huge",
    });
    expect([t.colors.primary, t.colors.border, t.fontHeading, t.radius]).toEqual([
      "red-500",
      "blue-300",
      "geist",
      0.625,
    ]);
  });

  it("clamps radius and never puts a heading-only font on body text", () => {
    const t = clampTheme({ ...base, radius: 9, fontBody: "cinzel" as never });
    expect([t.radius, t.fontBody]).toEqual([1.5, "geist"]);
  });

  it("keeps display fonts off body text when parsing", () => {
    const t = themeSchema.parse({ ...base, fontHeading: "creepster", fontBody: "jost" });
    expect([t.fontHeading, t.fontBody]).toEqual(["creepster", "geist"]);
  });

  it("every font has a lazy loader, and body text uses only the six text faces", async () => {
    const { FONTS, BODY_FONT_IDS } = await import("~/demos/mood-ui/design-guide");
    const src = (await import("node:fs")).readFileSync("app/demos/mood-ui/fonts.ts", "utf8");
    for (const f of FONTS) expect(src).toContain(f.id.includes("-") ? `"${f.id}":` : `${f.id}:`);
    // Body text is never experimental: three sans and three serifs.
    expect(BODY_FONT_IDS).toEqual([
      "geist",
      "inter",
      "ibm-plex-sans",
      "ibm-plex-serif",
      "eb-garamond",
      "libre-caslon-text",
    ]);
  });

  it("every mood pair uses known fonts with a body font on body text, and type settings become CSS variables", async () => {
    const { FONT_PAIRS, BODY_FONT_IDS } = await import("~/demos/mood-ui/design-guide");
    for (const p of FONT_PAIRS) {
      expect(FONT_IDS).toContain(p.heading);
      expect(BODY_FONT_IDS).toContain(p.body);
    }
    const deco = themeToCssVars({ ...base, fontHeading: "federo", fontBody: "geist" }, { heading: "A", body: "B" });
    expect([deco["--font-heading-case"], deco["--font-body-weight"]]).toEqual(["uppercase", "400"]);
    const neon = themeToCssVars({ ...base, fontHeading: "tilt-neon" }, { heading: "A", body: "B" });
    expect(neon["--font-heading-glow"]).toMatch(/--primary/);
  });

  it("style leanings are helpers the model reports, never presets", () => {
    expect(THEME_SYSTEM).toMatch(/STYLE LEANINGS \(helpers, not presets/);
    expect(themeSchema.parse({ ...base, leaning: "fantasy-rpg" }).leaning).toBe("fantasy-rpg");
    expect(themeSchema.parse({ ...base, leaning: "made-up" }).leaning).toBe("none");
  });

  it("depth is flat unless asked for, and only flat or lifted", () => {
    const { depth: _omit, ...noDepth } = base;
    expect(themeSchema.parse(noDepth).depth).toBe("flat");
    expect(themeSchema.parse({ ...base, depth: "3d" }).depth).toBe("flat");
    expect(themeSchema.parse({ ...base, depth: "lifted" }).depth).toBe("lifted");
  });

  it("only palette tokens survive: tokens pass through, hex snaps, junk is rejected", () => {
    expect(TOKENS).toHaveLength(22 * 11 + 2);
    expect([
      toToken("Blue-600"),
      toToken("#2563eb"),
      toToken("#2564ec"),
      toToken("bg-white"),
      toToken("lilac"),
    ]).toEqual(["blue-600", "blue-600", "blue-600", "white", null]);
    expect(nearestToken("#000001")).toBe("black");
    expect(themeSchema.safeParse({ ...base, colors: { ...base.colors, card: "lilac" } }).success).toBe(false);
  });

  it("the guard fixes contrast without leaving the palette", () => {
    const { theme } = guardTheme({
      ...base,
      colors: { ...base.colors, cardForeground: "teal-200", primary: "teal-100" },
    });
    for (const c of Object.values(theme.colors)) expect(isToken(c)).toBe(true);
  });

  it("exports a paste-ready shadcn globals.css snippet", async () => {
    const { themeToCss } = await import("~/demos/mood-ui/schema");
    const css = themeToCss(base, { heading: "A", body: "B" });
    expect(css).toMatch(/^\/\* Low Tide/);
    expect(css).toContain(".theme-low-tide {");
    expect(css).toContain("--card-foreground: #042f2e; /* teal-950 */");
    expect(css).toContain("--font-sans: B;");
  });

  it("writes shadcn CSS variable names", () => {
    const v = themeToCssVars(base, { heading: "A", body: "B" });
    expect(Object.keys(v)).toEqual(
      expect.arrayContaining([
        "--card-foreground",
        "--primary-foreground",
        "--muted-foreground",
        "--radius",
        "--font-heading",
      ]),
    );
    expect(v["--radius"]).toBe("0.75rem");
  });
});
