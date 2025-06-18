# FivUI

> **⚠️ DEVELOPMENT WARNING**  
> **This library is currently under active development and is NOT ready for production use.**  
> **Features, APIs, and components may change significantly without notice.**  
> **Please wait for the stable v1.0.0 release before using in production projects.**

A modern, lightweight UI component library CLI for React and Next.js applications, built with **TailwindCSS**.

**Copy. Paste. Customize.**

Unlike traditional component libraries, FivUI copies source code directly into your project. This gives you full control and ownership of the components.

## Features

- 🎨 **Copy-paste components** - Own your code, not dependencies
- 🎯 **TailwindCSS v4.x** - Modern styling with design tokens
- ⚡ **TypeScript** - Full type safety out the box
- 🔧 **Customizable** - Modify components to match your design
- 📦 **Smart dependency management** - Only install what you need
- 🚀 **Optimized for React & Next.js** - Works perfectly with modern frameworks

## Quick Start

### 1. Install the CLI Tool (One-time Setup)

```bash
npm install -g @fivexlabs/fivui
```

> **Note**: You're installing a CLI tool, not a component library. Components will be copied to your project.

### 2. Navigate to Your Project & Check Requirements

```bash
cd your-project
fivui setup
```

This will check if you have TailwindCSS v4.x installed and show setup instructions.

### 3. Copy Components to Your Project

```bash
fivui add button
```

This will:
- **Copy** `button.tsx` to `src/components/ui/button.tsx`
- **Copy** `utils.ts` to `src/lib/utils.ts` 
- **Install** required dependencies (@radix-ui/react-slot, etc.)
- **Create** folder structure if it doesn't exist

### 4. Use the Copied Components

```tsx
// Import from YOUR project files (not from @fivexlabs/fivui)
import { Button } from '@/components/ui/button';

export default function MyPage() {
  return (
    <div>
      <Button>Click me</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  );
}
```

> **Important**: After running `fivui add button`, the component lives in YOUR codebase. You can modify it freely!

## Requirements

- **Node.js** 20.0.0 or higher
- **React** 18.0.0 or higher  
- **TailwindCSS** 4.0.0 or higher

## How It Works

**FivUI is NOT a traditional npm package.** Instead, it's a CLI tool that copies component source code directly into your project.

### Traditional Component Libraries:
```bash
npm install some-ui-lib          # Install package
import { Button } from 'some-ui-lib'  # Import from node_modules
```

### FivUI Approach:
```bash
npm install -g @fivexlabs/fivui  # Install CLI tool (global)
fivui add button                 # Copy source code to your project
import { Button } from '@/components/ui/button'  # Import from YOUR files
```

### Benefits:

1. **CLI Tool** - Global CLI for managing components
2. **Copy Source** - Components become part of your codebase
3. **Full Control** - Edit, modify, extend without limitations
4. **No Bundle Bloat** - Only copy what you need
5. **Smart Dependencies** - Auto-installs required peer dependencies

### File Structure

When you add components, they're organized like this:

```
src/
├── components/
│   └── ui/           # UI components go here
│       └── button.tsx
└── lib/
    └── utils.ts      # Utility functions
```

## CLI Commands

```bash
# Show setup instructions
fivui setup

# Add a component
fivui add button

# Show help
fivui --help
```

## Customization

Since components are copied to your project, you can:

- **Modify styles** - Change colors, spacing, animations
- **Add props** - Extend interfaces for your needs
- **Change behavior** - Update logic and functionality
- **Add variants** - Create custom variants with CVA

## Dependencies

Components automatically install their required dependencies

## Troubleshooting

### TailwindCSS v4.x Required

FivUI requires TailwindCSS v4.x. To upgrade:

```bash
npm install tailwindcss@^4.0.0
```