/**
 * Programmatic fixtures for the rule tests: a fraud and a genuine scenario
 * that pass every per-scenario rule, and a slot-1 chapter that passes every
 * mix rule. Tests mutate one thing and expect one message.
 */
import { resolve } from 'node:path';
import {
  loadBalance,
  loadCast,
  loadHabitCards,
  loadLearningObjectives,
  loadPatternIds,
  loadRecoverySteps,
  loadRecoveryFeedback,
  type ContentReport,
} from '../../scripts/lib/content.ts';
import type { Registries } from '../../scripts/lib/rules.ts';
import { chapterSchema, scenarioSchema, type Chapter, type Scenario } from '../../src/content/schema.ts';

export const ROOT = resolve(import.meta.dirname, '..', '..');
export const CONTENT = resolve(ROOT, 'content');
export const DOCS = resolve(ROOT, 'docs');

/** Registries from the real content files (balance.yaml, cast, recovery steps, habit cards, LOs, pattern briefs). */
export function realRegistries(extra: Partial<Registries> = {}): Registries {
  const r: ContentReport = { errors: [], warnings: [], scenarios: new Map() };
  const los = loadLearningObjectives(DOCS);
  const balance = loadBalance(CONTENT, r);
  if (!balance || r.errors.length > 0) throw new Error(`registries do not load: ${r.errors.join('\n')}`);
  return {
    balance,
    cast: loadCast(CONTENT, r),
    recoverySteps: loadRecoverySteps(CONTENT, r),
    recoveryFeedback: loadRecoveryFeedback(CONTENT, r),
    habitCards: loadHabitCards(CONTENT, r, los),
    los,
    patterns: loadPatternIds(DOCS),
    flagsSet: new Set(),
    arcVars: new Set(),
    ...extra,
  };
}

type Raw = Record<string, unknown>;

