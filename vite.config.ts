import {defineConfig, type Plugin} from 'vitest/config';
import {builtinModules} from 'node:module';

const nodeBuiltins = builtinModules.flatMap(m => [m, `node:${m}`]);

const cjsShimBanner = `\
import {createRequire as __cjs_createRequire} from 'node:module';
import {dirname as __cjs_dirname} from 'node:path';
import {fileURLToPath as __cjs_fileURLToPath} from 'node:url';
const require = __cjs_createRequire(import.meta.url);
const __filename = __cjs_fileURLToPath(import.meta.url);
const __dirname = __cjs_dirname(__filename);`;

/**
 * Vite plugin that defines process.env.NODE_ENV as "production"
 * only during builds. This must NOT apply during tests because
 * src/metadata.ts conditionally exports privateExports when
 * NODE_ENV === 'test'.
 */
function buildOnlyDefine(): Plugin {
  return {
    name: 'build-only-define',
    config(_, {command}) {
      if (command === 'build') {
        return {
          define: {
            'process.env.NODE_ENV': '"production"'
          }
        };
      }
    }
  };
}

export default defineConfig({
  plugins: [buildOnlyDefine()],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        cleanup: 'src/cleanup.ts'
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.mjs`
    },
    rollupOptions: {
      external: nodeBuiltins,
      output: {
        banner: cjsShimBanner
      }
    },
    target: 'node20',
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
