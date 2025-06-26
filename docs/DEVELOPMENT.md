# Development Guide

## TypeScript Configuration

FivUI uses a dual TypeScript configuration approach to handle template files properly:

### Main Configuration (`tsconfig.json`)
- **Purpose**: Type checking for the CLI source code
- **Includes**: `src/**/*`
- **Excludes**: `templates`, `dist`, `node_modules`
- **Strict**: Full TypeScript strict mode enabled

### Template Configuration (`tsconfig.templates.json`)
- **Purpose**: Type checking for template files
- **Includes**: `templates/**/*`
- **Excludes**: `src`, `dist`, `node_modules`
- **Strict**: Relaxed rules for template development

## Working with Templates

### Template Files
Template files are located in the `templates/` directory and are:
- Copied to user projects during `fivui add` commands
- Excluded from the main TypeScript compilation
- Use relaxed TypeScript rules for development
- Have their own ESLint configuration

### Import Paths in Templates
Template files use `@/` import paths that will resolve in user projects:
```typescript
// In templates/button.tsx
import { cn } from "@/lib/utils"  // Will resolve to user's @/lib/utils
import { Button } from "@/components/ui/button"  // Will resolve to user's components
```

### Type Checking Templates
```bash
# Check main source code
npm run type-check

# Check template files
npm run type-check:templates

# Check both
npm run type-check:all
```

### Linting Templates
```bash
# Lint main source code
npm run lint

# Lint template files
npm run lint:templates

# Lint both
npm run lint:all
```

## ESLint Configuration

The ESLint configuration includes special rules for template files:
- Disables `import/no-unresolved` for template files
- Relaxes TypeScript rules for template development
- Allows `@ts-ignore` comments in templates if needed

## Best Practices

### Template Development
1. **Use `@/` imports**: These will resolve correctly in user projects
2. **Avoid hard dependencies**: Template files should not import from `src/`
3. **Test imports**: Use `npm run type-check:templates` to verify imports
4. **Document dependencies**: List all external dependencies in registry files

### Adding New Templates
1. Create the template file in `templates/`
2. Use `@/` import paths for user project dependencies
3. Create a registry file in `registry/`
4. Test with `npm run type-check:templates`
5. Update documentation if needed

### Troubleshooting
- **Import errors**: Check that paths use `@/` prefix
- **Type errors**: Verify template TypeScript config is being used
- **Build errors**: Ensure templates are excluded from main build
- **Lint errors**: Check ESLint overrides for template files

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `type-check` | Check main source code |
| `type-check:templates` | Check template files |
| `type-check:all` | Check both source and templates |
| `lint` | Lint main source code |
| `lint:templates` | Lint template files |
| `lint:all` | Lint both source and templates |
| `lint:fix` | Fix linting issues in source |
| `lint:fix:templates` | Fix linting issues in templates |
| `lint:fix:all` | Fix linting issues in both |
| `format` | Format all files (source + templates) | 