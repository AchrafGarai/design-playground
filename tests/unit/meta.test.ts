import { describe, expect, it } from "vitest";
import { parseDemoMeta } from "~/lib/meta-schema";

const valid = {
  slug: "my-demo",
  title: "My demo",
  description: "Does a thing.",
  tags: ["motion"],
  order: 2,
  status: "ready",
};

describe("demo meta validation", () => {
  it("accepts a valid meta", () => {
    expect(parseDemoMeta(valid, "my-demo")).toEqual(valid);
    expect(parseDemoMeta({ ...valid, mode: "iframe", ogImage: "/og/x.png", stage: "ink" }, "my-demo").mode).toBe(
      "iframe",
    );
  });

  it.each([
    ["bad slug", { ...valid, slug: "My Demo" }],
    ["bad status", { ...valid, status: "done" }],
    ["missing title", { ...valid, title: undefined }],
    ["negative order", { ...valid, order: -1 }],
    ["relative ogImage", { ...valid, ogImage: "og.png" }],
    ["unknown field", { ...valid, colour: "red" }],
  ])("rejects %s", (_, input) => {
    expect(() => parseDemoMeta(input, "my-demo")).toThrow(/Invalid meta/);
  });

  it("rejects a slug that differs from its folder", () => {
    expect(() => parseDemoMeta(valid, "other-folder")).toThrow(/must equal folder/);
  });
});
