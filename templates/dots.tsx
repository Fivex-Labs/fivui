'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const dotsVariants = cva('inline-block h-2.5 w-2.5 rounded-full', {
  variants: {
    variant: {
      default: 'bg-foreground',
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface DotsProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof dotsVariants> {}

const Dots = React.forwardRef<HTMLSpanElement, DotsProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(dotsVariants({ variant }), className)} {...props} />
    )
  },
)

Dots.displayName = 'Dots'

export { Dots } 