"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const AspectRatio = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { ratio?: number }
>(({ className, ratio = 1, style, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative w-full", className)}
    style={{ paddingBottom: `${100 / ratio}%`, ...style }}
    {...props}
  >
    <div className="absolute inset-0">{children}</div>
  </div>
))
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
