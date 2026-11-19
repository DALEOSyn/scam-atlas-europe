/**
 * CR-45 (Madrid QA engine fixes): dialled calls, the bank header's account kind, inline language spans,
 * call announcements, "If you already…" sub-headings, timer expiry on a genuine beat (ruling R21), the
 * generic `you_chose_dismiss_started` line, and a single setup step on an opener that asks nothing.
 * Fixtures: tests/fixtures/scenarios/cr45-*.yaml (validated, linted and played in cr30-35.test.ts too).
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { readYaml } from '../../../scripts/lib/content.ts';
import { choiceLines, layer1Overhead, LAYER1_OVERHEAD, scenarioRules } from '../../../scripts/lib/rules.ts';
import { callDirectionOf, inferredDirection } from '../../../src/content/callDirection.ts';
import { firstLang, langMarkupIssues, langPieces, strayLangMarkers, stripLang } from '../../../src/content/inlineLang.ts';
import { chapterSchema, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { debriefOf } from '../../../src/engine/debrief.ts';
import { expiryDismissOf } from '../../../src/engine/result.ts';
import { clickedViaOf } from '../../../src/engine/recovery.ts';
import { viewOf } from '../../../src/engine/runner.ts';
import { classOf, scoreGroup } from '../../../src/engine/scoring.ts';
import { alreadyHeading } from '../../../src/ui/DebriefView.tsx';
import { logAnnouncement } from '../../../src/ui/ScenarioView.tsx';
import { ROOT, rawFraud, rawGenuine, realRegistries, scenario } from '../../content/fixtures.ts';
import { act, B, ctx, play, run, tick, type Raw } from './helpers.ts';

const FIX = resolve(ROOT, 'tests', 'fixtures', 'scenarios');
const raw = (file: string): Raw => readYaml(join(FIX, file)) as Raw;
const fixture = (file: string): Scenario => scenarioSchema.parse(raw(file));
const content = (rel: string): Scenario => scenarioSchema.parse(readYaml(join(ROOT, 'content', 'scenarios', rel)));
const errors = (r: Raw): string[] => {
  const res = scenarioSchema.safeParse(r);
  return res.success ? [] : res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};
const clone = <T>(x: T): T => structuredClone(x);
const beatOf = (r: Raw, id: string): Raw => (r.beats as Raw[]).find((b) => b.id === id) as Raw;
const expire = Array.from({ length: 400 }, () => tick(1));
const none = { pressureAny: false, pressureGenuine: false };

describe('item 1: a call the player dialled is outgoing', () => {
  const s = fixture('cr45-dialled-call.yaml');
  it('inferred from the parent action (call_number_in_message); the opening and other devices are incoming', () => {
    expect(callDirectionOf(s, 'security_line')).toBe('outgoing');
    expect(callDirectionOf(s, 'start')).toBe('incoming');
    expect(callDirectionOf(fixture('cr31-reserve-call.yaml'), 'reserve_transfer')).toBe('incoming');
  });
  it('the view marks the beat outgoing once the player dials; ringing calls carry no flag', () => {
    const c = ctx({ timerMode: 'off' });
    const st = run(s, c, [act('call_text_number')]);
    expect(viewOf(s, c, st).beat).toMatchObject({ id: 'security_line', device: 'call', outgoing: true });
    const boss = content('berlin/berlin-09-boss-fraud-team.yaml');
    expect(callDirectionOf(boss, 'fraud_team_call')).toBe('incoming');
  });
  it('shipped content: Rome 6-7 "officer_line" (reached by call_number_in_message) is now a dialled call', () => {
    expect(callDirectionOf(content('rome/rome-07-police-text.yaml'), 'officer_line')).toBe('outgoing');
  });
  it('an explicit direction wins over the inference', () => {
    const r = clone(raw('cr45-dialled-call.yaml'));
    beatOf(r, 'security_line').direction = 'outgoing';
    expect(errors(r)).toEqual([]);
    expect(callDirectionOf(scenarioSchema.parse(r), 'security_line')).toBe('outgoing');
  });
  it('validation: call beats only; outgoing never on a schedule; incoming cannot contradict a dialled call', () => {
    const notCall = clone(rawFraud());
    beatOf(notCall, 'fee_page').direction = 'outgoing';
    expect(errors(notCall).join('\n')).toMatch(/direction is for call beats/);
    const ringing = clone(raw('cr45-dialled-call.yaml'));
    beatOf(ringing, 'security_line').direction = 'incoming';
    expect(errors(ringing).join('\n')).toMatch(/cannot ring as incoming/);
    const boss = clone(readYaml(join(ROOT, 'content', 'scenarios', 'berlin', 'berlin-09-boss-fraud-team.yaml')) as Raw);
    beatOf(boss, 'fraud_team_call').direction = 'outgoing';
    expect(errors(boss).join('\n')).toMatch(/outgoing call is one the player dials/);
  });
  it('mixed parents (one dials, one does not) stay incoming by default', () => {
    const s2 = { actions: [{ kind: 'call_number_in_message', next_beat: 'x' }, { kind: 'open_link', next_beat: 'x' }], beats: [], interrupts: [] } as unknown as Scenario;
    expect(inferredDirection(s2, 'x')).toBe('incoming');
  });
});

describe('item 2: account kind', () => {
  it('defaults to personal; Paris business accounts say so and still validate', () => {
    const s = fixture('cr45-personal-account.yaml');
    expect(s.beats[0]?.message.account).toEqual({ nickname: 'Your current account', kind: 'personal' });
    const paris = readdirSync(join(ROOT, 'content', 'scenarios', 'paris')).filter((f) => f.endsWith('.yaml'));
    const withAccount = paris.map((f) => content(`paris/${f}`)).flatMap((x) => x.beats.flatMap((b) => (b.message.account ? [b.message.account] : [])));
    expect(withAccount.length).toBe(4);
    for (const a of withAccount) expect(a.kind).toBe('business');
  });
  it('rejects an unknown kind', () => {
    const r = clone(raw('cr45-personal-account.yaml'));
    ((beatOf(r, 'cleaning_transfer').message as Raw).account as Raw).kind = 'shared';
    expect(errors(r).join('\n')).toMatch(/account\.kind/);
  });
});

describe('item 3: inline language spans', () => {
  it('splits, strips and finds the language', () => {
    const label = 'Reply: {lang:es}¡sí, gracias!{/lang}';
    expect(langPieces(label)).toEqual([{ text: 'Reply: ' }, { text: '¡sí, gracias!', lang: 'es' }]);
    expect(stripLang(label)).toBe('Reply: ¡sí, gracias!');
    expect(firstLang(label)).toBe('es');
    expect(langPieces('plain')).toEqual([{ text: 'plain' }]);
    expect(langMarkupIssues(label)).toEqual([]);
  });
  it('rejects bad markup: unclosed, bad tag, English, empty', () => {
    expect(langMarkupIssues('Reply: {lang:es}¡sí!')).toHaveLength(1);
    expect(langMarkupIssues('{lang:Spanish}hola{/lang}').join()).toMatch(/not a valid language tag: use a BCP 47 tag, e\.g\. \{lang:es\}/);
    expect(langMarkupIssues('{lang:en}hi{/lang}').join()).toMatch(/English/);
    expect(langMarkupIssues('{lang:es} {/lang}').join()).toMatch(/empty/);
  });
  it('schema: labels and narratives are checked; a translation needs a span to translate', () => {
    const r = clone(raw('cr45-personal-account.yaml'));
    const interrupt = (r.interrupts as Raw[])[0] as Raw;
    ((interrupt.actions as Raw[])[0] as Raw).label = 'Reply: {lang:es}¡sí, gracias!';
    expect(errors(r).join('\n')).toMatch(/interrupts\.0\.actions\.0\.label: an inline language marker is not closed/);
    const r2 = clone(raw('cr45-personal-account.yaml'));
    (r2.outcomes as Record<string, Raw>).lucia_kitchen = { narrative: 'Plain English.', translation: 'Nothing to translate.' };
    expect(errors(r2).join('\n')).toMatch(/outcomes\.lucia_kitchen\.translation: a translation needs an inline language span/);
  });
  it('the view carries the label translation; the debrief "You chose" keeps the span (rendered with lang)', () => {
    const s = fixture('cr45-personal-account.yaml');
    const c = ctx({ timerMode: 'off', slot: 4 });
    const st = run(s, c, [tick(6)]);
    const i = viewOf(s, c, st).interrupts[0];
    expect(i?.actions[0]).toMatchObject({ label: 'Reply: {lang:es}¡sí, gracias!{/lang}', translation: 'yes, thanks!' });
  });
});

describe('item 4: call announcements', () => {
  it('a dialled call: "Calling {number}" (player feedback, own slot); a ringing call: "Incoming call from {caller}"', () => {
    const s = fixture('cr45-dialled-call.yaml');
    expect(logAnnouncement(s, { type: 'beat_arrived', beatId: 'security_line', at: 1 } as never)).toEqual({ category: 2, key: 'call', text: 'Calling 9 … 14, masked number.' });
    const boss = content('berlin/berlin-09-boss-fraud-team.yaml');
    const a = logAnnouncement(boss, { type: 'beat_arrived', beatId: 'fraud_team_call', at: 1 } as never);
    expect(a).toMatchObject({ category: 5, key: 'call' });
    expect(a?.text).toMatch(/^Incoming call from /);
    expect(logAnnouncement(fixture('cr45-personal-account.yaml'), { type: 'beat_arrived', beatId: 'cleaning_transfer', at: 1 } as never)).toEqual({ category: 5, text: 'New message.' });
  });
});

describe('item 5: "If you already…" sub-headings', () => {
  it('clickedVia follows the scenario\'s own "click": call, link, several kinds → mixed; interrupts do not count', () => {
    expect(clickedViaOf(fixture('cr45-dialled-call.yaml'))).toBe('call');
    expect(clickedViaOf(scenario(rawFraud()))).toBe('link');
    const mixed = clone(raw('cr45-dialled-call.yaml'));
    (mixed.actions as Raw[]).push({ id: 'open_l', label: 'Open the link', kind: 'reply', outcome: 'text_reported' });
    expect(clickedViaOf(scenarioSchema.parse(mixed))).toBe('mixed');
    // The interrupt's "Reply: ¡sí, gracias!" is small talk, not this scenario's "click".
    expect(clickedViaOf(fixture('cr45-personal-account.yaml'))).toBe('link');
  });
  it('the debrief carries authored headings and clickedVia', () => {
    const s = fixture('cr45-dialled-call.yaml');
    const { st, r } = play(s, ctx({ timerMode: 'off' }), [act('open_app')]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer2.alreadyClicked?.headings).toEqual({ paid: 'Moved money' });
    expect(d.layer2.clickedVia).toBe('call');
  });
  it('a heading needs its text; existing already_clicked without headings still parses', () => {
    const r = clone(raw('cr45-dialled-call.yaml'));
    ((r.debrief as Raw).already_clicked as Raw).headings = { shared_code: 'Read out a code' };
    expect(errors(r).join('\n')).toMatch(/a heading for "shared_code" needs already_clicked.shared_code/);
    expect(errors(rawFraud())).toEqual([]);
  });
});

/**
 * CR-45 round 3 (QA B2): the "If you already…" sub-heading of every shipped scenario with already-clicked advice,
 * one row per scenario, each authored situation with the heading shown over it (the authored heading, else the
 * game's; arc beats keep the arc wording). Pinned so reviewers can read the whole table and see any change.
 */
