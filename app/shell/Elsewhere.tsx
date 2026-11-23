import { ArrowUpRight } from "~/design-system";
import { SOCIALS } from "~/lib/site";

/** Portfolio "Elsewhere": social rows with the spotlight hover and a diagonal arrow. */
export function Elsewhere() {
  return (
    <section className="container-narrow reveal mt-28" aria-labelledby="elsewhere-heading">
      <h2 id="elsewhere-heading" className="label mb-3">
        Elsewhere
      </h2>
      <ul className="rows -mx-3">
        {SOCIALS.map((s) => (
          <li key={s.href}>
            <a href={s.href} rel="me noopener" className="row gap-3!">
              <span className="flex-1 font-medium text-contrast">{s.label}</span>
              <span className="text-sm text-secondary-text">{s.handle}</span>
              <ArrowUpRight className="arrow arrow-out size-4 shrink-0 text-contrast" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
