import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import prompts from 'prompts';
import type { ComponentsConfig, StylePreset } from '../../lib/schemas';
// import { DEFAULT_COMPONENTS_CONFIG, MONOREPO_COMPONENTS_CONFIG } from '../../lib/schemas';
import { detectWorkspace } from '../../lib/workspace';

export interface InitOptions {
  monorepo?: boolean;
  style?: StylePreset;
  baseColor?: 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone';
  iconLibrary?: 'lucide' | 'tabler' | 'remix' | 'phosphor' | 'hugeicons' | 'radix-icons';
  cssVariables?: boolean;
  force?: boolean;
  uiLibrary?: 'radix' | 'base' | 'ark';
}

export async function initProject(options: InitOptions = {}) {
  console.log('\n🎨 Welcome to FivUI!\n');
  
  // Check if meaningful CLI options are provided - if so, skip interactive mode
  const hasCliOptions = (options.baseColor && options.baseColor !== 'neutral') ||
                       (options.style && options.style !== 'mesa') ||
                       options.cssVariables === false ||
                       options.force ||
                       options.monorepo ||
                       options.uiLibrary === 'base';
  
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
        type: 'select' as const,
        name: 'style',
        message: 'Which style preset would you like?',
        choices: [
          { title: 'Mesa (classic, balanced)', value: 'mesa' },
          { title: 'Ridge (compact)', value: 'ridge' },
          { title: 'Dune (soft, rounded)', value: 'dune' },
          { title: 'Slate (sharp, boxy)', value: 'slate' },
          { title: 'Forge (dense)', value: 'forge' }
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
      },
      {
        type: 'select' as const,
        name: 'font',
        message: 'Which font would you like to use?',
        choices: [
          { title: 'Inter', value: 'inter' },
          { title: 'Geist', value: 'geist' },
          { title: 'Plus Jakarta Sans', value: 'plus-jakarta-sans' },
          { title: 'DM Sans', value: 'dm-sans' },
          { title: 'None (use system font)', value: 'none' }
        ],
        initial: 0
      },
      {
        type: 'select' as const,
        name: 'iconLibrary',
        message: 'Which icon library would you like to use?',
        choices: [
          { title: 'Lucide (default, recommended)', value: 'lucide' },
          { title: 'Tabler Icons', value: 'tabler' },
          { title: 'Remix Icons', value: 'remix' },
          { title: 'Phosphor Icons', value: 'phosphor' },
          { title: 'HugeIcons', value: 'hugeicons' },
          { title: 'Radix Icons', value: 'radix-icons' }
        ],
        initial: 0
      },
      {
        type: 'select' as const,
        name: 'uiLibrary',
        message: 'Which UI primitive library would you like to use?',
        choices: [
          { title: 'Radix UI (established, widely used)', value: 'radix' },
          { title: 'Base UI (modern, by MUI team)', value: 'base' },
          { title: 'Ark UI (headless, by Chakra team)', value: 'ark' }
        ],
        initial: 0
      }
    ]);

    // Handle user cancellation
    if (Object.keys(responses).length === 0) {
      console.log('\n❌ Setup cancelled.');
      return;
    }

    // Ensure style has a value (default mesa)
    if (!(responses as any).style) (responses as any).style = 'mesa';
    if (!(responses as any).iconLibrary) (responses as any).iconLibrary = 'lucide';
    if (!(responses as any).font) (responses as any).font = 'inter';

    // Check for existing files and ask about overwriting
    const overwriteQuestions = await checkExistingFiles(responses, workspace, existingConfig);
    
    if (overwriteQuestions.length > 0) {
      const overwriteResponses = await prompts(overwriteQuestions);
      Object.assign(responses, overwriteResponses);
    }

    // Show configuration summary
    console.log('\n📋 Configuration Summary:');
    console.log(`   Base Color: ${responses.baseColor}`);
    console.log(`   Style: ${responses.style}`);
    console.log(`   Global CSS: ${responses.globalCss}`);
    console.log(`   CSS Variables: ${responses.cssVariables ? 'Yes' : 'No'}`);
    console.log(`   TypeScript: ${responses.typescript ? 'Yes' : 'No'}`);
    const libNames: Record<string, string> = { radix: 'Radix UI', base: 'Base UI', ark: 'Ark UI' };
    console.log(`   UI Library: ${libNames[responses.uiLibrary] ?? 'Radix UI'}`);

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
    $schema: 'https://ui.fivexlabs.com/fivui.schema.json',
    style: responses.style,
    iconLibrary: responses.iconLibrary ?? 'lucide',
    font: responses.font ?? 'inter',
    tsx: responses.typescript,
    rsc: responses.rsc,
    uiLibrary: responses.uiLibrary ?? 'radix',
    tailwind: {
      config: '',
      css: responses.globalCss,
      baseColor: responses.baseColor,
      cssVariables: responses.cssVariables,
      version: '4',
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
    handleGlobalCssSetup(globalCssPath, responses.baseColor ?? 'neutral', responses.style ?? 'mesa', responses.overwriteGlobalCss === 'overwrite', responses.font);
  }
  
  // Show setup instructions
  showSetupComplete(responses);
}

