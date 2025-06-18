import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import prompts from 'prompts';
import type { ComponentsConfig } from '../../lib/schemas';
// import { DEFAULT_COMPONENTS_CONFIG, MONOREPO_COMPONENTS_CONFIG } from '../../lib/schemas';
import { detectWorkspace } from '../../lib/workspace';

export interface InitOptions {
  monorepo?: boolean;
  style?: 'default' | 'new-york';
  baseColor?: 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone';
  cssVariables?: boolean;
  force?: boolean;
  tailwindVersion?: '3' | '4';
}

export async function initProject(options: InitOptions = {}) {
  console.log('\n🎨 Welcome to FivUI!\n');
  
  // Check if meaningful CLI options are provided - if so, skip interactive mode
  const hasCliOptions = (options.baseColor && options.baseColor !== 'neutral') || 
                       (options.tailwindVersion && options.tailwindVersion !== '4') ||
                       options.cssVariables === false || // Only if explicitly set to false
                       options.force || 
                       options.monorepo;
  
  if (hasCliOptions) {
    // Use CLI options directly (backward compatibility)
    await runDirectSetup(options);
  } else {
    // Run interactive setup
    await runInteractiveSetup(options);
  }
}

async function runInteractiveSetup(_cliOptions: InitOptions) {
  const workspace = detectWorkspace();
  
  try {
    // Detect existing configuration
    const existingConfig = detectExistingConfig(workspace);
    
    // Ask all configuration questions
    const responses = await prompts([
      {
        type: 'confirm' as const,
        name: 'typescript',
        message: 'Would you like to use TypeScript (recommended)?',
        initial: true
      },
      {
        type: 'select' as const,
        name: 'baseColor',
        message: 'Which color would you like to use as base color?',
        choices: [
          { title: 'Neutral', value: 'neutral' },
          { title: 'Slate', value: 'slate' },
          { title: 'Gray', value: 'gray' },
          { title: 'Zinc', value: 'zinc' },
          { title: 'Stone', value: 'stone' }
        ],
        initial: 0
      },
      {
        type: 'text' as const,
        name: 'globalCss',
        message: 'Where is your global CSS file?',
        initial: workspace.type === 'single' ? 'src/styles/globals.css' : 'packages/ui/src/styles/globals.css',
        validate: (value: string) => value.trim() !== '' || 'Please enter a valid path'
      },
      {
        type: 'confirm' as const,
        name: 'cssVariables',
        message: 'Would you like to use CSS variables for colors?',
        initial: true
      },
      {
        type: 'select' as const,
        name: 'tailwindVersion',
        message: 'Which version of TailwindCSS are you using?',
        choices: [
          { title: 'v4.x (latest)', value: '4' },
          { title: 'v3.x', value: '3' }
        ],
        initial: 0
      },
      {
        type: (prev: string) => prev === '3' ? 'text' : null, // Only ask for v3
        name: 'tailwindConfig',
        message: 'Where is your tailwind.config.js located?',
        initial: 'tailwind.config.js',
        validate: (value: string) => {
          if (value.trim() === '') {
            return 'Tailwind v3 requires a config file path';
          }
          return true;
        }
      },
      {
        type: 'text' as const,
        name: 'componentsAlias',
        message: 'Configure the import alias for components:',
        initial: workspace.type === 'single' ? '@/components' : '@workspace/ui/components'
      },
      {
        type: 'text' as const,
        name: 'utilsAlias',
        message: 'Configure the import alias for utils:',
        initial: workspace.type === 'single' ? '@/lib/utils' : '@workspace/ui/lib/utils'
      },
      {
        type: 'confirm' as const,
        name: 'rsc',
        message: 'Are you using React Server Components?',
        initial: true
      }
    ]);

    // Handle user cancellation
    if (Object.keys(responses).length === 0) {
      console.log('\n❌ Setup cancelled.');
      return;
    }

    // Set default style since we removed the interactive option
    (responses as any).style = 'default';

    // Check for existing files and ask about overwriting
    const overwriteQuestions = await checkExistingFiles(responses, workspace, existingConfig);
    
    if (overwriteQuestions.length > 0) {
      const overwriteResponses = await prompts(overwriteQuestions);
      Object.assign(responses, overwriteResponses);
    }

    // Show configuration summary
    console.log('\n📋 Configuration Summary:');
    console.log(`   Base Color: ${responses.baseColor}`);
    console.log(`   Global CSS: ${responses.globalCss}`);
    console.log(`   CSS Variables: ${responses.cssVariables ? 'Yes' : 'No'}`);
    console.log(`   TailwindCSS: v${responses.tailwindVersion}.x`);
    console.log(`   TypeScript: ${responses.typescript ? 'Yes' : 'No'}`);

    const confirmSetup = await prompts({
      type: 'confirm' as const,
      name: 'proceed',
      message: 'Write configuration to fivui.json. Proceed?',
      initial: true
    });

    if (!confirmSetup.proceed) {
      console.log('\n❌ Setup cancelled.');
      return;
    }

    // Proceed with setup
    console.log('\n🔧 Setting up FivUI...');
    await executeSetup(responses, workspace, _cliOptions);
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

function detectExistingConfig(workspace: any) {
  const configPath = join(workspace.root, 'fivui.json');
  if (existsSync(configPath)) {
    try {
      return JSON.parse(readFileSync(configPath, 'utf8'));
    } catch {
      return null;
    }
  }
  return null;
}

async function checkExistingFiles(responses: any, workspace: any, existingConfig: any) {
  const questions: any[] = [];
  
  // Check fivui.json
  if (existingConfig) {
    questions.push({
      type: 'confirm' as const,
      name: 'overwriteConfig',
      message: 'fivui.json already exists. Would you like to overwrite it?',
      initial: false
    });
  }
  
  // Check global CSS file
  const globalCssPath = join(workspace.root, responses.globalCss);
  if (existsSync(globalCssPath)) {
    questions.push({
      type: 'select' as const,
      name: 'overwriteGlobalCss',
      message: `${responses.globalCss} already exists. What would you like to do?`,
      choices: [
        { title: 'Overwrite completely', value: 'overwrite' },
        { title: 'Append FivUI styles (requires manual integration)', value: 'append' },
        { title: 'Skip (keep existing file)', value: 'skip' }
      ],
      initial: 1
    });
  }
  
  return questions;
}

async function executeSetup(responses: any, workspace: any, _cliOptions: InitOptions) {
  const isMonorepo = workspace.type !== 'single';
  
  // Create configuration
  const config: ComponentsConfig = {
    $schema: 'https://ui.fivexlabs.com/schema.json',
    style: responses.style,
    tsx: responses.typescript,
    rsc: responses.rsc,
    tailwind: {
      config: responses.tailwindConfig || '',
      css: responses.globalCss,
      baseColor: responses.baseColor,
      cssVariables: responses.cssVariables,
      version: responses.tailwindVersion,
    },
    aliases: {
      components: responses.componentsAlias,
      utils: responses.utilsAlias,
      ui: responses.componentsAlias.replace('/components', '/components/ui'),
      hooks: responses.componentsAlias.replace('/components', '/hooks'),
      lib: responses.utilsAlias.replace('/utils', ''),
    },
  };
  
  // Write components.json
  const configPath = join(workspace.root, 'fivui.json');
  if (!existsSync(configPath) || responses.overwriteConfig) {
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Created fivui.json');
  }
  
  // Create directory structure
  createDirectoryStructure(workspace, responses, isMonorepo);
  
  // Handle global CSS
  const globalCssPath = join(workspace.root, responses.globalCss);
  if (responses.overwriteGlobalCss !== 'skip') {
    handleGlobalCssSetup(globalCssPath, responses.tailwindVersion, responses.overwriteGlobalCss === 'overwrite');
  }
  
  // Show setup instructions
  showSetupComplete(responses);
}

function createDirectoryStructure(workspace: any, _responses: any, isMonorepo: boolean) {
  if (isMonorepo) {
    // Create monorepo structure
    const uiPackageDir = join(workspace.root, 'packages', 'ui');
    const dirs = [
      join(uiPackageDir, 'src', 'components'),
      join(uiPackageDir, 'src', 'lib'),
      join(uiPackageDir, 'src', 'hooks'),
      join(uiPackageDir, 'src', 'styles'),
    ];
    
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 Created ${dir.replace(workspace.root + '/', '')}/`);
      }
    });
    
    // Create UI package.json if it doesn't exist
    const packageJsonPath = join(uiPackageDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
      const packageJson = {
        name: '@workspace/ui',
        version: '0.1.0',
        type: 'module',
        exports: {
          './components/*': './src/components/*.tsx',
          './lib/*': './src/lib/*.ts',
          './hooks/*': './src/hooks/*.ts',
          './styles/*': './src/styles/*',
        },
        dependencies: {},
        devDependencies: {
          '@types/react': '^18.0.0',
          'react': '^18.0.0',
          'typescript': '^5.0.0',
        },
      };
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('📄 Created packages/ui/package.json');
    }
  } else {
    // Create single project structure
    const dirs = [
      join(workspace.root, 'src', 'components', 'ui'),
      join(workspace.root, 'src', 'lib'),
      join(workspace.root, 'src', 'styles'),
    ];
    
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 Created ${dir.replace(workspace.root + '/', '')}/`);
      }
    });
  }
}

