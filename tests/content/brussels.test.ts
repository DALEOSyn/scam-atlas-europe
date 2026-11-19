/**
 * Brussels finale content (T-3.12 part 1; GDD §30, R19, R22, CR-40…CR-44): the chapter file (rules card, content
 * notes word for word, the arc finale block), the scored mix, the fall lists (GDD §9: at most 6 options, exactly
 * 2 harmful; tell_trusted_adult as a stop step in every personal-money fall), the advice scenario 10-4 (Noor never
 * shares; the consequence sentence only in its layer 2, followed by the next step), drill 10-5 (CR-41), the boss
 * (CR-42 overlay, Marrowby's call, the Gatewren banner), the finale scenarios (no timer, reveal on every close/Teo
 * outcome, arc_told_someone never on stepping away, no amounts), the new registry entries, and the rules the
 * generic validator cannot see ("never calls you first" only about the card-blocking line; real bodies only on
 * the help card).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { listFiles, validateContent } from '../../scripts/lib/content.ts';
import { chapterRules, scenarioRules } from '../../scripts/lib/rules.ts';
import { chapterSchema, scenarioSchema, ARC_TOLD_SOMEONE, type Scenario } from '../../src/content/schema.ts';
import { CONTENT, realRegistries } from './fixtures.ts';
import { maxPointsOfScenario, redFlagCount } from '../../src/engine/result.ts';
import { deriveCheckables } from '../../src/content/checkables.ts';
import { B } from '../unit/engine/helpers.ts';

const yaml = (path: string): unknown => parse(readFileSync(path, 'utf8'));
const brussels = chapterSchema.parse(yaml(join(CONTENT, 'chapters', 'brussels.yaml')));
const scenarios = new Map<string, Scenario>(
  listFiles(join(CONTENT, 'scenarios', 'brussels'), ['.yaml']).map((f) => {
    const s = scenarioSchema.parse(yaml(f));
    return [s.id, s];
  }),
);
const sc = (id: string): Scenario => {
  const s = scenarios.get(id);
  if (!s) throw new Error(`scenario ${id} is missing`);
  return s;
};

/** Every player-visible string of a scenario (not ids, sources or comments). */
function strings(value: unknown, skip: ReadonlySet<string> = new Set(['sources', 'id', 'learning_objectives', 'brands', 'cast', 'pattern', 'chapter'])): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap((v) => strings(v, skip));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => (skip.has(k) ? [] : strings(v, skip)));
  return [];
}
const textOf = (s: Scenario): string => strings(s).join('\n');

const CONSEQUENCE = "Letting someone use your account like this is a crime, and the account holder can be held responsible. If it's already happened, getting help early is the right move.";
const PRESSURE = "If anyone pressures you to keep going, that's a reason to get help now.";
const FRIEND_ALREADY = 'Sent money already? Stop paying, tell someone you trust, call your bank on the number on your card, and keep the chat history. Ignore anyone who offers to get it back for a fee.';
const FINALE = ['brussels-arc-close', 'brussels-arc-recovery-offer', 'brussels-arc-teo'];
const SCORED = ['brussels-01-print-invoice', 'brussels-02-poster-parcel', 'brussels-03-new-bank-details', 'brussels-04-noor-easy-money', 'brussels-06-desk-signin', 'brussels-07-it-desk-visit', 'brussels-08-mateus-new-number', 'brussels-09-boss-helpdesk'];