/**
 * Derives physical directory paths from user-provided alias responses.
 * Mirrors the logic in workspace.ts resolveComponentPath.
 */
function derivePathsFromResponses(workspace: any, responses: any): { uiDir: string; libDir: string; stylesDir: string; hooksDir?: string } {
  const componentsAlias = responses.componentsAlias ?? '@/components';
  const utilsAlias = responses.utilsAlias ?? '@/lib/utils';
  const globalCss = responses.globalCss ?? 'src/styles/globals.css';

  // Handle @workspace/ aliases (monorepo)
  if (componentsAlias.startsWith('@workspace/')) {
    const workspacePath = componentsAlias.replace('@workspace/', '');
    const uiPackageDir = join(workspace.root, 'packages', dirname(workspacePath));
    return {
      uiDir: join(uiPackageDir, 'src', 'components', 'ui'),
      libDir: join(uiPackageDir, 'src', 'lib'),
      hooksDir: join(uiPackageDir, 'src', 'hooks'),
      stylesDir: join(uiPackageDir, 'src', 'styles'),
    };
  }

  // Handle @/ aliases (single project)
  if (componentsAlias.startsWith('@/')) {
    const basePath = workspace.currentWorkspace
      ? join(workspace.root, workspace.currentWorkspace)
      : workspace.root;
    const componentsLocalPath = componentsAlias.replace('@/', '');
    const uiDir = join(basePath, 'src', componentsLocalPath, 'ui');
    const libLocalPath = utilsAlias.replace('@/', '').replace(/\/utils$/, '') || 'lib';
    const libDir = join(basePath, 'src', libLocalPath);
    const stylesDir = join(basePath, dirname(globalCss));
    return { uiDir, libDir, stylesDir };
  }

  // Fallback: literal path (e.g. "components")
  const basePath = workspace.currentWorkspace
    ? join(workspace.root, workspace.currentWorkspace)
    : workspace.root;
  const uiDir = join(basePath, componentsAlias, 'ui');
  const libDir = join(basePath, utilsAlias.replace(/\/utils$/, ''));
  const stylesDir = join(basePath, dirname(globalCss));
  return { uiDir, libDir, stylesDir };
}

function createDirectoryStructure(workspace: any, responses: any, isMonorepo: boolean) {
  const { uiDir, libDir, stylesDir, hooksDir } = derivePathsFromResponses(workspace, responses);

  const dirs: string[] = [uiDir, libDir, stylesDir];
  if (hooksDir) {
    dirs.push(hooksDir);
  }

  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      const displayPath = dir.startsWith(workspace.root) ? dir.replace(workspace.root + '/', '') : dir;
      console.log(`📁 Created ${displayPath}/`);
    }
  });

  // For monorepo, create UI package.json if it doesn't exist
  if (isMonorepo) {
    const uiPackageDir = join(workspace.root, 'packages', 'ui');
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
  }
}

