import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastPairs, knownFailures, type Role } from "~/design-system/contrast-pairs";
import { appDir } from "./helpers";

const css = readFileSync(path.join(appDir, "design-system/tokens.css"), "utf8");

/** Custom properties declared in the first block that starts with `selector {`. */
function block(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`${selector} block not found in tokens.css`);
  const body = css.slice(start, css.indexOf("\n}", start)).replace(/\/\*[\s\S]*?\*\//g, "");
  return new Map([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1] as string, (m[2] as string).trim()]));
}

const light = block(":root");
const dark = new Map([...light, ...block(".dark")]);

/** → [r, g, b] in 0–1 for #rgb, #rrggbb and hsl(h s% l%). */
function rgb(value: string): [number, number, number] {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
  }
  const hsl = /^hsl\(([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\)$/.exec(value);
  if (hsl) {
    const [h, s, l] = [Number(hsl[1]), Number(hsl[2]) / 100, Number(hsl[3]) / 100];
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [f(0), f(8), f(4)];
  }
  throw new Error(`Unsupported colour for contrast test: ${value}`);
}

function luminance(value: string): number {
  const [r, g, b] = rgb(value).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(vars: Map<string, string>, fg: Role, bg: Role): number {
  const get = (role: Role) => {
    const v = vars.get(`--${role}`);
    if (!v) throw new Error(`--${role} missing`);
    return luminance(v);
  };
  const [hi, lo] = [get(fg), get(bg)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const MIN = { text: 4.5, large: 3, ui: 3 } as const;

for (const [theme, vars] of [
  ["light", light],
  ["dark", dark],
] as const) {
  describe(`WCAG 2.2 AA contrast, ${theme} theme`, () => {
    it.each(contrastPairs)("$fg on $bg ($kind): $where", ({ fg, bg, kind }) => {
      expect(ratio(vars, fg, bg)).toBeGreaterThanOrEqual(MIN[kind]);
    });
  });
}

describe("documented failures stay failures (light theme)", () => {
  it.each(knownFailures)("$fg on $bg: $why", ({ fg, bg }) => {
    expect(ratio(light, fg, bg)).toBeLessThan(4.5);
  });
});
