/**
 * Deploy gate: exits 1 unless docs/DECISIONS.md G4 records conditions 1–3 as met (format in scripts/lib/g4-gate.ts).
 * Usage: `node scripts/g4-gate.ts [path/to/DECISIONS.md]` (Node >= 22.18, no npm install needed) or `npm run g4:gate`.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkG4Gate } from './lib/g4-gate.ts';

const file = resolve(process.argv[2] ?? resolve(import.meta.dirname, '..', 'docs', 'DECISIONS.md'));
const result = checkG4Gate(readFileSync(file, 'utf8'));
if (result.ok) {
  console.log('g4:gate PASSED: DECISIONS.md G4 records conditions 1, 2 and 3 as met and confirmed by Roman.');
} else {
  console.error('g4:gate FAILED: deploy is not allowed yet.');
  for (const e of result.errors) console.error(`  - ${e}`);
  process.exitCode = 1;
}
