// Font loaders for the fonts in design-guide.ts (self-hosted, Latin subset, loaded only when a theme uses them).
import { FONTS, type FontId } from "./design-guide";

// One entry per font: its Fontsource package and the Latin weights it ships (display faces often have only 400).
// Vite needs literal import paths, so each loader is spelled out.
const LOADERS: Record<FontId, (() => Promise<unknown>)[]> = {
  system: [],
  geist: [() => import("@fontsource/geist/latin-400.css"), () => import("@fontsource/geist/latin-700.css")],
  inter: [() => import("@fontsource/inter/latin-400.css"), () => import("@fontsource/inter/latin-700.css")],
  "ibm-plex-sans": [
    () => import("@fontsource/ibm-plex-sans/latin-400.css"),
    () => import("@fontsource/ibm-plex-sans/latin-700.css"),
  ],
  "ibm-plex-serif": [
    () => import("@fontsource/ibm-plex-serif/latin-400.css"),
    () => import("@fontsource/ibm-plex-serif/latin-700.css"),
  ],
  cormorant: [
    () => import("@fontsource/cormorant-garamond/latin-400.css"),
    () => import("@fontsource/cormorant-garamond/latin-700.css"),
  ],
  "eb-garamond": [
    () => import("@fontsource/eb-garamond/latin-400.css"),
    () => import("@fontsource/eb-garamond/latin-700.css"),
  ],
  "crimson-pro": [
    () => import("@fontsource/crimson-pro/latin-400.css"),
    () => import("@fontsource/crimson-pro/latin-700.css"),
  ],
  jost: [
    () => import("@fontsource/jost/latin-300.css"),
    () => import("@fontsource/jost/latin-400.css"),
    () => import("@fontsource/jost/latin-700.css"),
  ],
  "geist-mono": [
    () => import("@fontsource/geist-mono/latin-400.css"),
    () => import("@fontsource/geist-mono/latin-700.css"),
  ],
  "chakra-petch": [
    () => import("@fontsource/chakra-petch/latin-400.css"),
    () => import("@fontsource/chakra-petch/latin-700.css"),
  ],
  vt323: [() => import("@fontsource/vt323/latin-400.css")],
  "exo-2": [() => import("@fontsource/exo-2/latin-400.css"), () => import("@fontsource/exo-2/latin-700.css")],
  "space-grotesk": [
    () => import("@fontsource/space-grotesk/latin-400.css"),
    () => import("@fontsource/space-grotesk/latin-700.css"),
  ],
  sora: [() => import("@fontsource/sora/latin-400.css"), () => import("@fontsource/sora/latin-700.css")],
  nunito: [() => import("@fontsource/nunito/latin-400.css"), () => import("@fontsource/nunito/latin-700.css")],
  "shantell-sans": [
    () => import("@fontsource/shantell-sans/latin-400.css"),
    () => import("@fontsource/shantell-sans/latin-700.css"),
  ],
  "josefin-sans": [
    () => import("@fontsource/josefin-sans/latin-400.css"),
    () => import("@fontsource/josefin-sans/latin-700.css"),
  ],
  "old-standard-tt": [
    () => import("@fontsource/old-standard-tt/latin-400.css"),
    () => import("@fontsource/old-standard-tt/latin-700.css"),
  ],
  "libre-caslon-text": [
    () => import("@fontsource/libre-caslon-text/latin-400.css"),
    () => import("@fontsource/libre-caslon-text/latin-700.css"),
  ],
  "barlow-condensed": [
    () => import("@fontsource/barlow-condensed/latin-400.css"),
    () => import("@fontsource/barlow-condensed/latin-700.css"),
  ],
  "zen-kaku-gothic-new": [
    () => import("@fontsource/zen-kaku-gothic-new/latin-400.css"),
    () => import("@fontsource/zen-kaku-gothic-new/latin-700.css"),
  ],
  cinzel: [() => import("@fontsource/cinzel/latin-400.css"), () => import("@fontsource/cinzel/latin-700.css")],
  "pirata-one": [() => import("@fontsource/pirata-one/latin-400.css")],
  fraunces: [() => import("@fontsource/fraunces/latin-400.css"), () => import("@fontsource/fraunces/latin-700.css")],
  playfair: [
    () => import("@fontsource/playfair-display/latin-400.css"),
    () => import("@fontsource/playfair-display/latin-700.css"),
  ],
  manrope: [() => import("@fontsource/manrope/latin-400.css"), () => import("@fontsource/manrope/latin-700.css")],
  tektur: [() => import("@fontsource/tektur/latin-400.css"), () => import("@fontsource/tektur/latin-700.css")],
  "press-start-2p": [() => import("@fontsource/press-start-2p/latin-400.css")],
  "tilt-neon": [() => import("@fontsource/tilt-neon/latin-400.css")],
  monoton: [() => import("@fontsource/monoton/latin-400.css")],
  "archivo-black": [() => import("@fontsource/archivo-black/latin-400.css")],
  syne: [() => import("@fontsource/syne/latin-400.css"), () => import("@fontsource/syne/latin-700.css")],
  unbounded: [() => import("@fontsource/unbounded/latin-400.css"), () => import("@fontsource/unbounded/latin-700.css")],
  fredoka: [() => import("@fontsource/fredoka/latin-400.css"), () => import("@fontsource/fredoka/latin-700.css")],
  "gochi-hand": [() => import("@fontsource/gochi-hand/latin-400.css")],
  "pinyon-script": [() => import("@fontsource/pinyon-script/latin-400.css")],
  federo: [() => import("@fontsource/federo/latin-400.css")],
  sancreek: [() => import("@fontsource/sancreek/latin-400.css")],
  rye: [() => import("@fontsource/rye/latin-400.css")],
  creepster: [() => import("@fontsource/creepster/latin-400.css")],
  "saira-stencil-one": [() => import("@fontsource/saira-stencil-one/latin-400.css")],
  "black-ops-one": [() => import("@fontsource/black-ops-one/latin-400.css")],
  "shippori-mincho": [
    () => import("@fontsource/shippori-mincho/latin-400.css"),
    () => import("@fontsource/shippori-mincho/latin-700.css"),
  ],
};

const loaded = new Set<FontId>();
export async function loadFonts(...ids: FontId[]): Promise<void> {
  await Promise.all(
    ids
      .filter((id) => !loaded.has(id))
      .map(async (id) => {
        loaded.add(id);
        await Promise.all(LOADERS[id].map((load) => load()));
      }),
  );
}

export const fontFamily = (id: FontId) => FONTS.find((f) => f.id === id)?.family ?? "var(--font-sans)";
