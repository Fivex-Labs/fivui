"use client"

import * as React from "react"
import { Avatar } from "@ark-ui/react/avatar"
import { cn } from "@/lib/utils"

const AvatarRoot = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof Avatar.Root>
>(({ className, ...props }, ref) => (
  <Avatar.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
AvatarRoot.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<typeof Avatar.Image>
>(({ className, ...props }, ref) => (
  <Avatar.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof Avatar.Fallback>
>(({ className, ...props }, ref) => (
  <Avatar.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { AvatarRoot as Avatar, AvatarImage, AvatarFallback }