function handleGlobalCssSetup(globalCssPath: string, tailwindVersion: string, forceOverwrite: boolean) {
  const globalStyles = generateGlobalStyles(tailwindVersion as '3' | '4');
  
  if (!existsSync(globalCssPath) || forceOverwrite) {
    // Create or overwrite
    const dir = globalCssPath.substring(0, globalCssPath.lastIndexOf('/'));
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(globalCssPath, globalStyles);
    console.log(`✅ ${forceOverwrite ? 'Overwritten' : 'Created'} ${globalCssPath}`);
  } else {
    // Append with warning
    const existingContent = readFileSync(globalCssPath, 'utf8');
    const appendedContent = `${existingContent}

/* ========================================
 * FivUI Styles - MANUAL INTEGRATION NEEDED
 * ======================================== 
 * 
 * ⚠️  WARNING: These styles have been appended to your existing globals.css
 * 
 * For components to work correctly, you need to:
 * 1. Move the CSS variables (:root and .dark) to the TOP of your file
 * 2. Ensure @tailwind directives are at the very beginning
 * 3. Place @layer base styles after @tailwind directives
 * 
 * Or run: fivui init --force to overwrite this file completely
 * ======================================== */

${globalStyles}`;
    
    writeFileSync(globalCssPath, appendedContent);
    console.log('✅ Appended FivUI styles to ' + globalCssPath);
    console.log('\n🚨 IMPORTANT: Manual integration required!');
    console.log('   Your components may not style correctly until you:');
    console.log('   • Move CSS variables to the top of your globals.css');
    console.log('   • Ensure proper @tailwind directive order');
  }
}

