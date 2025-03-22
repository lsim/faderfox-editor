import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'jsdom',
      coverage: {
        enabled: true,
        include: ['src/**/*.{js,ts}'],
        exclude: [],
        reporter: ['lcov', 'text', 'text-summary', 'cobertura'],
        all: true,
      },
      environment: 'jsdom',
      include: ['test/**/*-tests.ts'],
      exclude: [...configDefaults.exclude, 'e2e/**'],
      globals: true,
    },
  }),
);
