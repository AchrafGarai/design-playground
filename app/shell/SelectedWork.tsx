import { ArrowUpRight } from "~/design-system";
import { PORTFOLIO_URL, SELECTED_WORK } from "~/lib/site";

/** Portfolio work list, linking out to the case studies on the UX portfolio. */
export function SelectedWork() {
  return (
    <section className="container-narrow reveal mt-28" aria-labelledby="work-heading">
      <h2 id="work-heading" className="label mb-3">
        <a
          href={PORTFOLIO_URL}
          rel="me noopener"
          className="group inline-flex items-center gap-1 transition-colors hover:text-contrast"
        >
          Selected work
          <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-snap group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </h2>
      <ol className="rows -mx-3">
        {SELECTED_WORK.map((w, i) => (
          <li key={w.id}>
            <a href={`${PORTFOLIO_URL}/work/${w.id}`} rel="me noopener" className="row group">
              <span className="num w-6 shrink-0 text-xs text-secondary-text tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-contrast">{w.name}</span>
                <span className="block truncate text-sm text-secondary-text">{w.line}</span>
              </span>
              <span className="shrink-0 text-right text-sm whitespace-nowrap text-secondary-text tabular-nums">
                {w.year}
              </span>
              <ArrowUpRight strokeWidth={2.25} className="arrow arrow-out size-4 shrink-0 text-contrast" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
