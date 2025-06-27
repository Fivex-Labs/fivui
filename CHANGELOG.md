# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [v1.2.4] - 2025-01-17

### Added
- ✨ **Step Forms Component**: Comprehensive multi-step form component with advanced features
  - Multiple display variants: default (numbered circles), dots, and progress bar
  - Step validation system with optional/required step support
  - Interactive navigation with clickable step indicators
  - Smooth animations and transitions between steps
  - Both controlled and uncontrolled component patterns
  - Rich step information display (titles, descriptions, status indicators)
  - Customizable button text and navigation controls
  - Responsive design with horizontal/vertical orientation support
  - Built-in accessibility features and keyboard navigation
  - TypeScript interfaces for step configuration and validation

### Enhanced
- 🎨 **Component Registry**: Added registry entry for step-forms component
- 📦 **Dependencies**: Includes lucide-react icons and card/button components
- 🔧 **Template System**: Full template integration for seamless installation

## [v1.2.3] - 2025-01-17

### Fixed
- 🔧 **Multiple Selector Registry**: Updated registry dependencies to match template
  - Removed unused `cmdk` and `command` dependencies
  - Added missing `input` dependency
  - Kept `lucide-react` for icons and `badge` for selected options

## [v1.2.2] - 2025-01-17

### Fixed
- 🐛 **Dual Range Slider**: Fixed width issue where slider wasn't taking full width
- 🔧 **Component API**: Simplified Dual Range Slider API by removing redundant label props

## [v1.2.1] - 2025-01-17

### Added
- ✨ **Dual Range Slider Component**: New component for selecting a range of values
  - Custom labels with formatting support
  - Configurable label positioning (top/bottom)
  - Built on Radix UI's slider primitive for accessibility
  - Consistent styling with FivUI design system

- 🔍 **Multiple Selector Component**: Advanced multi-select component with rich features
  - Async and sync search support with debouncing
  - Option grouping capability
  - Creatable options support
  - Fixed and disabled options
  - Maximum selection limit
  - Custom styling for component and badges
  - Loading states for async operations
  - Full keyboard navigation
  - Clear all functionality
  - Placeholder control

### Enhanced
- 🎨 **Component Registry**: Added registry entries for new components
- 📦 **Dependencies**: Added necessary Radix UI primitives and other dependencies
- 🔧 **TypeScript Support**: Full type definitions for all new components

## [v0.5.3] - 2025-01-17

### Documentation
- ⚠️ **Development Warning**: Added prominent warning at top of README
- 📝 **Production Notice**: Clear messaging that library is not ready for production use
- 🚧 **Version Guidance**: Advising users to wait for stable v1.0.0 release
- 📋 **Transparency**: Setting proper expectations for early adopters

## [v0.5.2] - 2025-01-17

### Fixed
- 🐛 **Single Project Global Styles**: Fixed missing global styles generation for single (non-monorepo) projects
- 📁 **Directory Structure**: Added `src/styles/` directory creation for single projects
- 🎨 **Feature Parity**: Both monorepo and single projects now get the same CSS templates with accordion animations
- ✅ **Template System**: Verified template file system works correctly for both project types

### Technical Details
- Added `generateGlobalStyles()` call to `initSingleProject()` function
- Single projects now create `src/styles/globals.css` with full design tokens and animations
- Consistent behavior between monorepo (`packages/ui/src/styles/globals.css`) and single project setups

## [v0.5.1] - 2025-01-17

### Improved
- 🔧 **Template File Architecture**: Refactored CSS generation to use separate template files
- 📁 **Better Organization**: Moved global styles from inline strings to `templates/globals-v3.css` and `templates/globals-v4.css`
- 🧹 **Code Maintainability**: Reduced bundle size and improved code readability
- 📦 **Smaller Bundle**: CLI bundle reduced from 26.72 KB to 23.53 KB
- 🔄 **Template System**: Consistent approach for both component and CSS templates

### Technical Details
- Separated Tailwind v3 and v4 global styles into dedicated template files
- Added fallback mechanism if template files are missing
- Improved error handling with warning messages
- Consistent template path resolution across the codebase

## [v0.5.0] - 2025-01-17

