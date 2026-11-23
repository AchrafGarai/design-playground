import { Link } from "react-router";
import { pageMeta } from "~/lib/seo";
import { AUTHOR, LOCATION, PORTFOLIO_URL, SITE_NAME } from "~/lib/site";
import { ContactCTA } from "~/shell/ContactCTA";
import type { Route } from "./+types/about";

export function meta(_: Route.MetaArgs) {
  return pageMeta({
    title: `About | ${SITE_NAME}`,
    description: `About ${AUTHOR}: senior product designer and UI team lead who prototypes in code. Based in ${LOCATION}.`,
    path: "/about",
  });
}

// From the UX portfolio's About page.
const experience = [
  { years: "2021 to now", role: "UI Team Lead · Senior Product Designer", org: "InstaDeep (BioNTech Group)" },
  { years: "2020 to 2021", role: "UX/UI Designer", org: "Start Development" },
  { years: "2018 to 2020", role: "UI/UX Designer", org: "Namplapps" },
];

const capabilities = [
  { area: "Product", items: "Requirements, discovery and prioritisation with product owners" },
  { area: "Research", items: "User interviews, usability testing, surveys" },
  { area: "Design", items: "UI design for data-heavy products, design systems and governance" },
  { area: "Engineering", items: "Prototyping in React, motion, design tokens, accessible front-end" },
  { area: "Leadership", items: "Leading the UI team, mentoring designers, cross-team design collaboration" },
];

const education = [
  { item: "BSc Business Administration, IT major", detail: "Tunis Business School, 2017" },
  { item: "Professional Scrum Product Owner (PSPO)", detail: "Certification" },
  { item: "Google UX Design", detail: "Certificate" },
  { item: "Meta Front-End Developer", detail: "Certificate" },
];

const languages = "Arabic (native), English (fluent), French (professional)";

const colophon = [
  { item: "Stack", detail: "React 19, React Router 7, Tailwind CSS 4, Motion" },
  { item: "Type", detail: "The system UI font" },
  { item: "Hosting", detail: "Static, on Cloudflare Pages" },
  { item: "Principles", detail: "Fast shell, demos load on their own, light and dark, keyboard friendly" },
];

/** About (portfolio About page): portrait, story, experience, capabilities, education, colophon, contact. */
export default function About() {
  return (
    <>
      <section className="container-narrow mt-10 sm:mt-14" aria-labelledby="about-heading">
        <div className="avatar rise w-fit [--i:0]">
          <img
            src="/achraf-garai.jpg"
            alt={`Portrait of ${AUTHOR}`}
            width={80}
            height={80}
            className="size-20 rounded-full object-cover"
          />
        </div>
        <h1 id="about-heading" className="rise mt-6 text-xl [--i:1]">
          About
        </h1>
        <div className="rise mt-2 space-y-4 text-pretty [--i:2]">
          <p>
            I'm {AUTHOR}, a senior product designer and UI team lead with 10+ years of experience designing complex,
            data-heavy products. I'm based in {LOCATION}.
          </p>
          <p>
            At InstaDeep (BioNTech Group) I lead the UI team and govern the Deep Design System, shared across four
            product teams. My case studies live on my{" "}
            <a className="link" href={PORTFOLIO_URL} rel="me noopener">
              UX portfolio
            </a>
            .
          </p>
          <p>
            This playground is the other half: interface ideas I'd rather build than describe. Each one is a small,
            self-contained room. Start with{" "}
            <Link className="link" to="/p/mood-ui" viewTransition>
              Mood → UI
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="container-narrow reveal mt-20" aria-labelledby="experience-heading">
        <h2 id="experience-heading" className="label mb-2">
          Experience
        </h2>
        <ol className="text-sm">
          {experience.map((e) => (
            <li
              key={e.years}
              className="flex flex-col gap-0.5 border-b border-line py-3 last:border-0 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="w-28 shrink-0 text-secondary-text tabular-nums">{e.years}</span>
              <span className="flex-1 font-medium text-contrast">{e.role}</span>
              <span className="text-secondary-text">{e.org}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-narrow reveal mt-20" aria-labelledby="capabilities-heading">
        <h2 id="capabilities-heading" className="label mb-2">
          Capabilities
        </h2>
        <dl className="text-sm">
          {capabilities.map((c) => (
            <div
              key={c.area}
              className="flex flex-col gap-0.5 border-b border-line py-3 last:border-0 sm:flex-row sm:gap-4"
            >
              <dt className="w-28 shrink-0 font-medium text-contrast">{c.area}</dt>
              <dd className="text-secondary-text">{c.items}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-narrow reveal mt-20" aria-labelledby="education-heading">
        <h2 id="education-heading" className="label mb-2">
          Education &amp; certifications
        </h2>
        <ul className="text-sm">
          {education.map((e) => (
            <li
              key={e.item}
              className="flex flex-col gap-0.5 border-b border-line py-3 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <span className="font-medium text-contrast">{e.item}</span>
              <span className="text-secondary-text">{e.detail}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <span className="font-medium text-contrast">Languages</span>
          <span className="ml-3 text-secondary-text">{languages}</span>
        </p>
      </section>

      <section className="container-narrow reveal mt-20" aria-labelledby="colophon-heading">
        <h2 id="colophon-heading" className="label mb-2">
          Colophon
        </h2>
        <ul className="text-sm">
          {colophon.map((c) => (
            <li
              key={c.item}
              className="flex flex-col gap-0.5 border-b border-line py-3 last:border-0 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="w-28 shrink-0 font-medium text-contrast">{c.item}</span>
              <span className="text-secondary-text">{c.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <ContactCTA title="Say hello">
        <p>Email is the best way to reach me for roles, collaborations, or just to talk design.</p>
      </ContactCTA>
    </>
  );
}
