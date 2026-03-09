"use client"

import * as React from "react"
import { Switch } from "@ark-ui/react/switch"
import { cn } from "@/lib/utils"

const SwitchRoot = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Switch.Root> & { onCheckedChange?: (checked: boolean) => void }
>(({ className, onCheckedChange, ...props }, ref) => (
  <Switch.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    onCheckedChange={(e) => onCheckedChange?.(e.checked)}
    {...props}
    ref={ref}
  >
    <Switch.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </Switch.Root>
))
SwitchRoot.displayName = "Switch"

export { SwitchRoot as Switch }