describe('Brussels chapter file (GDD §30.1, §30.11)', () => {
  it('is slot 10, complete, with the play order, the boss last and no arc beat', () => {
    expect(brussels.slot).toBe(10);
    expect(brussels.status).toBe('complete');
    expect(brussels.scenario_order).toEqual({
      am: ['brussels-01-print-invoice', 'brussels-02-poster-parcel', 'brussels-03-new-bank-details'],
      pm: ['brussels-04-noor-easy-money', 'brussels-05-noor-friend', 'brussels-06-desk-signin', 'brussels-07-it-desk-visit', 'brussels-08-mateus-new-number', 'brussels-09-boss-helpdesk'],
    });
    expect(brussels.boss).toBe('brussels-09-boss-helpdesk');
    expect(brussels.arc_beat).toBeUndefined();
    expect(brussels.patterns).toEqual(['remote-access-support-call', 'money-mule-recruitment']);
    expect(brussels.callbacks).toEqual(['payment-detail-change', 'smishing-parcel-fee', 'messenger-family-impersonation', 'e-id-approval-on-call', 'recovery-scam']);
  });
  it('intro and rules card word for word', () => {
    expect(brussels.intro).toBe('Brussels: the Open Evening is in two days. The Atlas is printed, Teo and Noor are on their way, and the projector laptop is being difficult.');
    expect(brussels.rules).toEqual({
      title: "Adaeze's Open Evening rules",
      items: ['Nobody who contacted you gets your screen, your codes or your account.', 'Pause, check on a number or app you already know, and ask someone.'],
    });
  });
  it('content notes are R19(4) / STORY §5.6 word for word', () => {
    expect(brussels.content_note).toBe('This chapter ends the trip, including the Alex storyline. It touches on friendship, feeling let down, money and a teenager being offered easy money. You can pause or skip any story scene, and help is one tap away.');
    expect(brussels.content_note_arc_closed).toBe('This chapter ends the trip and touches on money and a teenager being offered easy money. You can pause or skip any story scene, and help is one tap away.');
  });
  it('the arc finale block names its three scenarios, the reveal names and authored reveal lines (CR-43, R22(3))', () => {
    const f = brussels.arc_finale;
    expect(f?.close).toBe('brussels-arc-close');
    expect(f?.recovery_offer).toBe('brussels-arc-recovery-offer');
    expect(f?.teo).toBe('brussels-arc-teo');
    expect(f?.reveal_names).toEqual(['Alex', 'Robin', 'Sacha']);
    expect(f?.reveal).toEqual({ tell: 'Same picture, other names.', habit: 'A photo check and a trusted person beat a feeling.' });
    for (const id of FINALE) expect(sc(id).finale).toBeDefined();
  });
  it('the arc damage control: at most 6 options, exactly 2 harmful, tell_trusted_adult as a stop step, no amounts', () => {
    const dc = brussels.arc_finale?.damage_control ?? [];
    expect(dc.length).toBeLessThanOrEqual(6);
    expect(dc.filter((x) => x.category === 'harmful')).toHaveLength(2);
    expect(dc).toContainEqual({ step: 'tell_trusted_adult', category: 'stop' });
    expect(dc).toContainEqual({ step: 'stop_paying', category: 'stop' });
  });
  it('no story scenes yet (part 2): `scenes` is left out, which the validator allows', () => {
    expect(brussels.scenes).toBeUndefined();
  });
  it('the Atlas page links the four habit cards of STORY §3.10', () => {
    expect(brussels.atlas_cards).toEqual(['easy-money-costs-you', 'nobody-needs-your-screen', 'a-real-friend-never-needs-your-money', 'ask-someone']);
  });
  it('passes the chapter rules with no mix issue (the finale is exempt from the callback cap, GDD §30.5)', () => {
    const res = chapterRules(brussels, 'brussels', [...scenarios.values()], realRegistries());
    expect(res).toEqual({ errors: [], warnings: [] });
  });
  it('the callback cap still applies to a chapter without arc_finale (sceptic 2)', () => {
    const plain = { ...brussels, arc_finale: undefined };
    const res = chapterRules(plain, 'brussels', [...scenarios.values()], realRegistries());
    expect(res.errors.join('\n')).toMatch(/mix: 5 callbacks; at most 2/);
  });
  it('every Brussels scenario passes the per-scenario rules', () => {
    const reg = realRegistries({ flagsSet: new Set(['brussels_bank_called', ARC_TOLD_SOMEONE]) });
    for (const s of scenarios.values()) expect(scenarioRules(s, reg).errors, s.id).toEqual([]);
  });
  it('content:validate reports no error for Brussels', () => {
    const r = validateContent(CONTENT);
    expect(r.errors).toEqual([]);
    expect(r.warnings.filter((w) => /(?:scenarios|chapters)\/brussels/.test(w))).toEqual([]);
  });
});

