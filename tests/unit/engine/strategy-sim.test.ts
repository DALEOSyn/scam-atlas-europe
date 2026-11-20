/**
 * GDD §7.2 strategy rows 6, 6b, 8 and 10, played through the runner (not hand-written records).
 * A synthetic Berlin-shaped chapter: 4 standard fraud (2 red flags + 2 decoys each; "1-5" has the
 * sender as a decoy and no link), 3 genuine with 2 own checkable details each (1-6 has sender + link),
 * and a 3-beat boss with 4 red flags and 3 decoys. Max 172, R = 12.
 */
import { describe, expect, it } from 'vitest';
import type { RunnerEvent } from '../../../src/engine/runner.ts';
import { recordOf, summarise } from '../../../src/engine/chapter.ts';
import { checkablesOf } from '../../../src/engine/inspect.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { startScenario, step, viewOf } from '../../../src/engine/runner.ts';
import type { Scenario } from '../../../src/content/schema.ts';
import { rawFraud, rawGenuine, scenario } from '../../content/fixtures.ts';
import { B, ctx, type Raw } from './helpers.ts';

const PATTERN = 'smishing-parcel-fee';

const fraudStd = (id: string) => scenario(rawFraud(id));
/** "1-5": sender decoy, no link, two red-flag phone numbers. */
const fraudCode = scenario({
  ...rawFraud('f15'),
  message: { sender: { display: 'Brewnook', detail: 'BREWNOOK' }, body: 'Send us the 6-digit code we just texted you.', request: 'share_code', references: ['BN-1'], phone_numbers: ['0800 ••• 1', '0800 ••• 2'] },
  inspectables: [
    { target: 'sender.detail', reveal: 'Looks like the real sender ID.', red_flag: false },
    { target: 'reference', reveal: 'A case number.', red_flag: false },
    { target: 'phone_number', reveal: 'Not Brewnook support.', red_flag: true },
    { target: 'phone_number#2', reveal: 'Not Brewnook support either.', red_flag: true },
  ],
  actions: [
    { id: 'tap_link', label: 'Reply with the code', kind: 'reply', next_beat: 'fee_page', pressure_target: true },
    { id: 'open_app', label: 'Open the app yourself', kind: 'verify_in_app', outcome: 'fine' },
    { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
  ],
});
/** Genuine with sender + reference (no link, no phone). */
const genuineTwo = (id: string, pattern: string) =>
  scenario(rawGenuine(id, { pattern, message: { sender: { display: 'Trundle', detail: 'TRUNDLE' }, body: 'Your parcel is in the locker.', request: 'none', references: ['TR-2'] }, inspectables: [] }));
/** Genuine high stakes with sender + link ("1-6"). */
const genuineHigh = scenario(rawGenuine('g16', {
  stakes: 'high',
  message: { sender: { display: 'Thimble & Pine', detail: 'orders@thimble-pine.example' }, body: 'Payment failed. Update it at thimble-pine.example/account', request: 'enter_details' },
  inspectables: [],
  actions: [
    { id: 'go_pick_up', label: 'Update via the email link', kind: 'enter_details', outcome: 'done', pressure_target: true },
    { id: 'check_app', label: 'Open the shop yourself', kind: 'verify_in_app', outcome: 'done' },
    { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
  ],
}));

/** Boss: beat 1 sender decoy + link flag; beat 2 sender + link flags + logo decoy; beat 3 call: caller-ID decoy + phone flag. */
const bossRaw = rawFraud('boss');
const bossS: Scenario = scenario({
  ...bossRaw,
  role: 'boss',
  difficulty: 3,
  message: { sender: { display: 'Trundle', detail: 'TRUNDLE' }, body: 'Pay the fee at trundle-zoll.example/p/1', request: 'pay' },
  inspectables: [
    { target: 'sender.detail', reveal: 'Looks like the courier.', red_flag: false },
    { target: 'link', reveal: 'Not trundle.example.', red_flag: true },
  ],
  beats: [
    ...(bossRaw.beats as Raw[]),
    {
      id: 'b2', arrives_after: 30, device: 'email',
      message: { sender: { display: 'Customs', detail: 'bill@customs-pay.example' }, subject: 'Invoice', body: 'Pay at customs-pay.example/x', request: 'pay', image: { alt: 'Logo' } },
      inspectables: [
        { target: 'sender.detail', reveal: 'Not customs.', red_flag: true },
        { target: 'link', reveal: 'Not customs.', red_flag: true },
        { target: 'image', reveal: 'A copied logo.', red_flag: false },
      ],
      actions: [
        { id: 'b2_verify', label: 'Check in the app', kind: 'verify_in_app', outcome: 'fine' },
        { id: 'b2_report', label: 'Report it', kind: 'report', outcome: 'reported' },
        { id: 'b2_pay', label: 'Pay', kind: 'pay', outcome: 'stolen', pressure_target: true },
      ],
    },
    {
      id: 'b3', arrives_after: 30, device: 'call',
      message: { sender: { display: 'Trundle support', detail: '+49 30 •••• 1' }, transcript: [{ speaker: 'caller', text: 'Pay now.' }], request: 'pay', phone_numbers: ['0800 ••• 9'] },
      inspectables: [
        { target: 'caller_id', reveal: 'Caller ID can be faked.', red_flag: false },
        { target: 'phone_number', reveal: 'Not Trundle.', red_flag: true },
      ],
      actions: [
        { id: 'b3_verify', label: 'Call Trundle on the app number', kind: 'call_back_known', outcome: 'fine' },
        { id: 'b3_report', label: 'Report the call', kind: 'report', outcome: 'reported' },
        { id: 'b3_pay', label: 'Pay', kind: 'pay', outcome: 'stolen', pressure_target: true },
      ],
    },
  ],
});

const chapterScenarios: Scenario[] = [fraudStd('f11'), genuineTwo('g11', PATTERN), fraudStd('f13'), genuineTwo('g12', 'staff-briefing'), fraudCode, genuineHigh, fraudStd('f17'), bossS];
const chapter = { patterns: [PATTERN] };

type Tagger = (targets: string[]) => string[];
const tagAll: Tagger = (t) => t;
const tagSenderLink: Tagger = (t) => t.filter((x) => x === 'sender.detail' || x === 'caller_id' || x === 'link');
const tagNone: Tagger = () => [];

/** Play one scenario: on each live beat, check + tag per strategy, then pick the action of the wanted class. */
function playScenario(s: Scenario, tagger: Tagger, pick: 'verify' | 'report') {
  const c = ctx();
  let st = startScenario(s, c);
  for (let guard = 0; guard < 20 && st.phase !== 'done'; guard++) {
    const v = viewOf(s, c, st);
    if (st.phase === 'consequence') {
      st = step(s, c, st, { type: 'continue' });
      continue;
    }
    const beat = v.beat;
    if (!beat) break;
    const def = s.beats.find((b) => b.id === beat.id);
    const targets = checkablesOf({ id: beat.id, device: beat.device, message: beat.message, inspectables: beat.id === 'start' ? s.inspectables : (def?.inspectables ?? []) }).map((x) => x.target);
    for (const t of tagger(targets)) {
      st = step(s, c, st, { type: 'check', beatId: beat.id, target: t });
      st = step(s, c, st, { type: 'tag', beatId: beat.id, target: t, on: true });
    }
    const want = beat.actions.find((a) => B.action_kinds[a.kind].class === pick) ?? beat.actions.find((a) => B.action_kinds[a.kind].class === 'verify');
    if (!want) throw new Error(`no ${pick} action on ${s.id}/${beat.id}`);
    st = step(s, c, st, { type: 'act', actionId: want.id } as RunnerEvent);
  }
  return recordOf(resultOf(s, B, st), s.pattern);
}

function playChapter(tagger: Tagger, pick: 'verify' | 'report') {
  return summarise(B, chapter, chapterScenarios.map((s) => playScenario(s, tagger, pick)), true);
}

describe('GDD §7.2 rows played through the runner', () => {
  it('the synthetic chapter has max 172 and R = 12', () => {
    const s = playChapter(tagNone, 'verify');
    expect(s.max).toBe(172);
    expect(s.redFlags).toBe(12);
  });

  it('row 6: tag everything + always verify → 150, spotted −5, bronze', () => {
    expect(playChapter(tagAll, 'verify')).toMatchObject({ points: 150, spotted: -5, stamp: 'bronze' });
  });

  it('row 6b: always tag sender + link + always verify → 162 (94.2%), spotted 2, bronze', () => {
    const s = playChapter(tagSenderLink, 'verify');
    expect(s).toMatchObject({ points: 162, correctTags: 9, wrongTags: 7, spotted: 2, stamp: 'bronze' });
    expect(s.rating).toBeCloseTo(94.19, 1);
  });

  it('row 8: blind always-verify → 150 (87.2%), spotted 0, bronze', () => {
    const s = playChapter(tagNone, 'verify');
    expect(s).toMatchObject({ points: 150, spotted: 0, stamp: 'bronze', doubleChecks: 2, offFocusDoubleChecks: 1 });
    expect(s.rating).toBeCloseTo(87.21, 1);
  });

  it('row 10: blind always-report → 55 (32%), 3 genuine reported, bronze', () => {
    const s = playChapter(tagNone, 'report');
    expect(s).toMatchObject({ points: 55, genuineReported: 3, stamp: 'bronze' });
    expect(s.rating).toBeCloseTo(31.98, 1);
  });
});
