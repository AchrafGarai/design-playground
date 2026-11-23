import { type ComponentType, type LazyExoticComponent, lazy } from "react";
import { type DemoMeta, parseDemoMeta } from "./meta-schema";

type MetaModule = { meta?: unknown };
type ComponentModule = { default: ComponentType };
type Loader = () => Promise<ComponentModule>;

export type Demo = DemoMeta & { load: Loader };

/** "../demos/mood-ui/meta.ts" -> "mood-ui" */
export function folderOf(file: string): string {
  const match = /\/demos\/([^/]+)\//.exec(file);
  if (!match?.[1]) throw new Error(`Unexpected demo path: ${file}`);
  return match[1];
}

/** Pure, testable: turns glob results into a validated, ordered demo list. */
export function buildRegistry(
  metaModules: Record<string, MetaModule>,
  loaders: Record<string, Loader>,
  validate: (meta: unknown, folder: string) => DemoMeta,
): Demo[] {
  const loaderByFolder = new Map(Object.entries(loaders).map(([file, load]) => [folderOf(file), load]));
  const demos: Demo[] = [];
  for (const [file, mod] of Object.entries(metaModules)) {
    const folder = folderOf(file);
    if (folder.startsWith("_")) continue;
    const meta = validate(mod.meta, folder);
    const load = loaderByFolder.get(folder);
    if (!load) throw new Error(`app/demos/${folder} has a meta.ts but no index.tsx`);
    demos.push({ ...meta, load });
  }
  return demos.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

// Metadata is eager (tiny, needed for sidebar/home/meta tags); components are lazy chunks.
const metaModules = import.meta.glob<MetaModule>(["../demos/*/meta.ts", "!../demos/_*/meta.ts"], {
  eager: true,
});
const loaders = import.meta.glob<ComponentModule>(["../demos/*/index.tsx", "!../demos/_*/index.tsx"]);

// zod runs at build time (prerender + react-router.config.ts) and in tests; the browser bundle skips it
// (statically false branch → zod is tree-shaken out of the shell).
function validateMeta(meta: unknown, folder: string): DemoMeta {
  if (import.meta.env.SSR || import.meta.env.MODE === "test") return parseDemoMeta(meta, folder);
  return meta as DemoMeta;
}
export const demos: Demo[] = buildRegistry(metaModules, loaders, validateMeta);

export function getDemo(slug: string | undefined): Demo | undefined {
  return demos.find((d) => d.slug === slug);
}

/** The most recent demo: highest `order`. */
export function latestDemo(): Demo | undefined {
  return demos.at(-1);
}

const lazyCache = new Map<string, LazyExoticComponent<ComponentType>>();
export function lazyDemo(demo: Demo): LazyExoticComponent<ComponentType> {
  let component = lazyCache.get(demo.slug);
  if (!component) {
    component = lazy(demo.load);
    lazyCache.set(demo.slug, component);
  }
  return component;
}
