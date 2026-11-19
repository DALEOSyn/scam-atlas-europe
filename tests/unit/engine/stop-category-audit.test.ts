/**
 * T-3.13l (R24): calling the bank on a known number is a first action after card or account details are stolen,
 * so it is `stop` everywhere, and a recovery that opens with it meets LO-16 (gold allows one recovered fall).
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { recoveryOptionsOf, scoreRecovery } from '../../../src/engine/recovery.ts';
import { readYaml, ROOT } from '../helpers.ts';
import { B } from './helpers.ts';

function load(path: string): Scenario {
  return scenarioSchema.parse(readYaml(path));
}

const CASES: [string, string][] = [
  ['content/scenarios/berlin/berlin-03-address-incomplete.yaml', 'card_details_stolen'],
  ['content/scenarios/berlin/berlin-07-customs-fee.yaml', 'card_details_stolen'],
  ['content/scenarios/berlin/berlin-08-payment-failed-lookalike.yaml', 'account_and_card_stolen'],
  ['content/scenarios/berlin/berlin-09-boss-fraud-team.yaml', 'fee_paid_by_card'],
  ['content/scenarios/amsterdam/amsterdam-07-easy-work.yaml', 'topped_up'],
];

describe('T-3.13l stop categories', () => {
  it.each(CASES)('%s %s: opening with call_bank_known_number recovers (LO-16)', (path, outcomeId) => {
    const s = load(path);
    const opts = recoveryOptionsOf(s.outcomes[outcomeId]);
    const helpful = opts.filter((o) => o.category !== 'harmful' && o.step !== 'call_bank_known_number').map((o) => o.step);
    expect(helpful.length).toBeGreaterThanOrEqual(2);
    const r = scoreRecovery(B, opts, ['call_bank_known_number', ...helpful.slice(0, 2)]);
    expect(r.lo16).toBe(true);
    expect(r.points).toBeGreaterThanOrEqual(6);
  });

  it('call_bank_known_number is `stop` in every shipped scenario outcome', () => {
    const base = resolve(ROOT, 'content/scenarios');
    const found: string[] = [];
    for (const dir of readdirSync(base)) {
      for (const f of readdirSync(resolve(base, dir)).filter((n) => n.endsWith('.yaml'))) {
        const s = load(`content/scenarios/${dir}/${f}`);
        for (const [id, o] of Object.entries(s.outcomes ?? {})) {
          for (const opt of recoveryOptionsOf(o)) {
            if (opt.step === 'call_bank_known_number') {
              found.push(`${s.id}/${id}`);
              expect(opt.category, `${s.id}/${id}`).toBe('stop');
            }
          }
        }
      }
    }
    expect(found.length).toBeGreaterThanOrEqual(34);
  });
});
