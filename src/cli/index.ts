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
  .version('1.2.9');

function detectTailwindVersion(): '3' | '4' | null {
  try {
    // Check if tailwindcss is installed
    const tailwindPath = require.resolve('tailwindcss');
    const packageJson = require(join(dirname(tailwindPath), 'package.json'));
    const version = packageJson.version;
    
    if (version.startsWith('3.')) {
      return '3';
    } else if (version.startsWith('4.')) {
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
    console.log('❌ TailwindCSS not found in your project.');
    console.log('\nPlease install TailwindCSS first:');
    console.log('  # For latest version (v4.x - recommended)');
    console.log('  npm install tailwindcss@^4.0.0');
    console.log('\n  # Or for v3.x');
    console.log('  npm install tailwindcss@^3.0.0');
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
  
  if (tailwindVersion === '4') {
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
  } else {
    console.log('⚙️  TailwindCSS v3.x Configuration:');
    console.log('  1. Add to your CSS file:');
    console.log('     @tailwind base;');
    console.log('     @tailwind components;');
    console.log('     @tailwind utilities;');
    console.log('');
    console.log('  2. Create/update tailwind.config.js:');
    console.log('     module.exports = {');
    console.log('       content: ["./src/**/*.{js,ts,jsx,tsx}"],');
    console.log('       theme: { extend: {} },');
    console.log('       plugins: [],');
    console.log('     }');
    console.log('');
    console.log('  💡 Consider upgrading to v4.x for better DX!');
  }
  
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

function copyComponent(componentName: string) {
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
    
    // Install dependencies first
    if (registry.dependencies && registry.dependencies.length > 0) {
      installDependencies(registry.dependencies);
    }
    
    // Handle registry dependencies (like utils)
    if (registry.registryDependencies && registry.registryDependencies.length > 0) {
      for (const dep of registry.registryDependencies) {
        if (dep !== componentName) { // Avoid infinite recursion
          copyComponent(dep);
        }
      }
    }
    
    // Copy files using workspace-aware paths
    for (const file of registry.files) {
      let targetPath: string;
      
      if (registry.type === 'components:ui') {
        // Use component path from config
        const componentDir = resolveComponentPath(config, workspace, 'ui');
        targetPath = join(componentDir, file.name);
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
      const tailwindVersion = config.tailwind.version || '4';
      const keyframeName = `${componentName}-v${tailwindVersion}`;
      
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
      console.log(`   import { ${capitalizedComponentName} } from "${config.aliases.ui || '@workspace/ui/components'}/${componentName}";`);
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

function addAllComponents() {
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
      copyComponent(component);
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
  .option('--tailwind-version <version>', 'TailwindCSS version (3, 4)', '4')
  .option('--css-variables', 'Use CSS variables for theming (default: true)')
  .option('--no-css-variables', 'Use utility classes for theming')
  .option('--force', 'Overwrite existing configuration')
  .action(async (options) => {
    // Validate base color
    const validColors = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
    const baseColor = validColors.includes(options.baseColor) ? options.baseColor : 'neutral';
    
    const tailwindVersion = options.tailwindVersion === '3' ? '3' : '4';
    const cssVariables = options.cssVariables !== false; // Default to true unless --no-css-variables
    
    await initProject({
      monorepo: options.monorepo,
      baseColor,
      tailwindVersion,
      cssVariables,
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
  .action((components) => {
    if (components && components.length > 0) {
      console.log(`\n🚀 Adding ${components.length} component${components.length > 1 ? 's' : ''}: ${components.join(', ')}\n`);
      
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
          copyComponent(component);
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
      console.log('  fivui add button calendar popover');
      console.log('  fivui add button input select checkbox');
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
    console.log('💡 Use "fivui add all" to add all components at once.');
  });

program
  .command('all')
  .description('Add all available components')
  .action(() => {
    addAllComponents();
  });

program.parse(); 