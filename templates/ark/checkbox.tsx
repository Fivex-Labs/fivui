"use client"

import * as React from "react"
import { Checkbox } from "@ark-ui/react/checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const CheckboxRoot = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Checkbox.Root>
>(({ className, ...props }, ref) => (
  <Checkbox.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <Checkbox.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </Checkbox.Indicator>
  </Checkbox.Root>
))
CheckboxRoot.displayName = "Checkbox"

export { CheckboxRoot as Checkbox }