function handleGlobalCssSetup(globalCssPath: string, baseColor: string, style: string, forceOverwrite: boolean, font?: string) {
  const globalStyles = generateGlobalStyles(baseColor, style, font);
  
  if (!existsSync(globalCssPath) || forceOverwrite) {
    // Create or overwrite
    const dir = dirname(globalCssPath);
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
 * 2. Ensure @import "tailwindcss" is at the very beginning
 * 3. Place @layer base styles after the import
 * 
 * Or run: fivui init --force to overwrite this file completely
 * ======================================== */

${globalStyles}`;
    
    writeFileSync(globalCssPath, appendedContent);
    console.log('✅ Appended FivUI styles to ' + globalCssPath);
    console.log('\n🚨 IMPORTANT: Manual integration required!');
    console.log('   Your components may not style correctly until you:');
    console.log('   • Move CSS variables to the top of your globals.css');
    console.log('   • Ensure @import "tailwindcss" is at the beginning');
  }
}

function showSetupComplete(_responses: any) {
  console.log('\n🎉 FivUI setup completed successfully!\n');
  console.log('📋 Next steps:');
  console.log('  1. Ensure your CSS imports: @import "tailwindcss"');
  console.log('  2. No config file needed for Tailwind v4! 🎉');
  console.log('  3. Run: fivui add button');
  console.log('  4. Start building! 🚀\n');
  console.log('💡 Learn more: https://ui.fivexlabs.com/docs');
}

/** Border radius per style preset (Mesa, Ridge, Dune, Slate, Forge) */
const STYLE_RADIUS: Record<string, string> = {
  mesa: '0.625rem',
  ridge: '0.5rem',
  dune: '0.75rem',
  slate: '0',
  forge: '0.375rem',
  default: '0.625rem',
  'new-york': '0.625rem',
};

/** Google Fonts family slugs for @import (value from init prompt -> URL slug) */
const GOOGLE_FONT_SLUGS: Record<string, string> = {
  inter: 'Inter:wght@400;500;600;700',
  geist: 'Geist:wght@400;500;600;700',
  'plus-jakarta-sans': 'Plus+Jakarta+Sans:wght@400;500;600;700',
  'dm-sans': 'DM+Sans:wght@400;500;600;700',
};

function generateGlobalStyles(baseColor: string, style: string = 'mesa', font?: string): string {
  const validBaseColors = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
  const templateFileName = validBaseColors.includes(baseColor) && baseColor !== 'neutral'
    ? join('themes', `${baseColor}-v4.css`)
    : 'globals-v4.css';

  const packageRoot = resolve(__dirname, '../..');
  const templatePath = join(packageRoot, 'templates', templateFileName);

  let content: string;
  if (existsSync(templatePath)) {
    content = readFileSync(templatePath, 'utf8');
  } else {
    const fallbackPath = join(packageRoot, 'templates', 'globals-v4.css');
    if (existsSync(fallbackPath)) {
      console.warn(`⚠️  Theme file ${templateFileName} not found, using default neutral theme`);
      content = readFileSync(fallbackPath, 'utf8');
    } else {
      console.warn(`⚠️  Template files not found, using fallback styles`);
      return `@import "tailwindcss";\n\n/* Fallback styles - please check template files */`;
    }
  }

  // Apply style preset radius (matches --radius: 0.625rem or similar)
  const radius = STYLE_RADIUS[style] ?? STYLE_RADIUS.mesa;
  content = content.replace(/--radius:\s*[^;]+;/, `--radius: ${radius};`);

  // Prepend Google Fonts @import when font is selected
  if (font && font !== 'none' && GOOGLE_FONT_SLUGS[font]) {
    content = `@import url('https://fonts.googleapis.com/css2?family=${GOOGLE_FONT_SLUGS[font]}&display=swap');\n\n${content}`;
  }
  return content;
}

async function runDirectSetup(options: InitOptions) {
  const workspace = detectWorkspace();
  
  // Convert CLI options to responses format
  const responses = {
    typescript: true,
    style: options.style || 'mesa',
    iconLibrary: options.iconLibrary || 'lucide',
    font: (options as any).font || 'inter',
    baseColor: options.baseColor || 'neutral',
    globalCss: workspace.type === 'single' ? 'src/styles/globals.css' : 'packages/ui/src/styles/globals.css',
    cssVariables: options.cssVariables !== false, // Default to true unless explicitly false
    componentsAlias: workspace.type === 'single' ? '@/components' : '@workspace/ui/components',
    utilsAlias: workspace.type === 'single' ? '@/lib/utils' : '@workspace/ui/lib/utils',
    rsc: true, // Default to true
    uiLibrary: options.uiLibrary ?? 'radix',
    overwriteConfig: options.force || false,
    overwriteGlobalCss: options.force ? 'overwrite' : 'append'
  };
  
  console.log('🔧 Setting up FivUI with CLI options...');
  await executeSetup(responses, workspace, options);
} 