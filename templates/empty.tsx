"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Empty({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function EmptyIcon({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty-icon"
      className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted", className)}
      {...props}
    />
  )
}

function EmptyTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="empty-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function EmptyDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="empty-description"
      className={cn("mt-2 text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Empty, EmptyIcon, EmptyTitle, EmptyDescription }
