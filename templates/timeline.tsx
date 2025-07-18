import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const timelineVariants = cva(
  "relative flex flex-col",
  {
    variants: {
      variant: {
        subtle: "[&_[data-slot=timeline-indicator]]:bg-muted [&_[data-slot=timeline-indicator]]:text-muted-foreground [&_[data-slot=timeline-separator]]:bg-border",
        solid: "[&_[data-slot=timeline-indicator]]:bg-primary [&_[data-slot=timeline-indicator]]:text-primary-foreground [&_[data-slot=timeline-separator]]:bg-primary/20",
        outline: "[&_[data-slot=timeline-indicator]]:border-2 [&_[data-slot=timeline-indicator]]:border-primary [&_[data-slot=timeline-indicator]]:bg-background [&_[data-slot=timeline-indicator]]:text-primary [&_[data-slot=timeline-separator]]:bg-border",
        plain: "[&_[data-slot=timeline-indicator]]:bg-transparent [&_[data-slot=timeline-indicator]]:text-foreground [&_[data-slot=timeline-separator]]:bg-border",
      },
      size: {
        sm: "[&_[data-slot=timeline-indicator]]:h-6 [&_[data-slot=timeline-indicator]]:w-6 [&_[data-slot=timeline-indicator]]:text-xs [&_[data-slot=timeline-separator]]:w-px [&_[data-slot=timeline-content]]:text-sm",
        md: "[&_[data-slot=timeline-indicator]]:h-8 [&_[data-slot=timeline-indicator]]:w-8 [&_[data-slot=timeline-indicator]]:text-sm [&_[data-slot=timeline-separator]]:w-px [&_[data-slot=timeline-content]]:text-base",
        lg: "[&_[data-slot=timeline-indicator]]:h-10 [&_[data-slot=timeline-indicator]]:w-10 [&_[data-slot=timeline-indicator]]:text-base [&_[data-slot=timeline-separator]]:w-px [&_[data-slot=timeline-content]]:text-lg",
        xl: "[&_[data-slot=timeline-indicator]]:h-12 [&_[data-slot=timeline-indicator]]:w-12 [&_[data-slot=timeline-indicator]]:text-lg [&_[data-slot=timeline-separator]]:w-px [&_[data-slot=timeline-content]]:text-xl",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
)

export interface TimelineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineVariants> {}

function Timeline({ className, variant, size, ...props }: TimelineProps) {
  return (
    <div
      data-slot="timeline"
      className={cn(timelineVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function TimelineItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-item"
      className={cn("relative flex gap-4 pb-8 last:pb-0", className)}
      {...props}
    />
  )
}

function TimelineConnector({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-connector"
      className={cn("relative flex flex-col items-center", className)}
      {...props}
    />
  )
}

function TimelineIndicator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-indicator"
      className={cn(
        "relative z-10 flex shrink-0 items-center justify-center rounded-full font-medium",
        className
      )}
      {...props}
    />
  )
}

function TimelineSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-separator"
      className={cn(
        "absolute top-8 h-full min-h-8 bg-border",
        className
      )}
      {...props}
    />
  )
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-2", className)}
      {...props}
    />
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-title"
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  )
}

function TimelineDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineIndicator,
  TimelineSeparator,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
} 