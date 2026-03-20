import { builtinModules } from 'node:module';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vitest/config';

const nodeBuiltins = builtinModules.flatMap(m => [m, `node:${m}`]);

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        cleanup: 'src/cleanup.ts'
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rolldownOptions: {
      platform: "node",
      external: nodeBuiltins,
      checks: { pluginTimings: false },
      experimental: { attachDebugInfo: "none" },
    },
    target: 'node24',
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: { conditions: ['node'] },
  plugins: [checker({typescript: {root: '.'}})],
  test: {
    globals: true,
    mockReset: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/cleanup.ts'],
    },
  }
});
