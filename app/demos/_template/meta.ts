import type { DemoMeta } from "~/lib/meta-schema";

export const meta = {
  slug: "__SLUG__",
  title: "__TITLE__",
  description: "Describe this demo in one sentence.",
  tags: [],
  order: 0 /* __ORDER__ */,
  status: "wip",
} satisfies DemoMeta;
