"use client"

import * as React from "react"
import { IMaskInput } from 'react-imask'
// @ts-ignore - Template file, path will resolve in user project
import { cn } from "@/lib/utils"

export interface MaskedInputProps
  extends Omit<React.ComponentProps<typeof IMaskInput>, 'mask'> {
  mask: string | RegExp | Array<string | RegExp> | Function
  lazy?: boolean
  placeholderChar?: string
  definitions?: Record<string, RegExp>
  blocks?: Record<string, any>
  prepare?: Function
  parser?: Function
  formatter?: Function
  validator?: Function
  preprocessor?: Function
  postprocessor?: Function
  dispatch?: Function
  overwrite?: boolean | 'shift' | 'replace'
  autofix?: boolean | 'pad' | 'extend' | 'shift'
  maxLength?: number
  minLength?: number
  eager?: boolean
  skipOptional?: boolean
  showMask?: boolean
  showTooltip?: boolean
  tooltip?: boolean | string | Function
  commit?: Function
  unmask?: boolean | 'typed' | 'radix'
  radix?: string
  mapToRadix?: Array<string>
  scale?: number
  signed?: boolean
  thousandsSeparator?: string
  padFractionalZeros?: boolean
  normalizeZeros?: boolean
  min?: number
  max?: number
  parse?: Function
  format?: Function
  validate?: Function
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <IMaskInput
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MaskedInput.displayName = "MaskedInput"

export { MaskedInput } 