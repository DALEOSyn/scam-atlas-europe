/**
 * Warsaw (T-3.7): the authored chapter played through the runner, so the GDD §25.7 strategy check, the
 * marketplace device (CR-33), the code confirmation (CR-34), the drill for Mateus (CR-32) and the boss's
 * "Move the chat to Kettle" engage (CR-35, ruling R14) hold for the real YAML.
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { maxPointsOfScenario, redFlagCount, resultOf } from '../../../src/engine/result.ts';
import { step, type RunnerContext, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import { readYaml, ROOT } from '../helpers.ts';
import { act, B, check, ctx, play, run, tag } from './helpers.ts';

const DIR = 'content/scenarios/warsaw';
const all = new Map<string, Scenario>(
  readdirSync(resolve(ROOT, DIR))
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => {
      const s = scenarioSchema.parse(readYaml(`${DIR}/${f}`));
      return [s.id, s] as const;
    }),
);
const get = (id: string): Scenario => {
  const s = all.get(id);
  if (!s) throw new Error(`missing ${id}`);
  return s;
};
const c = () => ctx({ slot: 5 });
const cont: RunnerEvent = { type: 'continue' };
const recover = (picks: string[]): RunnerEvent => ({ type: 'recovery', picks });
const BOSS = 'warsaw-09-boss-stove';
const kasiaReply: RunnerEvent = { type: 'interrupt_act', interruptId: 'kasia_concert_done', actionId: 'reply_kasia_bravo' };
const tagBoth = (target: string, beat = 'start'): RunnerEvent[] => [check(target, beat), tag(target, beat)];

/** Drive consequences, interrupts and (optionally) damage control to the end. */
function finish(s: Scenario, cx: RunnerContext, st0: RunnerState, picks?: string[]): RunnerState {
  let st = st0;
  for (let i = 0; i < 10 && st.phase !== 'done'; i++) {
    if (st.phase === 'consequence') st = step(s, cx, st, cont);
    else if (st.phase === 'interrupt') st = step(s, cx, st, kasiaReply);
    else if (st.phase === 'damage_control' && picks) st = step(s, cx, st, recover(picks));
    else break;
  }
  return st;
}
const points = (id: string, events: RunnerEvent[], picks?: string[]) => {
  const s = get(id);
  const cx = ctx({ slot: 5, timerMode: 'off' });
  return resultOf(s, B, finish(s, cx, run(s, cx, events), picks));
};

describe('Warsaw: chapter totals (GDD §25.7)', () => {
  const scored = () => [...all.values()].filter((s) => s.role === 'standard' || s.role === 'boss');

  it('8 scored (3 genuine), R = 12, max 170, boss 51', () => {
    expect(scored()).toHaveLength(8);
    expect(scored().filter((s) => !s.is_fraud)).toHaveLength(3);
    expect(scored().reduce((n, s) => n + redFlagCount(s), 0)).toBe(12);
    expect(scored().reduce((n, s) => n + maxPointsOfScenario(B, s), 0)).toBe(170);
    expect(maxPointsOfScenario(B, get(BOSS))).toBe(51);
  });

  it('per-scenario R and max points match the strategy table', () => {
    const expected: Record<string, [number, number]> = {
      'warsaw-01-rucksack-sold': [0, 15],
      'warsaw-02-vote-for-the-band': [2, 19],
      'warsaw-03-collect-your-payment': [3, 21],
      'warsaw-04-kasia-twelve-euros': [0, 15],
      'warsaw-05-card-photo-in-app': [1, 17],
      'warsaw-06-kasia-payment-code': [1, 17],
      'warsaw-08-atlas-lines': [0, 15],
      [BOSS]: [5, 51],
    };
    for (const [id, [r, max]] of Object.entries(expected)) {
      expect([id, redFlagCount(get(id))]).toEqual([id, r]);
      expect([id, maxPointsOfScenario(B, get(id))]).toEqual([id, max]);
    }
  });

  it('the payment code appears only in 5-6 and drill 5-7', () => {
    const withCode = [...all.values()].filter((s) => JSON.stringify(s).includes('payment code')).map((s) => s.id).sort();
    expect(withCode).toEqual(['warsaw-06-kasia-payment-code', 'warsaw-07-mateus-asks']);
  });
});

