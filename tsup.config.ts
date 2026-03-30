import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  target: 'es2020',
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  minify: true,
  treeshake: true,
});