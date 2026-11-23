// A Figma-like canvas: drag empty space (or hold Space) to pan, scroll/trackpad to pan, pinch or ⌘/Ctrl + scroll
// to zoom around the pointer. The transform is written straight to the DOM (no React render per frame).
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import type { DemoLifecycle } from "~/lib/useDemoLifecycle";

type View = { x: number; y: number; k: number };
const MIN = 0.25;
const MAX = 2;
const clampK = (k: number) => Math.min(MAX, Math.max(MIN, k));
// Pointer-downs on these never start a pan, so every component on the canvas stays usable.
const INTERACTIVE =
  "button,input,textarea,select,a,label,[role=slider],[role=switch],[role=tab],[role=radio],[role=checkbox]";

export function Canvas({
  children,
  contentWidth,
  life,
}: {
  children: ReactNode;
  contentWidth: number;
  life: DemoLifecycle;
}) {
  const viewport = useRef<HTMLElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const view = useRef<View>({ x: 0, y: 0, k: 1 });
  const [zoom, setZoom] = useState(1);
  const [panning, setPanning] = useState(false);

  const apply = useCallback((next: View, animate = false) => {
    view.current = next;
    const w = world.current;
    const v = viewport.current;
    if (!w || !v) return;
    w.style.transition = animate ? "transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1)" : "";
    w.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.k})`;
    // The dot grid moves and scales with the world.
    const step = 24 * next.k;
    v.style.backgroundSize = `${step}px ${step}px`;
    v.style.backgroundPosition = `${next.x}px ${next.y}px`;
    // Barely there at 100%, and gone as you zoom out (dense dots read as noise).
    v.style.setProperty("--m-dot", String(Math.max(0, Math.min(1, (next.k - 0.4) / 0.6))));
    setZoom(next.k);
  }, []);

  const fitView = useCallback(
    (animate = false) => {
      const v = viewport.current;
      const w = world.current;
      if (!v || !w) return;
      // Fit the width on large screens; on small ones stay readable (≥ 60%) and centre, so it overflows like a canvas.
      const pad = 48;
      const k = Math.min(1, Math.max(0.6, (v.clientWidth - pad * 2) / contentWidth));
      const x = (v.clientWidth - contentWidth * k) / 2;
      apply({ x, y: 52, k }, animate); // clear of the toolbar
    },
    [apply, contentWidth],
  );

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number, animate = false) => {
      const { x, y, k } = view.current;
      const nk = clampK(k * factor);
      const r = nk / k;
      apply({ x: cx - (cx - x) * r, y: cy - (cy - y) * r, k: nk }, animate);
    },
    [apply],
  );

  useEffect(() => {
    const v = viewport.current;
    if (!v) return;
    fitView();
    let fitted = true; // re-fit on resize until the user moves the canvas
    const ro = new ResizeObserver(() => {
      if (fitted) fitView();
    });
    ro.observe(v);
    life.onCleanup(() => ro.disconnect());

    life.listen(
      v,
      "wheel",
      ((e: WheelEvent) => {
        e.preventDefault();
        fitted = false;
        const rect = v.getBoundingClientRect();
        if (e.ctrlKey || e.metaKey) {
          // Trackpad pinch arrives as ctrl + wheel.
          zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - rect.left, e.clientY - rect.top);
        } else {
          const { x, y, k } = view.current;
          const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
          const dy = e.shiftKey && !e.deltaX ? 0 : e.deltaY;
          apply({ x: x - dx, y: y - dy, k });
        }
      }) as EventListener,
      { passive: false },
    );

    let space = false;
    life.listen(window, "keydown", (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest?.(`${INTERACTIVE},[contenteditable]`);
      if (e.shiftKey && e.code === "Digit1" && !typing) {
        fitted = true; // Shift + 1 brings everything back into view, as in Figma
        fitView(true);
      }
      if (e.code === "Space" && !typing) {
        space = true;
        v.dataset.space = "";
        e.preventDefault();
      }
    });
    life.listen(window, "keyup", (e: KeyboardEvent) => {
      if (e.code === "Space") {
        space = false;
        delete v.dataset.space;
      }
    });

    let drag: { id: number; sx: number; sy: number; x: number; y: number } | null = null;
    life.listen(v, "pointerdown", ((e: PointerEvent) => {
      const onControl = (e.target as HTMLElement).closest(INTERACTIVE);
      if (e.button === 1 || (e.button === 0 && (space || !onControl))) {
        if ((e.target as HTMLElement).closest("[data-canvas-ui]")) return; // overlays (prompt bar, zoom)
        drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: view.current.x, y: view.current.y };
        v.setPointerCapture(e.pointerId);
        fitted = false;
        setPanning(true);
        e.preventDefault();
      }
    }) as EventListener);
    life.listen(v, "pointermove", ((e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      apply({ x: drag.x + e.clientX - drag.sx, y: drag.y + e.clientY - drag.sy, k: view.current.k });
    }) as EventListener);
    const end = ((e: PointerEvent) => {
      if (drag && e.pointerId === drag.id) {
        drag = null;
        setPanning(false);
      }
    }) as EventListener;
    life.listen(v, "pointerup", end);
    life.listen(v, "pointercancel", end);
  }, [apply, fitView, zoomAt, life]);

  const center = (factor: number) => {
    const v = viewport.current;
    if (v) zoomAt(factor, v.clientWidth / 2, v.clientHeight / 2, true);
  };

  return (
    <section
      ref={viewport}
      className="m-canvas absolute inset-0 overflow-hidden"
      data-panning={panning || undefined}
      aria-label="Component canvas: drag to pan, pinch or Ctrl + scroll to zoom"
    >
      <div ref={world} className="absolute top-0 left-0 origin-top-left will-change-transform">
        {children}
      </div>

      <div
        data-canvas-ui
        className="m-zoom absolute bottom-5 left-4 z-10 flex items-center rounded-full p-1 text-xs tabular-nums"
      >
        <button type="button" className="m-zoom-btn" aria-label="Zoom out" onClick={() => center(1 / 1.25)}>
          −
        </button>
        <button
          type="button"
          className="m-zoom-btn w-12"
          aria-label="Fit to screen (Shift + 1)"
          onClick={() => fitView(true)}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" className="m-zoom-btn" aria-label="Zoom in" onClick={() => center(1.25)}>
          +
        </button>
      </div>
    </section>
  );
}
