"use client"

import * as React from "react"
import { X, ChevronDown, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
  fixed?: boolean
  disabled?: boolean
  group?: string
}

export interface MultipleSelectorProps {
  value?: Option[]
  defaultValue?: Option[]
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  onChange?: (options: Option[]) => void
  onSearch?: (value: string) => Promise<Option[]>
  creatable?: boolean
  maxSelected?: number
  onMaxSelected?: (maxLimit: number) => void
  className?: string
  badgeClassName?: string
  // Loading and message props
  loadingIndicator?: React.ReactNode
  emptyIndicator?: React.ReactNode
  searchDelay?: number
  hidePlaceholderWhenSelected?: boolean
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const MultipleSelector = React.forwardRef<HTMLDivElement, MultipleSelectorProps>(
  (
    {
      value,
      defaultValue = [],
      options = [],
      placeholder = "Select options...",
      disabled,
      onChange,
      onSearch,
      creatable = false,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      className,
      badgeClassName,
      loadingIndicator,
      emptyIndicator,
      searchDelay = 300,
      hidePlaceholderWhenSelected = false,
    },
    ref
  ) => {
    const [searchValue, setSearchValue] = React.useState("")
    const [isOpen, setIsOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    // Use controlled value if provided, otherwise use internal state
    const [internalSelectedOptions, setInternalSelectedOptions] = React.useState<Option[]>(defaultValue)
    const selectedOptions = value !== undefined ? value : internalSelectedOptions

    // Use provided options or internal state for available options
    const [internalAvailableOptions, setInternalAvailableOptions] = React.useState(options)
    const availableOptions = onSearch ? internalAvailableOptions : options

    // Debounced search value for async search
    const debouncedSearchValue = useDebounce(searchValue, searchDelay)

    // Handle debounced async search
    React.useEffect(() => {
      if (!onSearch || !debouncedSearchValue.trim()) {
        setIsLoading(false)
        return
      }

      const performSearch = async () => {
        setIsLoading(true)
        try {
          const results = await onSearch(debouncedSearchValue)
          setInternalAvailableOptions(results)
        } catch (error) {
          console.error('Search error:', error)
          setInternalAvailableOptions([])
        } finally {
          setIsLoading(false)
        }
      }

      performSearch()
    }, [debouncedSearchValue, onSearch])

    // Handle clicks outside to close dropdown
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = React.useCallback((option: Option) => {
      if (selectedOptions.length >= maxSelected) {
        onMaxSelected?.(maxSelected)
        return
      }

      const newSelected = [...selectedOptions, option]
      if (value === undefined) {
        setInternalSelectedOptions(newSelected)
      }
      onChange?.(newSelected)
      setSearchValue("")
      setIsOpen(false)
      
      // Focus back on input after selection
      setTimeout(() => inputRef.current?.focus(), 0)
    }, [selectedOptions, maxSelected, onMaxSelected, onChange, value])

    const handleRemove = React.useCallback((optionToRemove: Option) => {
      if (optionToRemove.fixed) return

      const newSelected = selectedOptions.filter(
        option => option.value !== optionToRemove.value
      )
      if (value === undefined) {
        setInternalSelectedOptions(newSelected)
      }
      onChange?.(newSelected)
    }, [selectedOptions, onChange, value])

    const handleSearch = React.useCallback((value: string) => {
      setSearchValue(value)
      setIsOpen(true)
      
      // For non-async search, filter immediately
      if (!onSearch && value.trim()) {
        setIsLoading(false)
      }
    }, [onSearch])

    const handleCreateOption = React.useCallback(() => {
      if (!searchValue.trim()) return

      const newOption: Option = {
        value: searchValue.toLowerCase(),
        label: searchValue.trim(),
      }

      handleSelect(newOption)
    }, [searchValue, handleSelect])

    const handleInputFocus = () => {
      setIsOpen(true)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    // Filter and group options
    const filteredOptions = React.useMemo(() => {
      return availableOptions.filter(option => 
        !selectedOptions.some(selected => selected.value === option.value) &&
        (searchValue === "" || option.label.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }, [availableOptions, selectedOptions, searchValue])

    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, Option[]> = {}
      
      filteredOptions.forEach(option => {
        const group = option.group || "Options"
        if (!groups[group]) {
          groups[group] = []
        }
        groups[group].push(option)
      })

      return groups
    }, [filteredOptions])

    const hasOptions = Object.keys(groupedOptions).length > 0
    const showCreateOption = creatable && searchValue.trim() && !filteredOptions.some(opt => opt.label.toLowerCase() === searchValue.toLowerCase())

    // Default loading indicator
    const defaultLoadingIndicator = (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Searching...</span>
      </div>
    )

    // Default empty indicator
    const defaultEmptyIndicator = (
      <div className="px-2 py-1.5 text-sm text-muted-foreground">
        No options available
      </div>
    )

    return (
      <div ref={ref} className="relative">
        <div
          ref={containerRef}
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          onClick={() => {
            if (!disabled) {
              inputRef.current?.focus()
              setIsOpen(true)
            }
          }}
        >
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className={cn(
                "gap-1 pr-0.5",
                option.fixed && "bg-muted hover:bg-muted",
                option.disabled && "bg-muted-foreground text-muted hover:bg-muted-foreground",
                badgeClassName
              )}
            >
              <span className="text-xs">{option.label}</span>
              {!option.fixed && (
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleRemove(option)
                  }}
                  disabled={disabled}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </Badge>
          ))}
          <Input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="h-6 flex-1 border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
            placeholder={
              hidePlaceholderWhenSelected && selectedOptions.length > 0 
                ? "" 
                : selectedOptions.length === 0 
                  ? placeholder 
                  : ""
            }
          />
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          >
            {isLoading ? (
              loadingIndicator || defaultLoadingIndicator
            ) : hasOptions ? (
              Object.entries(groupedOptions).map(([group, options]) => (
                <div key={group}>
                  {group !== "Options" && (
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      {group}
                    </div>
                  )}
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                        "hover:bg-accent hover:text-accent-foreground",
                        option.disabled && "pointer-events-none opacity-50"
                      )}
                      onClick={() => !option.disabled && handleSelect(option)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              ))
            ) : showCreateOption ? (
              <div
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={handleCreateOption}
              >
                Create "{searchValue}"
              </div>
            ) : (
              emptyIndicator || defaultEmptyIndicator
            )}
            {hasOptions && showCreateOption && (
              <div
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={handleCreateOption}
              >
                Create "{searchValue}"
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

MultipleSelector.displayName = "MultipleSelector" 