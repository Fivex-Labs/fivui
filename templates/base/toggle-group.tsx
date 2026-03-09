"use client"

import * as React from "react"
import { ToggleGroup } from "@base-ui/react/toggle-group"
import { cn } from "@/lib/utils"

const ToggleGroupRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ToggleGroup.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroup.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    data-slot="toggle-group"
    {...props}
  />
))
ToggleGroupRoot.displayName = "ToggleGroup"

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof ToggleGroup.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroup.Item
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
      className
    )}
    data-slot="toggle-group-item"
    {...props}
  />
))
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroupRoot as ToggleGroup, ToggleGroupItem }
