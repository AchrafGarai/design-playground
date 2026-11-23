import type { Config } from "@react-router/dev/config";
import { discoverDemos } from "./scripts/discover-demos";

export default {
  appDirectory: "app",
  // Static only: no server at runtime. Every page is prerendered at build time.
  ssr: false,
  async prerender() {
    // Same discovery rules as app/lib/registry.ts (folders under app/demos, "_" ignored),
    // and every meta is validated with zod, so a bad meta fails the build here.
    const demos = await discoverDemos();
    return ["/", "/about", ...demos.map((d) => `/p/${d.slug}`)];
  },
} satisfies Config;