export function rawFraud(id = 'f1', over: Raw = {}): Raw {
  return {
    id,
    chapter: 'testcity',
    role: 'standard',
    pattern: 'smishing-parcel-fee',
    theme: 'parcel',
    learning_objectives: ['LO-02', 'LO-03', 'LO-05'],
    difficulty: 2,
    is_fraud: true,
    device: 'sms',
    brands: ['trundle'],
    message: {
      sender: { display: 'Trundle', detail: '+49 151 •••• 0173' },
      body: 'Trundle: customs fee EUR 1.99 due today: trundle-zoll.example/p/1',
      request: 'pay',
      references: ['TR-1'],
      phone_numbers: ['0800 ••• 4410'],
    },
    inspectables: [
      { target: 'sender.detail', reveal: 'A private mobile number.', red_flag: true },
      { target: 'link', reveal: 'Not trundle.example.', red_flag: true },
      { target: 'reference', reveal: 'Looks like a tracking number.', red_flag: false },
      { target: 'phone_number', reveal: 'Looks normal.', red_flag: false },
    ],
    actions: [
      { id: 'tap_link', label: 'Open the link', kind: 'open_link', next_beat: 'fee_page', pressure_target: true },
      { id: 'open_app', label: 'Open the app yourself', kind: 'verify_in_app', outcome: 'fine' },
      { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
    ],
    beats: [
      {
        id: 'fee_page',
        device: 'browser',
        message: { page: { address: 'trundle-zoll.example/p/1' }, body: 'Enter card details.', request: 'enter_details' },
        inspectables: [{ target: 'page.address', reveal: 'Still the look-alike.', red_flag: true }],
        actions: [
          { id: 'enter_card', label: 'Enter card details', kind: 'enter_details', outcome: 'stolen', pressure_target: true },
          { id: 'close_page', label: 'Close the page', kind: 'ignore', outcome: 'left' },
        ],
      },
    ],
    outcomes: {
      stolen: {
        narrative: 'Unknown payments appear.',
        recovery: [
          { step: 'block_card_in_bank_app', category: 'stop' },
          { step: 'call_bank_known_number', category: 'secure' },
          { step: 'report_to_police_online', category: 'report' },
          { step: 'reply_ask_money_back', category: 'harmful' },
          { step: 'wait_and_see', category: 'harmful' },
        ],
      },
      fine: { narrative: 'No fee.' },
      reported: { narrative: 'Reported.' },
      left: { narrative: 'Nothing happens.' },
    },
    debrief: {
      layer1: { tell: 'A small fee by text with a look-alike link.', what_works: 'Open the app yourself.' },
      device_tip: 'Press and hold a link to preview it.',
      habit_card: 'open-it-yourself',
      already_clicked: { paid: 'Block your card.' },
      sources: ['europol-scam-smishing'],
    },
    ...over,
  };
}

export function rawGenuine(id = 'g1', over: Raw = {}): Raw {
  return {
    id,
    chapter: 'testcity',
    role: 'standard',
    pattern: 'smishing-parcel-fee',
    theme: 'parcel',
    learning_objectives: ['LO-03'],
    difficulty: 2,
    is_fraud: false,
    stakes: 'low',
    device: 'sms',
    brands: ['trundle'],
    message: {
      sender: { display: 'Trundle', detail: 'TRUNDLE' },
      body: 'Your parcel TR-2 is in the locker. Track it at trundle.example/t/2 or in the app.',
      request: 'none',
      references: ['TR-2'],
      phone_numbers: ['0800 ••• 4410'],
    },
    inspectables: [{ target: 'sender.detail', reveal: 'The short code you know.', red_flag: false, reassures: true }],
    actions: [
      { id: 'go_pick_up', label: 'Pick it up', kind: 'proceed', outcome: 'done' },
      { id: 'check_app', label: 'Check in the app first', kind: 'verify_in_app', outcome: 'done' },
      { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
    ],
    outcomes: { done: { narrative: 'You collect your parcel.' }, reported: { narrative: 'Reported.' } },
    debrief: {
      layer1: { tell: 'It asked for nothing and matched your order.', what_works: 'Open the app yourself.' },
      device_tip: 'Your courier app shows the same parcel.',
      habit_card: 'open-it-yourself',
      sources: ['europol-scam-smishing'],
    },
    ...over,
  };
}

export function scenario(raw: Raw): Scenario {
  return scenarioSchema.parse(raw);
}

/**
 * Slot 1 (band 1–3, 7–8 scored, boss difficulty 3): 8 scored scenarios,
 * 5 fraud + 3 genuine (37.5%), boss fraud in the afternoon, one genuine twin,
 * no more than 2 in a row of one truth, themes alternate, 2 fraud with a
 * sender decoy, a genuine scenario at every difficulty used.
 */
export function validChapter(): { chapter: Chapter; scenarios: Scenario[] } {
  const senderDecoy = (r: Raw): Raw => ({
    ...r,
    inspectables: [
      { target: 'sender.detail', reveal: 'A real-looking short code.', red_flag: false },
      ...(r.inspectables as Raw[]).filter((i) => i.target !== 'sender.detail'),
    ],
  });
  const raws: Raw[] = [
    rawFraud('f1', { difficulty: 1, theme: 'parcel' }),
    rawGenuine('g1', { difficulty: 1, theme: 'bank', twin_of: 'f1' }),
    rawFraud('f2', { difficulty: 2, theme: 'parcel' }),
    senderDecoy(rawFraud('f3', { difficulty: 2, theme: 'bank' })),
    rawGenuine('g2', { difficulty: 2, theme: 'parcel' }),
    senderDecoy(rawFraud('f4', { difficulty: 3, theme: 'shop' })),
    rawGenuine('g3', { difficulty: 3, theme: 'bank' }),
    {
      ...rawFraud('boss', { role: 'boss', difficulty: 3, theme: 'shop' }),
      // The follow-up page stays reached by next_beat; a scheduled boss beat is an independent
      // message (arrives_after, never a next_beat target) and needs min_checkables.
      beats: [
        ...(rawFraud().beats as Raw[]),
        ...(rawFraud().beats as Raw[]).map((b) => ({
          ...b,
          id: 'second_page',
          arrives_after: 30,
          message: { ...(b.message as Raw), references: ['TR-1'] },
          actions: (b.actions as Raw[]).map((a) => ({ ...a, id: `${String(a.id)}_2` })),
        })),
      ],
    },
  ];
  const scenarios = raws.map(scenario);
  const chapter = chapterSchema.parse({
    slot: 1,
    city: 'testcity',
    name: 'Test City',
    status: 'complete',
    patterns: ['smishing-parcel-fee'],
    lo_focus: ['LO-02'],
    scenario_order: { am: ['f1', 'g1', 'f2', 'f3'], pm: ['g2', 'f4', 'g3', 'boss'] },
    boss: 'boss',
    intro: 'A test chapter.',
  });
  return { chapter, scenarios };
}
