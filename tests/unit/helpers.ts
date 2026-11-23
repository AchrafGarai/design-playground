import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const root = path.resolve(import.meta.dirname, "../..");
export const appDir = path.join(root, "app");

export function walk(dir: string, exts = [".ts", ".tsx", ".css"]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry === "+types") continue;
      out.push(...walk(p, exts));
    } else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}

export const rel = (p: string) => path.relative(root, p);

/** Static and dynamic import specifiers in a TS/TSX file. */
export function importsOf(file: string): string[] {
  const src = readFileSync(file, "utf8");
  const specs: string[] = [];
  for (const m of src.matchAll(
    /(?:import|export)\s[^"']*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|import\s*["']([^"']+)["']/g,
  )) {
    const spec = m[1] ?? m[2] ?? m[3];
    if (spec) specs.push(spec);
  }
  return specs;
}

/** Resolves "~/x" and relative specifiers to an absolute path; bare packages return null. */
export function resolveSpec(spec: string, fromFile: string): string | null {
  if (spec.startsWith("~/")) return path.join(appDir, spec.slice(2));
  if (spec.startsWith(".")) return path.resolve(path.dirname(fromFile), spec);
  return null;
}

/** Blanks out comments but keeps line numbers. Comments may mention reference px values. */
export function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " ")).replace(/(^|[^:"'])\/\/.*$/gm, "$1");
}
