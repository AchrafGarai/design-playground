import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowRight, CloseIcon, cx, ExpandIcon, GaugeIcon, InfoIcon } from "~/design-system";
import { DemoContainer } from "~/lib/DemoContainer";
import { type Demo, demos, getDemo, lazyDemo } from "~/lib/registry";
import { pageMeta } from "~/lib/seo";
import { SITE_NAME } from "~/lib/site";
import { useHotkey } from "~/lib/useHotkey";
import { useHydrated } from "~/lib/useHydrated";
import { useIdle } from "~/lib/useIdle";
import { NotFound } from "~/shell/NotFound";
import { PerfOverlay } from "~/shell/PerfOverlay";
import type { Route } from "./+types/demo";

export function meta({ params }: Route.MetaArgs) {
  const demo = getDemo(params.slug);
  if (!demo) return [{ title: `Not found | ${SITE_NAME}` }];
  return pageMeta({
    title: `${demo.title} | ${SITE_NAME}`,
    description: demo.description,
    path: `/p/${demo.slug}`,
    image: demo.ogImage,
  });
}

export default function DemoPage() {
  const { slug } = useParams();
  const demo = getDemo(slug);
  if (!demo) return <NotFound />;
  return <DemoView key={demo.slug} demo={demo} />;
}

function Loading() {
  return (
    <div role="status" className="grid h-full min-h-64 place-items-center text-sm text-secondary-text">
      Loading…
    </div>
  );
}

/** Demo workspace: toolbar + full-height stage; details live in an info popover. */
function DemoView({ demo }: { demo: Demo }) {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Read the query only after hydration: prerendered HTML never has it (the pre-paint script hides chrome meanwhile).
  const full = hydrated && searchParams.get("view") === "full";
  const [perfOn, setPerfOn] = useState(false);
  const togglePerf = useCallback(() => setPerfOn((on) => !on), []);
  useHotkey("p", togglePerf);
  const idle = useIdle(2500, full);

  // Info panel: a native popover (light dismiss, Esc). Mirror its state for aria-expanded.
  const infoRef = useRef<HTMLDivElement | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const attachInfo = useCallback((el: HTMLDivElement | null) => {
    infoRef.current = el;
    if (!el) return;
    const onToggle = (e: Event) => setInfoOpen((e as ToggleEvent).newState === "open");
    el.addEventListener("toggle", onToggle);
    return () => {
      el.removeEventListener("toggle", onToggle);
      infoRef.current = null;
    };
  }, []);
  useHotkey("i", () => infoRef.current?.togglePopover());
  useHotkey("Escape", () => {
    if (full) navigate(`/p/${demo.slug}`, { viewTransition: true });
  });

  useEffect(() => {
    const root = document.documentElement;
    if (full) root.dataset.view = "full";
    else delete root.dataset.view;
    return () => {
      delete root.dataset.view;
    };
  }, [full]);

  const index = demos.indexOf(demo);
  const next = demos[(index + 1) % demos.length] ?? demo;
  const DemoComponent = lazyDemo(demo);
  // Demos are client-only (they may use WebGL, audio, workers): prerender shows the loading state.
  const body = hydrated ? (
    <Suspense fallback={<Loading />}>
      <DemoComponent />
    </Suspense>
  ) : (
    <Loading />
  );

  if (full) {
    return (
      // stage "ink" renders the demo in the dark theme tokens, whatever the site theme is.
      <div className={cx("min-h-dvh bg-bg p-6 text-fg", demo.stage === "ink" && "dark")}>
        {/* Quiet close button: always reachable, fades out while idle so recordings stay clean. */}
        <Link
          to={`/p/${demo.slug}`}
          viewTransition
          aria-label="Exit full screen"
          title="Exit full screen (Esc)"
          data-idle={idle || undefined}
          className="icon-btn exit-full fixed top-3 right-3 z-50"
        >
          <CloseIcon className="icon" />
        </Link>
        <DemoContainer slug={demo.slug}>{body}</DemoContainer>
        {perfOn && <PerfOverlay />}
      </div>
    );
  }

  return (
    // Workspace: the demo fills the main column; the toolbar floats over it. Viewport height minus the top bar.
    <section
      aria-labelledby="demo-title"
      className="flex h-[calc(100dvh-var(--spacing-header))] flex-col px-2 pb-2 sm:px-3 sm:pb-3"
    >
      <div className="stage relative min-h-0 flex-1 overflow-hidden rounded-stage bg-media-card">
        <div className="absolute inset-0 overflow-auto">
          <DemoContainer slug={demo.slug}>{body}</DemoContainer>
        </div>

        {/* Floating toolbar: tiny frosted pills (title left, icons right) over the demo. Clicks pass through the gap. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 stage-toolbar flex items-center justify-between gap-2 px-2.5 py-1.5">
          <div className="stage-bar pointer-events-auto min-w-0 pl-1">
            <h1 id="demo-title" className="stage-title truncate">
              {demo.title}
            </h1>
            <span className="stage-status shrink-0">{demo.status === "wip" ? "Work in progress" : "Ready"}</span>
          </div>

          <div className="stage-bar stage-actions pointer-events-auto shrink-0 gap-0">
            <button
              type="button"
              popoverTarget="demo-info"
              aria-expanded={infoOpen}
              aria-label="About this demo"
              title="About this demo (I)"
              className="icon-btn"
            >
              <InfoIcon className="icon" />
            </button>
            <button
              type="button"
              aria-pressed={perfOn}
              aria-keyshortcuts="P"
              aria-label="Performance overlay"
              title="Performance overlay (P)"
              onClick={togglePerf}
              className="icon-btn"
            >
              <GaugeIcon className="icon" />
            </button>
            <Link to="?view=full" aria-label="Open full screen" title="Open full screen" className="icon-btn">
              <ExpandIcon className="icon" />
            </Link>
          </div>
        </div>
      </div>

      <div
        id="demo-info"
        ref={attachInfo}
        popover="auto"
        role="dialog"
        aria-labelledby="demo-info-title"
        className="info-popover"
      >
        <h2 id="demo-info-title" className="text-sm">
          {demo.title}
        </h2>
        <p className="mt-1 text-pretty">{demo.description}</p>
        <dl className="mt-3">
          <div className="flex gap-4 border-t border-line py-2.5">
            <dt className="w-16 shrink-0 text-secondary-text">Status</dt>
            <dd className="font-medium text-contrast">{demo.status === "wip" ? "Work in progress" : "Ready"}</dd>
          </div>
          <div className="flex gap-4 border-t border-line py-2.5">
            <dt className="w-16 shrink-0 text-secondary-text">Focus</dt>
            <dd className="flex flex-wrap gap-1.5">
              {demo.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </dd>
          </div>
          <div className="flex gap-4 border-t border-line py-2.5">
            <dt className="w-16 shrink-0 text-secondary-text">Keys</dt>
            <dd className="flex flex-col gap-1 text-fg">
              <span>
                <kbd className="key">I</kbd> Info · <kbd className="key">P</kbd> Performance
              </span>
              <span>
                <kbd className="key">Esc</kbd> Close / exit full screen
              </span>
            </dd>
          </div>
        </dl>
        {demos.length > 1 && (
          <Link
            to={`/p/${next.slug}`}
            viewTransition
            className="group mt-2 flex items-center gap-3 rounded-xl border border-line p-3"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-secondary-text">Next project</span>
              <span className="block truncate font-medium text-contrast">{next.title}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-contrast transition-transform duration-300 ease-snap group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {perfOn && <PerfOverlay />}
    </section>
  );
}
