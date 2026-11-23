import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";

/**
 * Dev only: serve POST /api/theme with the same handler the Cloudflare Pages Function uses.
 * Free by default: tries a local Ollama server, then the offline generator. Reads optional settings
 * (ANTHROPIC_API_KEY, OLLAMA_MODEL, OLLAMA_URL) from .env.local; nothing here is bundled into the site.
 */
function themeApi(env: Record<string, string>): Plugin {
  return {
    name: "playground-theme-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/theme", async (req, res) => {
        const { handleThemeRequest } = await server.ssrLoadModule("/server/mood-theme.ts");
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const url = `http://${req.headers.host ?? "localhost"}${req.originalUrl ?? "/api/theme"}`;
        const request = new Request(url, {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
        });
        const response: Response = await handleThemeRequest(request, {
          GEMINI_API_KEY: env.GEMINI_API_KEY || undefined,
          GEMINI_MODEL: env.GEMINI_MODEL || undefined,
          ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY || undefined,
          OPEN_ROUTER_API_KEY: env.OPEN_ROUTER_API_KEY || undefined,
          OPENROUTER_MODEL: env.OPENROUTER_MODEL || undefined,
          THEME_PROVIDER: env.THEME_PROVIDER || undefined,
          useOllama: env.OLLAMA !== "off",
          noRateLimit: env.RATE_LIMIT !== "on",
          OLLAMA_URL: env.OLLAMA_URL || undefined,
          OLLAMA_MODEL: env.OLLAMA_MODEL || undefined,
        });
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [tailwindcss(), reactRouter(), themeApi(env)],
    resolve: { alias: { "~": path.resolve(import.meta.dirname, "app") } },
  };
});
