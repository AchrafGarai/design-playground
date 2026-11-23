import { describe, expect, it } from "vitest";
import { parseDemoMeta } from "~/lib/meta-schema";
import { buildRegistry, demos, folderOf, getDemo } from "~/lib/registry";

const load = () => Promise.resolve({ default: () => null });
const meta = (slug: string, order: number) => ({
  meta: { slug, title: slug, description: "d", tags: [], order, status: "wip" },
});

describe("registry", () => {
  it("discovers mood-ui from app/demos", () => {
    expect(demos.map((d) => d.slug)).toContain("mood-ui");
    expect(getDemo("mood-ui")?.title).toBe("Mood → UI");
  });

  it("never registers folders starting with _", () => {
    expect(demos.some((d) => d.slug.startsWith("_") || d.slug.includes("SLUG"))).toBe(false);
  });

  it("sorts by order and ignores _ folders", () => {
    const list = buildRegistry(
      {
        "../demos/b/meta.ts": meta("b", 2),
        "../demos/a/meta.ts": meta("a", 1),
        "../demos/_template/meta.ts": { meta: { slug: "__SLUG__" } },
      },
      { "../demos/a/index.tsx": load, "../demos/b/index.tsx": load },
      parseDemoMeta,
    );
    expect(list.map((d) => d.slug)).toEqual(["a", "b"]);
  });

  it("fails when a meta has no index.tsx", () => {
    expect(() => buildRegistry({ "../demos/a/meta.ts": meta("a", 1) }, {}, parseDemoMeta)).toThrow(/no index.tsx/);
  });

  it("extracts folder names", () => {
    expect(folderOf("../demos/mood-ui/meta.ts")).toBe("mood-ui");
  });
});
