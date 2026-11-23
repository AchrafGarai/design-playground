/**
 * Opt-in interface sound, ported as-is from the UX portfolio. Off by default; the AudioContext is only
 * created from the visitor's own click. Synthesised with Web Audio: no audio files to download.
 *   tick  → hovering navigation, project rows and list rows (mouse only)
 *   tap   → clicking any link or button
 *   chime → turning sound on, or switching the theme
 */
import { useSyncExternalStore } from "react";

const KEY = "ui-sound";
let ctx: AudioContext | null = null;
let on = false;
const listeners = new Set<() => void>();
const emit = () => {
  for (const l of listeners) l();
};

function blip(freq: number, duration: number, gain: number, delay = 0) {
  if (!on || !ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + duration);
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(gain, t + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

const tick = () => blip(2400, 0.03, 0.025);
const tap = () => blip(620, 0.07, 0.05);
const chime = () => {
  blip(880, 0.18, 0.04);
  blip(1320, 0.22, 0.03, 0.07);
};

export const sound = {
  isOn: () => on,
  setOn(next: boolean) {
    on = next;
    if (on) {
      ctx ??= new AudioContext();
      void ctx.resume();
    }
    try {
      localStorage.setItem(KEY, on ? "1" : "0");
    } catch {}
    emit();
    if (on) chime();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export function useSoundOn(): boolean {
  return useSyncExternalStore(sound.subscribe, sound.isOn, () => false);
}

// Hover ticks on sidebar rows, list rows, chips and toolbar buttons (mouse only, so taps on a phone don't also tick).
const HOVER = [
  "[data-site-header] nav a",
  "[data-floating-nav] a",
  "[data-floating-nav] button",
  ".side-row",
  "a.row",
  "button.chip",
  ".float-pill .icon-btn",
].join(", ");

let installed = false;
/** Restores the saved choice and installs the delegated listeners. Call once on the client. */
export function installSound(): () => void {
  if (installed) return () => {};
  installed = true;
  const controller = new AbortController();
  const { signal } = controller;

  try {
    if (localStorage.getItem(KEY) === "1") {
      on = true;
      emit();
      const unlock = () => {
        ctx ??= new AudioContext();
        void ctx.resume();
      };
      window.addEventListener("pointerdown", unlock, { once: true, signal });
      window.addEventListener("keydown", unlock, { once: true, signal });
    }
  } catch {}

  let lastHover: Element | null = null;
  document.addEventListener(
    "pointerover",
    (e) => {
      if (e.pointerType === "touch") return;
      const el = (e.target as Element).closest(HOVER);
      if (el && el !== lastHover) tick();
      lastHover = el;
    },
    { signal },
  );

  // One delegated click handler: the theme chime and taps. The sound toggle handles itself.
  document.addEventListener(
    "click",
    (e) => {
      const el = (e.target as Element).closest("a, button");
      if (!el || el.hasAttribute("data-sound-toggle")) return;
      if (el.hasAttribute("data-theme-toggle")) chime();
      else tap();
    },
    { signal },
  );

  return () => {
    controller.abort();
    installed = false;
  };
}
