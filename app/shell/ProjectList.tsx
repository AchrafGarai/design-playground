import type { KeyboardEvent } from "react";
import { Link } from "react-router";
import { ArrowRight } from "~/design-system";
import type { Demo } from "~/lib/registry";

/** Portfolio work list: numbered rows, hover spotlight, arrow slides in. ↑/↓/Home/End move focus. */
export function ProjectList({ demos, numberOf }: { demos: Demo[]; numberOf: (d: Demo) => number }) {
  const onKeyDown = (e: KeyboardEvent<HTMLOListElement>) => {
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>("a.row"));
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      e.key === "ArrowDown"
        ? (i + 1) % links.length
        : e.key === "ArrowUp"
          ? (i - 1 + links.length) % links.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? links.length - 1
              : null;
    if (next === null || links.length === 0) return;
    e.preventDefault();
    links[next]?.focus();
  };

  return (
    <ol className="rows -mx-3" onKeyDown={onKeyDown}>
      {demos.map((demo) => (
        <li key={demo.slug}>
          <Link to={`/p/${demo.slug}`} viewTransition className="row group">
            <span className="num w-6 shrink-0 text-xs text-secondary-text tabular-nums">
              {String(numberOf(demo)).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-contrast">{demo.title}</span>
              <span className="block truncate text-sm text-secondary-text">{demo.description}</span>
            </span>
            <span className="hidden shrink-0 text-sm text-secondary-text sm:block">{demo.tags[0]}</span>
            <span className="shrink-0 text-right text-sm whitespace-nowrap text-secondary-text uppercase">
              {demo.status}
            </span>
            <ArrowRight strokeWidth={2.25} className="arrow size-4 shrink-0 text-contrast" />
          </Link>
        </li>
      ))}
    </ol>
  );
}
