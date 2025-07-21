'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const kbdVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background font-mono text-sm font-medium text-muted-foreground shadow-sm',
  {
    variants: {
      size: {
        xs: 'h-5 min-w-5 px-1.5 text-xs',
        sm: 'h-6 min-w-6 px-2 text-xs',
        md: 'h-8 min-w-8 px-2.5 text-sm',
        lg: 'h-9 min-w-9 px-3 text-base',
        xl: 'h-10 min-w-10 px-3.5 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(kbdVariants({ size }), className)}
        {...props}
      />
    )
  }
)

Kbd.displayName = 'Kbd'

export { Kbd } 