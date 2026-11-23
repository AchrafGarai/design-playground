import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { installSound } from "~/lib/sound";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

/** Minimal projects sidebar on the left; top bar (nav + toggles), content and footer on the right. */
export function Layout({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  // Demo pages are a full-height workspace: no footer under them.
  const isDemo = useLocation().pathname.startsWith("/p/");
  useEffect(() => installSound(), []);

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        data-chrome
        className="sr-only z-60 rounded-lg bg-contrast px-3 py-1.5 text-sm font-medium text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <Sidebar />
      {drawerOpen && (
        <div className="md:hidden">
          <div className="drawer-backdrop" aria-hidden="true" onClick={closeDrawer} />
          <Sidebar drawer onClose={closeDrawer} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenProjects={() => setDrawerOpen(true)} projectsOpen={drawerOpen} wide={isDemo} />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        {!isDemo && <Footer />}
      </div>
    </div>
  );
}
