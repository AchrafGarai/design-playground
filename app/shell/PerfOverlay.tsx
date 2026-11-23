import { useEffect, useState } from "react";

type Stats = { fps: number; frameMs: number; heapMb: number | null };
type MemoryPerformance = Performance & { memory?: { usedJSHeapSize: number } };

/** FPS, frame time and JS heap (Chromium only). Off by default; toggled by the shell. */
export function PerfOverlay() {
  const [stats, setStats] = useState<Stats>({ fps: 0, frameMs: 0, heapMb: null });

  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let last = performance.now();
    let windowStart = last;
    let worst = 0;
    const tick = (now: number) => {
      worst = Math.max(worst, now - last);
      last = now;
      frames++;
      const elapsed = now - windowStart;
      if (elapsed >= 500) {
        const memory = (performance as MemoryPerformance).memory;
        setStats({
          fps: Math.round((frames * 1000) / elapsed),
          frameMs: Math.round(worst * 10) / 10,
          heapMb: memory ? Math.round(memory.usedJSHeapSize / 1048576) : null,
        });
        frames = 0;
        worst = 0;
        windowStart = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <aside aria-label="Performance" className="perf-overlay">
      <span>FPS</span>
      <span>{stats.fps}</span>
      <span>Frame</span>
      <span>{stats.frameMs} ms</span>
      {stats.heapMb !== null && (
        <>
          <span>Heap</span>
          <span>{stats.heapMb} MB</span>
        </>
      )}
    </aside>
  );
}
