#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { execSync } from 'child_process';
import { detectWorkspace, loadComponentsConfig, findComponentsConfig, resolveComponentPath } from '../lib/workspace.js';
import { initProject } from './commands/init.js';

const program = new Command();

program
  .name('fivui')
  .description('FivUI CLI - A modern UI component library for React')
  .version('1.4.2');

function detectTailwindVersion(): '4' | null {
  try {
    // Check if tailwindcss is installed
    const tailwindPath = require.resolve('tailwindcss');
    const packageJson = require(join(dirname(tailwindPath), 'package.json'));
    const version = packageJson.version;

    if (version.startsWith('3.')) {
      console.log('\n⚠️  TailwindCSS v3.x detected. FivUI requires TailwindCSS v4.x.');
      console.log('   Please upgrade: npm install tailwindcss@^4.0.0\n');
      return null;
    }
    if (version.startsWith('4.')) {
      return '4';
    }
    return null;
  } catch (error) {
    return null;
  }
}

function showSetupInstructions() {
  const workspace = detectWorkspace();
  const configPath = findComponentsConfig(workspace);
  const tailwindVersion = detectTailwindVersion();
  
  console.log('\n🎨 FivUI Setup Guide\n');
  
  if (!tailwindVersion) {
    console.log('❌ TailwindCSS v4.x not found in your project.');
    console.log('\nPlease install TailwindCSS v4:');
    console.log('  npm install tailwindcss@^4.0.0');
    console.log('\nThen run this command again.');
    return;
  }
  
  console.log(`✅ TailwindCSS v${tailwindVersion}.x detected\n`);
  
  if (workspace.type !== 'single') {
    console.log(`🏢 Detected ${workspace.type} monorepo`);
    console.log(`📂 Workspace root: ${workspace.root}`);
    if (workspace.currentWorkspace) {
      console.log(`📍 Current workspace: ${workspace.currentWorkspace}`);
    }
    console.log('');
  }
  
  if (!configPath) {
    console.log('⚠️  No fivui.json found.');
    console.log('Run: fivui init');
    console.log('\nThis will set up the proper configuration for your project.');
    return;
  }
  
  console.log('📋 Tailwind CSS Setup Instructions:');
  console.log('✨ TailwindCSS v4.x Configuration:');
  console.log('  1. Add to your CSS file:');
  console.log('     @import "tailwindcss";');
  console.log('');
  console.log('  2. No config file needed! 🎉');
  console.log('     • Configuration is done directly in CSS using @theme directive');
  console.log('     • Built-in support for CSS variables and modern features');
  console.log('     • Automatic content detection (no need to configure paths)');
  console.log('');
  console.log('  3. Optional customization in CSS:');
  console.log('     @theme {');
  console.log('       --color-primary: #3b82f6;');
  console.log('       --font-heading: "Inter", sans-serif;');
  console.log('     }');
  
  console.log('\n🚀 Ready to use FivUI!');
  console.log('Next: fivui add button');
}

function getRegistryPath(componentName: string): string {
  // In the built CLI, we need to resolve relative to the package root
  const packageRoot = resolve(__dirname, '../..');
  return join(packageRoot, 'registry', `${componentName}.json`);
}

function getTemplatePath(templatePath: string): string {
  // In the built CLI, we need to resolve relative to the package root
  const packageRoot = resolve(__dirname, '../..');
  return join(packageRoot, templatePath);
}

