"use client"

import * as React from "react"
import { ContextMenu } from "@base-ui/react/context-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function ContextMenuRoot(props: React.ComponentProps<typeof ContextMenu.Root>) {
  return <ContextMenu.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger(props: React.ComponentProps<typeof ContextMenu.Trigger>) {
  return <ContextMenu.Trigger data-slot="context-menu-trigger" {...props} />
}

function ContextMenuPortal(props: React.ComponentProps<typeof ContextMenu.Portal>) {
  return <ContextMenu.Portal data-slot="context-menu-portal" {...props} />
}

const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ContextMenu.Popup>
>(({ className, ...props }, ref) => (
  <ContextMenu.Positioner>
    <ContextMenu.Popup
      ref={ref}
      data-slot="context-menu-content"
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </ContextMenu.Positioner>
))
ContextMenuContent.displayName = "ContextMenuContent"

const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ContextMenu.Item>
>(({ className, ...props }, ref) => (
  <ContextMenu.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
))
ContextMenuItem.displayName = "ContextMenuItem"

const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ContextMenu.CheckboxItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenu.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ContextMenu.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <CheckIcon className="h-4 w-4" />
    </ContextMenu.ItemIndicator>
  </ContextMenu.CheckboxItem>
))
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem"

const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ContextMenu.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenu.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
ContextMenuSeparator.displayName = "ContextMenuSeparator"

export {
  ContextMenuRoot as ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuSeparator,
}
