// shadcn/ui Avatar and Separator (new-york). Avatars show initials only (no remote images).
import { Separator as SeparatorPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "./cn";

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--muted) text-xs font-medium text-(--foreground)",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative
      orientation={orientation}
      className={cn(
        "shrink-0 bg-(--border) data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}
