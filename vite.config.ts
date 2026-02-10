import {defineConfig} from 'vitest/config';
import {builtinModules} from 'node:module';

const nodeBuiltins = builtinModules.flatMap(m => [m, `node:${m}`]);

const cjsShimBanner = `\
import {createRequire as __cjs_createRequire} from 'node:module';
import {dirname as __cjs_dirname} from 'node:path';
import {fileURLToPath as __cjs_fileURLToPath} from 'node:url';
const require = __cjs_createRequire(import.meta.url);
const __filename = __cjs_fileURLToPath(import.meta.url);
const __dirname = __cjs_dirname(__filename);`;

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
    rollupOptions: {
      external: nodeBuiltins,
      output: {
        banner: cjsShimBanner
      }
    },
    target: 'node24',
    minify: 'esbuild',
    outDir: 'dist',
    emptyOutDir: true
  },
  test: {
    globals: true,
    mockReset: true,
    environment: 'node',
    include: ['test/**/*.test.ts']
  }
});
