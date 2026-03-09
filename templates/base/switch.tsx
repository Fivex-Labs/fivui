"use client"

import * as React from "react"
import { Switch } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

const SwitchRoot = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Switch.Root> & { onCheckedChange?: (checked: boolean) => void }
>(({ className, onCheckedChange, ...props }, ref) => (
  <Switch.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-primary data-[unchecked]:bg-input",
      className
    )}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <Switch.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[checked]:translate-x-5 data-[unchecked]:translate-x-0"
      )}
    />
  </Switch.Root>
))
SwitchRoot.displayName = "Switch"

export { SwitchRoot as Switch }