const HEADINGS: Record<string, Partial<Record<'clicked' | 'entered_details' | 'shared_code' | 'paid', string>>> = {
  'amsterdam-02-id-photo': { entered_details: "Entered your details" },
  'amsterdam-03-noor-new-number': { paid: "Paid or gave card details" },
  'amsterdam-04-noor-lock-down': { paid: "Paid or gave card details" },
  'amsterdam-07-easy-work': { clicked: "Opened, called or replied", paid: "Paid or gave card details" },
  'amsterdam-08-jonas-rent': { paid: "Paid or gave card details" },
  'amsterdam-09-boss-last-evening': { clicked: "Clicked the link", paid: "Paid or gave card details" },
  'brussels-02-poster-parcel': { clicked: "Clicked the link", entered_details: "Entered your details" },
  'brussels-03-new-bank-details': { paid: "Paid or gave card details" },
  'brussels-04-noor-easy-money': { entered_details: "Shared a login or card details" }, // authored
  'brussels-05-noor-friend': { entered_details: "Shared a login or card details" }, // authored
  'brussels-08-mateus-new-number': { paid: "Paid or gave card details" },
  'brussels-09-boss-helpdesk': { clicked: "Called the number they gave", shared_code: "Shared a code or approved a request" }, // clicked authored (pop-up number)
  'brussels-arc-close': { paid: "Sent money" },
  'brussels-arc-recovery-offer': { paid: "Sent money" },
  'brussels-arc-teo': { clicked: "Replied, moved to another app or kept a secret" },
  'amsterdam-arc-alex-02': { clicked: "Replied, moved to another app or kept a secret" },
  'berlin-03-address-incomplete': { clicked: "Clicked the link", entered_details: "Entered your details", paid: "Paid or gave card details" },
  'berlin-04-teo-customs': { clicked: "Clicked the link", paid: "Paid or gave card details" },
  'berlin-05-kettle-code': { shared_code: "Shared a code or approved a request" },
  'berlin-07-customs-fee': { clicked: "Clicked the link", paid: "Paid or gave card details" },
  'berlin-08-payment-failed-lookalike': { clicked: "Clicked the link", entered_details: "Entered your details" },
  'berlin-09-boss-fraud-team': { clicked: "Clicked the link", shared_code: "Shared a code or approved a request", paid: "Paid or gave card details" },
  'berlin-arc-alex-01': { clicked: "Replied, moved to another app or kept a secret" },
  'dublin-02-presenter-ad': { clicked: "Clicked the link", entered_details: "Entered your details" },
  'dublin-03-recovery-offer': { clicked: "Clicked the link", entered_details: "Entered your details", paid: "Paid or gave card details" },
  'dublin-04-declan-two-ads': { paid: "Paid or gave card details" },
  'dublin-06-rating-tasks': { clicked: "Replied", paid: "Paid or gave card details" },
  'dublin-07-adviser-call': { entered_details: "Entered your details" },
  'dublin-09-boss-clone-bond': { entered_details: "Entered your details", paid: "Paid or gave card details" },
  'dublin-arc-alex-08': { paid: "Sent money" },
  'home-02-mailbox-full': { clicked: "Clicked the link", entered_details: "Entered your details" },
  'home-04-kettle-locked': { clicked: "Clicked the link", shared_code: "Shared a code or approved a request" },
  'home-05-teo-prize': { paid: "Paid or gave card details" },
  'home-06-boss-new-portal': { clicked: "Clicked the link", entered_details: "Entered your details", shared_code: "Shared a code or approved a request" },
  'lisbon-02-meter-sticker': { clicked: "Scanned the QR code", entered_details: "Entered your details" },
  'lisbon-03-alfama-ad': { clicked: "Clicked the link", entered_details: "Entered your details" },
  'lisbon-04-beatriz-two-rooms': { paid: "Paid or gave card details" },
  'lisbon-06-host-partner-page': { clicked: "Clicked the link", entered_details: "Entered your details" },
  'lisbon-07-parking-slip': { clicked: "Scanned the QR code", entered_details: "Entered your details" },
  'lisbon-09-boss-thursday-flat': { entered_details: "Entered your details", paid: "Paid or gave card details" },
  'lisbon-arc-alex-07': { clicked: "Replied, moved to another app or kept a secret", paid: "Sent money" },
  'paris-02-ceo-lookalike': { paid: "Paid or gave card details" },
  'paris-03-ines-plumber-rib': { paid: "Paid or gave card details" },
  'paris-05-salary-change': { entered_details: "Entered your details" },
  'paris-07-agency-new-account': { paid: "Paid or gave card details" },
  'paris-08-supplier-thread-match': { paid: "Paid or gave card details" },
  'paris-09-boss-pont': { paid: "Paid or gave card details" },
  'paris-arc-alex-03': { clicked: "Replied, moved to another app or kept a secret" },
  'rome-03-police-card-call': { entered_details: "Entered your details" },
  'rome-04-grandpa-new-number': { clicked: "Followed the caller's steps", paid: "Paid or gave card details" },
  'rome-06-davide-paid': { paid: "Paid or gave card details" },
  'rome-07-police-text': { clicked: "Called the number they gave", shared_code: "Shared a code or approved a request" },
  'rome-08-new-number-davide': { paid: "Paid or gave card details" },
  'rome-09-boss-investigation': { entered_details: "Entered your details", shared_code: "Shared a code or approved a request", paid: "Paid or gave card details" },
  'rome-arc-alex-06': { paid: "Sent money" },
  'stockholm-02-pending-payment': { shared_code: "Shared a code or approved a request" },
  'stockholm-04-jamal-police-call': { shared_code: "Shared a code or approved a request" },
  'stockholm-05-loan-call': { shared_code: "Shared a code or approved a request" },
  'stockholm-06-buyer-qr': { shared_code: "Shared a code or approved a request" },
  'stockholm-08-support-call': { clicked: "Installed something for them" },
  'stockholm-09-boss-case-file': { shared_code: "Shared a code or approved a request" },
  'stockholm-arc-alex-09': { paid: "Sent money" },
  'warsaw-02-vote-for-the-band': { clicked: "Clicked the link", entered_details: "Entered your details" },
  'warsaw-03-collect-your-payment': { clicked: "Clicked the link", entered_details: "Entered your details" },
  'warsaw-05-card-photo-in-app': { entered_details: "Entered your details" },
  'warsaw-06-kasia-payment-code': { shared_code: "Shared a code or approved a request" },
  'warsaw-07-mateus-asks': { shared_code: "Shared a code or approved a request" },
  'warsaw-09-boss-stove': { entered_details: "Entered your details" },
  'warsaw-arc-alex-05': { paid: "Sent money" },
};

