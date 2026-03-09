"use client"

import * as React from "react"
import { Slider } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

const SliderRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Slider.Root>
>(({ className, ...props }, ref) => (
  <Slider.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <Slider.Range className="absolute h-full bg-primary" />
    </Slider.Track>
    <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50" />
  </Slider.Root>
))
SliderRoot.displayName = "Slider"

export { SliderRoot as Slider }
