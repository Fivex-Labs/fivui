"use client"

import * as React from "react"
import { Tooltip } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

const TooltipRoot = Tooltip.Root
const TooltipTrigger = Tooltip.Trigger

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Tooltip.Popup> & { sideOffset?: number }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Tooltip.Positioner sideOffset={sideOffset}>
    <Tooltip.Popup
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </Tooltip.Positioner>
))
TooltipContent.displayName = "TooltipContent"

export { TooltipRoot as Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