describe('item 5: every shipped "If you already…" heading (QA B2 table)', () => {
  const SCEN = join(ROOT, 'content', 'scenarios');
  const shipped = readdirSync(SCEN)
    .sort()
    .flatMap((city) =>
      readdirSync(join(SCEN, city))
        .filter((f) => f.endsWith('.yaml'))
        .sort()
        .map((f) => scenarioSchema.parse(readYaml(join(SCEN, city, f)))),
    );
  const actual = Object.fromEntries(
    shipped.flatMap((s) => {
      const ac = s.debrief.already_clicked;
      if (!ac) return [];
      const via = clickedViaOf(s);
      const row = Object.fromEntries((['clicked', 'entered_details', 'shared_code', 'paid'] as const).flatMap((k) => (ac[k] ? [[k, alreadyHeading(k, ac, s.debrief.variant === 'arc', via)]] : [])));
      return [[s.id, row]];
    }),
  );
  it('the table matches the shipped content', () => {
    expect(actual).toEqual(HEADINGS);
  });
  it('the cases QA named: a link payment is the click; What-now "Call back this number" and a reply to Teo are not', () => {
    // Berlin 1-4: the reply goes to Teo (genuine); the click is the link in his screenshot.
    expect(HEADINGS['berlin-04-teo-customs']?.clicked).toBe('Clicked the link');
    // Berlin 1-9 boss and the Amsterdam boss: "Pay … through the link"; the What-now "Call back this number" is after the call.
    expect(HEADINGS['berlin-09-boss-fraud-team']?.clicked).toBe('Clicked the link');
    expect(HEADINGS['amsterdam-09-boss-last-evening']?.clicked).toBe('Clicked the link');
    // Still right: Rome 6-7 dials the text's number; Lisbon 7-2 scans the sticker.
    expect(HEADINGS['rome-07-police-text']?.clicked).toBe('Called the number they gave');
    expect(HEADINGS['lisbon-02-meter-sticker']?.clicked).toBe('Scanned the QR code');
    expect(clickedViaOf(content('berlin/berlin-09-boss-fraud-team.yaml'))).toBe('link');
    expect(clickedViaOf(content('rome/rome-07-police-text.yaml'))).toBe('call');
  });
  it('replies count only on fraud scenarios; What-now extras never count', () => {
    const r = clone(raw('cr45-dialled-call.yaml'));
    (r.actions as Raw[]).push({ id: 'say_hi', label: 'Reply hi', kind: 'reply', outcome: 'text_reported' });
    expect(clickedViaOf(scenarioSchema.parse(r))).toBe('mixed');
    expect(clickedViaOf({ ...scenarioSchema.parse(r), is_fraud: false })).toBe('call');
    const noDial = scenarioSchema.parse(r);
    const onlyExtra = { ...noDial, actions: noDial.actions.filter((a) => a.kind !== 'call_number_in_message' && a.kind !== 'reply'), beats: [] };
    const withExtra = { ...onlyExtra, what_now: { extra: [{ id: 'cb', label: 'Call back this number', kind: 'call_number_in_message' as const, note: 'n' }] } };
    expect(clickedViaOf(withExtra)).toBe('link');
  });
});