function showSetupComplete(responses: any) {
  console.log('\n🎉 FivUI setup completed successfully!\n');
  console.log('📋 Next steps:');
  
  if (responses.tailwindVersion === '4') {
    console.log('  1. Ensure your CSS imports: @import "tailwindcss"');
    console.log('  2. No config file needed for Tailwind v4! 🎉');
  } else {
    console.log('  1. Configure your tailwind.config.js');
    console.log('  2. Set up your CSS imports');
  }
  
  console.log('  3. Run: fivui add button');
  console.log('  4. Start building! 🚀\n');
  
  console.log('💡 Learn more: https://ui.fivexlabs.com/docs');
}

function generateGlobalStyles(tailwindVersion: '3' | '4'): string {
  const templateFileName = tailwindVersion === '4' ? 'globals-v4.css' : 'globals-v3.css';
  
  // Resolve template path relative to package root
  const packageRoot = resolve(__dirname, '../..');
  const templatePath = join(packageRoot, 'templates', templateFileName);
  
  if (existsSync(templatePath)) {
    return readFileSync(templatePath, 'utf8');
  }
  
  // Fallback to inline styles if template files are not found
  console.warn(`⚠️  Template file ${templateFileName} not found, using fallback styles`);
  
  if (tailwindVersion === '4') {
    return `@import "tailwindcss";\n\n/* Fallback styles - please check template files */`;
  } else {
    return `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n/* Fallback styles - please check template files */`;
  }
}

async function runDirectSetup(options: InitOptions) {
  const workspace = detectWorkspace();
  
  // Convert CLI options to responses format
  const responses = {
    typescript: true, // Default to TypeScript
    style: 'default', // Always use default style
    baseColor: options.baseColor || 'neutral',
    globalCss: workspace.type === 'single' ? 'src/styles/globals.css' : 'packages/ui/src/styles/globals.css',
    cssVariables: options.cssVariables !== false, // Default to true unless explicitly false
    tailwindVersion: options.tailwindVersion || '4',
    tailwindConfig: options.tailwindVersion === '3' ? 'tailwind.config.js' : '', // Empty for v4
    componentsAlias: workspace.type === 'single' ? '@/components' : '@workspace/ui/components',
    utilsAlias: workspace.type === 'single' ? '@/lib/utils' : '@workspace/ui/lib/utils',
    rsc: true, // Default to true
    overwriteConfig: options.force || false,
    overwriteGlobalCss: options.force ? 'overwrite' : 'append'
  };
  
  console.log('🔧 Setting up FivUI with CLI options...');
  await executeSetup(responses, workspace, options);
} 