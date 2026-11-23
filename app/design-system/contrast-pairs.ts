/**
 * Every text/background and UI pair used in the shell, as portfolio colour roles (tokens.css).
 * tests/unit/contrast.test.ts checks each one in BOTH themes (light :root, dark .dark).
 *   text → 4.5:1   large → 3:1 (≥24px, or ≥18.66px bold)   ui → 3:1 (focus ring, icons)
 */
export type ContrastKind = "text" | "large" | "ui";
export type Role = "bg" | "bg-100" | "bg-200" | "bg-300" | "fg" | "contrast" | "secondary" | "accent" | "mute";

export const contrastPairs: Array<{ fg: Role; bg: Role; kind: ContrastKind; where: string }> = [
  { fg: "fg", bg: "bg", kind: "text", where: "body text" },
  { fg: "contrast", bg: "bg", kind: "text", where: "headings, row titles, active nav" },
  { fg: "secondary", bg: "bg", kind: "text", where: "labels, row meta, footer" },
  { fg: "accent", bg: "bg", kind: "text", where: "inline links, outline chip" },
  { fg: "fg", bg: "bg-100", kind: "text", where: "text on hovered rows, copy button" },
  { fg: "contrast", bg: "bg-100", kind: "text", where: "row title on hover" },
  { fg: "secondary", bg: "bg-100", kind: "text", where: "row meta on hover" },
  { fg: "fg", bg: "bg-200", kind: "text", where: "chips, nav hover, floating nav" },
  { fg: "contrast", bg: "bg-200", kind: "text", where: "nav hover, perf overlay" },
  { fg: "contrast", bg: "bg-300", kind: "text", where: "floating nav hover, chip hover" },
  { fg: "secondary", bg: "bg-100", kind: "ui", where: "ghost icons on the demo stage (media-card = bg-100)" },
  { fg: "secondary", bg: "bg-100", kind: "text", where: "demo status label on the stage" },
  { fg: "bg", bg: "contrast", kind: "text", where: "pressed button, active chip, skip link" },
  { fg: "accent", bg: "bg", kind: "ui", where: "focus ring" },
  { fg: "secondary", bg: "bg", kind: "ui", where: "icon buttons (theme, sound, arrows)" },
];

/** Known failures, tested so nobody uses these pairs by accident (light theme). */
export const knownFailures: Array<{ fg: Role; bg: Role; why: string }> = [
  { fg: "secondary", bg: "bg-200", why: "4.42:1: no secondary text on bg-200" },
  { fg: "accent", bg: "bg-100", why: "4.33:1: links only on bg" },
  { fg: "mute", bg: "bg", why: "1.88:1: mute is for disabled states and hairline icons, never text" },
];
