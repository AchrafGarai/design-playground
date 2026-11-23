// Static preview of build/client that behaves like Cloudflare Pages: /p/x → p/x/index.html,
// unknown paths → 404.html, and the "/*" headers from public/_headers (so e2e catches CSP issues).
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../build/client");
const port = Number(process.env.PORT ?? 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".wasm": "application/wasm",
};

function globalHeaders() {
  const file = path.join(root, "_headers");
  if (!existsSync(file)) return {};
  const headers = {};
  let inGlobal = false;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    if (!line.startsWith(" ")) inGlobal = line.trim() === "/*";
    else if (inGlobal) {
      const i = line.indexOf(":");
      headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return headers;
}

function resolve(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  for (const candidate of [clean, path.join(clean, "index.html"), `${clean}.html`]) {
    const p = path.join(root, candidate);
    if (p.startsWith(root) && existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

const headers = globalHeaders();
createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const file = resolve(url.pathname);
  const target = file ?? path.join(root, "404.html");
  res.writeHead(file ? 200 : 404, {
    ...headers,
    "Content-Type": types[path.extname(target)] ?? "application/octet-stream",
  });
  createReadStream(target).pipe(res);
}).listen(port, () => console.log(`Preview: http://localhost:${port}`));
