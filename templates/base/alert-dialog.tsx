"use client"

import * as React from "react"
import { AlertDialog } from "@base-ui/react/alert-dialog"
import { cn } from "@/lib/utils"

const AlertDialogRoot = AlertDialog.Root
const AlertDialogTrigger = AlertDialog.Trigger
const AlertDialogAction = AlertDialog.Action
const AlertDialogCancel = AlertDialog.Cancel

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Popup>
>(({ className, children, ...props }, ref) => (
  <AlertDialog.Portal>
    <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <AlertDialog.Popup
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </AlertDialog.Popup>
  </AlertDialog.Portal>
))
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Title>
>(({ className, ...props }, ref) => (
  <AlertDialog.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
))
AlertDialogTitle.displayName = "AlertDialogTitle"
const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Description>
>(({ className, ...props }, ref) => (
  <AlertDialog.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

export {
  AlertDialogRoot as AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
