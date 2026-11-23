// shadcn/ui Button (new-york), reading the scoped theme variables.
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "./cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[calc(var(--radius)-2px)] text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-(--ring)/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-(--primary) text-(--primary-foreground) shadow-xs hover:bg-(--primary)/90",
        secondary: "bg-(--secondary) text-(--secondary-foreground) shadow-xs hover:bg-(--secondary)/80",
        outline:
          "border border-(--border) bg-(--background) shadow-xs hover:bg-(--accent) hover:text-(--accent-foreground)",
        ghost: "hover:bg-(--accent) hover:text-(--accent-foreground)",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-10 px-6",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      data-variant={variant ?? "default"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
