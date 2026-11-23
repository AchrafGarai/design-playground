import { setTheme, useTheme } from "~/lib/theme";
import { MoonIcon, SunIcon } from "./icons";

/** Theme toggle (portfolio behaviour, compact sidebar styling): sun/moon morph, colour crossfade, choice saved. The sound module chimes on it. */
export function ThemeToggle() {
  const theme = useTheme();
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button
      type="button"
      data-theme-toggle
      aria-label={label}
      title={label}
      className="icon-btn theme-toggle"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <SunIcon />
      <MoonIcon />
    </button>
  );
}
