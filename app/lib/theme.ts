import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const KEY = "theme"; // same key as the portfolio; the pre-paint script in root.tsx reads it

const listeners = new Set<() => void>();
const read = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

/** Toggles html.dark with the portfolio's brief colour crossfade, and saves the choice. */
export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.classList.toggle("dark", theme === "dark");
  window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
  for (const l of listeners) l();
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    read,
    () => "light",
  );
}