### Added
- 🎵 **Accordion Component**: Complete accordion component with full shadcn/ui compatibility
- 🎛️ **Multiple Accordion Types**: Support for both `single` and `multiple` selection modes  
- 🎨 **Smooth Animations**: Built-in accordion expand/collapse animations for both Tailwind v3 and v4
- 🔧 **Auto-Dependencies**: Automatic installation of `@radix-ui/react-accordion` and `lucide-react`
- ♿ **Accessibility First**: WAI-ARIA compliant with proper keyboard navigation
- 🎯 **Feature Complete**: All accordion features from shadcn/ui including:
  - AccordionItem, AccordionTrigger, AccordionContent components
  - Collapsible functionality with `collapsible` prop
  - Default value support with `defaultValue`
  - Custom styling via `className` props
  - TypeScript support with proper ref forwarding

### Enhanced
- 📋 **Global Styles**: Added accordion animations to both Tailwind v3 and v4 setups
- 🎬 **Animation System**: Keyframe animations for smooth accordion transitions
- 🔄 **Registry System**: Seamless component installation via `fivui add accordion`

### Technical Details
- Uses `@radix-ui/react-accordion` as the accessible foundation
- ChevronDown icon from `lucide-react` with rotation animation
- CSS custom properties for Radix accordion height calculations
- Template-based architecture for easy customization

## [v0.4.1] - 2025-01-17

### Added
- ✨ **TailwindCSS Version Detection**: Automatic detection of TailwindCSS v3.x vs v4.x
- 🎯 **Smart Configuration**: fivui.json automatically configured based on Tailwind version
- 📋 **Version-Specific Setup Instructions**: Detailed setup guides for both v3 and v4
- 🎛️ **CLI Options**: Added `--tailwind-version` flag to `fivui init` command

### Changed  
- 🔧 **TailwindCSS v4.x Support**: Empty config path for v4 (no tailwind.config.js needed)
- 📝 **Setup Command**: Enhanced with version-specific instructions and examples
- 🎨 **Default Style**: Using "default" style instead of "new-york" as requested
- 🔍 **Better Detection**: Improved package.json parsing for version detection

### Technical Details
- TailwindCSS v4.x uses `@import "tailwindcss"` instead of `@tailwind` directives
- v4 uses CSS-first configuration with `@theme` directive
- v4 has automatic content detection (no paths configuration needed)
- v3 still requires traditional tailwind.config.js setup

## [v0.4.0] - 2025-01-17

### Added
- 🏢 **Monorepo Support**: Full support for pnpm, yarn, and npm workspaces
- 🎯 **Context-Aware Setup**: Automatic workspace detection and smart path resolution
- 📋 **fivui.json Configuration**: shadcn/ui compatible configuration system
- 🔧 **Enhanced CLI**: New `fivui init` command for project setup
- 🚀 **Cross-Workspace Imports**: Support for `@workspace/ui` imports in monorepos
- 📁 **Smart File Placement**: Components placed in correct locations based on project structure
- **Monorepo Templates** - Pre-configured setups for workspace projects
- **Cross-workspace Imports** - Support for `@workspace/ui` style imports

### Changed
- **CLI Architecture** - Now workspace-aware for all operations
- **Component Installation** - Uses fivui.json for path resolution
- **Version Bump** - Updated to v0.4.0
- **Build System** - Bundled CLI for better dependency management
- **Setup Flow** - Now requires `fivui init` before adding components
- 🔧 **TailwindCSS v4.x Support**: Empty config path for v4 (no tailwind.config.js needed)
- 📝 **Setup Command**: Enhanced with version-specific instructions and examples
- 🎨 **Default Style**: Using "default" style instead of "new-york" as requested
- 🔍 **Better Detection**: Improved package.json parsing for version detection

### Enhanced
- **Error Messages** - More helpful guidance for configuration issues
- **File Organization** - Proper separation of UI components and utilities
- **Import Instructions** - Context-aware import examples

### Notes
- Single projects: Use `fivui init` then `fivui add button`
- Monorepos: Automatic detection and proper workspace setup
- fivui.json defines project structure and aliases
- Backwards compatible with existing v0.3.0 usage patterns

## [0.3.0] - 2025-01-17

### Added
- Copy-paste component library CLI approach
- Template-based component system with separate .tsx files
- Registry system for component metadata and dependencies
- Smart CLI with TailwindCSS v4.x version detection
- Button component with full variant support (default, secondary, destructive, outline, ghost, link)
- Utils library with cn() function for class merging
- Automatic dependency installation per component
- File structure setup (src/components/ui/, src/lib/)
- Commander.js-based CLI replacing oclif
- Modern TypeScript configuration with strict mode
- Template file exclusion from TypeScript compilation

### Changed
- Switched from package-based to copy-paste component distribution
- Updated to TailwindCSS v4.x requirement only
- Replaced custom fivui colors with standard Tailwind design tokens
- Simplified CLI commands: `fivui setup` and `fivui add`
- Updated file structure to match modern React patterns
- Removed Vue/Angular support to focus on React/Next.js