describe('item 6: timer expiry on a genuine beat (ruling R21)', () => {
  const s = fixture('cr45-personal-account.yaml');
  it('expiry on the message scores what "Leave it for now" scores (0 from slot 1; never ★ above it)', () => {
    const c = ctx({ slot: 4 });
    const left = play(s, c, [act('leave_cleaning')]).r;
    const expired = play(s, c, expire).r;
    expect(expired.beats[0]).toMatchObject({ timerExpired: true, stars: left.beats[0]?.stars, points: left.beats[0]?.points });
    expect(expired.beats[0]).toMatchObject({ stars: 0, points: 0 });
  });
  it('expiry on the bank card scores like its Cancel', () => {
    const c = ctx({ slot: 4 });
    const cancelled = play(s, c, [act('pay_lucia_app'), act('cancel_cleaning')]).r;
    const expired = play(s, c, [act('pay_lucia_app'), ...expire]).r;
    expect(expired.beats[0]).toMatchObject({ timerExpired: true, stars: cancelled.beats[0]?.stars, points: cancelled.beats[0]?.points });
  });
  it('tutorial grace (slot 0): the dismiss scores ★, 5 points, and so does the expiry', () => {
    expect(play(s, ctx({ slot: 0 }), expire).r.beats[0]).toMatchObject({ stars: 1, points: 5, timerExpired: true });
  });
  it('no dismiss option on the message: the bank card\'s Cancel, later in the group, counts (psych M1)', () => {
    const r = clone(raw('cr45-personal-account.yaml'));
    r.actions = (r.actions as Raw[]).filter((a) => a.id !== 'leave_cleaning');
    delete (r.outcomes as Record<string, Raw>).cleaning_unpaid;
    const s2 = scenarioSchema.parse(r);
    expect(play(s2, ctx({ slot: 4 }), expire).r.beats[0]).toMatchObject({ stars: 0, points: 0, timerExpired: true });
    expect(expiryDismissOf(s2, B, { current: 'start', timerExpired: true }).map((d) => d.actionId)).toEqual(['cancel_cleaning']);
  });
  it('low stakes: an authored score override on the dismiss caps the expiry too; fraud is untouched', () => {
    const low = rawGenuine('g-low', { pressure: { timer: true, levers: [] } });
    (low.actions as Raw[]).push({ id: 'leave', label: 'Leave it', kind: 'ignore', outcome: 'done', score: 0, score_reason: 'test' });
    const s3 = scenario(low);
    expect(play(s3, ctx({ slot: 4 }), expire).r.beats[0]).toMatchObject({ stars: 2, points: 0, timerExpired: true });
    const f = scenario(rawFraud());
    const fraudExpired = scoreGroup(B, 'fraud', undefined, { engagedOnFraud: false, timerExpired: true, expiryDismiss: expiryDismissOf(f, B, { current: 'start', timerExpired: true }) });
    expect(fraudExpired).toMatchObject({ stars: 2, points: 10 });
  });
  it('the lowest of several dismiss options counts; a decision before the deadline is never replaced', () => {
    const ds = [
      { cls: 'dismiss' as const, kind: 'ignore' as const, actionId: 'a', override: 3 },
      { cls: 'dismiss' as const, kind: 'ignore' as const, actionId: 'b' },
    ];
    expect(scoreGroup(B, 'legit_low', undefined, { engagedOnFraud: false, timerExpired: true, expiryDismiss: ds })).toMatchObject({ stars: 2, points: 3, timerExpired: true });
    const verify = { cls: 'verify' as const, kind: 'ask_someone' as const, actionId: 'v' };
    expect(scoreGroup(B, 'legit_high', verify, { engagedOnFraud: false, timerExpired: true, expiryDismiss: ds })).toMatchObject({ stars: 3, points: 15 });
  });
});

