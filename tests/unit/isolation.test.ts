import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { appDir, importsOf, rel, resolveSpec, stripComments, walk } from "./helpers";

const demosDir = path.join(appDir, "demos");
const allowedShared = [path.join(appDir, "design-system"), path.join(appDir, "lib")];
const within = (p: string, dir: string) => p === dir || p.startsWith(dir + path.sep);

/** Packages that must only ever be imported from inside a demo folder. */
const HEAVY = [
  /^three($|\/)/,
  /^@react-three\//,
  /^tone($|\/)/,
  /^onnxruntime/,
  /^@huggingface\//,
  /^@mediapipe\//,
  /\.wasm(\?|$)/,
];

describe("demo isolation", () => {
  const demoFolders = readdirSync(demosDir, { withFileTypes: true }).filter((d) => d.isDirectory());

  for (const folder of demoFolders) {
    const own = path.join(demosDir, folder.name);
    it(`${folder.name} imports only from itself, ~/design-system and ~/lib`, () => {
      const violations: string[] = [];
      for (const file of walk(own)) {
        for (const spec of importsOf(file)) {
          const target = resolveSpec(spec, file);
          if (target === null) continue; // npm package: allowed inside a demo
          if (within(target, own) || allowedShared.some((d) => within(target, d))) continue;
          violations.push(`${rel(file)} -> ${spec}`);
        }
      }
      expect(violations).toEqual([]);
    });

    it(`${folder.name} never styles :root, html or body`, () => {
      const violations = walk(own)
        .filter((file) =>
          /:root|document\.(documentElement|body)|\bhtml\s*\{|\bbody\s*\{/.test(
            stripComments(readFileSync(file, "utf8")),
          ),
        )
        .map(rel);
      expect(violations).toEqual([]);
    });
  }

  it("the shell never imports a demo directly or a heavy library", () => {
    const violations: string[] = [];
    for (const file of walk(appDir).filter((f) => !within(f, demosDir))) {
      for (const spec of importsOf(file)) {
        const target = resolveSpec(spec, file);
        if (target && within(target, demosDir)) violations.push(`${rel(file)} -> ${spec}`);
        if (HEAVY.some((re) => re.test(spec))) violations.push(`${rel(file)} -> ${spec} (heavy)`);
      }
    }
    expect(violations).toEqual([]);
  });
});
