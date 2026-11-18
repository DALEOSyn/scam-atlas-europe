/**
 * npm run content:validate [-- --strict]
 * Validates every content/scenarios/<chapter>/*.yaml against src/content/schema.ts
 * and cross-checks source ids (content/sources.yaml) and brand ids (content/brands.yaml).
 * --strict also fails on placeholder sources/brands (use from G1 on).
 */
import { resolve } from 'node:path';
import { validateContent } from './lib/content.ts';

const strict = process.argv.includes('--strict');
const contentDir = resolve(import.meta.dirname, '..', 'content');
const report = validateContent(contentDir, { strict });

for (const w of report.warnings) console.warn(`warning: ${w}`);
for (const e of report.errors) console.error(`error: ${e}`);

if (report.errors.length > 0) {
  console.error(`\ncontent:validate FAILED: ${report.errors.length} error(s).`);
  process.exit(1);
}
console.log(`content:validate OK: ${report.scenarios.size} scenario(s), ${report.warnings.length} warning(s).`);