### Removed
- Badge and Dialog components (focusing on Button first)
- Examples directory (separate showcase app planned)
- Custom fivui color scheme
- oclif CLI framework
- Package exports (no longer needed for copy-paste approach)
- TailwindCSS v3.x support

### Notes
- Components are now copied directly to user projects
- Users own and can modify all component code
- Template files use @ts-ignore for development-time imports
- Registry files define component dependencies and metadata

## [0.6.0] - 2024-12-28

### 🎨 Major Theming System Upgrade

**BREAKING CHANGES:**
- **Updated to OKLCH Color Format**: Migrated from HSL to modern OKLCH color format for better color accuracy and consistency with shadcn/ui
- **Default Base Color Changed**: Changed default from `slate` to `neutral` to match shadcn/ui defaults
- **Extended Color Palette**: Added chart colors (`--chart-1` through `--chart-5`) and sidebar colors for future components

### ✨ New Features
- **CSS Variables Toggle**: Added `--css-variables` / `--no-css-variables` CLI options for theming approach selection
- **Multiple Base Color Support**: Full support for `slate`, `gray`, `zinc`, `neutral`, and `stone` base colors
- **Enhanced Color System**: All 25+ design tokens now match shadcn/ui exactly including sidebar and chart colors
- **Improved Radius**: Updated default border radius from `0.5rem` to `0.625rem` for modern design

### 🔄 Updated Components
- **Global Styles**: Both Tailwind v3 and v4 templates updated with complete OKLCH color system
- **Accordion**: Now includes all modern design tokens for consistent theming
- **Button**: Enhanced with new color variables for better theme support

### 🛠️ Technical Improvements
- **Schema Updates**: Enhanced `ComponentsConfig` with proper TypeScript types for all base colors
- **CLI Validation**: Added proper validation for base color selection
- **Template System**: Improved template architecture for better maintainability

### 📚 Documentation
- **Full shadcn/ui Compatibility**: Now matches shadcn/ui theming documentation exactly
- **Migration Guide**: Existing projects will automatically use new color system on next `fivui init`

## [0.5.3] - 2024-12-28

### ⚠️ Development Warning
- Added prominent development warning in README
- Package marked as under development, not ready for production use

## [0.5.2] - 2024-12-28

### 🎉 First NPM Release
- Published `@fivexlabs/fivui` to npm registry
- Complete CLI package with templates and registry system
- 13.2 kB compressed package size

## [0.5.1] - 2024-12-28

### 🐛 Bug Fixes
- **Global Styles for Single Projects**: Fixed critical bug where single projects weren't receiving global CSS styles
- **Template File Architecture**: Refactored from inline CSS strings to dedicated template files
- **Bundle Size Optimization**: Reduced CLI bundle size from 26.72 KB to 23.53 KB

### 🔧 Improvements
- **Template System**: Added `templates/globals-v3.css` and `templates/globals-v4.css` for better maintainability
- **Error Handling**: Added fallback handling for missing template files
- **Both Project Types**: Ensured both monorepo and single projects receive complete CSS templates

## [0.5.0] - 2024-12-28

### 🎵 New Component: Accordion
- **Full Accordion Implementation**: Added complete accordion component with Radix UI integration
- **Registry Integration**: `registry/accordion.json` with automatic dependency management
- **Template**: `templates/accordion.tsx` with full TypeScript support
- **Animations**: Added accordion animations to both Tailwind v3 and v4 global styles
- **shadcn/ui Compatibility**: 100% feature parity including single/multiple selection modes

### 🔧 Component Features
- **Accessibility**: Full ARIA support via Radix UI Accordion primitive
- **Customizable**: Single or multiple item selection modes
- **Collapsible**: Optional collapsible functionality
- **Animations**: Smooth expand/collapse animations
- **Icons**: Lucide React chevron icons with rotation animations
- **Styling**: Complete Tailwind CSS styling with CSS variables

### 📦 Automatic Dependencies
- **NPM Packages**: Auto-installs `@radix-ui/react-accordion` and `lucide-react`
- **Registry Dependencies**: Auto-installs `utils` component
- **Error Handling**: Graceful fallback with manual installation instructions

## [0.4.0] - 2024-12-28

### 🎯 Template-Based Architecture
- **Registry System**: Implemented JSON-based component registry (`registry/button.json`, `registry/utils.json`)
- **Template Files**: Created dedicated template files (`templates/button.tsx`, `templates/utils.ts`)
- **Dependency Management**: Automatic npm package installation per component
- **Smart Dependencies**: Only installs what each component actually needs