describe('Warsaw standard scenarios', () => {
  it('5-1 genuine sale (CR-30, CR-33): printing the label ★★★; reporting it costs 5', () => {
    const s = get('warsaw-01-rucksack-sold');
    expect(play(s, c(), [act('print_rucksack_label')]).r.stars).toBe(3);
    expect(play(s, c(), [act('check_rucksack_sale')]).r.stars).toBe(3);
    expect(play(s, c(), [act('report_sale_notice')]).r.points).toBe(-5);
    expect(play(s, c(), [act('ignore_sale_notice')]).r.stars).toBe(2);
  });

  it('5-2: typing the code is a fall; closing the page and calling Ola keeps the engage cap ★★', () => {
    const s = get('warsaw-02-vote-for-the-band');
    const fell = play(s, c(), [act('open_vote_link'), act('enter_vote_number'), act('type_vote_code')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options).toHaveLength(6);
    expect(play(s, c(), [act('open_vote_link'), act('enter_vote_number'), act('close_call_ola')]).r.stars).toBe(2);
    expect(points('warsaw-02-vote-for-the-band', [...tagBoth('claim'), ...tagBoth('link'), act('call_ola_saved')]).points).toBe(19);
  });

  it('5-4 genuine €12: "couldn\'t check" never caps; cancelling the agreed payment scores 0', () => {
    const s = get('warsaw-04-kasia-twelve-euros');
    expect(s.beats[0]?.message.payee?.name_check).toBe('unavailable');
    expect(play(s, c(), [act('pay_kasia_app'), act('send_kasia_twelve')]).r.stars).toBe(3);
    expect(play(s, c(), [act('pay_kasia_app'), act('cancel_call_kasia')]).r.stars).toBe(3);
    expect(play(s, c(), [act('pay_kasia_app'), act('cancel_kasia_transfer')]).r.stars).toBe(0);
    expect(play(s, c(), [act('report_kasia_real')]).r.points).toBe(-5);
  });

  it('5-6 (CR-34): sending the code then declining keeps the code-then-confirm cap; Confirm falls', () => {
    const s = get('warsaw-06-kasia-payment-code');
    const cap = B.points.code_then_confirm.star_cap; // producer ruling after the CR review: ★★ (engine branch)
    expect(play(s, c(), [act('send_payment_code'), act('decline_tremolik')]).r.stars).toBe(cap);
    expect(play(s, c(), [act('send_payment_code'), act('decline_call_kasia')]).r.stars).toBe(cap);
    const fell = play(s, c(), [act('send_payment_code'), act('confirm_tremolik')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options.map((o) => o.step)).toContain('send_code_to_cancel');
    expect(points('warsaw-06-kasia-payment-code', [...tagBoth('request'), act('call_kasia_saved')]).points).toBe(17);
  });
});

describe('Warsaw boss (CR-33 buyer chat, CR-35 engage, covered_by)', () => {
  const s = get(BOSS);

  it('ideal: check the platform on beat 1, then beats 2–3, all 5 red flags tagged: 51 of 51', () => {
    const cx = c();
    const st = finish(
      s,
      cx,
      run(s, cx, [
        ...tagBoth('request'),
        act('keep_in_swaploft'),
        cont,
        ...tagBoth('link', 'collect'),
        ...tagBoth('request', 'collect'),
        act('open_sales_boss'),
        cont,
        ...tagBoth('link', 'release'),
        ...tagBoth('request', 'release'),
        act('open_sales_release'),
      ]),
    );
    expect(st.phase).toBe('done');
    const r = resultOf(s, B, st);
    expect(r.points).toBe(51);
    expect(r.correctTags).toBe(5);
    expect(r.genuineReported).toBe(0);
  });

  it('row 3: "Move the chat to Kettle" ends beat 1 at ★★ (CR-35), then verifying beats 2–3: 46', () => {
    const cx = c();
    const st = finish(
      s,
      cx,
      run(s, cx, [...tagBoth('request'), act('move_chat_kettle'), cont, ...tagBoth('link', 'collect'), ...tagBoth('request', 'collect'), act('open_sales_boss'), cont, ...tagBoth('link', 'release'), ...tagBoth('request', 'release'), act('open_sales_release')]),
    );
    const r = resultOf(s, B, st);
    expect(r.beats.map((b) => b.stars)).toEqual([2, 3, 3]);
    expect(r.points).toBe(46);
  });

  it('a check on beat 1 covers ignoring beats 2 and 3 ("already checked")', () => {
    const cx = c();
    const st = finish(s, cx, run(s, cx, [act('keep_in_swaploft'), cont, act('ignore_collect_boss'), cont, act('ignore_release')]));
    expect(resultOf(s, B, st).beats.map((b) => b.stars)).toEqual([3, 3, 3]);
  });

  it('falls on beats 2 and 3 merge into one six-step list, set warsaw_bank_called, and skip Kasia\'s message', () => {
    const cx = c();
    let st = run(s, cx, [act('move_chat_kettle'), cont, act('enter_card_boss'), cont, act('bank_login_boss')]);
    while (st.phase === 'consequence') st = step(s, cx, st, cont);
    expect(st.phase).toBe('damage_control');
    expect(st.recovery?.options).toHaveLength(6);
    st = finish(s, cx, step(s, cx, st, recover(['block_card_in_bank_app', 'call_bank_known_number', 'change_password'])));
    const r = resultOf(s, B, st);
    expect(r.flagsSet).toContain('warsaw_bank_called');
    expect(r.points).toBe(10 + 9);
    expect(st.interrupts.find((i) => i.id === 'kasia_concert_done')?.skipped).toBe(true);
  });
});

describe('Warsaw strategy rows (GDD §25.7)', () => {
  const PICKS_CARD = ['block_card_in_bank_app', 'call_bank_known_number', 'tell_trusted_adult'];
  const ideal = (): number[] => [
    points('warsaw-01-rucksack-sold', [act('print_rucksack_label')]).points,
    points('warsaw-02-vote-for-the-band', [...tagBoth('claim'), ...tagBoth('link'), act('call_ola_saved')]).points,
    points('warsaw-03-collect-your-payment', [...tagBoth('sender.detail'), ...tagBoth('link'), ...tagBoth('request'), act('open_sales_yourself')]).points,
    points('warsaw-04-kasia-twelve-euros', [act('pay_kasia_app'), act('send_kasia_twelve')]).points,
    points('warsaw-06-kasia-payment-code', [...tagBoth('request'), act('call_kasia_saved')]).points,
    points('warsaw-08-atlas-lines', [act('reply_atlas_thursday')]).points,
  ];

  it('row 1 ideal: 170 of 170, spotted 12', () => {
    const p55 = points('warsaw-05-card-photo-in-app', [...tagBoth('request'), act('check_swaploft_settings')]);
    const boss = points(BOSS, [...tagBoth('request'), act('keep_in_swaploft'), cont, ...tagBoth('link', 'collect'), ...tagBoth('request', 'collect'), act('open_sales_boss'), cont, ...tagBoth('link', 'release'), ...tagBoth('request', 'release'), act('open_sales_release')]);
    expect(ideal().reduce((a, b) => a + b, 0) + p55.points + boss.points).toBe(170);
  });

  // GDD §25.7 row 11 lists the boss as 10 + 15 + 15 + "tags 4" = 44 (total 155). The 4 boss red flags tagged
  // there earn 4 × 2 = 8, capped at +6 (§7.1), so the boss scores 46 and the row 157 (92.4%): still gold,
  // spotted 10. Reported to game-designer as a table correction.
  it('row 11 "inside the app is safe": 157 (GDD table: 155), spotted 10 (gold under today\'s rules; R15 input)', () => {
    const p55 = points('warsaw-05-card-photo-in-app', [act('send_card_photo')], PICKS_CARD);
    expect(p55.points).toBe(9);
    const boss = points(BOSS, [act('move_chat_kettle'), cont, ...tagBoth('link', 'collect'), ...tagBoth('request', 'collect'), act('open_sales_boss'), cont, ...tagBoth('link', 'release'), ...tagBoth('request', 'release'), act('open_sales_release')]);
    expect(boss.points).toBe(46);
    expect(ideal().reduce((a, b) => a + b, 0) + p55.points + boss.points).toBe(157);
    expect(boss.correctTags - boss.wrongTags).toBe(4);
  });

  it('row 6c "always tag the request + always verify": 162, net spotted 2', () => {
    const verify: Record<string, string> = {
      'warsaw-01-rucksack-sold': 'check_rucksack_sale',
      'warsaw-02-vote-for-the-band': 'call_ola_saved',
      'warsaw-03-collect-your-payment': 'open_sales_yourself',
      'warsaw-04-kasia-twelve-euros': 'call_kasia_first',
      'warsaw-05-card-photo-in-app': 'check_swaploft_settings',
      'warsaw-06-kasia-payment-code': 'call_kasia_saved',
      'warsaw-08-atlas-lines': 'ask_adaeze_directory_atlas',
    };
    let total = 0;
    let net = 0;
    for (const [id, a] of Object.entries(verify)) {
      const r = points(id, [...tagBoth('request'), act(a)]);
      total += r.points;
      net += r.correctTags - r.wrongTags;
    }
    const boss = points(BOSS, [...tagBoth('request'), act('keep_in_swaploft'), cont, ...tagBoth('request', 'collect'), act('open_sales_boss'), cont, ...tagBoth('request', 'release'), act('open_sales_release')]);
    expect(total + boss.points).toBe(162);
    expect(net + boss.correctTags - boss.wrongTags).toBe(2);
  });
});

describe('Warsaw drill 5-7 and arc beat', () => {
  it('the drill is unscored, and its damage control is Mateus\'s (CR-32)', () => {
    const s = get('warsaw-07-mateus-asks');
    const cx = c();
    let st = run(s, cx, [act('help_mateus_steps')]);
    while (st.phase === 'consequence') st = step(s, cx, st, cont);
    expect(st.phase).toBe('damage_control');
    expect(st.recovery?.options).toHaveLength(6);
    const quiet = s.outcomes['helping_mateus']?.recovery?.find((r) => r.step === 'keep_quiet');
    expect(quiet?.feedback).toBe('Feeling embarrassed is normal. The advice is to call the bank straight away, without shame. I\'m calling.');
    expect(play(s, cx, [act('let_it_go_mateus')]).r.scored).toBe(false);
  });

  it('the arc beat is slot 5, unscored, and adding €50 banks alex_invested', () => {
    const s = get('warsaw-arc-alex-05');
    expect(s.arc_slot).toBe(5);
    expect(play(s, c(), [act('check_official_register')]).r.stars).toBeNull();
    expect(s.outcomes['added_fifty']?.arc_effects).toEqual({ alex_invested: 50 });
  });
});
