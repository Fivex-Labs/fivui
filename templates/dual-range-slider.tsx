"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

export interface DualRangeSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  formatLabel?: (value: number) => string
  showLabel?: boolean
}

const DualRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualRangeSliderProps
>(({
  className,
  formatLabel,
  showLabel = true,
  ...props
}, ref) => {
  const [values, setValues] = React.useState<number[]>(props.defaultValue as number[] || [25, 75])

  const handleValueChange = (newValues: number[]) => {
    setValues(newValues)
    if (props.onValueChange) {
      props.onValueChange(newValues)
    }
  }

  const renderLabel = (value: number) => {
    if (!showLabel) return null
    return formatLabel ? formatLabel(value) : `${value}`
  }

  return (
    <div className="relative w-full">
      {showLabel && (
        <div className="absolute -top-8 left-0 right-0 flex justify-between">
          <span className="text-sm">{renderLabel(values[0])}</span>
          <span className="text-sm">{renderLabel(values[1])}</span>
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        onValueChange={handleValueChange}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
        <SliderPrimitive.Thumb
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Root>
    </div>
  )
})

DualRangeSlider.displayName = "DualRangeSlider"

export { DualRangeSlider } 