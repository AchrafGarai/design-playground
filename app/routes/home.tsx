import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Orb } from "~/design-system";
import { demos, latestDemo } from "~/lib/registry";
import { pageMeta } from "~/lib/seo";
import { AUTHOR, LOCATION, SITE_NAME } from "~/lib/site";
import { ContactCTA } from "~/shell/ContactCTA";
import { Elsewhere } from "~/shell/Elsewhere";
import { ProjectList } from "~/shell/ProjectList";
import { SelectedWork } from "~/shell/SelectedWork";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return pageMeta({
    title: `${SITE_NAME} | ${AUTHOR}`,
    description: "A design engineering playground: small, self-contained interface experiments by Achraf Garai.",
    path: "/",
  });
}

const ALL = "all";

/** Home (portfolio home): short intro, the playground projects, selected UX work, elsewhere, contact. */
export default function Home() {
  const latest = latestDemo();
  const [tag, setTag] = useState(ALL);
  const tags = useMemo(() => [...new Set(demos.flatMap((d) => d.tags))].sort(), []);
  const shown = tag === ALL ? demos : demos.filter((d) => d.tags.includes(tag));

  return (
    <>
      <section className="container-narrow mt-10 sm:mt-14" aria-labelledby="intro-heading">
        <div className="rise w-fit [--i:0]">
          <Orb size="md" />
        </div>
        <h1 id="intro-heading" className="rise mt-5 text-xl [--i:1]">
          Playground
        </h1>
        <p className="rise mt-1.5 text-pretty [--i:2]">
          Small interface experiments by {AUTHOR}.{" "}
          {latest && (
            <>
              Latest:{" "}
              <Link className="link" to={`/p/${latest.slug}`} viewTransition>
                {latest.title}
              </Link>
              .
            </>
          )}
        </p>
      </section>

      <section
        id="projects"
        className="container-narrow rise mt-12 scroll-mt-6 [--i:3]"
        aria-labelledby="projects-heading"
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h2 id="projects-heading" className="label">
            Projects <span className="tabular-nums">{demos.length}</span>
          </h2>
          <fieldset className="flex flex-wrap gap-1">
            <legend className="sr-only">Filter projects by tag</legend>
            {[ALL, ...tags].map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tag === t} onClick={() => setTag(t)}>
                {t === ALL ? "All" : t}
              </button>
            ))}
          </fieldset>
        </div>
        <p className="sr-only" aria-live="polite">
          {shown.length} {shown.length === 1 ? "project" : "projects"} shown
        </p>
        <ProjectList demos={shown} numberOf={(d) => demos.indexOf(d) + 1} />
      </section>

      <SelectedWork />
      <Elsewhere />
      <ContactCTA>
        <p>
          Based in {LOCATION}. Open to senior product design and design engineering roles, and to collaborations on
          interfaces that move.
        </p>
      </ContactCTA>
    </>
  );
}