### 🔧 CLI Enhancements
- **`fivui add button`**: Copy button component + utils, install dependencies automatically
- **Dependency Detection**: Installs `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Registry Dependencies**: Automatically resolves and installs dependent registry components
- **Error Handling**: Graceful error handling with manual installation instructions

### 🏗️ Architecture Changes
- **Copy-Paste Model**: Users own the code completely, no runtime dependencies on FivUI
- **Template-Based**: Components copied from templates, not imported from package
- **Registry-Driven**: All components defined in JSON registry files
- **Modular**: Each component specifies its own dependencies and files

### 🧩 Component System
- **Button Component**: Full shadcn/ui compatibility with all variants and `asChild` prop
- **Utils**: Essential utility functions (`cn`, `cva`) copied to user projects
- **TypeScript**: Full TypeScript support with proper type definitions
- **Customizable**: Users can modify components after copying

## [0.3.0] - 2024-12-28

### 🚀 Advanced CLI Features
- **Monorepo Support**: Full monorepo detection and setup with workspace configuration
- **TailwindCSS Version Detection**: Automatic detection of Tailwind v3 vs v4
- **Smart Configuration**: Different setups for monorepo vs single project structures
- **Workspace Integration**: Proper alias configuration for monorepo workspaces

### 🏢 Monorepo Features
- **Package Structure**: Creates `packages/ui/` with proper workspace structure
- **Cross-Package Imports**: Configured aliases like `@workspace/ui/components`
- **Workspace Package.json**: Automatic UI package.json generation
- **App Integration**: Separate fivui.json for apps consuming UI package

### 🎨 TailwindCSS v4 Support
- **Version-Specific Templates**: Different global CSS for v3 vs v4
- **Modern Syntax**: Uses `@import "tailwindcss"` for v4, traditional directives for v3
- **@theme Directive**: v4 uses modern @theme syntax for animations
- **Backward Compatibility**: Full support for v3 projects

### 🔧 Configuration Enhancements
- **fivui.json**: Comprehensive configuration with Tailwind version detection
- **Base Color Support**: Foundation for multiple color themes
- **Alias Management**: Smart path aliases for different project structures
- **Force Override**: `--force` flag to overwrite existing configurations

## [0.2.0] - 2024-12-28

### 🎨 Design System Foundation
- **Global Styles**: Comprehensive CSS with design tokens and animations
- **CSS Variables**: Modern theming system with HSL color variables
- **Dark Mode**: Complete dark mode support with automatic color switching
- **Design Tokens**: Full set of semantic color tokens (primary, secondary, muted, etc.)

### 🎭 Component Styling
- **Accordion Animations**: Smooth expand/collapse animations with CSS keyframes
- **Border Utilities**: Consistent border styling across components
- **Typography**: Base body and text styling with design system integration
- **Responsive**: Mobile-first responsive design principles

### 🏗️ Project Structure
- **Directory Creation**: Automatic creation of `src/components/ui/`, `src/lib/`, `src/styles/`
- **File Generation**: Automatic generation of `globals.css` with complete styling
- **TypeScript Ready**: Full TypeScript configuration and type safety
- **Import Aliases**: Configured path aliases for clean imports

## [0.1.0] - 2024-12-28

### 🎉 Initial Release
- **CLI Foundation**: Basic CLI structure with Commander.js
- **Project Initialization**: `fivui init` command for project setup
- **fivui.json**: Basic configuration file generation
- **Directory Structure**: Automatic creation of component directories
- **TypeScript**: Full TypeScript support and configuration

## [0.8.2] - 2024-12-19

### Fixed
- Fixed hardcoded "button" component name in CLI success messages and import examples
- CLI now correctly displays the actual component name that was added (e.g., "code-block component has been added successfully" instead of "button component has been added successfully")
- Import examples now show the correct component name and capitalization

## [0.8.1] - 2024-12-19

### 🚨 Critical Fix

- **TailwindCSS v4 Compatibility**: Fixed "Cannot apply unknown utility class" error
  - **Root Cause**: CSS variables were defined in `:root` within `@layer base` (v3 format)
  - **Solution**: Moved CSS variables to `@theme` directive (proper v4 format)
  - **Impact**: Utilities like `border-border`, `bg-background`, `text-foreground` now work correctly
  - **Affected**: All TailwindCSS v4 projects using FivUI global CSS

### 🔧 Technical Details

- **Before**: `--border: oklch(...)` in `:root` → ❌ `border-border` failed
- **After**: `--color-border: oklch(...)` in `@theme` → ✅ `border-border` works
- **Files Updated**: `templates/globals-v4.css` only (v3 remains unchanged)
- **Breaking**: None - this is a compatibility fix, not a breaking change

### 📋 For Users

If you experienced CSS errors like:
```
Cannot apply unknown utility class: border-border
Cannot apply unknown utility class: bg-background  
Cannot apply unknown utility class: text-foreground
```

**Solution**: Re-run `fivui init` to get the updated CSS file, or manually update your globals.css to use the new format.

## [0.8.0] - 2024-12-18 

## [0.9.0] - 2024-12-19

### Added
- **New Table Component**: Added a comprehensive table component inspired by shadcn/ui
  - Includes all table sub-components: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`
  - Fully responsive with overflow handling
  - Supports hover states, selected states, and proper styling
  - Compatible with data tables and can be combined with @tanstack/react-table
  - Usage: `fivui add table`

