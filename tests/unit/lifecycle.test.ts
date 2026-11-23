import { describe, expect, it, vi } from "vitest";
import { createLifecycle } from "~/lib/useDemoLifecycle";

describe("demo lifecycle", () => {
  it("runs cleanups in reverse order, aborts listeners, and can be reused", () => {
    const life = createLifecycle();
    const calls: string[] = [];
    life.onCleanup(() => calls.push("first"));
    life.onCleanup(() => calls.push("second"));
    const target = new EventTarget();
    const handler = vi.fn();
    life.listen(target, "ping", handler);
    target.dispatchEvent(new Event("ping"));
    life.dispose();
    target.dispatchEvent(new Event("ping"));
    expect(calls).toEqual(["second", "first"]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(life.signal.aborted).toBe(false);
  });
});
