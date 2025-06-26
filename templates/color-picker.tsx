"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// @ts-ignore - Template file, path will resolve in user project
import { cn } from "@/lib/utils"
// @ts-ignore - Template file, path will resolve in user project
import { oklchToHex, hexToOklch, rgbToOklch, isValidColor, toOklch } from "@/components/ui/color-utils"

export interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  /**
   * Which color format tabs to show
   * @default ['oklch', 'hex', 'rgb']
   */
  formats?: Array<'hex' | 'rgb' | 'oklch'>
  /**
   * Default format tab to show
   * @default 'oklch'
   */
  defaultFormat?: 'hex' | 'rgb' | 'oklch'
  /**
   * Whether to show the OKLCH sliders
   * @default true
   */
  showSliders?: boolean
  /**
   * Whether to show the color preview
   * @default true
   */
  showPreview?: boolean
  /**
   * Size of the color picker button
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean
}

// Parse OKLCH string to components
function parseOklch(oklchString: string): { l: number; c: number; h: number } {
  const match = oklchString.match(/oklch\(([^)]+)\)/)
  if (!match) return { l: 0.5, c: 0.1, h: 0 }
  
  const parts = match[1].split(/\s+/)
  return {
    l: parseFloat(parts[0]) || 0.5,
    c: parseFloat(parts[1]) || 0.1,
    h: parseFloat(parts[2]) || 0
  }
}

// Create OKLCH string from components
function createOklch(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`
}

const ColorPicker = React.forwardRef<
  HTMLButtonElement,
  ColorPickerProps
>(({ 
  value, 
  onChange, 
  className,
  formats = ['oklch', 'hex', 'rgb'],
  defaultFormat = 'oklch',
  showSliders = true,
  showPreview = true,
  size = 'default',
  disabled = false
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)
  
  // Ensure default format is available in the formats array
  const availableFormats = formats.length > 0 ? formats : ['oklch']
  const initialFormat = availableFormats.includes(defaultFormat) ? defaultFormat : availableFormats[0]
  
  const [inputType, setInputType] = React.useState<'hex' | 'rgb' | 'oklch'>(initialFormat)
  const [tempValue, setTempValue] = React.useState(value)
  
  // Parse OKLCH components for sliders
  const { l, c, h } = parseOklch(tempValue)
  const [lightness, setLightness] = React.useState(l)
  const [chroma, setChroma] = React.useState(c)
  const [hue, setHue] = React.useState(h)

  // Update OKLCH when sliders change
  const updateOklchFromSliders = React.useCallback((newL: number, newC: number, newH: number) => {
    const newOklch = createOklch(newL, newC, newH)
    setTempValue(newOklch)
    handleTypeChange(inputType, newOklch)
  }, [inputType])

  // Update input value when type changes
  const handleTypeChange = React.useCallback((newType: 'hex' | 'rgb' | 'oklch', oklchValue?: string) => {
    setInputType(newType)
    const valueToConvert = oklchValue || tempValue
    
    try {
      if (newType === 'hex') {
        setInputValue(oklchToHex(valueToConvert))
      } else if (newType === 'rgb') {
        // Convert OKLCH to RGB format
        const hexColor = oklchToHex(valueToConvert)
        const r = parseInt(hexColor.slice(1, 3), 16)
        const g = parseInt(hexColor.slice(3, 5), 16)
        const b = parseInt(hexColor.slice(5, 7), 16)
        setInputValue(`rgb(${r}, ${g}, ${b})`)
      } else {
        setInputValue(valueToConvert)
      }
    } catch {
      setInputValue(valueToConvert)
    }
  }, [tempValue])

  const handleInputChange = React.useCallback((newValue: string) => {
    setInputValue(newValue)
    
    let oklchValue: string
    if (inputType === 'hex') {
      oklchValue = hexToOklch(newValue)
    } else if (inputType === 'rgb') {
      oklchValue = rgbToOklch(newValue)
    } else {
      // Validate OKLCH format
      if (isValidColor(newValue)) {
        oklchValue = toOklch(newValue)
      } else {
        oklchValue = tempValue // Keep previous value if invalid
      }
    }
    
    setTempValue(oklchValue)
    const components = parseOklch(oklchValue)
    setLightness(components.l)
    setChroma(components.c)
    setHue(components.h)
  }, [inputType, tempValue])

  const handleConfirm = React.useCallback(() => {
    onChange(tempValue)
    setIsOpen(false)
  }, [onChange, tempValue])

  const handleCancel = React.useCallback(() => {
    setTempValue(value)
    setInputValue(value)
    const components = parseOklch(value)
    setLightness(components.l)
    setChroma(components.c)
    setHue(components.h)
    setIsOpen(false)
  }, [value])

  // Update sliders when tempValue changes externally
  React.useEffect(() => {
    const components = parseOklch(tempValue)
    setLightness(components.l)
    setChroma(components.c)
    setHue(components.h)
  }, [tempValue])

  // Format labels for display
  const formatLabels = {
    oklch: 'OKLCH',
    hex: 'HEX',
    rgb: 'RGB'
  }

  // Format placeholders
  const formatPlaceholders = {
    oklch: 'oklch(0.5 0.1 180)',
    hex: '#000000',
    rgb: 'rgb(0, 0, 0)'
  }

  // Size classes for the button
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          className={cn(
            "p-0 rounded-md border-2",
            sizeClasses[size],
            className
          )}
          style={{ backgroundColor: oklchToHex(value) }}
          disabled={disabled}
        >
          <span className="sr-only">Pick color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          {/* OKLCH Sliders */}
          {showSliders && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">OKLCH Color Picker</Label>
              
              {/* Lightness Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Lightness (L)</Label>
                  <span className="text-xs text-muted-foreground">{lightness.toFixed(3)}</span>
                </div>
                <Slider
                  value={[lightness]}
                  onValueChange={([newL]) => {
                    setLightness(newL)
                    updateOklchFromSliders(newL, chroma, hue)
                  }}
                  min={0}
                  max={1}
                  step={0.001}
                  className="w-full"
                />
                <div 
                  className="h-4 rounded-sm border"
                  style={{
                    background: `linear-gradient(to right, 
                      oklch(0 ${chroma} ${hue}), 
                      oklch(0.5 ${chroma} ${hue}), 
                      oklch(1 ${chroma} ${hue}))`
                  }}
                />
              </div>

              {/* Chroma Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Chroma (C)</Label>
                  <span className="text-xs text-muted-foreground">{chroma.toFixed(3)}</span>
                </div>
                <Slider
                  value={[chroma]}
                  onValueChange={([newC]) => {
                    setChroma(newC)
                    updateOklchFromSliders(lightness, newC, hue)
                  }}
                  min={0}
                  max={0.4}
                  step={0.001}
                  className="w-full"
                />
                <div 
                  className="h-4 rounded-sm border"
                  style={{
                    background: `linear-gradient(to right, 
                      oklch(${lightness} 0 ${hue}), 
                      oklch(${lightness} 0.2 ${hue}), 
                      oklch(${lightness} 0.4 ${hue}))`
                  }}
                />
              </div>

              {/* Hue Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Hue (H)</Label>
                  <span className="text-xs text-muted-foreground">{hue.toFixed(1)}°</span>
                </div>
                <Slider
                  value={[hue]}
                  onValueChange={([newH]) => {
                    setHue(newH)
                    updateOklchFromSliders(lightness, chroma, newH)
                  }}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
                <div 
                  className="h-4 rounded-sm border"
                  style={{
                    background: `linear-gradient(to right, 
                      oklch(${lightness} ${chroma} 0), 
                      oklch(${lightness} ${chroma} 60), 
                      oklch(${lightness} ${chroma} 120), 
                      oklch(${lightness} ${chroma} 180), 
                      oklch(${lightness} ${chroma} 240), 
                      oklch(${lightness} ${chroma} 300), 
                      oklch(${lightness} ${chroma} 360))`
                  }}
                />
              </div>
            </div>
          )}

          {/* Format Tabs and Input */}
          {availableFormats.length > 1 ? (
            <div>
              <Label className="text-sm font-medium">Color Input</Label>
              <Tabs value={inputType} onValueChange={(v) => handleTypeChange(v as 'hex' | 'rgb' | 'oklch')}>
                <TabsList className={cn(
                  "grid w-full",
                  availableFormats.length === 2 && "grid-cols-2",
                  availableFormats.length === 3 && "grid-cols-3"
                )}>
                  {availableFormats.map((format) => (
                    <TabsTrigger key={format} value={format}>
                      {formatLabels[format]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {availableFormats.map((format) => (
                  <TabsContent key={format} value={format}>
                    <Input
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={formatPlaceholders[format]}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          ) : (
            <div>
              <Label className="text-sm font-medium">Color Input</Label>
              <Input
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={formatPlaceholders[availableFormats[0]]}
              />
            </div>
          )}

          {/* Color Preview */}
          {showPreview && (
            <div className="h-16 rounded-md border-2" style={{ backgroundColor: oklchToHex(tempValue) }} />
          )}

          {/* Confirmation Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleConfirm} className="flex-1">
              Apply
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})
ColorPicker.displayName = "ColorPicker"

export { ColorPicker } 