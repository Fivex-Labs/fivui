"use client"

import * as React from "react"
import { Accordion as BaseAccordion } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = BaseAccordion.Root

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Item>
>(({ className, ...props }, ref) => (
  <BaseAccordion.Item ref={ref} className={cn("border-b", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <BaseAccordion.Header className="flex">
    <BaseAccordion.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </BaseAccordion.Trigger>
  </BaseAccordion.Header>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Panel>
>(({ className, children, ...props }, ref) => (
  <BaseAccordion.Panel
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[closed]:animate-accordion-up data-[open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </BaseAccordion.Panel>
))
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
