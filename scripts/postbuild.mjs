// After `react-router build`: add a 404 page for Cloudflare Pages and report the shell bundle size.
import { copyFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const out = path.resolve(import.meta.dirname, "../build/client");
const fallback = path.join(out, "__spa-fallback.html");
// Unknown URLs get the SPA shell (not the prerendered home), so the client router renders NotFound.
if (existsSync(fallback)) copyFileSync(fallback, path.join(out, "404.html"));

// Shell bundle = every JS file the home page loads up front (modulepreload + entry).
const html = readFileSync(path.join(out, "index.html"), "utf8");
const files = new Set([...html.matchAll(/(?:href|src|import\()\s*=?\s*"(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]));
let raw = 0;
let gz = 0;
for (const f of files) {
  const buf = readFileSync(path.join(out, f));
  raw += buf.length;
  gz += gzipSync(buf).length;
}
const css = readdirSync(path.join(out, "assets")).filter((f) => f.endsWith(".css"));
const cssSize = css.reduce((n, f) => n + statSync(path.join(out, "assets", f)).size, 0);
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
console.log(`\nShell JS (home, ${files.size} files): ${kb(raw)} raw, ${kb(gz)} gzip · CSS: ${kb(cssSize)}`);