describe('Brussels mix (GDD §30.1, §30.3)', () => {
  it('8 scored: 3 genuine (10-1, 10-6, 10-7), 5 fraud, plus drill 10-5', () => {
    const scored = [...brussels.scenario_order.am, ...brussels.scenario_order.pm].map(sc).filter((s) => s.role === 'standard' || s.role === 'boss');
    expect(scored.map((s) => s.id)).toEqual(SCORED);
    expect(scored.filter((s) => !s.is_fraud).map((s) => s.id)).toEqual(['brussels-01-print-invoice', 'brussels-06-desk-signin', 'brussels-07-it-desk-visit']);
    expect(sc('brussels-05-noor-friend').role).toBe('drill');
  });
  it('R = 14 and max 172 (boss 51), per-scenario as the GDD §30.8 strategy check', () => {
    const expected: Record<string, [number, number]> = {
      'brussels-01-print-invoice': [0, 15],
      'brussels-02-poster-parcel': [2, 19],
      'brussels-03-new-bank-details': [2, 19],
      'brussels-04-noor-easy-money': [2, 19],
      'brussels-06-desk-signin': [0, 15],
      'brussels-07-it-desk-visit': [0, 15],
      'brussels-08-mateus-new-number': [2, 19],
      'brussels-09-boss-helpdesk': [6, 51],
    };
    for (const [id, [r, max]] of Object.entries(expected)) expect([id, redFlagCount(sc(id)), maxPointsOfScenario(B, sc(id))]).toEqual([id, r, max]);
    expect(SCORED.reduce((n, id) => n + redFlagCount(sc(id)), 0)).toBe(14);
    expect(SCORED.reduce((n, id) => n + maxPointsOfScenario(B, sc(id)), 0)).toBe(172);
  });
  it('genuine own checkables 10-1 5, 10-6 5, 10-7 3; twins 10-1 and 10-3 expose 5 each', () => {
    const n = (id: string) => deriveCheckables(sc(id).device, sc(id).message).length;
    expect(['brussels-01-print-invoice', 'brussels-06-desk-signin', 'brussels-07-it-desk-visit'].map(n)).toEqual([5, 5, 3]);
    expect(n('brussels-03-new-bank-details')).toBe(5);
  });
  it('the finale scenarios have no timer (R22) and are arc beats outside scenario_order', () => {
    for (const id of FINALE) {
      expect(sc(id).pressure.timer, id).toBe(false);
      expect(sc(id).role).toBe('arc');
    }
  });
});

describe('Fall lists (GDD §9, §30.4 shared rule)', () => {
  it('every damage-control list has at most 6 options and exactly 2 harmful', () => {
    for (const s of scenarios.values()) {
      for (const [key, o] of Object.entries(s.outcomes)) {
        if (!o.recovery) continue;
        expect(o.recovery.length, `${s.id} ${key}`).toBeLessThanOrEqual(6);
        expect(o.recovery.filter((r) => r.category === 'harmful'), `${s.id} ${key}`).toHaveLength(2);
      }
    }
  });
  it('tell_trusted_adult is a stop step in every personal-money fall (10-2, 10-8, boss, recovery offer)', () => {
    for (const id of ['brussels-02-poster-parcel', 'brussels-08-mateus-new-number', 'brussels-09-boss-helpdesk', 'brussels-arc-recovery-offer']) {
      for (const [key, o] of Object.entries(sc(id).outcomes)) if (o.recovery) expect(o.recovery, `${id} ${key}`).toContainEqual({ step: 'tell_trusted_adult', category: 'stop' });
    }
  });
  it('the boss: every fall sets brussels_bank_called; remote-access falls and the approved sign-in have their own steps', () => {
    const o = sc('brussels-09-boss-helpdesk').outcomes;
    const falls = Object.entries(o).filter(([, x]) => x.recovery);
    expect(falls.map(([k]) => k).sort()).toEqual(['logged_in_phone_off', 'pointer_moves_b1', 'pointer_moves_b2']);
    for (const [, x] of falls) expect(x.sets_flags).toEqual(['brussels_bank_called']);
    for (const k of ['pointer_moves_b1', 'pointer_moves_b2']) expect(o[k]?.recovery?.map((r) => r.step)).toEqual(['go_offline', 'call_bank_known_number', 'tell_trusted_adult', 'get_device_checked', 'let_caller_finish', 'pay_to_unlock']);
    expect(o['logged_in_phone_off']?.recovery?.map((r) => r.step)).toEqual(['call_bank_known_number', 'tell_trusted_adult', 'change_password', 'report_to_police_online', 'approve_again_to_cancel', 'wait_and_see']);
    for (const [key, x] of Object.entries(o)) if (!x.recovery) expect(x.sets_flags, key).toBeUndefined();
  });
});

