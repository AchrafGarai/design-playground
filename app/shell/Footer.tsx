import { ArrowUp } from "~/design-system";
import { AUTHOR, LOCATION, SOCIALS } from "~/lib/site";

/** Portfolio footer. */
export function Footer() {
  const toTop = () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  };
  return (
    <footer
      data-chrome
      className="container-narrow mt-24 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-5 pb-8 text-xs"
    >
      <p className="text-secondary-text">
        © {new Date().getFullYear()} {AUTHOR} · {LOCATION}
      </p>
      <ul className="flex items-center gap-1" aria-label="Footer">
        {SOCIALS.map((s) => (
          <li key={s.href}>
            <a className="footer-item" href={s.href} rel="me noopener">
              {s.label}
            </a>
          </li>
        ))}
        <li>
          <button type="button" className="footer-item group" onClick={toTop}>
            Top
            <ArrowUp className="size-3 transition-transform duration-300 ease-snap group-hover:-translate-y-0.5" />
          </button>
        </li>
      </ul>
    </footer>
  );
}
