import { Link } from "react-router";

/** Portfolio 404. */
export function NotFound() {
  return (
    <section className="container-narrow py-32 text-center">
      <p className="text-sm text-secondary-text">404</p>
      <h1 className="mt-2 text-xl">This page wandered off.</h1>
      <Link to="/" viewTransition className="btn mt-6">
        Back to home
      </Link>
    </section>
  );
}
