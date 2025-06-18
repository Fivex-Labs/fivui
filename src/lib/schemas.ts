export interface ComponentsConfig {
  $schema?: string;
  style: 'default' | 'new-york';
  rsc?: boolean;
  tsx: boolean;
  tailwind: {
    config: string;
    css: string;
    baseColor?: 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone';
    cssVariables?: boolean;
    version?: '3' | '4';
  };
  iconLibrary?: 'lucide' | 'radix-icons';
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

export interface RegistryComponent {
  name: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  keyframes?: ComponentKeyframes[];
  files: {
    name: string;
    template: string;
  }[];
}

export interface WorkspaceInfo {
  root: string;
  type: 'npm' | 'pnpm' | 'yarn' | 'single';
  workspaces: string[];
  currentWorkspace?: string | undefined;
}

export const DEFAULT_COMPONENTS_CONFIG: ComponentsConfig = {
  $schema: 'https://ui.fivexlabs.com/fivui.schema.json',
  style: 'default',
  tsx: true,
  tailwind: {
    config: 'tailwind.config.js',
    css: 'src/styles/globals.css',
    baseColor: 'neutral',
    cssVariables: true,
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
  style: 'default',
  tsx: true,
  tailwind: {
    config: 'tailwind.config.js',
    css: 'packages/ui/src/styles/globals.css',
    baseColor: 'neutral',
    cssVariables: true,
  },
  aliases: {
    components: '@workspace/ui/components',
    utils: '@workspace/ui/lib/utils',
    ui: '@workspace/ui/components',
    hooks: '@workspace/ui/hooks',
    lib: '@workspace/ui/lib',
  },
}; 