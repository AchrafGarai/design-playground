import { useEffect } from "react";
import { useDemoLifecycle } from "~/lib/useDemoLifecycle";

// Rendered inside <DemoContainer slug="__SLUG__">. Import only from this folder,
// ~/design-system and ~/lib. Style [data-demo="__SLUG__"], never :root or body.
export default function Demo() {
  const life = useDemoLifecycle();
  useEffect(() => {
    // Create heavy resources here and register their cleanup, e.g. life.onCleanup(() => renderer.dispose()).
    life.onCleanup(() => {});
  }, [life]);

  return (
    <div className="flex flex-col items-center gap-2 px-6 pt-20 pb-12 text-center">
      <h2 className="text-xl">__TITLE__</h2>
      <p className="text-sm text-secondary-text">Coming soon</p>
    </div>
  );
}
