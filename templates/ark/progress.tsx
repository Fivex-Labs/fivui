"use client"

import * as React from "react"
import { Progress } from "@ark-ui/react/progress"
import { cn } from "@/lib/utils"

function ProgressRoot({
  className,
  value,
  ...props
}: React.ComponentProps<typeof Progress.Root>) {
  return (
    <Progress.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      value={value}
      {...props}
    >
      <Progress.Track>
        <Progress.Range
          data-slot="progress-indicator"
          className="bg-primary h-full w-full flex-1 transition-all"
        />
      </Progress.Track>
    </Progress.Root>
  )
}

export { ProgressRoot as Progress }
