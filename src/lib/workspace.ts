import { existsSync, readFileSync } from 'fs';
import { resolve, join, dirname, relative } from 'path';
import type { WorkspaceInfo, ComponentsConfig } from './schemas';

export function detectWorkspace(cwd: string = process.cwd()): WorkspaceInfo {
  // Start from current directory and walk up to find workspace root
  let currentDir = cwd;
  
  while (currentDir !== dirname(currentDir)) { // Stop at filesystem root
    // Check for workspace files
    const packageJsonPath = join(currentDir, 'package.json');
    const pnpmWorkspacePath = join(currentDir, 'pnpm-workspace.yaml');
    const yarnWorkspacePath = join(currentDir, 'yarn.lock');
    
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      // Check for pnpm workspace
      if (existsSync(pnpmWorkspacePath)) {
        const workspaces = parseWorkspaces(currentDir, 'pnpm');
        return {
          root: currentDir,
          type: 'pnpm',
          workspaces,
          currentWorkspace: findCurrentWorkspace(cwd, currentDir, workspaces) || undefined,
        };
      }
      
      // Check for yarn workspaces
      if (packageJson.workspaces && existsSync(yarnWorkspacePath)) {
        const workspaces = parseWorkspaces(currentDir, 'yarn');
        return {
          root: currentDir,
          type: 'yarn',
          workspaces,
          currentWorkspace: findCurrentWorkspace(cwd, currentDir, workspaces) || undefined,
        };
      }
      
      // Check for npm workspaces
      if (packageJson.workspaces) {
        const workspaces = parseWorkspaces(currentDir, 'npm');
        return {
          root: currentDir,
          type: 'npm',
          workspaces,
          currentWorkspace: findCurrentWorkspace(cwd, currentDir, workspaces) || undefined,
        };
      }
    }
    
    currentDir = dirname(currentDir);
  }
  
  // No workspace found, return single project
  return {
    root: cwd,
    type: 'single',
    workspaces: ['.'],
    currentWorkspace: '.',
  };
}

function parseWorkspaces(root: string, type: 'pnpm' | 'yarn' | 'npm'): string[] {
  const workspaces: string[] = [];
  
  if (type === 'pnpm') {
    const pnpmWorkspacePath = join(root, 'pnpm-workspace.yaml');
    if (existsSync(pnpmWorkspacePath)) {
      // Simple YAML parsing for packages field
      const content = readFileSync(pnpmWorkspacePath, 'utf8');
      const matches = content.match(/packages:\s*\n((?:\s*-\s*.+\n?)*)/);
      if (matches && matches[1]) {
        const packageLines = matches[1].split('\n');
        for (const line of packageLines) {
          const match = line.match(/^\s*-\s*['"]?([^'"]+)['"]?/);
          if (match && match[1]) {
            workspaces.push(match[1]);
          }
        }
      }
    }
  } else {
    // npm/yarn workspaces in package.json
    const packageJsonPath = join(root, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.workspaces) {
        if (Array.isArray(packageJson.workspaces)) {
          workspaces.push(...packageJson.workspaces);
        } else if (packageJson.workspaces.packages) {
          workspaces.push(...packageJson.workspaces.packages);
        }
      }
    }
  }
  
  return workspaces;
}

function findCurrentWorkspace(cwd: string, root: string, workspaces: string[]): string | null {
  const relativePath = relative(root, cwd);
  
  for (const workspace of workspaces) {
    // Handle glob patterns (simplified)
    if (workspace.includes('*')) {
      const pattern = workspace.replace('*', '');
      if (relativePath.startsWith(pattern)) {
        return workspace;
      }
    } else {
      if (relativePath.startsWith(workspace) || relativePath === workspace) {
        return workspace;
      }
    }
  }
  
  return null;
}

export function loadComponentsConfig(configPath: string): ComponentsConfig | null {
  try {
    if (!existsSync(configPath)) {
      return null;
    }
    
    const content = readFileSync(configPath, 'utf8');
    return JSON.parse(content) as ComponentsConfig;
  } catch (error) {
    console.warn(`Failed to load fivui.json from ${configPath}:`, error);
    return null;
  }
}

export function findComponentsConfig(workspace: WorkspaceInfo): string | null {
  const searchPaths: string[] = [];
  
  // Add current directory first
  if (workspace.currentWorkspace) {
    const targetPath = join(workspace.root, workspace.currentWorkspace);
    searchPaths.push(join(targetPath, 'fivui.json'));
  }
  
  // Add workspace-specific paths
  if (workspace.currentWorkspace) {
    searchPaths.push(join(workspace.root, workspace.currentWorkspace, 'fivui.json'));
  }
  
  // Add root path
  searchPaths.push(join(workspace.root, 'fivui.json'));
  
  for (const path of searchPaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  return null;
}

export function resolveComponentPath(
  config: ComponentsConfig,
  workspace: WorkspaceInfo,
  componentType: 'ui' | 'lib' | 'hooks' | 'components'
): string {
  let alias: string;
  
  // Get the correct alias based on component type
  if (componentType === 'ui' && config.aliases.ui) {
    alias = config.aliases.ui;
  } else if (componentType === 'lib' && config.aliases.lib) {
    alias = config.aliases.lib;
  } else if (componentType === 'hooks' && config.aliases.hooks) {
    alias = config.aliases.hooks;
  } else if (componentType === 'components') {
    alias = config.aliases.components;
  } else {
    // Fallback mapping for utils
    if (componentType === 'lib') {
      alias = config.aliases.utils;
    } else {
      alias = config.aliases.components;
    }
  }
  
  // Handle workspace aliases
  if (alias.startsWith('@workspace/')) {
    const workspacePath = alias.replace('@workspace/', '');
    return join(workspace.root, 'packages', workspacePath);
  }
  
  // Handle regular aliases
  if (alias.startsWith('@/')) {
    const localPath = alias.replace('@/', '');
    const basePath = workspace.currentWorkspace 
      ? join(workspace.root, workspace.currentWorkspace)
      : workspace.root;
    
    // For single projects, resolve relative to src/
    return join(basePath, 'src', localPath);
  }
  
  // Fallback to literal path
  return alias;
} 