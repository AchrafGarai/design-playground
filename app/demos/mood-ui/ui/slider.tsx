// shadcn/ui Slider and Progress (new-york).
import { Progress as ProgressPrimitive, Slider as SliderPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "./cn";

export function Slider({ className, defaultValue, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const thumbs = defaultValue ?? props.value ?? [0];
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-(--muted)">
        <SliderPrimitive.Range className="absolute h-full bg-(--primary)" />
      </SliderPrimitive.Track>
      {thumbs.map((_, i) => (
        <SliderPrimitive.Thumb
          // biome-ignore lint/suspicious/noArrayIndexKey: thumbs have no identity
          key={i}
          aria-label={props["aria-label"]}
          className="block size-4 shrink-0 rounded-full border border-(--primary) bg-(--background) shadow-sm transition-[box-shadow] outline-none hover:ring-4 hover:ring-(--ring)/50 focus-visible:ring-4 focus-visible:ring-(--ring)/50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-(--primary)/20", className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-(--primary) transition-all"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