### Features
- Table component with semantic HTML structure
- Built-in accessibility features and proper ARIA attributes
- Tailwind CSS styling with design tokens
- Full TypeScript support with proper type definitions
- Consistent with shadcn/ui API and styling patterns

## [0.9.1] - 2024-12-19

### Added
- **New Label Component**: Added accessible label component based on Radix UI
  - Supports proper form associations with `htmlFor` attribute
  - Includes peer-disabled styling for accessibility
  - Usage: `fivui add label`
  
- **New Input Component**: Added versatile input field component
  - Supports all HTML input types (text, email, password, file, etc.)
  - Includes focus states, disabled states, and proper styling
  - File input support with custom styling
  - Usage: `fivui add input`
  
- **New Checkbox Component**: Added checkbox component with Radix UI primitives
  - Includes check icon from Lucide React
  - Supports checked, unchecked, and indeterminate states
  - Accessible with proper ARIA attributes
  - Usage: `fivui add checkbox`
  
- **New Toggle Component**: Added toggle button component
  - Multiple variants: default and outline
  - Multiple sizes: small, default, and large
  - Supports pressed/unpressed states with proper styling
  - Based on Radix UI Toggle primitive
  - Usage: `fivui add toggle`

### Features
- All new components follow shadcn/ui design patterns and API
- Full TypeScript support with proper type definitions
- Automatic dependency management (Radix UI primitives, Lucide React icons)
- Consistent styling with existing FivUI design tokens
- Proper accessibility features and ARIA support

## [0.9.2] - 2024-12-19

### Added
- **New Alert Component**: Added alert component for displaying important messages
  - Two variants: default and destructive
  - Supports icons, titles, and descriptions
  - Semantic HTML with proper ARIA attributes
  - Usage: `fivui add alert`

- **New Alert Dialog Component**: Added modal alert dialog with smooth animations
  - Built-in animations using Tailwind CSS utilities (fade, zoom, slide)
  - Includes overlay, content, header, footer, title, description
  - Action and cancel buttons with proper styling
  - Based on Radix UI Alert Dialog primitive
  - Usage: `fivui add alert-dialog`

- **New Aspect Ratio Component**: Added component for maintaining consistent aspect ratios
  - Simple wrapper around Radix UI Aspect Ratio primitive
  - Perfect for responsive images and videos
  - Usage: `fivui add aspect-ratio`

- **New Avatar Component**: Added avatar component with image and fallback support
  - Includes Avatar, AvatarImage, and AvatarFallback sub-components
  - Automatic fallback when image fails to load
  - Circular design with proper sizing
  - Based on Radix UI Avatar primitive
  - Usage: `fivui add avatar`

- **New Badge Component**: Added badge component for labels and status indicators
  - Multiple variants: default, secondary, destructive, outline
  - Small, rounded design perfect for tags and status
  - Hover states and focus management
  - Usage: `fivui add badge`

- **New Breadcrumb Component**: Added comprehensive breadcrumb navigation
  - Includes Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis
  - Support for custom separators and ellipsis for long paths
  - Works with routing libraries via asChild prop
  - Lucide React icons for separators
  - Usage: `fivui add breadcrumb`

### Features
- All components follow shadcn/ui design patterns and API
- Full TypeScript support with proper type definitions
- Automatic dependency management (Radix UI primitives, Lucide React icons)
- Built-in animations using Tailwind CSS utilities (no custom keyframes needed)
- Consistent styling with existing FivUI design tokens
- Proper accessibility features and ARIA support

## [0.9.1] - 2024-12-19 