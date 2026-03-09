"use client"

import * as React from "react"
import { HoverCard } from "@ark-ui/react/hover-card"
import { cn } from "@/lib/utils"

function HoverCardRoot(props: React.ComponentProps<typeof HoverCard.Root>) {
  return <HoverCard.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger(props: React.ComponentProps<typeof HoverCard.Trigger>) {
  return <HoverCard.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCard.Content> & { align?: "start" | "center" | "end"; sideOffset?: number }) {
  return (
    <HoverCard.Positioner>
      <HoverCard.Content
        data-slot="hover-card-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </HoverCard.Positioner>
  )
}

export { HoverCardRoot as HoverCard, HoverCardTrigger, HoverCardContent }