describe('shipped content (after merging CR-36…44, Rome, Lisbon, Stockholm and Dublin)', () => {
  const cities = readdirSync(join(ROOT, 'content', 'scenarios'));
  const shipped = cities.flatMap((c) => readdirSync(join(ROOT, 'content', 'scenarios', c)).filter((f) => f.endsWith('.yaml')).map((f) => content(`${c}/${f}`)));
  const slotOf = new Map(readdirSync(join(ROOT, 'content', 'chapters')).map((f) => [f.replace(/\.yaml$/, ''), chapterSchema.parse(readYaml(join(ROOT, 'content', 'chapters', f))).slot]));

  it('call beats: only Rome 6-7 officer_line and Stockholm 9-2 security_line are dialled; every other call (incl. CR-36 voice calls) rings', () => {
    const dirs = shipped.flatMap((s) => s.beats.filter((b) => b.device === 'call').map((b) => `${s.id}/${b.id}:${callDirectionOf(s, b.id)}`));
    // Both are reached only by "Call the number" in a text (call_number_in_message).
    expect(dirs.filter((d) => d.endsWith(':outgoing')).sort()).toEqual(['rome-07-police-text/officer_line:outgoing', 'stockholm-02-pending-payment/security_line:outgoing']);
    expect(dirs.length).toBeGreaterThan(5);
  });

  it('scheduled call beats announce "Incoming call from …", never "New message."', () => {
    for (const s of shipped) {
      for (const b of s.beats.filter((x) => x.device === 'call' && x.arrives_after !== undefined)) {
        expect([s.id, b.id, logAnnouncement(s, { type: 'beat_arrived', beatId: b.id, at: 0 } as never)?.text.startsWith('Incoming call from ')]).toEqual([s.id, b.id, true]);
      }
    }
  });

  /** Expiry on the opening message, played in the chapter's slot: [stars, points] (R21 changes marked). */
  const EXPIRY: Record<string, [number, number]> = {
    'amsterdam-05-warehouse-interview': [2, 10],
    'brussels-01-print-invoice': [0, 0], // R21 (Brussels)
    'brussels-06-desk-signin': [0, 0], // R21 (Brussels)
    'berlin-06-payment-failed': [0, 0], // R21: was ★, 5
    'dublin-01-tea-money': [0, 0], // R21 (merged from main)
    'dublin-05-ellisfen-sheet': [2, 10],
    'home-03-password-reset': [1, 5], // slot 0 grace: "Close the page" scores ★, 5
    'lisbon-01-graca-studio': [0, 0], // R21: was ★, 5
    'lisbon-05-printed-meter': [2, 10],
    'paris-01-rent-close-match': [0, 0], // R21: was ★, 5
    'paris-06-solene-urgent': [0, 0], // R21: was ★, 5
    'rome-01-breakfast-till-ten': [2, 10],
    'rome-02-teo-calls-you': [2, 10],
    'rome-05-laundry': [0, 0], // R21: was ★, 5
    'stockholm-01-desk-login': [0, 0], // R21 (merged from main)
    'stockholm-03-birgitta-shopping': [0, 0], // R21 (merged from main)
    'warsaw-01-rucksack-sold': [2, 10],
    'warsaw-04-kasia-twelve-euros': [0, 0], // R21: was ★, 5
  };

  it('R21 on every timed genuine scenario: expiry scores its dismiss option, never more', () => {
    const timed = shipped.filter((s) => !s.is_fraud && s.pressure.timer && s.role !== 'arc');
    const got: Record<string, [number, number]> = {};
    for (const s of timed) {
      const slot = slotOf.get(s.chapter) ?? 1;
      const c = ctx({ slot });
      const expired = play(s, c, expire).r.beats[0];
      if (!expired) throw new Error(s.id);
      expect([s.id, expired.timerExpired]).toEqual([s.id, true]);
      got[s.id] = [expired.stars, expired.points];
      for (const a of s.actions.filter((x) => classOf(B, x.kind) === 'dismiss' && x.outcome !== undefined)) {
        const chosen = play(s, c, [act(a.id)]).r.beats[0];
        expect([s.id, a.id, expired.stars <= (chosen?.stars ?? 0), expired.points <= (chosen?.points ?? 0)]).toEqual([s.id, a.id, true, true]);
      }
    }
    expect(got).toEqual(EXPIRY);
  });
});

