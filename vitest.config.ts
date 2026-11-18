import { defineConfig, type Plugin } from 'vitest/config';
import preact from '@preact/preset-vite';
import { resolve } from 'node:path';
import { yamlModuleSource } from './scripts/lib/yaml-module.ts';

const SCENARIOS_DIR = resolve(import.meta.dirname, 'content', 'scenarios');

/** Same YAML import as the build (vite.config.ts, scripts/lib/yaml-module.ts), without build-start validation. */
const yamlData: Plugin = {
  name: 'scam-atlas-yaml-data',
  transform(code, id) {
    if (!/\.ya?ml$/.test(id)) return null;
    return { code: yamlModuleSource(id, code, SCENARIOS_DIR), map: null };
  },
};

export default defineConfig({
  plugins: [preact(), yamlData],
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/content/**/*.test.ts'],
    environment: 'node',
  },
});
