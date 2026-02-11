// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/eslint.config.js',
      '**/vite.config.ts',
      '**/dist/',
      '**/coverage/',
      '**/.yarn/',
      '.pnp.cjs',
      '.pnp.loader.mjs',
      'package.json'
    ],
  },
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    files: ['test/**/*.test.ts', 'src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description'
        }
      ],
      'no-console': 'error',
      'yoda': 'error',
      'prefer-const': [
        'error',
        {
          destructuring: 'all'
        }
      ],
      'no-control-regex': 'off',
      'no-constant-condition': ['error', {checkLoops: false}]
    }
  });
