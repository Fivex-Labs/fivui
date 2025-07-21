'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('inline-flex items-center justify-center text-primary', {
  variants: {
    size: {
      xs: 'size-4',
      sm: 'size-5',
      md: 'size-6',
      lg: 'size-8',
      xl: 'size-10',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  variant?: 'simple' | 'circle' | 'ring' | 'wave' | 'dot-pulse' | 'dot-intermittent'
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, variant = 'ring', size, ...props }, ref) => {
    const spinnerClassName = cn(spinnerVariants({ size }), className)

    const renderSpinner = () => {
      switch (variant) {
        case 'simple':
          return (
            <div
              className={cn(
                'animate-spin rounded-full border-4 border-current border-t-transparent',
                spinnerClassName
              )}
            />
          )
        case 'circle':
          return (
            <div
              className={cn(
                'animate-spin rounded-full border-4 border-dashed border-current',
                spinnerClassName
              )}
            />
          )
        case 'dot-intermittent':
          return (
            <div
              className={cn(
                'grid grid-cols-3 place-content-center justify-center gap-1',
                spinnerClassName
              )}
            >
              <div className="h-2 w-2 animate-intermittent rounded-full bg-current" />
              <div
                className="h-2 w-2 animate-intermittent rounded-full bg-current"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="h-2 w-2 animate-intermittent rounded-full bg-current"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          )
        case 'ring':
          return (
            <svg
              className={cn('animate-ring fill-none stroke-current', spinnerClassName)}
              viewBox="25 25 50 50"
              strokeWidth="5"
            >
              <circle cx="50" cy="50" r="20" />
            </svg>
          )
        case 'dot-pulse':
          return (
            <div
              className={cn(
                'relative flex items-center justify-center',
                spinnerClassName
              )}
            >
              <div className="h-2/3 w-2/3 animate-pulse rounded-full bg-current" />
              <div
                className="absolute h-full w-full animate-pulse rounded-full bg-current"
                style={{
                  animationDelay: '-0.5s',
                }}
              />
            </div>
          )
        case 'wave':
          return (
            <div
              className={cn(
                'flex items-end justify-center gap-1',
                spinnerClassName
              )}
            >
              <div className="h-1/2 w-1/4 animate-wave rounded-full bg-current" />
              <div
                className="h-1/2 w-1/4 rounded-full bg-current"
                style={{
                  animationName: 'wave',
                  animationDuration: '1.2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: '-1.1s',
                }}
              />
              <div
                className="h-1/2 w-1/4 rounded-full bg-current"
                style={{
                  animationName: 'wave',
                  animationDuration: '1.2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: '-1s',
                }}
              />
              <div
                className="h-1/2 w-1/4 rounded-full bg-current"
                style={{
                  animationName: 'wave',
                  animationDuration: '1.2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: '-0.9s',
                }}
              />
            </div>
          )
        default:
          return (
            <div
              className={cn(
                'animate-spin rounded-full border-4 border-dashed border-current',
                spinnerClassName
              )}
            />
          )
      }
    }

    return (
      <div ref={ref} className={spinnerClassName} {...props}>
        {renderSpinner()}
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'
export { Spinner } 