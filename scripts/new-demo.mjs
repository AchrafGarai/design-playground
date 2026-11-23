#!/usr/bin/env node
// Usage: pnpm new:demo <slug> "<Title>"   (non-interactive)
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [slug, title] = process.argv.slice(2);
const fail = (msg) => {
  console.error(`new:demo: ${msg}\nUsage: pnpm new:demo <slug> "<Title>"`);
  process.exit(1);
};
if (!slug || !title) fail("missing arguments");
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(`slug "${slug}" must be kebab-case`);

const demosDir = path.resolve(import.meta.dirname, "../app/demos");
const target = path.join(demosDir, slug);
if (existsSync(target)) fail(`app/demos/${slug} already exists`);

// Next order = highest existing order + 1
let maxOrder = 0;
for (const dir of readdirSync(demosDir)) {
  if (dir.startsWith("_")) continue;
  const metaFile = path.join(demosDir, dir, "meta.ts");
  if (!existsSync(metaFile)) continue;
  const match = /order:\s*(\d+)/.exec(readFileSync(metaFile, "utf8"));
  if (match) maxOrder = Math.max(maxOrder, Number(match[1]));
}

cpSync(path.join(demosDir, "_template"), target, { recursive: true });
const jsString = JSON.stringify(title).slice(1, -1);
for (const file of ["meta.ts", "index.tsx"]) {
  const p = path.join(target, file);
  const text = readFileSync(p, "utf8")
    .replaceAll("__SLUG__", slug)
    .replaceAll('"__TITLE__"', JSON.stringify(title))
    .replaceAll("__TITLE__", file === "index.tsx" ? `{${JSON.stringify(title)}}` : jsString)
    .replace(/order: \d+ \/\* __ORDER__ \*\//, `order: ${maxOrder + 1}`);
  writeFileSync(p, text);
}

console.log(`Created app/demos/${slug}`);
console.log(`Open http://localhost:5173/p/${slug}`);
