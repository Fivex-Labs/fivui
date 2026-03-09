/** FivUI style presets (terrain-themed). Control border radius and visual density. */
export type StylePreset = 'mesa' | 'ridge' | 'dune' | 'slate' | 'forge';

export interface ComponentsConfig {
  $schema?: string;
  /** Style preset: mesa (classic), ridge (compact), dune (soft), slate (sharp), forge (dense). */
  style: StylePreset | 'default' | 'new-york'; // 'default'/'new-york' for backward compat
  rsc?: boolean;
  tsx: boolean;
  tailwind: {
    config: string;
    css: string;
    baseColor?: 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone';
    cssVariables?: boolean;
    version?: '4';
  };
  /** Icon library for component templates. Affects which icon package is installed. */
  iconLibrary?: 'lucide' | 'tabler' | 'remix' | 'phosphor' | 'hugeicons' | 'radix-icons';
  /** Google Font for typography. Generates @import in globals.css. */
  font?: string;
  /** UI primitive library: 'radix' (default), 'base', or 'ark'. Used when adding components without --radix/--base/--ark flag. */
  uiLibrary?: 'radix' | 'base' | 'ark';
  aliases: {
    components: string;
    utils: string;
    ui?: string;
    hooks?: string;
    lib?: string;
  };
}

export interface ComponentKeyframes {
  name: string;
  css: string;
}

export interface RegistryComponentVariant {
  dependencies?: string[];
  devDependencies?: string[];
  files: { name: string; template: string }[];
}

export interface RegistryComponent {
  name: string;
  type: string;
  /** Shared across variants */
  registryDependencies?: string[];
  keyframes?: ComponentKeyframes[];
  /** Legacy flat format (for components with no variants) */
  dependencies?: string[];
  devDependencies?: string[];
  files?: { name: string; template: string }[];
  /** Variant-aware format (radix | base | ark) */
  variants?: {
    radix?: RegistryComponentVariant;
    base?: RegistryComponentVariant;
    ark?: RegistryComponentVariant;
  };
}

export interface WorkspaceInfo {
  root: string;
  type: 'npm' | 'pnpm' | 'yarn' | 'single';
  workspaces: string[];
  currentWorkspace?: string | undefined;
}

export const DEFAULT_COMPONENTS_CONFIG: ComponentsConfig = {
  $schema: 'https://ui.fivexlabs.com/fivui.schema.json',
  style: 'mesa',
  tsx: true,
  uiLibrary: 'radix',
  tailwind: {
    config: '',
    css: 'src/styles/globals.css',
    baseColor: 'neutral',
    cssVariables: true,
    version: '4',
  },
  aliases: {
    components: '@/components',
    utils: '@/lib/utils',
    ui: '@/components/ui',
    hooks: '@/hooks',
    lib: '@/lib',
  },
};

export const MONOREPO_COMPONENTS_CONFIG: ComponentsConfig = {
  $schema: 'https://ui.fivexlabs.com/fivui.schema.json',
  style: 'mesa',
  tsx: true,
  uiLibrary: 'radix',
  tailwind: {
    config: '',
    css: 'packages/ui/src/styles/globals.css',
    baseColor: 'neutral',
    cssVariables: true,
    version: '4',
  },
  aliases: {
    components: '@workspace/ui/components',
    utils: '@workspace/ui/lib/utils',
    ui: '@workspace/ui/components',
    hooks: '@workspace/ui/hooks',
    lib: '@workspace/ui/lib',
  },
}; 