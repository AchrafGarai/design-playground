// shadcn/ui Input (new-york), reading the scoped theme variables.
import type * as React from "react";
import { cn } from "./cn";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-[calc(var(--radius)-2px)] border border-(--border) bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-(--muted-foreground) focus-visible:border-(--ring) focus-visible:ring-[3px] focus-visible:ring-(--ring)/50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-[calc(var(--radius)-2px)] border border-(--border) bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-(--muted-foreground) focus-visible:border-(--ring) focus-visible:ring-[3px] focus-visible:ring-(--ring)/50",
        className,
      )}
      {...props}
    />
  );
}
