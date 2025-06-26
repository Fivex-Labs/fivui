"use client"

import * as React from "react"
import InputMask from "react-input-mask"
// @ts-ignore - Template file, path will resolve in user project
import { cn } from "@/lib/utils"

export interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /**
   * The mask pattern to apply
   * Examples:
   * - Phone: "(999) 999-9999"
   * - Date: "99/99/9999"
   * - Credit Card: "9999 9999 9999 9999"
   * - Currency: "999,999.99"
   */
  mask: string
  /**
   * Character to use for placeholder in mask
   * @default "9"
   */
  maskChar?: string
  /**
   * Whether to show the mask characters
   * @default true
   */
  showMask?: boolean
  /**
   * Value change handler
   */
  onChange?: (value: string) => void
  /**
   * Whether to format the value on blur
   * @default false
   */
  formatOnBlur?: boolean
  /**
   * Whether to parse the value on focus
   * @default false
   */
  parseOnFocus?: boolean
  /**
   * Whether to keep the cursor position when typing
   * @default true
   */
  keepCharPositions?: boolean
  /**
   * Whether to allow empty values
   * @default false
   */
  allowEmpty?: boolean
  /**
   * Whether to validate the input
   * @default false
   */
  validate?: boolean
  /**
   * Custom validation function
   */
  onValidation?: (value: string) => boolean
  /**
   * Error state
   */
  error?: boolean
  /**
   * Error message
   */
  errorMessage?: string
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ 
    className, 
    type,
    mask,
    maskChar = "9",
    showMask = true,
    onChange,
    formatOnBlur = false,
    parseOnFocus = false,
    keepCharPositions = true,
    allowEmpty = false,
    validate = false,
    onValidation,
    error = false,
    errorMessage,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(props.value || "")
    const [isValid, setIsValid] = React.useState(true)

    // Handle value changes
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      
      // Validate if needed
      if (validate && onValidation) {
        const valid = onValidation(newValue)
        setIsValid(valid)
      }
      
      // Call external onChange
      onChange?.(newValue)
    }, [onChange, validate, onValidation])

    // Handle blur for formatting
    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (formatOnBlur) {
        // Additional formatting logic can be added here
        const formattedValue = e.target.value
        setInternalValue(formattedValue)
        onChange?.(formattedValue)
      }
      
      // Call original onBlur
      props.onBlur?.(e)
    }, [formatOnBlur, onChange, props.onBlur])

    // Handle focus for parsing
    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (parseOnFocus) {
        // Additional parsing logic can be added here
        const parsedValue = e.target.value
        setInternalValue(parsedValue)
        onChange?.(parsedValue)
      }
      
      // Call original onFocus
      props.onFocus?.(e)
    }, [parseOnFocus, onChange, props.onFocus])

    // Update internal value when external value changes
    React.useEffect(() => {
      if (props.value !== undefined) {
        setInternalValue(props.value as string)
      }
    }, [props.value])

    return (
      <div className="space-y-1">
        <InputMask
          ref={ref}
          mask={mask}
          maskChar={showMask ? maskChar : ""}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          keepCharPositions={keepCharPositions}
          beforeMaskedValueChange={(newState, oldState, userInput) => {
            // Handle empty value allowance
            if (!allowEmpty && userInput === "") {
              return oldState
            }
            return newState
          }}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
        {validate && !isValid && !error && (
          <p className="text-sm text-destructive">Invalid format</p>
        )}
      </div>
    )
  }
)
MaskedInput.displayName = "MaskedInput"

export { MaskedInput } 