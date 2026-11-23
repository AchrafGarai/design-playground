import { useEffect, useState } from "react";

/** true after `ms` without pointer movement, touch or keys; false again on the next one. */
export function useIdle(ms: number, enabled = true): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let timer = window.setTimeout(() => setIdle(true), ms);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), ms);
    };
    const events = ["pointermove", "pointerdown", "keydown", "touchstart"] as const;
    for (const e of events) window.addEventListener(e, wake, { passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, wake);
    };
  }, [ms, enabled]);
  return enabled && idle;
}
