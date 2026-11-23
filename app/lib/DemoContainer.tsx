import type { ReactNode } from "react";

/**
 * Scoped root for a demo. Demos put their CSS variables and styles on [data-demo="<slug>"],
 * never on :root or body, so the shell is never restyled by a demo.
 */
export function DemoContainer({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <div data-demo={slug} className="demo-root">
      {children}
    </div>
  );
}
