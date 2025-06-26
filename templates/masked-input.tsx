"use client"

import * as React from "react"
import { IMaskInput } from 'react-imask'
import { cn } from "@/lib/utils"

export interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'mask' | 'value'> {
  mask: string | RegExp | {
    mask: string | RegExp
    [key: string]: unknown
  }
  onAccept?: (value: string) => void
  value?: string
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, type, mask, onAccept, value, ...props }, ref) => {
    return (
      <IMaskInput
        // @ts-expect-error - IMask types are not properly exported, but the component works correctly at runtime
        mask={mask}
        type={type}
        value={value}
        onAccept={onAccept}
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