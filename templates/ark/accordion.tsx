"use client"

import * as React from "react"
import { Accordion } from "@ark-ui/react/accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionRoot = Accordion.Root

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Accordion.Item>
>(({ className, ...props }, ref) => (
  <Accordion.Item ref={ref} className={cn("border-b", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Accordion.ItemTrigger>
>(({ className, children, ...props }, ref) => (
  <div className="flex">
    <Accordion.ItemTrigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </Accordion.ItemTrigger>
  </div>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Accordion.ItemContent>
>(({ className, children, ...props }, ref) => (
  <Accordion.ItemContent
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)} style={{ ['--radix-accordion-content-height' as string]: 'var(--height, 0)' }}>{children}</div>
  </Accordion.ItemContent>
))
AccordionContent.displayName = "AccordionContent"

export { AccordionRoot as Accordion, AccordionItem, AccordionTrigger, AccordionContent }