describe('10-4 advice scenario: Noor never shares (CR-40, R19(1), BX7)', () => {
  const s = sc('brussels-04-noor-easy-money');
  it('is an advice scenario for Noor with a forwarded Postwick DM from Summer Euro Club', () => {
    expect(s.advice).toEqual({ for: 'noor' });
    expect(s.message.forwarded?.app).toBe('postwick');
    expect(s.message.forwarded?.sender).toEqual({ display: 'Summer Euro Club', detail: '@summer_euro_club · Postwick · 2 mutual friends' });
    expect(s.pressure.timer).toBe(false);
    expect(s.interrupts).toEqual([]);
  });
  it('every branch ends with Noor not sending and telling her mum; no damage control', () => {
    for (const [key, o] of Object.entries(s.outcomes)) {
      expect(o.narrative, key).toMatch(/Mum/);
      expect(o.recovery, key).toBeUndefined();
    }
    expect(s.actions.map((a) => a.kind)).toEqual(['advise_comply', 'ask_someone', 'report', 'ignore']);
    expect(s.outcomes['noor_checks_with_mum']?.narrative).toContain("I'm not sending anything.");
  });
  it('the consequence sentence is in layer 2, followed by the pressure line and the next step', () => {
    expect(s.debrief.layer2.notes?.startsWith(`${CONSEQUENCE} ${PRESSURE} Asking for help is never the wrong thing to do.`)).toBe(true);
    expect(s.debrief.advice_line).toBe('Noor asked, and that was the smart bit. With an offer like this, the answer is always no.');
    expect(s.debrief.already_clicked?.entered_details).toBe("If you've already shared it, it's not too late: change your login, call your bank on the number on your card, and tell a trusted adult.");
  });
  it('no outcome or layer-1 line calls anyone a criminal or mentions punishment, liability or "trouble"', () => {
    const shown = [...Object.values(s.outcomes).map((o) => o.narrative), s.debrief.layer1.tell, s.debrief.layer1.what_works, s.debrief.advice_line ?? ''].join(' ');
    expect(shown).not.toMatch(/crime|criminal|punish|prison|liab|trouble|police/i);
  });
});

