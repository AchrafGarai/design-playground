// shadcn/ui Badge (new-york), reading the scoped theme variables.
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "./cn";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-[calc(var(--radius)-4px)] border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-(--primary) text-(--primary-foreground)",
        secondary: "border-transparent bg-(--secondary) text-(--secondary-foreground)",
        accent: "border-transparent bg-(--accent) text-(--accent-foreground)",
        outline: "border-(--border) text-(--foreground)",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant ?? "default"}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
