import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import vitestPlugin from '@vitest/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.yarn/**', '*.js', '*.cjs', '*.mjs', '!eslint.config.js'],
  },
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'import/group-exports': 'error',
    },
  },
  {
    files: ['test/**/*.test.ts'],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportDeclaration:not([importKind="type"])[source.value=vitest]',
          message: 'Utilities from Vitest are available as globals and should not be imported',
        },
      ],
      'vitest/no-restricted-vi-methods': [
        'error',
        {
          mock: 'vi.mock is hoisted which can cause hard-to-debug errors. Prefer vi.doMock',
        },
      ],
    },
  }
);
