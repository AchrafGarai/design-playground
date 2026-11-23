// shadcn/ui RadioGroup (new-york).
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "./cn";

export function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />;
}

export function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-(--border) text-(--primary) shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-(--ring)/50 data-[state=checked]:border-(--primary)",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="relative flex items-center justify-center">
        <span className="size-2 rounded-full bg-(--primary)" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
