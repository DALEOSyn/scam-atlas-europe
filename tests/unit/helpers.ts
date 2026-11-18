import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { balanceSchema, scenarioSchema, type Balance, type Scenario } from '../../src/content/schema.ts';

export const ROOT = resolve(import.meta.dirname, '..', '..');

export function readYaml(rel: string): unknown {
  return parse(readFileSync(resolve(ROOT, rel), 'utf8'));
}

export function loadExample(): Scenario {
  return scenarioSchema.parse(readYaml('tests/fixtures/example-scenario.yaml'));
}

export function loadBalanceFile(): Balance {
  return balanceSchema.parse(readYaml('content/balance.yaml'));
}
