// Node-side twin of app/lib/registry.ts, used by react-router.config.ts for the prerender list.
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type DemoMeta, parseDemoMeta } from "../app/lib/meta-schema";

const demosDir = path.resolve(import.meta.dirname, "../app/demos");

export async function discoverDemos(): Promise<DemoMeta[]> {
  const folders = readdirSync(demosDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name);
  const metas: DemoMeta[] = [];
  for (const folder of folders) {
    const mod = (await import(/* @vite-ignore */ pathToFileURL(path.join(demosDir, folder, "meta.ts")).href)) as {
      meta?: unknown;
    };
    metas.push(parseDemoMeta(mod.meta, folder));
  }
  return metas.sort((a, b) => a.order - b.order);
}