describe('Wording rules across the chapter (BX1, BX7, §28.5 item 8)', () => {
  it('the consequence sentence appears in 10-4 layer 2 only, nowhere else in content', () => {
    for (const s of scenarios.values()) {
      const n = textOf(s).split('is a crime').length - 1;
      expect(n, s.id).toBe(s.id === 'brussels-04-noor-easy-money' ? 1 : 0);
    }
    const sceneFiles = listFiles(join(CONTENT, 'scenes'), ['.yaml']);
    for (const f of sceneFiles) expect(readFileSync(f, 'utf8'), f).not.toMatch(/is a crime/);
    for (const f of ['habit_cards.yaml', 'recovery_steps.yaml']) expect(readFileSync(join(CONTENT, f), 'utf8')).not.toMatch(/crime/);
  });
  it('"never calls you first" is only ever about the card-blocking line; never "your bank never calls"', () => {
    for (const s of scenarios.values()) {
      for (const sentence of textOf(s).split(/(?<=[.!?"])\s+/u)) {
        if (/calls? you first/i.test(sentence)) expect(sentence, s.id).toMatch(/card-blocking line/);
        expect(sentence, s.id).not.toMatch(/bank (?:will )?never calls?/i);
      }
    }
  });
  it('Marrowby is always "Marrowby, the card-blocking line" in what the caller says', () => {
    const call = sc('brussels-09-boss-helpdesk').beats.find((b) => b.id === 'card_call');
    expect(call?.message.sender?.display).toBe('Marrowby');
    const lines = call?.message.transcript?.map((l) => l.text).join(' ') ?? '';
    expect(lines).toContain('Marrowby, the card-blocking line');
    expect(lines).toContain('install Kindhand on the computer you\'re using and read me the code it shows');
  });
  it('no amount anywhere in the finale block (scenarios and the chapter block)', () => {
    for (const id of FINALE) for (const t of strings(sc(id))) expect(t, id).not.toMatch(/[€$£]|\p{Nd}/u);
    for (const t of strings(brussels.arc_finale)) expect(t).not.toMatch(/[€$£]|\p{Nd}/u);
  });
  it('every debrief points to the Belgium help card; real bodies and the real card line never appear', () => {
    for (const s of scenarios.values()) {
      expect(s.debrief.layer2.notes, s.id).toContain('Where to report and get help (Belgium) is on the help screen.');
      expect(textOf(s), s.id).not.toMatch(/Card Stop|Fraudstop|Febelfin|FSMA|Safeonweb|078 170 170|Police on Web/i);
    }
  });
  it('the debriefs never blame: no "you fell", "fooled", "stupid" or "careless"', () => {
    for (const s of scenarios.values()) expect(textOf(s), s.id).not.toMatch(/you fell|fooled|stupid|careless|should have known/i);
  });
});

describe('Drill 10-5: Noor\'s friend already said yes (CR-41)', () => {
  const s = sc('brussels-05-noor-friend');
  const help = s.outcomes['helping_noors_friend'];
  it('damage control for "Noor\'s friend", voiced by Noor, with the six steps of GDD §30.4', () => {
    expect(help?.recovery_for).toEqual({ label: "Noor's friend", voiced_by: 'noor' });
    expect(help?.recovery).toEqual([
      { step: 'stop_sharing', category: 'stop' },
      { step: 'tell_trusted_adult', category: 'stop' },
      { step: 'call_bank_known_number', category: 'stop' },
      { step: 'change_password', category: 'secure' },
      { step: 'keep_quiet', category: 'harmful', feedback: 'She wants it to go away. But getting help early is the right move.' },
      { step: 'one_more_to_end_it', category: 'harmful', feedback: PRESSURE },
    ]);
  });
  it('the friend is never named or cast; Noor is the only cast member', () => {
    expect(s.cast).toEqual(['noor']);
    expect(s.message.body).toBe('One more thing. My friend from football already sent her login and card details last night. She\'s really worried now. What should she do first?');
  });
  it('both branches practise the same damage control; Noor\'s closing line opens layer 2', () => {
    const line = "She's telling her mum tonight. They'll call the bank together, go to the police, and report the account. And I'm warning the team chat.";
    expect(s.debrief.layer2.notes).toContain(line);
    expect(s.outcomes['noor_not_so_sure']?.narrative).toBe('Noor: "I don\'t think it will. Help me pick what she does first?"');
    expect(s.outcomes['noor_not_so_sure']?.recovery).toEqual(help?.recovery);
    expect(s.outcomes['noor_not_so_sure']?.recovery_for).toEqual(help?.recovery_for);
  });
});

describe('Boss 10-9 (GDD §30.7; CR-42)', () => {
  const s = sc('brussels-09-boss-helpdesk');
  it('beat 1 is a browser warning overlay with a Close that picks the one dismiss', () => {
    expect(s.device).toBe('browser');
    expect(s.message.page?.overlay).toEqual({
      title: 'Security alert',
      body: 'Virus detected. This computer is blocked to protect your data. Call Kindhand Support now on 02 ••• •• 17. You have 5 minutes before your files are deleted.',
    });
    expect(s.actions.filter((a) => a.kind === 'ignore' || a.kind === 'delete')).toHaveLength(1);
  });
  it('beat 3 is a "Larchwick Bank" call with a display-only Gatewren banner', () => {
    const b = s.beats.find((x) => x.id === 'bank_call');
    expect(b?.message.sender?.display).toBe('Larchwick Bank');
    expect(b?.banner?.device).toBe('auth');
    expect(b?.banner?.message.body).toBe('Gatewren · Log in to Larchwick internet bank · Windows computer · Antwerp · Just now');
    expect(b?.message.ask?.text).toBe('Approve the security sign-in Gatewren is showing you now.');
  });
  it('the interrupt after beat 3 is Noor, never after a fall', () => {
    expect(s.interrupts.map((i) => [i.id, i.after_beat, i.on_fall, i.is_fraud])).toEqual([['noor_projector', 'bank_call', 'skip', false]]);
  });
  it('fall narratives stop at the cut: no amount, nothing about what the app does', () => {
    for (const key of ['pointer_moves_b1', 'pointer_moves_b2', 'logged_in_phone_off']) expect(s.outcomes[key]?.narrative, key).not.toMatch(/[€$£]/u);
  });
});

describe('Finale scenarios (GDD §30.6; CR-43, R22)', () => {
  it('close beat and Teo\'s chat: every outcome opens the reveal; arc_told_someone only on a photo check or report', () => {
    for (const id of ['brussels-arc-close', 'brussels-arc-teo']) {
      const s = sc(id);
      for (const a of s.actions) {
        const o = a.outcome ? s.outcomes[a.outcome] : undefined;
        expect(o?.reveal, `${id} ${a.id}`).toBe(true);
        const told = o?.sets_flags?.includes(ARC_TOLD_SOMEONE) === true;
        expect(told, `${id} ${a.id}`).toBe(['verify_identity', 'report', 'ask_someone'].includes(a.kind));
      }
    }
  });
  it('the close beat: Alex sends nothing new (no request, no amount) and the layer-2 line is word for word', () => {
    const s = sc('brussels-arc-close');
    expect(s.message.request).toBe('none');
    // QA round 1: slot 9's message is history ("Yesterday", under "Earlier"), not a new bubble under "Today";
    // the body a messenger beat needs is that message's own last word, so Alex adds no new words.
    expect(s.message.earlier).toEqual([{ when: 'Yesterday', body: "I'm in trouble. My account's frozen. You're the only one I can ask." }]);
    expect(s.message.body).toBe('Please?');
    expect([...(s.message.earlier ?? []).map((e) => e.body), s.message.body].join(' ')).toBe("I'm in trouble. My account's frozen. You're the only one I can ask. Please?");
    expect(JSON.stringify(s.message)).not.toMatch(/€|\d{2,}/u);
    expect(s.setup).toBe('The Open Evening is tomorrow. You open your chat with Alex one more time.');
    expect(s.debrief.layer2.notes?.startsWith("A clean photo check doesn't prove a profile is real: pictures can be made with AI. Telling someone is what works.")).toBe(true);
  });
  it('the recovery-agency test: blame on the lie first, the Dublin line, the M2 line and its recovery_note', () => {
    const s = sc('brussels-arc-recovery-offer');
    expect(s.setup).toBe('Alex was never real. The lie was theirs, not yours. A few days later, an email arrives.');
    expect(s.message.sender).toEqual({ display: 'Backhaven Recovery', detail: 'cases@backhaven-recovery.example' });
    const m2 = "People who've lost money are often targeted on purpose afterwards, because scammers share victims' details. That says nothing about you.";
    expect(s.debrief.layer2.notes).toContain(`Anyone who contacts you offering to get your money back for a fee is almost certainly running a second scam. ${m2} Call your bank straight away; it may be able to help.`);
    expect(s.outcomes['release_fee_paid']?.recovery_note).toBe(m2);
    expect(textOf(s)).not.toMatch(/\bagain\b|\btwice\b/i);
    expect(s.debrief.already_clicked?.paid).toBe('Paid a fee already? Stop paying, tell someone you trust, call your bank on the number on your card, and keep the emails. Being targeted says nothing about you.');
    expect(s.outcomes['backhaven_not_authorised']?.narrative).toContain("Fairmeasure's own page says it never contacts people to get their money back, and it can't recover lost money.");
  });
  it('the close beat and Teo\'s chat cite the FSMA dating-platform warning; Teo\'s chat has no "praise"', () => {
    expect(sc('brussels-arc-close').debrief.already_clicked?.paid).toBe(FRIEND_ALREADY);
    for (const id of ['brussels-arc-close', 'brussels-arc-teo']) expect(sc(id).debrief.sources).toContain('be-fsma-dating-platforms-2026');
    expect(textOf(sc('brussels-arc-teo'))).not.toMatch(/praise/i);
    expect(sc('brussels-arc-teo').debrief.sources).toContain('ie-ccpc-investment-scams');
  });
  it("Teo's chat names no platform, Teo never sends money, and the advice line is word for word", () => {
    const s = sc('brussels-arc-teo');
    expect(s.message.forwarded?.body).toBe("Teo, your postcard stories are lovely 😊 I've been making a little extra trading on my phone. Want me to show you? Just between us.");
    expect(textOf(s)).not.toMatch(/Glimmerfund/);
    expect(s.debrief.advice_line).toBe('Teo asked, and that was the smart bit. With an offer like this, the answer is always no.');
    for (const o of Object.values(s.outcomes)) expect(o.recovery).toBeUndefined();
  });
});

describe('Registries (GDD §30.11)', () => {
  const brands = yaml(join(CONTENT, 'brands.yaml')) as { brands: { id: string; name: string; domain?: string }[] };
  const cast = yaml(join(CONTENT, 'cast.yaml')) as { cast: { id: string; name: string }[] };
  const steps = yaml(join(CONTENT, 'recovery_steps.yaml')) as { steps: { id: string; label: string; feedback?: string }[] };
  const cards = yaml(join(CONTENT, 'habit_cards.yaml')) as { cards: { id: string; lo: string; title: string; habit: string; example: string; already_clicked: string }[] };
  it('Marrowby, Summer Euro Club and Weekfold are registered; Robin and Sacha are not cast', () => {
    const ids = brands.brands.map((b) => b.id);
    for (const id of ['marrowby', 'summer-euro-club', 'weekfold']) expect(ids).toContain(id);
    expect(brands.brands.find((b) => b.id === 'marrowby')?.domain).toBeUndefined();
    expect(cast.cast.map((c) => c.name.split(' ')[0])).not.toContain('Robin');
    expect(cast.cast.map((c) => c.name.split(' ')[0])).not.toContain('Sacha');
  });
  it('the three new recovery steps, word for word', () => {
    const by = new Map(steps.steps.map((x) => [x.id, x]));
    expect(by.get('stop_sharing')).toEqual({ id: 'stop_sharing', label: "Stop: don't move any money and don't share anything else" });
    expect(by.get('one_more_to_end_it')).toEqual({ id: 'one_more_to_end_it', label: 'Do one more transfer to make it stop', feedback: PRESSURE });
    expect(by.get('pay_to_unlock')).toEqual({
      id: 'pay_to_unlock',
      label: 'Pay the fee to unlock the screen',
      feedback: 'Paying only adds to the loss; the locked screen is part of the trick. Disconnect it from the internet and call your bank.',
    });
  });
  it('the new LO-14 habit card, and easy-money-costs-you keeps its habit sentence (R19(5))', () => {
    const friend = cards.cards.find((c) => c.id === 'a-real-friend-never-needs-your-money');
    expect(friend).toEqual({
      id: 'a-real-friend-never-needs-your-money',
      lo: 'LO-14',
      title: 'A real friend never needs your money',
      habit: "Someone you've only met online moves you to another app or steers you to money? Tell someone you trust, do a photo check, and never send money.",
      example: "A new online friend's 'easy profits' come with an invitation? Ask someone before you reply.",
      already_clicked: FRIEND_ALREADY,
    });
    const easy = cards.cards.find((c) => c.id === 'easy-money-costs-you');
    expect(easy?.habit).toBe("A real job pays you. If a 'job' wants a deposit, a top-up, a fee or a fine before you can earn or withdraw, or your ID copy before any contract, stop and talk to someone you trust.");
    expect(easy?.example).toContain("Someone online wants to 'use your account for a few transfers'? Say no and ask someone.");
    expect(easy?.already_clicked).toContain('Shared your login or card? Change your login, call your bank on the number on your card, and tell a trusted adult.');
  });
});
