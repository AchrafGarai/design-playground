import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { appDir, rel, stripComments, walk } from "./helpers";

// Raw colours and sizes live only in the design-system stylesheets (tokens.css + portfolio.css).
// Components use utilities and tokens. Demos own their generated themes and are skipped.
const designSystemCss = (f: string) => f.startsWith(path.join(appDir, "design-system")) && f.endsWith(".css");
const demosDir = path.join(appDir, "demos");
// root.tsx carries the two <meta name="theme-color"> values (browser chrome colour), copied from the portfolio.
const ROOT = path.join(appDir, "root.tsx");

const RULES: Array<[string, RegExp, string[]]> = [
  ["hex colour", /#[0-9a-fA-F]{3,8}\b(?![-\w])/, [ROOT]],
  ["colour function", /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/, []],
  ["raw length", /(?<![\w.-])\d*\.?\d+(?:px|rem)\b/, []],
];

describe("no hardcoded design values outside the design-system stylesheets", () => {
  const files = walk(appDir).filter((f) => !designSystemCss(f) && !f.startsWith(demosDir + path.sep));
  for (const [name, re, allowed] of RULES) {
    it(`no ${name}`, () => {
      const hits: string[] = [];
      for (const file of files.filter((f) => !allowed.includes(f))) {
        stripComments(readFileSync(file, "utf8"))
          .split("\n")
          .forEach((line, i) => {
            if (re.test(line)) hits.push(`${rel(file)}:${i + 1}  ${line.trim()}`);
          });
      }
      expect(hits).toEqual([]);
    });
  }
});
