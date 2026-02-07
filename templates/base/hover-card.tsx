"use client"

import * as React from "react"
import { PreviewCard } from "@base-ui/react/preview-card"
import { cn } from "@/lib/utils"

function HoverCardRoot(props: React.ComponentProps<typeof PreviewCard.Root>) {
  return <PreviewCard.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger(props: React.ComponentProps<typeof PreviewCard.Trigger>) {
  return <PreviewCard.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PreviewCard.Popup> & { align?: "start" | "center" | "end"; sideOffset?: number }) {
  return (
    <PreviewCard.Portal>
      <PreviewCard.Positioner sideOffset={sideOffset} alignment={align}>
        <PreviewCard.Popup
          data-slot="hover-card-content"
          className={cn(
            "bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        />
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  )
}

export { HoverCardRoot as HoverCard, HoverCardTrigger, HoverCardContent }
