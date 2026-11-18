import { defineConfig, type Plugin } from 'vitest/config';
import preact from '@preact/preset-vite';
import { parse } from 'yaml';

/** Same YAML-as-JSON import as the build (vite.config.ts), without build-time validation. */
const yamlData: Plugin = {
  name: 'scam-atlas-yaml-data',
  transform(code, id) {
    if (!/\.ya?ml$/.test(id)) return null;
    return { code: `export default ${JSON.stringify(parse(code))};`, map: null };
  },
};

export default defineConfig({
  plugins: [preact(), yamlData],
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/content/**/*.test.ts'],
    environment: 'node',
  },
});
