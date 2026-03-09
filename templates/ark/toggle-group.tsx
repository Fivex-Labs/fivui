"use client"

import * as React from "react"
import { ToggleGroup } from "@ark-ui/react/toggle-group"
import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<{ variant?: "default" | "outline"; size?: "default" | "sm" | "lg" }>({})

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
>(({ className, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  return (
    <ToggleGroup.Item
      ref={ref}
      className={cn(
        toggleVariants({ variant: context.variant, size: context.size }),
        className
      )}
      data-slot="toggle-group-item"
      {...props}
    />
  )
})
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroupRoot as ToggleGroup, ToggleGroupItem }