describe('item 7: you_chose_dismiss_started is generic', () => {
  it('no longer names a reset (and avoids "You started this")', () => {
    const ui = JSON.parse(readFileSync(join(ROOT, 'content', 'i18n', 'en', 'ui.json'), 'utf8')) as Record<string, string>;
    expect(ui.you_chose_dismiss_started).toBe('You left it. This one was safe; it was yours.');
  });
});

describe('extra (coordinator): a single setup step on an opener that asks nothing', () => {
  const opener = (request: string, actions: Raw[]): Raw =>
    rawGenuine('g-open', {
      message: { sender: { display: 'Trundle', detail: 'TRUNDLE' }, body: 'Your parcel is on its way.', request, references: ['TR-2'], phone_numbers: ['0800 ••• 4410'] },
      actions,
      beats: [
        {
          id: 'next',
          device: 'sms',
          message: { sender: { display: 'Trundle', detail: 'TRUNDLE' }, body: 'It is in the locker.', request: 'none' },
          actions: [
            { id: 'pick_up', label: 'Pick it up', kind: 'proceed', outcome: 'done' },
            { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
          ],
        },
      ],
    });
  const wait = { id: 'wait', label: 'Wait for the text', kind: 'proceed', next_beat: 'next' };
  it('request: none with one setup step (next_beat) is valid', () => {
    expect(errors(opener('none', [wait]))).toEqual([]);
  });
  it('sceptic B1: only a real setup step: never on fraud, never a non-proceed action', () => {
    const fraud = rawFraud('f-one', { message: { ...(rawFraud().message as Raw), request: 'none' }, actions: [{ id: 'tap_link', label: 'Open the link', kind: 'open_link', next_beat: 'fee_page', pressure_target: true }] });
    expect(errors(fraud).join('\n')).toMatch(/only a genuine opener with request: none may offer a single setup step/);
    const report = opener('none', [{ id: 'report_first', label: 'Report it', kind: 'report', next_beat: 'next' }]);
    expect(errors(report)).toEqual([]);
    expect(scenarioRules(scenarioSchema.parse(report), realRegistries()).errors.join('\n')).toMatch(/single opening action must be a setup step \(a proceed-class action with next_beat\), not report/);
    expect(scenarioRules(scenarioSchema.parse(opener('none', [wait])), realRegistries()).errors.join('\n')).not.toMatch(/single opening action/);
  });
  it('one action anywhere else is still rejected (2–5)', () => {
    expect(errors(opener('pay', [wait])).join('\n')).toMatch(/a scenario offers 2–5 actions/);
    expect(errors(opener('none', [{ id: 'go', label: 'Pick it up', kind: 'proceed', outcome: 'done' }])).join('\n')).toMatch(/single opening action is a setup step/);
    expect(errors(opener('none', [])).join('\n')).toMatch(/2–5 actions/);
  });
});

describe('psych M1: R21 on a one-action opener (Madrid 4-6 shape)', () => {
  /** A timed genuine high-stakes opener with only "Wait for the code"; the code text offers "Leave it". */
  const codeOpener = (): Raw =>
    rawGenuine('g-code', {
      stakes: 'high',
      pressure: { timer: true, levers: ['urgency'], honest_deadline: 'Code valid 5 minutes' },
      message: { sender: { display: 'Trundle', detail: 'TRUNDLE' }, body: 'Confirm with your bank. We have sent a code.', request: 'none', references: ['TR-2'], phone_numbers: ['0800 ••• 4410'] },
      actions: [{ id: 'wait_code', label: 'Wait for the code', kind: 'proceed', next_beat: 'code_text' }],
      beats: [
        {
          id: 'code_text',
          device: 'sms',
          message: { sender: { display: 'Trundle', detail: 'TRUNDLE' }, body: 'Code 4••••• for your payment.', request: 'enter_details' },
          actions: [
            { id: 'type_code', label: 'Type the code on the page', kind: 'proceed', outcome: 'done' },
            { id: 'check_app', label: 'Check in the app first', kind: 'verify_in_app', outcome: 'done' },
            { id: 'leave_it', label: 'Leave it, buy it later', kind: 'ignore', outcome: 'left' },
          ],
        },
      ],
      outcomes: { done: { narrative: 'Paid.' }, left: { narrative: 'You leave it for now.' } },
    });
  it('expiry on the opener scores what the later "Leave it" scores, never more', () => {
    const s = scenario(codeOpener());
    expect(errors(codeOpener())).toEqual([]);
    const c = ctx({ slot: 4 });
    const left = play(s, c, [act('wait_code'), act('leave_it')]).r.beats[0];
    const onOpener = play(s, c, expire).r.beats[0];
    expect(onOpener).toMatchObject({ timerExpired: true, stars: 0, points: 0 });
    expect([onOpener?.stars, onOpener?.points]).toEqual([left?.stars, left?.points]);
    expect(expiryDismissOf(s, B, { current: 'start', timerExpired: true }).map((d) => d.actionId)).toEqual(['leave_it']);
  });
  it('no dismiss option anywhere in the group: ★, 5 points as before', () => {
    const r = codeOpener();
    const beat = (r.beats as Raw[])[0] as Raw;
    beat.actions = (beat.actions as Raw[]).filter((a) => a.id !== 'leave_it');
    delete (r.outcomes as Record<string, Raw>).left;
    expect(play(scenario(r), ctx({ slot: 4 }), expire).r.beats[0]).toMatchObject({ timerExpired: true, stars: 1, points: 5 });
  });
});

describe('psych M2: "You chose" after a genuine expiry', () => {
  it('genuine: "You let the timer run out. This one was safe to act on."; fraud keeps the plain line', () => {
    const g = fixture('cr45-personal-account.yaml');
    const pg = play(g, ctx({ slot: 4 }), expire);
    expect(debriefOf(g, pg.st, pg.r, none).layer1.youChose).toEqual([{ beatId: 'start', kind: 'timer', genuine: true }]);
    const f = fixture('cr45-dialled-call.yaml');
    const pf = play(f, ctx({ slot: 4 }), expire);
    expect([...debriefOf(f, pf.st, pf.r, none).layer1.youChose, ...debriefOf(f, pf.st, pf.r, none).layer2.youChoseOther.map((o) => o.line)]).toContainEqual({ beatId: 'start', kind: 'timer' });
  });
  it('the layer-1 validator counts the genuine line (and only on genuine)', () => {
    const lines = choiceLines(fixture('cr45-personal-account.yaml'), realRegistries().balance);
    expect(lines).toContain('You let the timer run out. This one was safe to act on.');
    expect(lines).not.toContain('You let the timer run out.');
    expect(choiceLines(fixture('cr45-dialled-call.yaml'), realRegistries().balance)).toContain('You let the timer run out.');
  });
});

describe('sceptic: inline language markers only where they render', () => {
  it('a marker in a message body, a reveal or the debrief is an error; labels and narratives are fine', () => {
    expect(strayLangMarkers({ actions: [{ label: '{lang:es}sí{/lang}' }], outcomes: { a: { narrative: '{lang:es}¡Vale!{/lang}' } } })).toEqual([]);
    const r = clone(raw('cr45-personal-account.yaml'));
    (r.message as Raw).body = 'Hi! {lang:es}¡Hola!{/lang} Your half of the cleaning is €12, to my account as on the note on the fridge. Any time this week.';
    ((r.debrief as Raw).layer1 as Raw).tell = 'Her saved chat, {lang:es}claro{/lang}.';
    const e = errors(r).join('\n');
    expect(e).toMatch(/message\.body: inline language markers/);
    expect(e).toMatch(/debrief\.layer1\.tell: inline language markers/);
    expect(errors(raw('cr45-personal-account.yaml'))).toEqual([]);
  });
});

describe('layer-1 budget counts what renders (genuine expiry line, psych M2)', () => {
  it('the already-clicked link (8 words) is counted only when the debrief has already_clicked', () => {
    expect(layer1Overhead(fixture('cr45-dialled-call.yaml'))).toBe(LAYER1_OVERHEAD.standard);
    expect(layer1Overhead(fixture('cr45-personal-account.yaml'))).toBe(LAYER1_OVERHEAD.standard - 8);
  });
  it('a genuine timed debrief with already_clicked still pays for the link and fails over 40 words', () => {
    const r = clone(raw('cr45-personal-account.yaml'));
    (r.debrief as Raw).already_clicked = { paid: 'Paid the wrong account? Call your bank on the number on your card.' };
    ((r.debrief as Raw).layer1 as Raw).tell = 'Her saved chat and her own account, for the cleaning you share in the flat.';
    const e = scenarioRules(scenarioSchema.parse(r), realRegistries()).errors.join('\n');
    expect(e).toMatch(/debrief\.layer1 is 4\d words in the worst case \(authored \d+ \+ fixed 14 \+ slot 13: "You let the timer run out\. This one was safe to act on\."\)/);
  });
});
