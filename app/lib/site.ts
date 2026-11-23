/** Public origin used for absolute Open Graph URLs. Change when the Cloudflare domain is known. */
export const SITE_URL = "https://playground.pages.dev";
export const SITE_NAME = "Playground";
export const AUTHOR = "Achraf Garai";
export const LOCATION = "Tunis";
export const EMAIL = "hello@achrafgarai.com";
export const DEFAULT_OG_IMAGE = "/og/default.png";

/** Top-bar navigation (portfolio: two items). */
export const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
] as const;

/** Same links as the UX portfolio. */
export const SOCIALS = [
  { label: "LinkedIn", handle: "in/achraf-garai", href: "https://www.linkedin.com/in/achraf-garai" },
  { label: "Blog", handle: "achrafgarai.com", href: "https://www.achrafgarai.com" },
] as const;

/** The UX portfolio, where the case studies live. */
export const PORTFOLIO_URL = "https://work.achrafgarai.com";

/** Case studies from the UX portfolio (same order), linked out from Home. */
export const SELECTED_WORK = [
  { id: "aichor", name: "AIchor", line: "Giving ML engineers their hardware and attention back", year: "2024" },
  { id: "lumen", name: "Lumen", line: "Operating complex machines at the speed of a question", year: "2026" },
  { id: "prism", name: "Prism", line: "One design system for four product teams", year: "Since 2022" },
  { id: "hackages", name: "Hackages", line: "A free learning platform built to grow a consultancy", year: "2021" },
] as const;
