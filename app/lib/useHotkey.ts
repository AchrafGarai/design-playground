import { useEffect, useRef } from "react";

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Single-key shortcut (no modifiers), ignored while typing in a field. */
export function useHotkey(key: string, handler: () => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key.toLowerCase() === key.toLowerCase()) ref.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key]);
}
