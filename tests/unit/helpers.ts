import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { scenarioSchema, type Scenario } from '../../src/content/schema.ts';

export const ROOT = resolve(import.meta.dirname, '..', '..');

export function loadExample(): Scenario {
  return scenarioSchema.parse(parse(readFileSync(resolve(ROOT, 'content/scenarios/home/example.yaml'), 'utf8')));
}
