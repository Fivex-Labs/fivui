# Contributing to FivUI

Thank you for your interest in contributing to FivUI! We welcome contributions from the community and are excited to see what you'll build with us.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Component Development](#component-development)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [hello@fivexlabs.com](mailto:hello@fivexlabs.com).

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and TailwindCSS

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/fivui-lib.git
   cd fivui-lib
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your development environment**
   ```bash
   # Build the CLI
   npm run build
   
   # Run tests to ensure everything is working
   npm test
   ```

4. **Create a branch for your work**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## Project Structure

```
fivui-lib/
├── src/                    # Source code
│   ├── cli/               # CLI implementation
│   │   ├── commands/      # CLI commands
│   │   └── index.ts       # Main CLI entry point
│   ├── lib/               # Core library utilities
│   └── styles/            # Global styles
├── templates/             # Component templates
├── registry/              # Component registry files
├── tests/                 # Test files
└── docs/                  # Documentation
```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes**: Fix existing issues or bugs
- **New components**: Add new UI components
- **Enhancements**: Improve existing components or CLI functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage

### Before You Start

1. **Check existing issues** - Look through existing issues to see if your contribution is already being worked on
2. **Create an issue** - For new features or significant changes, create an issue first to discuss the approach
3. **Start small** - If you're new to the project, consider starting with a small bug fix or documentation improvement

## Component Development

### Adding a New Component

1. **Create the component template**
   ```bash
   # Create the component file in templates/
   touch templates/your-component.tsx
   ```

2. **Follow the component structure**
   ```tsx
   "use client"
   
   import * as React from "react"
   import { Slot } from "@radix-ui/react-slot"
   import { cva, type VariantProps } from "class-variance-authority"
   import { cn } from "@/lib/utils"
   
   const yourComponentVariants = cva(
     "base-classes",
     {
       variants: {
         variant: {
           default: "default-classes",
           // other variants
         },
         size: {
           default: "default-size-classes",
           // other sizes
         },
       },
       defaultVariants: {
         variant: "default",
         size: "default",
       },
     }
   )
   
   export interface YourComponentProps
     extends React.HTMLAttributes<HTMLDivElement>,
       VariantProps<typeof yourComponentVariants> {
     asChild?: boolean
   }
   
   const YourComponent = React.forwardRef<
     HTMLDivElement,
     YourComponentProps
   >(({ className, variant, size, asChild = false, ...props }, ref) => {
     const Comp = asChild ? Slot : "div"
     return (
       <Comp
         className={cn(yourComponentVariants({ variant, size, className }))}
         ref={ref}
         {...props}
       />
     )
   })
   YourComponent.displayName = "YourComponent"
   
   export { YourComponent, yourComponentVariants }
   ```

3. **Create the registry file**
   ```bash
   # Create the registry file
   touch registry/your-component.json
   ```

   ```json
   {
     "name": "your-component",
     "type": "components:ui",
     "dependencies": [
       "@radix-ui/react-slot"
     ],
     "registryDependencies": [
       "utils"
     ],
     "files": [
       {
         "name": "your-component.tsx",
         "template": "templates/your-component.tsx"
       }
     ]
   }
   ```

### Component Guidelines

1. **Use TypeScript** - All components must be written in TypeScript
2. **Follow naming conventions** - Use PascalCase for component names, kebab-case for files
3. **Use Radix UI** - Prefer Radix UI primitives for accessibility and functionality
4. **Support variants** - Use `class-variance-authority` for component variants
5. **Forward refs** - Always forward refs for better composability
6. **Support asChild** - Include `asChild` prop for Radix Slot compatibility
7. **Accessibility first** - Ensure components are accessible by default
8. **Responsive design** - Components should work well on all screen sizes

### Styling Guidelines

1. **TailwindCSS v4** - Use TailwindCSS v4 classes and features
2. **CSS variables** - Use CSS variables for theming when appropriate
3. **Semantic classes** - Use semantic class names that describe purpose, not appearance
4. **Mobile-first** - Write responsive styles mobile-first
5. **Dark mode** - Support dark mode variants

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Writing Tests

1. **Component tests** - Test component behavior, props, and accessibility
2. **CLI tests** - Test CLI commands and functionality
3. **Integration tests** - Test component integration with other components
4. **Accessibility tests** - Ensure components meet accessibility standards

Example test structure:
```tsx
import { render, screen } from '@testing-library/react'
import { YourComponent } from './your-component'

describe('YourComponent', () => {
  it('renders with default props', () => {
    render(<YourComponent>Test content</YourComponent>)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<YourComponent className="custom-class">Test</YourComponent>)
    expect(screen.getByText('Test')).toHaveClass('custom-class')
  })

  // Add more tests for variants, accessibility, etc.
})
```

## Documentation

### Component Documentation

Each component should include:

1. **JSDoc comments** - Document props and usage
2. **Examples** - Provide usage examples
3. **Accessibility notes** - Document accessibility features
4. **Variant descriptions** - Explain available variants

### CLI Documentation

Document CLI commands with:

1. **Command description** - What the command does
2. **Usage examples** - How to use the command
3. **Options** - Available flags and options
4. **Error handling** - Common errors and solutions

## Pull Request Process

### Before Submitting

1. **Test your changes** - Ensure all tests pass
2. **Update documentation** - Update relevant documentation
3. **Check code style** - Run linting and formatting
4. **Update changelog** - Add entry to CHANGELOG.md if applicable

### Submitting Your PR

1. **Use a clear title** - Describe what your PR does
2. **Provide context** - Explain why the change is needed
3. **Include examples** - Show how to use new features
4. **Link issues** - Reference related issues
5. **Request review** - Ask for review from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated checks** - CI/CD pipeline runs tests and checks
2. **Code review** - Maintainers review code quality and design
3. **Testing** - Changes are tested in different environments
4. **Approval** - At least one maintainer approval required
5. **Merge** - Changes are merged into main branch

## Release Process

FivUI follows semantic versioning (SemVer):

- **Patch** (1.0.1): Bug fixes and small improvements
- **Minor** (1.1.0): New features that don't break existing functionality
- **Major** (2.0.0): Breaking changes

### Release Workflow

1. **Version bump** - Update version in package.json and CLI
2. **Changelog update** - Update CHANGELOG.md with changes
3. **Build and test** - Ensure everything builds and tests pass
4. **Publish** - Publish to npm registry
5. **Tag release** - Create GitHub release with notes

## Getting Help

### Community Support

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and community discussion
- **Email** - [hello@fivexlabs.com](mailto:hello@fivexlabs.com) for direct support

### Development Questions

If you need help with development:

1. **Check existing issues** - Your question might already be answered
2. **Create a discussion** - Use GitHub Discussions for questions
3. **Join our community** - Connect with other contributors

### Reporting Bugs

When reporting bugs, please include:

1. **Clear description** - What happened vs. what you expected
2. **Steps to reproduce** - How to reproduce the issue
3. **Environment** - OS, Node version, package versions
4. **Code examples** - Minimal reproduction case
5. **Screenshots** - If applicable

### Feature Requests

For feature requests, please include:

1. **Use case** - Why is this feature needed?
2. **Proposed solution** - How should it work?
3. **Alternatives** - What alternatives have you considered?
4. **Additional context** - Any other relevant information

## Recognition

Contributors will be recognized in:

- **CHANGELOG.md** - For significant contributions
- **README.md** - In the contributors section
- **GitHub** - Through GitHub's contributor features

## License

By contributing to FivUI, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FivUI! Your contributions help make this project better for everyone. 🎉 