"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function ButtonGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="button-group"
      role="group"
      className={cn(
        "inline-flex items-center rounded-md [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:rounded-none [&>*:not(:first-child)]:border-l-0",
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup }
