"use client"

import * as React from "react"
import { Menubar } from "@base-ui/react/menubar"
import { cn } from "@/lib/utils"

const MenubarRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Menubar.Root>
>(({ className, ...props }, ref) => (
  <Menubar.Root
    ref={ref}
    className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
    data-slot="menubar"
    {...props}
  />
))
MenubarRoot.displayName = "Menubar"

const MenubarMenu = Menubar.Menu
const MenubarTrigger = Menubar.Trigger
const MenubarPortal = Menubar.Portal
const MenubarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Menubar.Popup>
>(({ className, ...props }, ref) => (
  <Menubar.Positioner>
    <Menubar.Popup
      ref={ref}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
        className
      )}
      {...props}
    />
  </Menubar.Positioner>
))
MenubarContent.displayName = "MenubarContent"

const MenubarItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Menubar.Item>
>(({ className, ...props }, ref) => (
  <Menubar.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = "MenubarItem"

export { MenubarRoot as Menubar, MenubarMenu, MenubarTrigger, MenubarPortal, MenubarContent, MenubarItem }
