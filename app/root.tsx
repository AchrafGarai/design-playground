import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { Layout as Shell } from "./shell/Layout";
import { NotFound } from "./shell/NotFound";

export const links: Route.LinksFunction = () => [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }];

// Applied before first paint: the saved/OS theme (no flash of the wrong theme) and ?view=full
// (no flash of the shell chrome, see app.css).
const prePaintScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");d.classList.toggle("dark",t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches)}catch(e){}try{var q=new URLSearchParams(location.search);if(q.get("view")==="full")d.dataset.view="full"}catch(e){}})()`;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#18181a" media="(prefers-color-scheme: dark)" />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-party pre-paint script */}
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <Shell>{children}</Shell>
      </LazyMotion>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}

export function HydrateFallback() {
  return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <Providers>
        <NotFound />
      </Providers>
    );
  }
  const message = error instanceof Error ? error.message : "Unknown error";
  return (
    <Providers>
      <section className="container-narrow py-32 text-center">
        <p className="text-sm text-secondary-text">Error</p>
        <h1 className="mt-2 text-xl">Something broke.</h1>
        <p className="mt-2 text-sm">{message}</p>
      </section>
    </Providers>
  );
}
