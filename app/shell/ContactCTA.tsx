import type { ReactNode } from "react";
import { CopyEmail, Orb } from "~/design-system";
import { EMAIL, SOCIALS } from "~/lib/site";

/** Portfolio contact block: orb, title, a line, copy-email, LinkedIn. Faint static accent glow behind. */
export function ContactCTA({ title = "Let's work together", children }: { title?: string; children?: ReactNode }) {
  const linkedin = SOCIALS.find((s) => s.label === "LinkedIn");
  return (
    <section
      className="contact container-narrow reveal relative mt-28 pt-6 text-center"
      aria-labelledby="contact-heading"
    >
      <div className="glow" aria-hidden="true" />
      <div className="relative">
        <Orb size="md" className="mx-auto" />
        <h2 id="contact-heading" className="mt-5 text-xl">
          {title}
        </h2>
        <div className="mx-auto mt-2 max-w-md text-pretty">{children}</div>
        <div className="mt-6">
          <CopyEmail email={EMAIL} />
        </div>
        {linkedin && (
          <p className="mt-4 text-sm text-secondary-text">
            or connect on{" "}
            <a className="link" href={linkedin.href} rel="me noopener">
              LinkedIn
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
