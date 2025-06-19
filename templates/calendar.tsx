"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Whether to show dropdowns for month and year selection
   * @default false
   */
  showDropdowns?: boolean
  /**
   * Whether to allow month selection via dropdown
   * @default true
   */
  allowMonthDropdown?: boolean
  /**
   * Whether to allow year selection via dropdown  
   * @default true
   */
  allowYearDropdown?: boolean
  /**
   * Start month for navigation range
   */
  fromMonth?: Date
  /**
   * End month for navigation range
   */
  toMonth?: Date
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showDropdowns = false,
  allowMonthDropdown = true,
  allowYearDropdown = true,
  fromMonth,
  toMonth,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  // Determine caption layout based on props
  const getCaptionLayout = () => {
    if (!showDropdowns) return "label"
    if (allowMonthDropdown && allowYearDropdown) return "dropdown"
    if (allowMonthDropdown && !allowYearDropdown) return "dropdown-months"
    if (!allowMonthDropdown && allowYearDropdown) return "dropdown-years"
    return "label"
  }

  // Set default range if dropdowns are enabled and no range is provided
  const startMonth = fromMonth || (showDropdowns ? new Date(new Date().getFullYear() - 100, 0) : undefined)
  const endMonth = toMonth || (showDropdowns ? new Date(new Date().getFullYear() + 10, 11) : undefined)

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={getCaptionLayout()}
      startMonth={startMonth}
      endMonth={endMonth}
      formatters={{
        formatMonthDropdown: (date) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return months[date.getMonth()];
        },
      }}
      className={cn("p-3", className)}
      classNames={{
        root: cn(defaultClassNames.root, "rdp"),
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: cn("text-sm font-medium flex-1 text-center", showDropdowns && "hidden"),
        dropdowns: "flex justify-center gap-2 items-center flex-1",
        months_dropdown: cn(
          "flex h-8 w-16 items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50"
        ),
        years_dropdown: cn(
          "flex h-8 w-20 items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50"
        ),
        nav: "space-x-1 flex items-center justify-between w-full",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          showDropdowns && "hidden"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          showDropdowns && "hidden"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-range-start)]:rounded-l-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_end: "day-range-end rounded-l-none rounded-r-md",
        range_start: "day-range-start rounded-r-none rounded-l-md", 
        range_middle: "day-range-middle rounded-none bg-accent text-accent-foreground",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground rounded-md",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 