function installDependencies(dependencies: string[]) {
  if (dependencies.length === 0) return;
  
  console.log('📦 Installing dependencies...');
  try {
    const depsString = dependencies.join(' ');
    execSync(`npm install ${depsString}`, { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully.');
  } catch (error) {
    console.log('❌ Failed to install dependencies. Please install manually:');
    console.log(`   npm install ${dependencies.join(' ')}`);
  }
}

type UiLibrary = 'radix' | 'base' | 'ark';

function copyComponent(componentName: string, uiLibrary?: UiLibrary) {
  const workspace = detectWorkspace();
  const configPath = findComponentsConfig(workspace);
  
  if (!configPath) {
    console.log('\n❌ No fivui.json found.');
    console.log('Run: fivui init');
    console.log('\nThis will set up the proper configuration for your project.');
    return;
  }
  
  const config = loadComponentsConfig(configPath);
  if (!config) {
    console.log('\n❌ Failed to load fivui.json.');
    return;
  }
  
  const registryPath = getRegistryPath(componentName);
  
  if (!existsSync(registryPath)) {
    console.log(`\n❌ ${componentName} component is not yet available.`);
    return;
  }
  
  try {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as any;
    
    // Resolve variant: registry may have variants (radix/base) or flat dependencies/files
    let dependencies: string[] = [];
    let files: { name: string; template: string }[] = [];
    if (registry.variants) {
      const library = uiLibrary ?? config.uiLibrary ?? 'radix';
      const variant = registry.variants[library];
      if (!variant) {
        console.log(`\n❌ ${componentName} does not support "${library}". Use --radix, --base, or --ark.`);
        return;
      }
      dependencies = variant.dependencies ?? [];
      files = variant.files ?? [];
    } else {
      dependencies = registry.dependencies ?? [];
      files = registry.files ?? [];
    }
    
    const effectiveUiLibrary = uiLibrary ?? config.uiLibrary ?? 'radix';
    
    // Install dependencies first
    if (dependencies.length > 0) {
      installDependencies(dependencies);
    }
    
    // Handle registry dependencies (like utils)
    if (registry.registryDependencies && registry.registryDependencies.length > 0) {
      for (const dep of registry.registryDependencies) {
        if (dep !== componentName) { // Avoid infinite recursion
          copyComponent(dep, effectiveUiLibrary);
        }
      }
    }
    
    // Copy files using workspace-aware paths
    for (const file of files) {
      let targetPath: string;
      
      if (registry.type === 'components:ui') {
        // Use component path from config
        const componentDir = resolveComponentPath(config, workspace, 'ui');
        targetPath = join(componentDir, file.name);
      } else if (registry.type === 'components:ui:appkit') {
        // Handle appkit components - create appkit subdirectory structure
        const componentDir = resolveComponentPath(config, workspace, 'ui');
        // Extract component name from the file name (remove 'appkit-' prefix and .tsx extension)
        const appkitComponentName = file.name.replace(/^appkit-/, '').replace(/\.tsx$/, '');
        // Create appkit subdirectory structure
        const appkitDir = join(componentDir, 'appkit', appkitComponentName);
        targetPath = join(appkitDir, 'index.tsx');
      } else if (registry.type === 'components:lib') {
        // Use lib path from config
        const libDir = resolveComponentPath(config, workspace, 'lib');
        targetPath = join(libDir, file.name);
      } else {
        // Fallback to components path
        const componentDir = resolveComponentPath(config, workspace, 'components');
        targetPath = join(componentDir, file.name);
      }
      
      // Create directory if it doesn't exist
      const dir = dirname(targetPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      // Read template file and write to target
      const templatePath = getTemplatePath(file.template);
      if (!existsSync(templatePath)) {
        console.log(`❌ Template file not found: ${file.template}`);
        continue;
      }
      
      let templateContent = readFileSync(templatePath, 'utf8');
      
      // Handle "use client" directive based on RSC setting
      if (config.rsc === true) {
        // RSC enabled: keep "use client" for client components
        // (template already has "use client" where needed)
      } else {
        // RSC disabled: remove "use client" directives
        templateContent = templateContent.replace(/^"use client"\s*\n/m, '');
      }
      
      writeFileSync(targetPath, templateContent, 'utf8');
      console.log(`📄 Created ${targetPath.replace(process.cwd(), '.')}`);
    }
    
    // Handle keyframes if component has them
    if (registry.keyframes && registry.keyframes.length > 0) {
      const keyframeName = `${componentName}-v4`;
      
      // Find the appropriate keyframes for the TailwindCSS version
      const keyframes = registry.keyframes.find((kf: any) => kf.name === keyframeName);
      
      if (keyframes) {
        // Resolve CSS file path
        const cssPath = resolveCssPath(config, workspace);
        
        if (existsSync(cssPath)) {
          let cssContent = readFileSync(cssPath, 'utf8');
          
          // Check if keyframes already exist
          const keyframeMarker = `/* ${componentName} keyframes */`;
          if (!cssContent.includes(keyframeMarker)) {
            // Add keyframes to the end of the file
            cssContent += `\n\n${keyframeMarker}\n${keyframes.css}\n`;
            writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`🎨 Added ${componentName} animations to CSS`);
          }
        } else {
          console.log(`⚠️  CSS file not found at ${cssPath}. Keyframes not added.`);
        }
      }
    }
    
    console.log(`\n✅ ${componentName} component has been added successfully.`);
    
    if (workspace.type !== 'single') {
      // Capitalize the component name for the import example
      const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
      console.log(`\n💡 In your app, import like this:`);
      
      if (registry.type === 'components:ui:appkit') {
        // For appkit components, show the correct import path (remove 'appkit-' prefix)
        const appkitFolderName = componentName.replace(/^appkit-/, '');
        console.log(`   import { ${capitalizedComponentName} } from "${config.aliases.ui || '@workspace/ui/components'}/appkit/${appkitFolderName}";`);
      } else {
        // For regular components
        console.log(`   import { ${capitalizedComponentName} } from "${config.aliases.ui || '@workspace/ui/components'}/${componentName}";`);
      }
    }
    
  } catch (error) {
    console.log(`\n❌ Failed to add ${componentName} component.`);
    console.log('Error:', error instanceof Error ? error.message : error);
  }
}

function resolveCssPath(config: any, workspace: any): string {
  if (workspace.currentWorkspace) {
    // For monorepos, resolve relative to the current workspace
    return join(workspace.root, workspace.currentWorkspace, config.tailwind.css);
  } else {
    // For single repos, resolve relative to the root
    return join(workspace.root, config.tailwind.css);
  }
}

function getAllAvailableComponents(): string[] {
  try {
    const packageRoot = resolve(__dirname, '../..');
    const registryDir = join(packageRoot, 'registry');
    
    if (!existsSync(registryDir)) {
      return [];
    }
    
    const files = readdirSync(registryDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
      .sort();
  } catch (error) {
    console.log('❌ Failed to read registry directory');
    return [];
  }
}

function addAllComponents(uiLibrary?: UiLibrary) {
  const components = getAllAvailableComponents();
  
  if (components.length === 0) {
    console.log('❌ No components available.');
    return;
  }
  
  console.log(`\n🚀 Adding all ${components.length} available components...\n`);
  
  const processedComponents = new Set<string>();
  let successCount = 0;
  let failureCount = 0;
  
  for (const component of components) {
    if (processedComponents.has(component)) {
      console.log(`⏭️  Skipping ${component} (already processed)`);
      continue;
    }
    
    try {
      console.log(`📦 Processing ${component}...`);
      copyComponent(component, uiLibrary);
      processedComponents.add(component);
      successCount++;
    } catch (error) {
      console.log(`❌ Failed to add ${component}`);
      failureCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully added: ${successCount} component${successCount !== 1 ? 's' : ''}`);
  if (failureCount > 0) {
    console.log(`❌ Failed to add: ${failureCount} component${failureCount !== 1 ? 's' : ''}`);
  }
}

// CLI Setup
program
  .command('init')
  .description('Initialize FivUI in your project')
  .option('--monorepo', 'Initialize as monorepo')
  .option('--base-color <color>', 'Base color for components (slate, gray, zinc, neutral, stone)', 'neutral')
  .option('--style <style>', 'Style preset (mesa, ridge, dune, slate, forge)', 'mesa')
  .option('--icon-library <lib>', 'Icon library (lucide, tabler, remix, phosphor, hugeicons, radix-icons)', 'lucide')
  .option('--css-variables', 'Use CSS variables for theming (default: true)')
  .option('--no-css-variables', 'Use utility classes for theming')
  .option('--ui-library <library>', 'UI primitive library (radix, base, ark)', 'radix')
  .option('--force', 'Overwrite existing configuration')
  .action(async (options) => {
    const validColors = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
    const validStyles = ['mesa', 'ridge', 'dune', 'slate', 'forge'];
    const validIconLibs = ['lucide', 'tabler', 'remix', 'phosphor', 'hugeicons', 'radix-icons'];
    const baseColor = validColors.includes(options.baseColor) ? options.baseColor : 'neutral';
    const style = validStyles.includes(options.style) ? options.style : 'mesa';
    const iconLibrary = validIconLibs.includes(options.iconLibrary) ? options.iconLibrary : 'lucide';
    const cssVariables = options.cssVariables !== false;
    const uiLibrary = ['base', 'ark'].includes(options.uiLibrary) ? options.uiLibrary : 'radix';
    await initProject({
      monorepo: options.monorepo,
      baseColor,
      style,
      iconLibrary,
      cssVariables,
      uiLibrary,
      force: options.force,
    });
  });

program
  .command('setup')
  .description('Show setup instructions for TailwindCSS')
  .action(() => {
    showSetupInstructions();
  });

program
  .command('add')
  .description('Add components to your project')
  .argument('<components...>', 'Component names to add')
  .option('--radix', 'Use Radix UI primitives for components that support variants')
  .option('--base', 'Use Base UI primitives for components that support variants')
  .option('--ark', 'Use Ark UI primitives for components that support variants')
  .action((components, options) => {
    let uiLibrary: UiLibrary | undefined;
    if (options.radix) uiLibrary = 'radix';
    else if (options.base) uiLibrary = 'base';
    else if (options.ark) uiLibrary = 'ark';
    const libCount = [options.radix, options.base, options.ark].filter(Boolean).length;
    if (libCount > 1) {
      console.log('\n❌ Use only one of --radix, --base, or --ark.');
      return;
    }
    if (components && components.length > 0) {
      console.log(`\n🚀 Adding ${components.length} component${components.length > 1 ? 's' : ''}: ${components.join(', ')}\n`);
      if (uiLibrary) {
        const libNames: Record<UiLibrary, string> = { radix: 'Radix UI', base: 'Base UI', ark: 'Ark UI' };
        console.log(`📚 Using ${libNames[uiLibrary]} primitives.\n`);
      }
      const processedComponents = new Set<string>();
      let successCount = 0;
      let failureCount = 0;
      for (const component of components) {
        if (processedComponents.has(component)) {
          console.log(`⏭️  Skipping ${component} (already processed)`);
          continue;
        }
        try {
          console.log(`📦 Processing ${component}...`);
          copyComponent(component, uiLibrary);
          processedComponents.add(component);
          successCount++;
        } catch (error) {
          console.log(`❌ Failed to add ${component}`);
          failureCount++;
        }
      }
      console.log(`\n📊 Summary:`);
      console.log(`✅ Successfully added: ${successCount} component${successCount !== 1 ? 's' : ''}`);
      if (failureCount > 0) {
        console.log(`❌ Failed to add: ${failureCount} component${failureCount !== 1 ? 's' : ''}`);
      }
    } else {
      console.log('\n❌ Please specify one or more component names after "add".');
      console.log('Usage: fivui add <component> [component2] [component3] ...');
      console.log('\nExamples:');
      console.log('  fivui add button');
      console.log('  fivui add button --radix');
      console.log('  fivui add button --base');
      console.log('  fivui add button --ark');
      console.log('  fivui add button calendar popover');
    }
  });

program
  .command('list')
  .description('List all available components')
  .action(() => {
    const components = getAllAvailableComponents();
    if (components.length === 0) {
      console.log('❌ No components available.');
      return;
    }
    console.log('\n📋 Available Components:');
    console.log('========================');
    components.forEach((component, index) => {
      console.log(`${index + 1}. ${component}`);
    });
    console.log(`\n💡 Use 'fivui add <component>' to add a component.`);
    console.log('💡 Use --radix, --base, or --ark to choose UI primitives (e.g. fivui add button --base).');
    console.log('💡 Use "fivui add all" to add all components at once.');
  });

program
  .command('all')
  .description('Add all available components')
  .option('--radix', 'Use Radix UI primitives for components that support variants')
  .option('--base', 'Use Base UI primitives for components that support variants')
  .option('--ark', 'Use Ark UI primitives for components that support variants')
  .action((options) => {
    let uiLibrary: UiLibrary | undefined;
    if (options.radix) uiLibrary = 'radix';
    else if (options.base) uiLibrary = 'base';
    else if (options.ark) uiLibrary = 'ark';
    const libCount = [options.radix, options.base, options.ark].filter(Boolean).length;
    if (libCount > 1) {
      console.log('\n❌ Use only one of --radix, --base, or --ark.');
      return;
    }
    addAllComponents(uiLibrary);
  });

program.parse(); 