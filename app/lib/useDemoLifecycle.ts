import { useEffect, useRef } from "react";

export type Disposer = () => void;

export interface DemoLifecycle {
  /** Register any cleanup: dispose GPU resources, stop audio, terminate workers… */
  onCleanup(fn: Disposer): void;
  /** Adds an event listener that is removed automatically on unmount. */
  listen<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    handler: (e: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void;
  listen(target: EventTarget, type: string, handler: EventListener, options?: AddEventListenerOptions): void;
  /** Aborts on unmount: pass it to fetch() or addEventListener(). */
  readonly signal: AbortSignal;
  /** Runs every cleanup (last registered first) and resets. Called for you on unmount. */
  dispose(): void;
}

export function createLifecycle(): DemoLifecycle {
  let disposers: Disposer[] = [];
  let controller = new AbortController();
  return {
    onCleanup(fn) {
      disposers.push(fn);
    },
    listen(target: EventTarget, type: string, handler: EventListener, options?: AddEventListenerOptions) {
      target.addEventListener(type, handler, { ...options, signal: controller.signal });
    },
    get signal() {
      return controller.signal;
    },
    dispose() {
      const pending = disposers.reverse();
      disposers = [];
      controller.abort();
      controller = new AbortController();
      for (const fn of pending) {
        try {
          fn();
        } catch (error) {
          console.warn("[demo cleanup]", error);
        }
      }
    },
  } as DemoLifecycle;
}

/**
 * Cleanup registry for a demo. Register cleanups inside your own effects:
 *   const life = useDemoLifecycle();
 *   useEffect(() => { const r = new Renderer(); life.onCleanup(() => r.dispose()); }, [life]);
 */
export function useDemoLifecycle(): DemoLifecycle {
  const ref = useRef<DemoLifecycle | null>(null);
  if (!ref.current) ref.current = createLifecycle();
  const lifecycle = ref.current;
  useEffect(() => () => lifecycle.dispose(), [lifecycle]);
  return lifecycle;
}
