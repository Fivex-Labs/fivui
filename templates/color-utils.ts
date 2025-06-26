// @ts-ignore - This dependency will be installed when the component is added
import { formatHex, oklch, rgb, parse } from 'culori'

// Convert any color to OKLCH format
export function toOklch(color: string): string {
  try {
    // Parse the color first
    let parsed
    
    if (color.startsWith('oklch(')) {
      // Already in OKLCH format, return as-is
      return color
    } else if (color.startsWith('#')) {
      // Hex format
      parsed = parse(color)
    } else if (color.startsWith('rgb(')) {
      // RGB format
      parsed = rgb(color)
    } else {
      // Try to parse as any supported format
      parsed = oklch(color)
    }
    
    if (!parsed) {
      throw new Error('Invalid color format')
    }
    
    // Convert to OKLCH
    const oklchColor = oklch(parsed)
    if (!oklchColor) {
      throw new Error('Failed to convert to OKLCH')
    }
    
    // Format as CSS OKLCH string
    const { l = 0, c = 0, h = 0 } = oklchColor
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`
  } catch (error) {
    console.warn('Failed to convert color to OKLCH:', color, error)
    return 'oklch(0.5 0 0)' // fallback
  }
}

// Convert OKLCH to HEX for color picker display
export function oklchToHex(oklchString: string): string {
  try {
    // Parse OKLCH string
    const match = oklchString.match(/oklch\(([^)]+)\)/)
    if (!match) {
      throw new Error('Invalid OKLCH format')
    }
    
    const values = match[1].split(' ').map(v => parseFloat(v.trim()))
    if (values.length < 3) {
      throw new Error('Insufficient OKLCH values')
    }
    
    const [l, c, h] = values
    const oklchColor = { mode: 'oklch' as const, l, c, h }
    
    // Convert to HEX
    const hexColor = oklchColor ? formatHex(oklchColor) : null
    return hexColor ?? '#000000'
  } catch (error) {
    console.warn('Failed to convert OKLCH to HEX:', oklchString, error)
    return '#000000' // fallback
  }
}

// Convert HEX to OKLCH
export function hexToOklch(hexString: string): string {
  return toOklch(hexString)
}

// Convert RGB to OKLCH
export function rgbToOklch(rgbString: string): string {
  return toOklch(rgbString)
}

// Validate color string
export function isValidColor(color: string): boolean {
  try {
    if (color.startsWith('oklch(')) {
      const match = color.match(/oklch\(([^)]+)\)/)
      if (!match) return false
      
      const values = match[1].split(' ').map(v => parseFloat(v.trim()))
      return values.length >= 3 && values.every(v => !isNaN(v))
    }
    
    const parsed = parse(color)
    return Boolean(parsed)
  } catch {
    return false
  }
}

// Get contrasting text color for a given background color
export function getContrastColor(backgroundColor: string): string {
  try {
    const oklchColor = oklch(toOklch(backgroundColor))
    if (!oklchColor) return 'oklch(0 0 0)'
    
    // If lightness is high, return dark text, otherwise light text
    return oklchColor.l != null && oklchColor.l > 0.5 ? 'oklch(0 0 0)' : 'oklch(1 0 0)'
  } catch {
    return 'oklch(0 0 0)'
  }
} 