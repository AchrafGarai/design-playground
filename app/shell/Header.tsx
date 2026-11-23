import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { ChevronUp, cx, MenuIcon, Orb, SoundToggle, ThemeToggle } from "~/design-system";
import { NAV } from "~/lib/site";

function useIsCurrent() {
  const { pathname } = useLocation();
  return (href: string) => pathname === href;
}

/**
 * Portfolio top bar: (mobile: menu + orb) · nav centred · sound + theme toggles right.
 * It scrolls away with the page; a floating pill takes over once it's out of view.
 */
export function Header({
  onOpenProjects,
  projectsOpen,
  wide = false,
}: {
  onOpenProjects: () => void;
  projectsOpen: boolean;
  /** Demo workspace: span the main column so the controls align with the demo toolbar. */
  wide?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [floating, setFloating] = useState(false);
  const isCurrent = useIsCurrent();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setFloating(!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Page progress on the back-to-top ring (portfolio reading pill). Written straight to the DOM, no re-renders.
  const ringRef = useRef<SVGCircleElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      ringRef.current?.style.setProperty("stroke-dashoffset", String(100 - p * 100));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <header
        ref={ref}
        data-chrome
        data-site-header
        className={cx("flex min-h-header items-center gap-4 py-1.5", wide ? "px-3 sm:px-4" : "container-narrow")}
      >
        <div className="flex flex-1 basis-0 items-center gap-1">
          <button
            type="button"
            onClick={onOpenProjects}
            aria-expanded={projectsOpen}
            aria-haspopup="dialog"
            aria-label="Open projects"
            className="icon-btn md:hidden"
          >
            <MenuIcon className="icon" />
          </button>
          <Link to="/" viewTransition className="flex rounded-full md:hidden" aria-label="Playground, home">
            <Orb size="xs" />
          </Link>
        </div>

        <nav aria-label="Primary">
          <ul className="flex gap-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  viewTransition
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className="nav-link"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="-mr-1 flex flex-1 basis-0 justify-end">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      <div
        data-chrome
        data-floating-nav
        data-visible={floating || undefined}
        aria-hidden={!floating}
        inert={!floating}
        className="floating-nav"
      >
        <nav
          aria-label="Quick"
          className="flex items-center gap-0.5 rounded-full border border-line bg-bg-200 p-1 font-medium"
        >
          <Link to="/" viewTransition className="flex rounded-full p-0.5" aria-label="Home">
            <Orb size="xs" />
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              viewTransition
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className="floating-link"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            aria-label="Back to top"
            title="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="progress-ring ml-0.5 text-secondary-text hover:text-contrast"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" className="progress-track">
              <circle cx="8" cy="8" r="7" pathLength="100" ref={ringRef} />
            </svg>
            <ChevronUp className="progress-chevron" />
          </button>
        </nav>
      </div>
    </>
  );
}
