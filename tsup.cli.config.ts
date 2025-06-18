import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli/index.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: false,
  outDir: 'dist/cli',
  target: 'node20',
  minify: false,
  treeshake: false,
  platform: 'node',
  shims: true,
  bundle: true,
}); 