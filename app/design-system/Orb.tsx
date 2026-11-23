import { cx } from "./cx";

/** The portfolio's animated light-blue orb mark. Styles in portfolio.css. Decorative: label the link around it. */
export function Orb({ size = "sm", className }: { size?: "xs" | "sm" | "md" | "lg"; className?: string }) {
  return (
    <span className={cx("orb", `orb-${size}`, className)} aria-hidden="true">
      <span className="swirl a" />
      <span className="swirl b" />
      <span className="core" />
      <span className="shine" />
    </span>
  );
}
