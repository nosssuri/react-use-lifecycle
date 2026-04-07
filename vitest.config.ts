import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    run: !process.env.VITEST_WATCH,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'coverage-final.json'],
      exclude: [
        'node_modules/',
        'dist/',
      ],
    },
  },
});
