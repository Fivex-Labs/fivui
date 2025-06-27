"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

export interface DualRangeSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  formatLabel?: (value: number) => string
  labelPosition?: "top" | "bottom"
  className?: string
  showLabel?: boolean
}

const DualRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualRangeSliderProps
>(({
  className,
  label,
  formatLabel,
  labelPosition = "top",
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
    <div className="w-full space-y-2">
      {label && labelPosition === "top" && (
        <div className="mb-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </div>
      )}
      <div className="relative">
        {showLabel && labelPosition === "top" && (
          <div className="absolute -top-6 left-0 right-0 flex justify-between">
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
        {showLabel && labelPosition === "bottom" && (
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
            <span className="text-sm">{renderLabel(values[0])}</span>
            <span className="text-sm">{renderLabel(values[1])}</span>
          </div>
        )}
      </div>
      {label && labelPosition === "bottom" && (
        <div className="mt-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </div>
      )}
    </div>
  )
})

DualRangeSlider.displayName = "DualRangeSlider"

export { DualRangeSlider } 