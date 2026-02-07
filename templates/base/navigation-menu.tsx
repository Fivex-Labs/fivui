"use client"

import * as React from "react"
import { NavigationMenu } from "@base-ui/react/navigation-menu"
import { cn } from "@/lib/utils"

const NavigationMenuRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof NavigationMenu.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenu.Root
    ref={ref}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    data-slot="navigation-menu"
    {...props}
  >
    {children}
  </NavigationMenu.Root>
))
NavigationMenuRoot.displayName = "NavigationMenu"

const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<typeof NavigationMenu.List>
>(({ className, ...props }, ref) => (
  <NavigationMenu.List
    ref={ref}
    className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
    data-slot="navigation-menu-list"
    {...props}
  />
))
NavigationMenuList.displayName = "NavigationMenuList"

const NavigationMenuItem = NavigationMenu.Item
const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof NavigationMenu.Trigger>
>(({ className, ...props }, ref) => (
  <NavigationMenu.Trigger
    ref={ref}
    className={cn(
      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent data-[active]:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    data-slot="navigation-menu-trigger"
    {...props}
  />
))
NavigationMenuTrigger.displayName = "NavigationMenuTrigger"

const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof NavigationMenu.Panel>
>(({ className, ...props }, ref) => (
  <NavigationMenu.Panel
    ref={ref}
    className={cn(
      "absolute left-0 top-full flex justify-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    data-slot="navigation-menu-content"
    {...props}
  />
))
NavigationMenuContent.displayName = "NavigationMenuContent"

const NavigationMenuLink = NavigationMenu.Link

export {
  NavigationMenuRoot as NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
}
