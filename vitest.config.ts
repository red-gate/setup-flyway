import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts', 'test/**/*.test.mts'],
    clearMocks: true,
    globals: false,
    testTimeout: 10000,
  },
});
