import { z } from "zod";

// Built lazily so the browser bundle can tree-shake zod (validation only runs at build time and in tests).
function createSchema() {
  return z
    .object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
      title: z.string().min(1),
      description: z.string().min(1).max(300),
      tags: z.array(z.string().min(1)),
      order: z.number().int().nonnegative(),
      status: z.enum(["wip", "ready"]),
      ogImage: z.string().startsWith("/").optional(),
      /** Reserved: "iframe" will isolate demos that need special headers. Not implemented yet. */
      mode: z.enum(["inline", "iframe"]).optional(),
      /** Surface used behind the demo in full-screen view (?view=full). Defaults to "light". */
      stage: z.enum(["light", "ink"]).optional(),
    })
    .strict();
}

let schema: ReturnType<typeof createSchema> | undefined;
export function demoMetaSchema() {
  schema ??= createSchema();
  return schema;
}

export type DemoMeta = z.infer<ReturnType<typeof createSchema>>;

/** Validates a demo meta and checks that the slug matches its folder name. Throws on error. */
export function parseDemoMeta(input: unknown, folder: string): DemoMeta {
  const result = demoMetaSchema().safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid meta in app/demos/${folder}/meta.ts:\n${z.prettifyError(result.error)}`);
  }
  if (result.data.slug !== folder) {
    throw new Error(
      `Invalid meta in app/demos/${folder}/meta.ts: slug "${result.data.slug}" must equal folder name "${folder}"`,
    );
  }
  return result.data;
}
