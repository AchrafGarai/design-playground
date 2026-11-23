import { type KeyboardEvent, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router";
import { CloseIcon, cx, Orb } from "~/design-system";
import { demos } from "~/lib/registry";
import { AUTHOR } from "~/lib/site";

/**
 * Minimal, macOS-style projects sidebar: mark, project rows with a status dot, author.
 * Site nav and toggles live in the top bar. Static on md+, a drawer on mobile.
 */
export function Sidebar({ drawer = false, onClose }: { drawer?: boolean; onClose?: () => void }) {
  const ref = useRef<HTMLElement>(null);
  // Drawer: focus the current (or first) row, close on Escape.
  useEffect(() => {
    if (!drawer) return;
    const root = ref.current;
    (
      root?.querySelector<HTMLElement>('[aria-current="page"]') ?? root?.querySelector<HTMLElement>("a.side-row")
    )?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, onClose]);

  // ↑/↓/Home/End move focus between rows; Enter opens.
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const rows = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>("a.side-row"));
    const i = rows.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      e.key === "ArrowDown"
        ? (i + 1) % rows.length
        : e.key === "ArrowUp"
          ? (i - 1 + rows.length) % rows.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? rows.length - 1
              : null;
    if (next === null || rows.length === 0) return;
    e.preventDefault();
    rows[next]?.focus();
  };

  return (
    <aside
      ref={ref}
      data-chrome
      aria-label="Projects sidebar"
      className={cx("sidebar", drawer ? "drawer" : "hidden md:flex")}
      {...(drawer ? { role: "dialog", "aria-modal": true } : {})}
    >
      <div className="flex items-center gap-2 px-2 py-1">
        <Link
          to="/"
          viewTransition
          onClick={onClose}
          className="flex items-center gap-2 rounded-md"
          aria-label="Playground, home"
        >
          <Orb size="xs" />
          <span className="text-xs font-semibold text-contrast">Playground</span>
        </Link>
        {drawer && (
          <button type="button" onClick={onClose} className="side-icon ml-auto" aria-label="Close projects">
            <CloseIcon className="icon" />
          </button>
        )}
      </div>

      <nav aria-label="Projects" onKeyDown={onKeyDown} className="mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <p className="side-heading">Projects</p>
        <ol className="flex flex-col gap-px">
          {demos.map((demo) => (
            <li key={demo.slug}>
              <NavLink to={`/p/${demo.slug}`} viewTransition onClick={onClose} className="side-row">
                <span className="min-w-0 truncate">{demo.title}</span>
                <span
                  className="status-dot"
                  data-status={demo.status}
                  title={demo.status === "wip" ? "Work in progress" : "Ready"}
                />
                <span className="sr-only">{demo.status === "wip" ? "(work in progress)" : "(ready)"}</span>
              </NavLink>
            </li>
          ))}
        </ol>
      </nav>

      <p className="px-2 pt-2 text-3xs text-secondary-text">{AUTHOR}</p>
    </aside>
  );
}
