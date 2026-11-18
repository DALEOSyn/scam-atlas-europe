import { describe, expect, it } from 'vitest';
import { chapterRules, scenarioRules, LAYER1_OVERHEAD, wordCount } from '../../scripts/lib/rules.ts';
import { deriveCheckables, linksIn } from '../../src/content/checkables.ts';
import { scenarioSchema, type Scenario } from '../../src/content/schema.ts';
import { rawFraud, rawGenuine, realRegistries, scenario, validChapter } from './fixtures.ts';

type Raw = Record<string, unknown>;
const reg = realRegistries();
const errorsOf = (raw: Raw) => scenarioRules(scenario(raw), reg).errors;
const schemaErrors = (raw: Raw): string[] => {
  const r = scenarioSchema.safeParse(raw);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};
const msg = (raw: Raw) => raw.message as Raw;
const actions = (raw: Raw) => raw.actions as Raw[];

describe('per-scenario rules (scenarioRules)', () => {
  it('the fraud and genuine fixtures pass every rule', () => {
    expect(errorsOf(rawFraud())).toEqual([]);
    expect(errorsOf(rawGenuine())).toEqual([]);
  });

  describe('pressure_target (UI_SPEC §6.3)', () => {
    it('a message that asks for something needs exactly one pressure_target', () => {
      const r = rawFraud();
      actions(r)[0] = { ...actions(r)[0], pressure_target: false };
      expect(errorsOf(r).join('\n')).toMatch(/opening message: the message asks for something \(request: pay\), so exactly one action needs pressure_target: true \(has 0\)/);
      const two = rawFraud();
      actions(two)[1] = { ...actions(two)[1], pressure_target: true };
      expect(errorsOf(two).join('\n')).toMatch(/\(has 2\)/);
    });
    it('a message that asks for nothing has no pressure_target', () => {
      const r = rawGenuine();
      actions(r)[0] = { ...actions(r)[0], pressure_target: true };
      expect(errorsOf(r).join('\n')).toMatch(/pressure_target is set but the message asks for nothing/);
    });
    it('applies to follow-up beats too', () => {
      const r = rawFraud();
      const beat = (r.beats as Raw[])[0] as Raw;
      (beat.actions as Raw[])[0] = { ...(beat.actions as Raw[])[0], pressure_target: false };
      expect(errorsOf(r).join('\n')).toMatch(/beat "fee_page": the message asks for something/);
    });
  });

  describe('action rules', () => {
    it('approve_prompt only on fraud', () => {
      const r = rawGenuine('g', { stakes: 'high', message: { ...msg(rawGenuine()), request: 'approve' } });
      actions(r)[0] = { id: 'approve', label: 'Approve', kind: 'approve_prompt', outcome: 'done', pressure_target: true };
      expect(errorsOf(r).join('\n')).toMatch(/approve_prompt only on fraud/);
    });
    it('no comply on low-stakes genuine, and proceed is required there', () => {
      const r = rawGenuine();
      actions(r)[0] = { id: 'pay_it', label: 'Pay', kind: 'pay', outcome: 'done' };
      const errs = errorsOf(r).join('\n');
      expect(errs).toMatch(/no comply actions on low-stakes genuine/);
      expect(errs).toMatch(/normal response to a low-stakes genuine message is proceed/);
    });
    it('engage on fraud needs next_beat', () => {
      const r = rawFraud();
      actions(r)[0] = { id: 'tap_link', label: 'Open', kind: 'open_link', outcome: 'fine', pressure_target: true };
      r.beats = [];
      r.outcomes = { ...(r.outcomes as Raw), stolen: undefined, left: undefined };
      delete (r.outcomes as Raw).stolen;
      delete (r.outcomes as Raw).left;
      expect(errorsOf(r).join('\n')).toMatch(/engage on fraud is never terminal; it needs next_beat/);
    });
    it('things the player started use proceed, not open_link', () => {
      const r = rawFraud('f', { player_started: true });
      expect(errorsOf(r).join('\n')).toMatch(/the player started this, so the in-message action is proceed, not open_link/);
    });
    it('standard scenarios offer a verify and a tempting wrong action', () => {
      const r = rawFraud();
      actions(r)[1] = { ...actions(r)[1], kind: 'report' };
      expect(errorsOf(r).join('\n')).toMatch(/at least one verify action/);
    });
    it('stakes match the request on genuine messages', () => {
      expect(errorsOf(rawGenuine('g', { stakes: 'high' })).join('\n')).toMatch(/stakes: high does not match the requests/);
    });
    it('stakes count the requests of every beat, not just the opening', () => {
      const g = rawGenuine('g', {
        message: { ...msg(rawGenuine()), request: 'open_link' },
        beats: [
          {
            id: 'shop',
            device: 'browser',
            message: { page: { address: 'trundle.example/pay' }, body: 'Pay the redelivery fee.', request: 'pay' },
            actions: [{ id: 'pay_it', label: 'Pay', kind: 'pay_protected', outcome: 'done', pressure_target: true }],
          },
        ],
      });
      actions(g)[0] = { id: 'go_pick_up', label: 'Open the link', kind: 'proceed', next_beat: 'shop', pressure_target: true };
      expect(errorsOf(g).join('\n')).toMatch(/stakes: low does not match the requests \(open_link, pay\)/);
      expect(errorsOf({ ...g, stakes: 'high' })).toEqual([]);
    });
    it('a fall on fraud needs recovery options', () => {
      const r = rawFraud();
      (r.outcomes as Record<string, Raw>).stolen = { narrative: 'Unknown payments appear.' };
      expect(errorsOf(r).join('\n')).toMatch(/is a fall on fraud: outcome "stolen" needs recovery options/);
    });
  });

  describe('inspectables', () => {
    it('spelling/grammar/language are never red flags and only decoys on fraud', () => {
      const r = rawFraud();
      (r.inspectables as Raw[])[2] = { target: 'reference', reveal: 'Typo.', red_flag: true, type: 'spelling' };
      expect(errorsOf(r).join('\n')).toMatch(/spelling is never a red flag or reassurance, only a decoy/);
      const g = rawGenuine();
      (g.inspectables as Raw[]).push({ target: 'reference', reveal: 'Odd wording.', red_flag: false, type: 'grammar' });
      expect(errorsOf(g).join('\n')).toMatch(/grammar may appear only as a decoy on fraud/);
      const quoted = rawGenuine();
      (quoted.inspectables as Raw[]).push({ target: 'reference', reveal: 'In the quoted text.', red_flag: false, type: 'grammar', context: 'quoted' });
      expect(errorsOf(quoted)).toEqual([]);
    });
    it('the padlock is never proof', () => {
      const r = rawFraud();
      ((r.beats as Raw[])[0] as Raw).inspectables = [
        { target: 'page.address', reveal: 'x', red_flag: true },
        { target: 'page.info', reveal: 'Padlock.', red_flag: false, type: 'padlock', reassures: true },
      ];
      expect(errorsOf(r).join('\n')).toMatch(/padlock is necessary but never proof/);
    });
    it('a logo or display name is never the only reassurance', () => {
      const g = rawGenuine();
      (g.inspectables as Raw[])[0] = { target: 'sender.detail', reveal: 'Right name.', red_flag: false, reassures: true, type: 'display_name' };
      expect(errorsOf(g).join('\n')).toMatch(/a logo or display name is never proof/);
    });
    it('fraud needs at least min_decoys_on_fraud decoys and min_checkables details', () => {
      const r = rawFraud();
      r.inspectables = (r.inspectables as Raw[]).filter((i) => i.red_flag);
      expect(errorsOf(r).join('\n')).toMatch(/at least 2 decoys/);
      const thin = rawFraud();
      thin.message = { ...msg(thin), references: undefined, phone_numbers: undefined };
      thin.inspectables = (thin.inspectables as Raw[]).slice(0, 2);
      expect(errorsOf(thin).join('\n')).toMatch(/2 checkable details; fraud messages need at least 3/);
    });
  });

  describe('words', () => {
    it('debrief layer 1 counts the fixed copy towards the 40-word limit', () => {
      const budget = reg.balance.session.debrief_layer1_max_words - LAYER1_OVERHEAD.standard;
      const r = rawFraud();
      const tell = Array.from({ length: budget }, () => 'word').join(' ');
      (r.debrief as Raw).layer1 = { tell, what_works: 'Open it.' };
      expect(errorsOf(r).join('\n')).toMatch(/debrief\.layer1 is \d+ words with the fixed copy/);
      (r.debrief as Raw).layer1 = { tell: Array.from({ length: budget - 2 }, () => 'word').join(' '), what_works: 'Open it.' };
      expect(errorsOf(r)).toEqual([]);
    });
    it('Alex lines are at most arc_line_max_words', () => {
      const limit = reg.balance.session.arc_line_max_words;
      const body = (n: number) => Array.from({ length: n }, () => 'hey').join(' ');
      const arc = (n: number): Raw => ({
        id: 'arc-1',
        chapter: 'testcity',
        role: 'arc',
        arc_slot: 1,
        learning_objectives: ['LO-14'],
        is_fraud: true,
        device: 'messenger',
        cast: ['alex'],
        message: { sender: { display: 'Alex' }, from_cast: 'alex', body: body(n), request: 'none' },
        actions: [
          { id: 'chat', label: 'Chat back', kind: 'reply', outcome: 'chatted' },
          { id: 'ask_teo', label: 'Mention it to Teo', kind: 'ask_someone', outcome: 'asked' },
        ],
        outcomes: { chatted: { narrative: 'You chat.', arc_effects: { alex_trust: 1 } }, asked: { narrative: 'Teo listens.' } },
        debrief: {
          variant: 'arc',
          layer1: { tell: 'Friendly, fast.', what_works: 'Talk to someone you know.' },
          already_clicked: { clicked: 'Nothing lost yet.' },
          sources: ['europol-scam-smishing'],
        },
      });
      expect(schemaErrors(arc(limit))).toEqual([]);
      expect(errorsOf(arc(limit))).toEqual([]);
      expect(errorsOf(arc(limit + 1)).join('\n')).toMatch(new RegExp(`arc lines are at most ${limit} words \\(has ${limit + 1}\\)`));
    });
    it('wordCount ignores punctuation-only tokens', () => {
      expect(wordCount('Open it — yourself.')).toBe(3);
    });
  });

  describe('registries', () => {
    it('unknown LO, cast, habit card, recovery step and flags fail', () => {
      const r = rawFraud('f', { learning_objectives: ['LO-99', 'LO-03'], cast: ['nobody'], requires_flags: ['never_set'] });
      (r.outcomes as Record<string, Raw>).stolen = {
        narrative: 'x',
        recovery: [
          { step: 'no_such_step', category: 'stop' },
          { step: 'call_bank_known_number', category: 'secure' },
          { step: 'report_to_police_online', category: 'report' },
          { step: 'reply_ask_money_back', category: 'harmful' },
          { step: 'wait_and_see', category: 'harmful' },
        ],
      };
      const errs = errorsOf(r).join('\n');
      expect(errs).toMatch(/LO-99 is not in docs\/LEARNING_OBJECTIVES\.md/);
      expect(errs).toMatch(/unknown cast member "nobody"/);
      expect(errs).toMatch(/no outcome anywhere sets "never_set"/);
      expect(errs).toMatch(/unknown step "no_such_step"/);
    });
    it('the habit card teaches one of the scenario LOs', () => {
      expect(errorsOf(rawFraud('f', { learning_objectives: ['LO-02', 'LO-05'] })).join('\n')).toMatch(/teaches LO-03, which is not in this scenario's learning_objectives/);
    });
    it('recovery lists have pick+2..pick+3 options, >= 2 harmful and a stop step', () => {
      const r = rawFraud();
      (r.outcomes as Record<string, Raw>).stolen = {
        narrative: 'x',
        recovery: [
          { step: 'block_card_in_bank_app', category: 'secure' },
          { step: 'call_bank_known_number', category: 'secure' },
          { step: 'reply_ask_money_back', category: 'harmful' },
        ],
      };
      const errs = errorsOf(r).join('\n');
      expect(errs).toMatch(/offer 5–6 options \(has 3\)/);
      expect(errs).toMatch(/at least 2 harmful/);
      expect(errs).toMatch(/one option must be the stop step/);
    });
  });
});

describe('schema-level checks', () => {
  it('Red Line 8: a letter carries a QR code or URL with an inspectable', () => {
    const letter = (inspectables: Raw[]): Raw =>
      rawFraud('l', {
        device: 'letter',
        message: {
          letterhead: 'Trundle Customs Office',
          body: 'Pay the fee by scanning the code.',
          request: 'scan_qr',
          references: ['TR-9'],
          phone_numbers: ['0800 ••• 4410'],
          qr: { payload: '/qr/letter-fee', destination: 'trundle-zoll.example' },
        },
        inspectables,
        actions: [
          { id: 'scan', label: 'Scan the code', kind: 'scan_qr_and_open', next_beat: 'fee_page', pressure_target: true },
          { id: 'open_app', label: 'Open the app yourself', kind: 'verify_in_app', outcome: 'fine' },
          { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
        ],
      });
    const decoys = [
      { target: 'reference', reveal: 'x', red_flag: false },
      { target: 'phone_number', reveal: 'x', red_flag: false },
    ];
    expect(schemaErrors(letter(decoys)).join('\n')).toMatch(/a letter must carry a QR code or URL with its own inspectable .*Red Line 8/);
    const ok = letter([{ target: 'qr.destination', reveal: 'Not trundle.example.', red_flag: true }, ...decoys]);
    expect(schemaErrors(ok)).toEqual([]);
    expect(errorsOf(ok)).toEqual([]);
  });

  it('Red Line 8 per beat: a paper letter cannot borrow a later SMS link', () => {
    const r = rawFraud('l2', {
      device: 'letter',
      message: { letterhead: 'Trundle Customs Office', body: 'Your parcel is held. We will text you.', request: 'none', references: ['TR-9'], phone_numbers: ['0800 ••• 4410'] },
      inspectables: [
        { target: 'reference', reveal: 'x', red_flag: false },
        { target: 'phone_number', reveal: 'x', red_flag: false },
      ],
      actions: [
        { id: 'wait_text', label: 'Wait for the text', kind: 'proceed', next_beat: 'sms' },
        { id: 'open_app', label: 'Open the app yourself', kind: 'verify_in_app', outcome: 'fine' },
      ],
      beats: [
        {
          id: 'sms',
          device: 'sms',
          message: { sender: { display: 'Trundle' }, body: 'Pay at trundle-zoll.example/p/1', request: 'pay' },
          inspectables: [{ target: 'link', reveal: 'Looks fine.', red_flag: false }],
          actions: [
            { id: 'pay_link', label: 'Pay', kind: 'pay', outcome: 'stolen', pressure_target: true },
            { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
          ],
        },
      ],
      outcomes: { ...(rawFraud().outcomes as Raw), left: undefined },
    });
    delete (r.outcomes as Raw).left;
    expect(schemaErrors(r).join('\n')).toMatch(/^inspectables: a letter must carry a QR code or URL with its own inspectable/m);
  });

  it('Red Line 8 on fraud: the letter\'s QR or URL must be a red flag, not only a decoy', () => {
    const r = rawFraud('l3', {
      device: 'letter',
      message: {
        letterhead: 'Trundle Customs Office',
        body: 'Scan to pay the fee.',
        request: 'scan_qr',
        references: ['TR-9'],
        qr: { payload: '/qr/letter-fee', destination: 'trundle-zoll.example' },
      },
      inspectables: [
        { target: 'qr.destination', reveal: 'Looks fine.', red_flag: false },
        { target: 'reference', reveal: 'x', red_flag: false },
      ],
      actions: [
        { id: 'scan', label: 'Scan the code', kind: 'scan_qr_and_open', next_beat: 'fee_page', pressure_target: true },
        { id: 'open_app', label: 'Open the app yourself', kind: 'verify_in_app', outcome: 'fine' },
        { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
      ],
    });
    expect(schemaErrors(r).join('\n')).toMatch(/mark its qr\.destination or link as red_flag: true \(Red Line 8\)/);
  });

  it('page.address and qr.destination must be fictional lowercase hosts (Red Line 3)', () => {
    const page = (address: string) => {
      const r = rawFraud();
      ((r.beats as Raw[])[0] as Raw).message = { page: { address }, body: 'x', request: 'enter_details' };
      return schemaErrors(r).join('\n');
    };
    expect(page('trundle-zoll.example/p/1')).toBe('');
    expect(page('https://trundle-zoll.example/p/1')).toBe('');
    expect(page('trundle-zoll.com/p/1')).toMatch(/page\.address must be a lowercase host/);
    expect(page('page.info')).toMatch(/page\.address must be a lowercase host/);
    expect(page('trundle.example.com/x')).toMatch(/page\.address must be a lowercase host/);
    expect(page('Trundle-zoll.example')).toMatch(/page\.address must be a lowercase host/);
    const qr = (destination: string) => {
      const r = rawFraud();
      r.message = { ...msg(r), qr: { payload: '/qr/x', destination } };
      return schemaErrors(r).join('\n');
    };
    expect(qr('trundle-redelivery.example')).toBe('');
    expect(qr('trundle-redelivery.de')).toMatch(/qr\.destination must be a lowercase host/);
  });

  it('inspectable targets must be visible in the device template', () => {
    const r = rawFraud();
    (r.inspectables as Raw[]).push({ target: 'payee.iban', reveal: 'x', red_flag: false });
    expect(schemaErrors(r).join('\n')).toMatch(/"payee\.iban" is not visible in this sms message/);
  });

  it('device parts, outcome references, unreachable beats', () => {
    const noBody = rawFraud();
    noBody.message = { ...msg(noBody), body: undefined };
    expect(schemaErrors(noBody).join('\n')).toMatch(/a sms message needs body/);
    const unreachable = rawFraud();
    actions(unreachable)[0] = { ...actions(unreachable)[0], next_beat: undefined, outcome: 'fine' };
    expect(schemaErrors(unreachable).join('\n')).toMatch(/beat "fee_page" is never reached/);
    const unused = rawFraud();
    (unused.outcomes as Raw).spare = { narrative: 'x' };
    expect(schemaErrors(unused).join('\n')).toMatch(/outcome "spare" is never reached/);
  });

  it('fraud debriefs need already_clicked; scored scenarios need pattern, theme and difficulty', () => {
    const r = rawFraud();
    delete (r.debrief as Raw).already_clicked;
    delete r.theme;
    expect(schemaErrors(r).join('\n')).toMatch(/already fell for it/);
    expect(schemaErrors(r).join('\n')).toMatch(/surface theme/);
  });

  it('QR payloads are in-game routes only, and other-language text needs a translation', () => {
    const r = rawFraud();
    r.message = { ...msg(r), qr: { payload: 'https://x.example', destination: 'x.example' } };
    expect(schemaErrors(r).join('\n')).toMatch(/in-game route/);
    const de = rawFraud();
    de.message = { ...msg(de), lang: 'de' };
    expect(schemaErrors(de).join('\n')).toMatch(/needs an inline translation/);
  });
});

describe('"What now?" extras and banners (GDD §6, §17 1-9)', () => {
  const callFraud = (): Raw => {
    const r = rawFraud();
    actions(r).push({ id: 'hang_up', label: 'Hang up', kind: 'hang_up', outcome: 'reported' });
    return r;
  };
  it('what_now needs a hang_up with an outcome on the same beat', () => {
    const r = rawFraud();
    r.what_now = { extra: [] };
    expect(schemaErrors(r).join('\n')).toMatch(/what_now needs a hang_up action/);
    const ok = callFraud();
    ok.what_now = { extra: [{ id: 'call_this_number', label: 'Call back this number', kind: 'call_number_in_message', note: 'You cannot tell whose line it is.' }] };
    expect(schemaErrors(ok)).toEqual([]);
    expect(errorsOf(ok)).toEqual([]);
  });
  it('what_now extras are engage kinds with unique ids', () => {
    const r = callFraud();
    r.what_now = { extra: [{ id: 'pay_now', label: 'Pay', kind: 'pay', note: 'x' }] };
    expect(errorsOf(r).join('\n')).toMatch(/what_now extra "pay_now" must be an engage kind/);
    const dup = callFraud();
    dup.what_now = { extra: [{ id: 'open_app', label: 'Call', kind: 'call_number_in_message', note: 'x' }] };
    expect(schemaErrors(dup).join('\n')).toMatch(/duplicate action id "open_app"/);
  });
  it('a banner is a message with no actions of its own', () => {
    const r = callFraud();
    r.banner = { device: 'sms', message: { sender: { display: 'Larchwick' }, body: 'Code 1234 to approve a payment.', request: 'none' } };
    expect(schemaErrors(r)).toEqual([]);
    const withActions = callFraud();
    withActions.banner = { device: 'sms', message: { body: 'x', request: 'none' }, actions: [] };
    expect(schemaErrors(withActions).join('\n')).toMatch(/banner/);
  });
});

describe('boss beat scheduling', () => {
  it('a boss beat arrives on a schedule or follows next_beat, never both, and a boss has a scheduled beat', () => {
    const unscheduled = rawFraud('b1', { role: 'boss', difficulty: 3 });
    expect(schemaErrors(unscheduled).join('\n')).toMatch(/a boss needs at least one scheduled beat/);
    const both = rawFraud('b2', { role: 'boss', difficulty: 3 });
    both.beats = (both.beats as Raw[]).map((b) => ({ ...b, arrives_after: 30 }));
    expect(schemaErrors(both).join('\n')).toMatch(/cannot also be a next_beat target/);
    const orphan = rawFraud('b3', { role: 'boss', difficulty: 3 });
    actions(orphan)[0] = { ...actions(orphan)[0], next_beat: undefined, outcome: 'fine' };
    expect(schemaErrors(orphan).join('\n')).toMatch(/boss beats arrive on a schedule: set arrives_after/);
  });
});

describe('checkables (UI_SPEC §3)', () => {
  it('derives checkables from the device template, numbering repeats', () => {
    const s = scenario(rawFraud());
    expect(deriveCheckables(s.device, s.message)).toEqual(['sender.detail', 'link', 'reference', 'phone_number']);
    expect(deriveCheckables('email', { request: 'none', sender: { display: 'x' }, body: 'a.example and b.test/x, mail@c.example' })).toEqual([
      'sender.detail',
      'link',
      'link#2',
    ]);
    expect(linksIn('see trundle.example.')).toEqual(['trundle.example']);
  });
});

describe('chapter mix rules (chapterRules)', () => {
  const run = (mutate: (c: ReturnType<typeof validChapter>) => void = () => undefined) => {
    const fx = validChapter();
    mutate(fx);
    return chapterRules(fx.chapter, 'testcity', fx.scenarios, reg);
  };
  const byId = (fx: ReturnType<typeof validChapter>, id: string): Scenario => {
    const s = fx.scenarios.find((x) => x.id === id);
    if (!s) throw new Error(id);
    return s;
  };

  it('the fixture chapter passes every rule, and its scenarios pass the per-scenario rules', () => {
    expect(run()).toEqual({ errors: [], warnings: [] });
    for (const s of validChapter().scenarios) expect(scenarioRules(s, reg).errors, s.id).toEqual([]);
  });

  it('draft chapters report mix issues as warnings, structure issues stay errors', () => {
    const r = run((fx) => {
      fx.chapter.status = 'draft';
      fx.scenarios = fx.scenarios.filter((s) => s.id !== 'g3');
      fx.chapter.scenario_order.pm = fx.chapter.scenario_order.pm.filter((id) => id !== 'g3');
      fx.chapter.scenario_order.am.push('ghost');
    });
    expect(r.errors.join('\n')).toMatch(/"ghost" is not a scenario/);
    expect(r.warnings.join('\n')).toMatch(/mix: .*\(draft chapter\)/);
  });

  it.each<[string, (fx: ReturnType<typeof validChapter>) => void, RegExp]>([
    ['legit share', (fx) => Object.assign(byId(fx, 'g2'), { is_fraud: true }), /genuine share 25%/],
    ['max consecutive same truth', (fx) => (fx.chapter.scenario_order = { am: ['g1', 'f1', 'f2', 'f3'], pm: ['f4', 'g2', 'g3', 'boss'] }), /more than 3 fraud scenarios in a row/],
    ['theme share', (fx) => ['f4', 'g3', 'boss', 'f3'].forEach((id) => Object.assign(byId(fx, id), { theme: 'parcel' })), /theme "parcel" on 7 of 8/],
    ['theme adjacency', (fx) => Object.assign(byId(fx, 'g1'), { theme: 'parcel' }), /"f1" and "g1" share the theme "parcel"/],
    ['pressure parity', (fx) => fx.scenarios.filter((s) => s.is_fraud).forEach((s) => (s.pressure.timer = true)), /pressure parity: timer\/pusher on 0% of genuine vs 100% of fraud/],
    ['sender/link decoy share', (fx) => {
      for (const id of ['f3', 'f4']) {
        const s = byId(fx, id);
        s.inspectables = s.inspectables.map((i) => (i.target === 'sender.detail' ? { ...i, red_flag: true } : i));
      }
    }, /0 of 5 fraud scenarios have the sender or link as a decoy; need 2/],
    ['genuine at every difficulty', (fx) => Object.assign(byId(fx, 'g3'), { difficulty: 2 }), /difficulty 3 is used but has no genuine scenario/],
    ['twin required', (fx) => Object.assign(byId(fx, 'g1'), { twin_of: undefined }), /needs at least one genuine twin/],
    ['scored count', (fx) => {
      fx.scenarios = fx.scenarios.filter((s) => s.id !== 'f2');
      fx.chapter.scenario_order.am = fx.chapter.scenario_order.am.filter((id) => id !== 'f2');
    }, /7 scored scenarios; slot 1 expects 7–8|genuine share/],
    ['difficulty band', (fx) => Object.assign(byId(fx, 'f1'), { difficulty: 4 }), /"f1" difficulty 4 is outside slot 1's band 1–3/],
    ['boss difficulty', (fx) => Object.assign(byId(fx, 'boss'), { difficulty: 2 }), /boss "boss" difficulty 2; slot 1 boss is 3/],
    ['pattern in chapter', (fx) => Object.assign(byId(fx, 'f2'), { pattern: 'email-phishing-credential' }), /uses pattern "email-phishing-credential", which is not in the chapter's patterns/],
  ])('%s', (_, mutate, expected) => {
    expect(run(mutate).errors.join('\n')).toMatch(expected);
  });

  it('twins: opposite truth and checkable-count parity ±1', () => {
    const same = run((fx) => Object.assign(byId(fx, 'g1'), { is_fraud: true }));
    expect(same.errors.join('\n')).toMatch(/its twin "f1" must have the opposite truth/);
    const parity = run((fx) => {
      const g = byId(fx, 'g1');
      g.message = { ...g.message, references: undefined };
      const f = byId(fx, 'f1');
      f.message = { ...f.message, attachments: [{ name: 'a.pdf' }] };
    });
    expect(parity.errors.join('\n')).toMatch(/twins "g1" \(3\) and "f1" \(5\) must expose the same number of checkable details, ±1/);
  });

  it('structure: city matches the file, boss role, every scenario in the order', () => {
    const r = chapterRules(validChapter().chapter, 'othercity', validChapter().scenarios, reg);
    expect(r.errors.join('\n')).toMatch(/city "testcity" does not match the file name "othercity.yaml"/);
    const missing = run((fx) => (fx.chapter.scenario_order.am = fx.chapter.scenario_order.am.filter((id) => id !== 'f1')));
    expect(missing.errors.join('\n')).toMatch(/scenario "f1" is missing from scenario_order/);
  });
});
