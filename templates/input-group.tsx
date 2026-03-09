"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function InputGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex h-9 w-full items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] [&>input]:border-0 [&>input]:bg-transparent [&>input]:focus-visible:ring-0 [&>input]:focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  )
}

export { InputGroup }
