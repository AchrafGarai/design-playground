// shadcn/ui Checkbox (new-york).
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "./cn";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-(--border) shadow-xs outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-(--ring)/50 data-[state=checked]:border-(--primary) data-[state=checked]:bg-(--primary) data-[state=checked]:text-(--primary-foreground)",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-content-center text-current">
        <svg
          viewBox="0 0 24 24"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
