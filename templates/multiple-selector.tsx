"use client"

import * as React from "react"
import { X, Check, Loader2, ChevronsUpDown } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
  fixed?: boolean
  disabled?: boolean
  [key: string]: any
}

export interface MultipleSelectorProps {
  value?: Option[]
  defaultOptions?: Option[]
  options?: Option[]
  placeholder?: string
  hidePlaceholderWhenSelected?: boolean
  disabled?: boolean
  onChange?: (options: Option[]) => void
  delay?: number
  onSearch?: (value: string) => Promise<Option[]>
  onSearchSync?: (value: string) => Option[]
  triggerSearchOnFocus?: boolean
  creatable?: boolean
  groupBy?: string
  maxSelected?: number
  onMaxSelected?: (maxLimit: number) => void
  loadingIndicator?: React.ReactNode
  emptyIndicator?: React.ReactNode
  selectFirstItem?: boolean
  className?: string
  badgeClassName?: string
  hideClearAllButton?: boolean
}

export interface MultipleSelectorRef {
  selectedValue: Option[]
  input: HTMLInputElement | null
}

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
  (
    {
      value,
      defaultOptions = [],
      options: controlledOptions,
      placeholder = "Select options...",
      hidePlaceholderWhenSelected,
      disabled,
      onChange,
      delay = 500,
      onSearch,
      onSearchSync,
      triggerSearchOnFocus,
      creatable = false,
      groupBy,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      loadingIndicator,
      emptyIndicator,
      selectFirstItem = true,
      className,
      badgeClassName,
      hideClearAllButton = false,
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [selected, setSelected] = React.useState<Option[]>(value || [])
    const [options, setOptions] = React.useState<Option[]>(controlledOptions || defaultOptions)
    const [inputValue, setInputValue] = React.useState("")
    const debouncedInput = useDebounce(inputValue, delay)

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: selected,
        input: inputRef.current,
      }),
      [selected]
    )

    const handleUnselect = React.useCallback(
      (option: Option) => {
        if (option.fixed) return
        const newSelected = selected.filter((s) => s.value !== option.value)
        setSelected(newSelected)
        onChange?.(newSelected)
      },
      [selected, onChange]
    )

    const handleSelect = React.useCallback(
      (option: Option) => {
        if (selected.length >= maxSelected) {
          onMaxSelected?.(maxSelected)
          return
        }
        const newSelected = [...selected, option]
        setSelected(newSelected)
        onChange?.(newSelected)
        setInputValue("")
      },
      [selected, maxSelected, onMaxSelected, onChange]
    )

    const handleClearAll = () => {
      const nonFixedOptions = selected.filter((option) => !option.fixed)
      if (nonFixedOptions.length === 0) return
      const fixedOptions = selected.filter((option) => option.fixed)
      setSelected(fixedOptions)
      onChange?.(fixedOptions)
    }

    const createOption = (inputValue: string): Option => ({
      value: inputValue.toLowerCase(),
      label: inputValue,
    })

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace" && !inputValue && selected.length > 0) {
        e.preventDefault()
        const lastOption = selected[selected.length - 1]
        if (!lastOption.fixed) handleUnselect(lastOption)
      }

      if (e.key === "Enter" && creatable && inputValue) {
        e.preventDefault()
        const newOption = createOption(inputValue)
        handleSelect(newOption)
        setInputValue("")
      }
    }

    React.useEffect(() => {
      if (!onSearch && !onSearchSync) return

      const handleSearch = async () => {
        setIsLoading(true)
        try {
          let searchResults: Option[] = []
          if (onSearchSync) {
            searchResults = onSearchSync(debouncedInput)
          } else if (onSearch) {
            searchResults = await onSearch(debouncedInput)
          }
          setOptions(searchResults)
        } finally {
          setIsLoading(false)
        }
      }

      if (debouncedInput || triggerSearchOnFocus) {
        handleSearch()
      } else {
        setOptions(controlledOptions || defaultOptions)
      }
    }, [debouncedInput, onSearch, onSearchSync, triggerSearchOnFocus, controlledOptions, defaultOptions])

    const showPlaceholder = !hidePlaceholderWhenSelected || selected.length === 0

    const groupedOptions = React.useMemo(() => {
      if (!groupBy) return options

      return options.reduce((groups, option) => {
        const key = option[groupBy] || ""
        return {
          ...groups,
          [key]: [...(groups[key] || []), option],
        }
      }, {} as Record<string, Option[]>)
    }, [options, groupBy])

    return (
      <Command
        onKeyDown={handleKeyDown}
        className={cn(
          "overflow-visible bg-transparent",
          className
        )}
      >
        <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <div className="flex flex-wrap gap-1">
            {selected.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className={cn(
                  "data-[fixed=true]:bg-muted data-[fixed=true]:hover:bg-muted",
                  "data-[disabled=true]:bg-muted-foreground data-[disabled=true]:text-muted data-[disabled=true]:hover:bg-muted-foreground",
                  badgeClassName
                )}
                data-fixed={option.fixed}
                data-disabled={option.disabled}
              >
                {option.label}
                {!option.fixed && (
                  <button
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(option)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </Badge>
            ))}
            <CommandInput
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              placeholder={showPlaceholder ? placeholder : ""}
              disabled={disabled}
              className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandList className="max-h-[300px] overflow-y-auto p-1">
                {isLoading ? (
                  <CommandPrimitive.Loading>
                    {loadingIndicator || (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                  </CommandPrimitive.Loading>
                ) : (
                  <>
                    {!hideClearAllButton && selected.length > 0 && (
                      <>
                        <CommandItem
                          onSelect={handleClearAll}
                          className="justify-center text-center"
                        >
                          Clear all
                        </CommandItem>
                        <CommandSeparator />
                      </>
                    )}
                    {groupBy ? (
                      Object.entries(groupedOptions).map(([group, groupOptions]) => (
                        <CommandGroup key={group} heading={group || "Options"}>
                          {groupOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                              onSelect={() => handleSelect(option)}
                              className="flex items-center justify-between"
                            >
                              {option.label}
                              {selected.some((s) => s.value === option.value) && (
                                <Check className="h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))
                    ) : (
                      <CommandGroup>
                        {options.length === 0 && (
                          <CommandEmpty>
                            {emptyIndicator || (
                              <span>No options found.</span>
                            )}
                            {creatable && inputValue && (
                              <CommandItem
                                onSelect={() => handleSelect(createOption(inputValue))}
                              >
                                Create "{inputValue}"
                              </CommandItem>
                            )}
                          </CommandEmpty>
                        )}
                        {options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            onSelect={() => handleSelect(option)}
                            className="flex items-center justify-between"
                          >
                            {option.label}
                            {selected.some((s) => s.value === option.value) && (
                              <Check className="h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </div>
          )}
        </div>
      </Command>
    )
  }
)

MultipleSelector.displayName = "MultipleSelector"

export { MultipleSelector } 