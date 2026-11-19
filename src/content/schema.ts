/**
 * Content contract between the engine and `scenario-writer`.
 *
 * The engine knows nothing about specific scenarios: everything it renders is
 * described by YAML validated against these schemas, at build time (Vite
 * plugin), in `npm run content:validate` and in CI.
 *
 * Shape follows `templates/scenario.template.yaml` and GDD §19 (CR-01…CR-13),
 * balance.yaml and UI_SPEC §14. Rules that need balance.yaml numbers or other
 * registries live in scripts/lib/rules.ts; this file holds shape and
 * within-file consistency only.
 */
import { z } from 'zod';
import { deriveCheckables } from './checkables.ts';
import { ICU_MESSAGE_RE, SPOTTED_EXPR_RE } from './constants.ts';

/** Lower-case kebab-case identifier, e.g. `berlin-03-parcel-customs`. */
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lower-case kebab-case (a-z, 0-9, -)');

/** snake_case identifier used for action ids, outcome keys and recovery steps. */
export const snakeId = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/, 'must be snake_case (a-z, 0-9, _)');

// ---------------------------------------------------------------------------
// Enumerations shared with balance.yaml and the GDD.

export const DEVICES = ['email', 'sms', 'messenger', 'call', 'browser', 'qr', 'banking', 'social', 'auth', 'letter'] as const;
export const deviceSchema = z.enum(DEVICES);
export type Device = z.infer<typeof deviceSchema>;

/** GDD §6 / balance.yaml action_kinds. content:validate checks balance.yaml covers exactly this set. */
export const ACTION_KINDS = [
  'verify_in_app', 'call_back_known', 'check_official_list', 'check_with_platform', 'ask_someone', 'verify_identity',
  'report', 'block', 'ignore', 'delete', 'hang_up', 'deny_prompt', 'reply', 'open_link', 'call_number_in_message',
  'scan_qr_and_open', 'pay', 'pay_unprotected', 'enter_details', 'share_code', 'approve_prompt', 'install_or_remote',
  'proceed', 'pay_protected', 'pause',
] as const;
export const actionKindSchema = z.enum(ACTION_KINDS);
export type ActionKind = z.infer<typeof actionKindSchema>;

export const ACTION_CLASSES = ['verify', 'report', 'dismiss', 'engage', 'comply', 'proceed', 'meta'] as const;
export type ActionClass = (typeof ACTION_CLASSES)[number];

/** GDD §8 pressure levers (CR-05). */
export const LEVERS = ['urgency', 'authority', 'fear', 'greed', 'helpfulness', 'affection', 'secrecy', 'small_amount', 'social_proof'] as const;

/** CR-03 scenario roles. Scored roles are standard and boss. */
export const ROLES = ['standard', 'boss', 'drill', 'arc'] as const;
export const SCORED_ROLES: readonly (typeof ROLES)[number][] = ['standard', 'boss'];

/**
 * What the message asks the player to do (UI_SPEC §6.3). Anything but `none`
 * requires exactly one action with `pressure_target: true`. The high-stakes
 * requests (GDD §6) decide `stakes` on genuine messages.
 */
export const REQUESTS = ['none', 'reply', 'open_link', 'call', 'scan_qr', 'pay', 'log_in', 'enter_details', 'share_code', 'approve', 'install'] as const;
export const HIGH_STAKES_REQUESTS: readonly (typeof REQUESTS)[number][] = ['pay', 'log_in', 'enter_details', 'share_code', 'approve', 'install'];

/** GDD §9 damage-control categories, assigned per scenario outcome (CR-07). */
export const RECOVERY_CATEGORIES = ['stop', 'secure', 'report', 'warn', 'harmful'] as const;

/** CR-04 inspectable types. spelling/grammar/language may only be decoys; padlock is never proof. */
export const INSPECTABLE_TYPES = [
  'sender', 'link', 'qr', 'payee', 'caller_id', 'padlock', 'page_address', 'logo', 'display_name', 'attachment',
  'reference', 'phone_number', 'letterhead', 'prompt', 'image', 'request', 'spelling', 'grammar', 'language', 'other',
] as const;
export const LANGUAGE_TYPES: readonly (typeof INSPECTABLE_TYPES)[number][] = ['spelling', 'grammar', 'language'];
export const NEVER_PROOF_TYPES: readonly (typeof INSPECTABLE_TYPES)[number][] = ['logo', 'display_name'];

/** Flag and arc-variable names (CR-08): snake_case, e.g. alex_invested. Dotted names read as domains to the red-line linter. */
export const flagName = z.string().regex(/^[a-z][a-z0-9_]*$/, 'flags are snake_case, e.g. kettle_hacked or alex_invested');

export const loId = z.string().regex(/^LO-\d{2}$/, 'learning objective ids look like LO-01');

// ---------------------------------------------------------------------------
// Message parts. Which parts a device needs is checked per beat (DEVICE_PARTS).

/** Non-routable lowercase host (RFC 2606 reserved TLDs; Red Line 3). */
export const FICTIONAL_HOST = /^[a-z0-9.-]+\.(example|test|invalid)$/;

/** Host part of an address-bar string: optional http(s)://, then host, then optional /path. */
export function addressHost(address: string): string {
  const rest = address.replace(/^https?:\/\//, '');
  return rest.split(/[/?#]/)[0] ?? rest;
}

const fictionalAddress = (what: string) =>
  z
    .string()
    .min(1)
    .refine((v) => FICTIONAL_HOST.test(addressHost(v)), `${what} must be a lowercase host ending in .example, .test or .invalid (Red Line 3)`);

/** QR codes may only resolve to an in-game route (Red Line 3). */
export const QR_PAYLOAD_RE = /^\/qr\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const qrSchema = z
  .object({
    payload: z.string().regex(QR_PAYLOAD_RE, 'QR payload must be an in-game route /qr/<id>'),
    /** Host shown on the destination chip ("QR code · opens trundle-redelivery.example"). */
    destination: fictionalAddress('qr.destination'),
    caption: z.string().min(1).optional(),
  })
  .strict();

export const senderSchema = z
  .object({
    display: z.string().min(1),
    detail: z.string().min(1).optional(),
  })
  .strict();

export const messageSchema = z
  .object({
    sender: senderSchema.optional(),
    /** Cast member speaking (content/cast.yaml). Arc characters' lines have a word limit. */
    from_cast: slug.optional(),
    subject: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    /** In-world language other than English needs an inline translation (UI_SPEC §4.8). */
    lang: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'lang is a BCP 47 tag such as de or pt-PT').optional(),
    translation: z.string().min(1).optional(),
    request: z.enum(REQUESTS),
    attachments: z.array(z.object({ name: z.string().min(1), size: z.string().min(1).optional() }).strict()).optional(),
    references: z.array(z.string().min(1)).optional(),
    phone_numbers: z.array(z.string().min(1)).optional(),
    qr: qrSchema.optional(),
    page: z.object({ address: fictionalAddress('page.address'), title: z.string().min(1).optional() }).strict().optional(),
    payee: z
      .object({
        name: z.string().min(1),
        iban: z.string().min(1).optional(),
        name_check: z.enum(['match', 'mismatch', 'close_match', 'unavailable']).optional(),
        holder: z.string().min(1).optional(),
      })
      .strict()
      .optional(),
    transcript: z.array(z.object({ speaker: z.enum(['caller', 'you']), text: z.string().min(1) }).strict()).optional(),
    prompt: z
      .object({
        type: z.enum(['sign_in', 'signature', 'qr_login']),
        service: z.string().min(1),
        where: z.string().min(1),
        device: z.string().min(1),
        when: z.string().min(1),
        number: z.number().int().min(0).max(99).optional(),
      })
      .strict()
      .optional(),
    letterhead: z.string().min(1).optional(),
    image: z.object({ alt: z.string().min(1) }).strict().optional(),
    l10n_note: z.string().min(1).optional(),
    /**
     * The sentence that asks for the code or approval (design ruling 2026-11-19, QA L1): the beat's
     * `request` checkable. Copied verbatim from the body or one caller line; `translation` verbatim
     * from message.translation when the message is not in English. share_code / approve only.
     */
    ask: z.object({ text: z.string().min(1), translation: z.string().min(1).optional() }).strict().optional(),
    /**
     * Earlier texts in the same thread (ruling QA L5), oldest first, shown muted above today's message
     * under "Earlier". SMS and messenger only. Never checkable, no actions, links shown as plain text.
     */
    earlier: z
      .array(
        z
          .object({
            when: z.string().min(1),
            body: z.string().min(1),
            lang: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'lang is a BCP 47 tag such as de or pt-PT').optional(),
            translation: z.string().min(1).optional(),
          })
          .strict()
          .superRefine((e, ctx) => {
            if (e.lang && e.lang !== 'en' && !e.translation) ctx.addIssue({ code: 'custom', path: ['translation'], message: `text in lang "${e.lang}" needs an inline translation` });
          }),
      )
      .max(3)
      .optional(),
  })
  .strict()
  .superRefine((m, ctx) => {
    if (m.lang && m.lang !== 'en' && !m.translation) {
      ctx.addIssue({ code: 'custom', path: ['translation'], message: `text in lang "${m.lang}" needs an inline translation` });
    }
    if (m.ask) {
      const callerLines = (m.transcript ?? []).filter((l) => l.speaker === 'caller').map((l) => l.text);
      if (!(m.body ?? '').includes(m.ask.text) && !callerLines.some((l) => l.includes(m.ask?.text ?? ''))) {
        ctx.addIssue({ code: 'custom', path: ['ask', 'text'], message: 'ask.text must be copied verbatim from the body or from one caller line of the transcript' });
      }
      if (m.lang && m.lang !== 'en') {
        if (!m.ask.translation) ctx.addIssue({ code: 'custom', path: ['ask', 'translation'], message: `the message is in "${m.lang}": ask.translation is required` });
        else if (!(m.translation ?? '').includes(m.ask.translation)) ctx.addIssue({ code: 'custom', path: ['ask', 'translation'], message: 'ask.translation must be copied verbatim from message.translation' });
      }
      if (m.request !== 'share_code' && m.request !== 'approve') ctx.addIssue({ code: 'custom', path: ['ask'], message: 'ask is only for messages whose request is share_code or approve' });
    }
  });
export type Message = z.infer<typeof messageSchema>;

/** Message parts each device template needs. */
export const DEVICE_PARTS: Record<Device, readonly (keyof Message)[]> = {
  email: ['sender', 'subject', 'body'],
  sms: ['sender', 'body'],
  messenger: ['sender', 'body'],
  call: ['sender', 'transcript'],
  browser: ['page'],
  qr: ['qr'],
  banking: ['payee'],
  social: ['sender', 'body'],
  auth: ['prompt'],
  letter: ['letterhead', 'body'],
};

export const pressureSchema = z
  .object({
    /** Timer on/off. Its LENGTH comes from balance.yaml timers.by_slot (never per scenario: length must not be a tell). */
    timer: z.boolean().default(false),
    levers: z.array(z.enum(LEVERS)).default([]),
    /** Authored follow-ups from the sender (CR-05; balance pushers.schedule: authored). */
    pusher: z
      .object({
        messages: z
          .array(
            z
              .object({
                at_seconds: z.number().int().positive(),
                text: z.string().min(1),
                /** CR-14: in-world language of the follow-up, with its inline translation (like message lang/translation). */
                lang: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'lang is a BCP 47 tag such as de or pt-PT').optional(),
                translation: z.string().min(1).optional(),
              })
              .strict()
              .superRefine((m, ctx) => {
                if (m.lang && m.lang !== 'en' && !m.translation) {
                  ctx.addIssue({ code: 'custom', path: ['translation'], message: `pusher text in lang "${m.lang}" needs an inline translation` });
                }
              }),
          )
          .min(1),
      })
      .strict()
      .optional(),
    /** Genuine messages only: the real deadline ("Locker holds your parcel 7 days"). */
    honest_deadline: z.string().min(1).optional(),
  })
  .strict();

export const inspectableSchema = z
  .object({
    /** A checkable of the beat's device template (src/content/checkables.ts), e.g. sender.detail, link, link#2, qr.destination. */
    target: z.string().regex(/^[a-z_]+(?:\.[a-z_]+)*(?:#[2-9])?$/, 'target is a checkable such as sender.detail, link or link#2'),
    reveal: z.string().min(1),
    red_flag: z.boolean(),
    type: z.enum(INSPECTABLE_TYPES).optional(),
    /** A detail that fits the genuine story. Never proof on its own (padlock, logo, display name). */
    reassures: z.boolean().optional(),
    /** Inside a quoted example (e.g. Teo's screenshot): can be a red flag inside a genuine message. */
    context: z.literal('quoted').optional(),
  })
  .strict();
export type Inspectable = z.infer<typeof inspectableSchema>;

export const actionSchema = z
  .object({
    id: snakeId,
    label: z.string().min(1),
    kind: actionKindSchema,
    outcome: snakeId.optional(),
    next_beat: snakeId.optional(),
    /** Optional override of the balance.yaml star table; needs a reason (CR-01). */
    score: z.number().int().optional(),
    score_reason: z.string().min(1).optional(),
    /** The action the message is pushing (UI_SPEC §6.3). */
    pressure_target: z.boolean().default(false),
  })
  .strict()
  .superRefine((a, ctx) => {
    if ((a.outcome === undefined) === (a.next_beat === undefined)) {
      ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'an action has exactly one of outcome or next_beat' });
    }
    if (a.score !== undefined && !a.score_reason) {
      ctx.addIssue({ code: 'custom', path: ['score_reason'], message: 'a score override needs score_reason (CR-01)' });
    }
  });
export type Action = z.infer<typeof actionSchema>;

/**
 * Optional extras for the engine's "What now?" step after hanging up (GDD §6, §16, §17 1-9).
 * The step always offers report and Done (dismiss), plus call_back_known (verify) unless an
 * extra of kind call_back_known replaces it. Extras are either
 * - engage (`note`, no outcome): e.g. "Call back this number"; returns to "What now?" with the
 *   note and caps the beat at ★★; or
 * - verify (`outcome`, no note): e.g. "Ask Adaeze through the staff directory"; ends the step as verify with
 *   its own outcome.
 * The class rule (engage/verify) needs balance.yaml, so it lives in scripts/lib/rules.ts.
 */
export const whatNowSchema = z
  .object({
    /** Label for the built-in call-back option, e.g. "Call the number on your Larchwick card". */
    call_back_label: z.string().min(1).optional(),
    /**
     * Optional outcome per built-in choice (producer decision, T-2.1), e.g. call_back_known →
     * "Your bank: we never called". Without one, the hang_up action's outcome is shown.
     */
    outcomes: z
      .object({ call_back_known: snakeId.optional(), report: snakeId.optional(), done: snakeId.optional() })
      .strict()
      .optional(),
    extra: z
      .array(
        z
          .object({ id: snakeId, label: z.string().min(1), kind: actionKindSchema, note: z.string().min(1).optional(), outcome: snakeId.optional() })
          .strict()
          .refine((x) => (x.note === undefined) !== (x.outcome === undefined), 'a what_now extra has exactly one of note (engage: back to "What now?") or outcome (verify: ends the step)'),
      )
      .max(3)
      .default([]),
  })
  .strict();
export type WhatNow = z.infer<typeof whatNowSchema>;

/**
 * A notification shown inside the beat (e.g. the code SMS or approval prompt
 * during a call, GDD §17 1-9). It has no actions of its own and can never be
 * reported (so never a "genuine message reported"). It needs a body: that text
 * is the beat's `request` checkable (src/content/checkables.ts), whose authored
 * reveal says what the code or approval is really for.
 */
export const bannerSchema = z
  .object({ device: z.enum(['sms', 'messenger', 'auth', 'banking', 'email']), message: messageSchema })
  .strict();

const beatBody = {
  device: deviceSchema,
  message: messageSchema,
  inspectables: z.array(inspectableSchema).default([]),
  actions: z.array(actionSchema).min(1).max(5),
  banner: bannerSchema.optional(),
  what_now: whatNowSchema.optional(),
};

/** CR-03 follow-up beat. Boss beats arrive on a schedule (`arrives_after`, seconds after the previous beat started). */
export const beatSchema = z
  .object({
    id: snakeId.refine((id) => id !== 'start', '"start" is reserved for the opening beat'),
    ...beatBody,
    arrives_after: z.number().int().min(0).optional(),
    /**
     * Scheduled boss beats only: this beat's timer length when the GDD states one (e.g. 1-9 beat 3,
     * a call, 40 s). Default: call beats use timers.call_beat, other boss beats timers.boss_beat.
     * Bounds (rules.ts): between call_beat and boss_beat.
     */
    timer_seconds: z.number().int().positive().optional(),
    /** Boss beats only: later beats can be narrative (balance multi_step.boss.scored_beats_max). */
    scored: z.boolean().default(true),
    /**
     * Boss only (ruling QA fun note a): earlier scheduled beats that tell the same story. If the player
     * verified on one of them, report or dismiss here scores as verify ("already checked").
     */
    covered_by: z.array(z.string().min(1)).min(1).optional(),
  })
  .strict();
export type Beat = z.infer<typeof beatSchema>;

/** CR-06 notification arriving mid-scenario. Unscored. */
export const interruptSchema = z
  .object({
    id: snakeId,
    /** Arrives on the scenario clock … */
    at_seconds: z.number().int().positive().optional(),
    /**
     * … or when that beat's call or message ends (ruling QA M6): on hang-up as "What now?" opens; after a
     * fall or the last timer expiry, after damage control (or the consequence step) as its own step
     * before the debrief. The debrief waits until it is answered.
     */
    after_beat: z.string().min(1).optional(),
    is_fraud: z.boolean(),
    ...beatBody,
  })
  .strict()
  .refine((i) => (i.at_seconds === undefined) !== (i.after_beat === undefined), 'an interrupt has exactly one of at_seconds or after_beat');

export const outcomeSchema = z
  .object({
    narrative: z.string().min(1),
    /** CR-07: damage-control options for this outcome, each with its category for THIS scenario. */
    recovery: z
      .array(
        z
          .object({
            step: snakeId,
            category: z.enum(RECOVERY_CATEGORIES),
            /**
             * Optional harmful-pick feedback for THIS scenario. Steps are shared across scenarios, so the line
             * in recovery_steps.yaml stays generic; put anything scenario-specific (who to tell) here.
             */
            feedback: z.string().min(1).optional(),
          })
          .strict(),
      )
      .optional(),
    sets_flags: z.array(flagName).optional(),
    /** Arc scenarios only, e.g. { alex_invested: 50 }. */
    arc_effects: z.record(flagName, z.union([z.number(), z.boolean()])).optional(),
  })
  .strict();
export type Outcome = z.infer<typeof outcomeSchema>;

export const debriefSchema = z
  .object({
    /** `arc`: no verdict line, no points (GDD §10.2). */
    variant: z.enum(['standard', 'arc']).default('standard'),
    /** CR-10 / UI_SPEC §8.1: verdict is generated; tell and what_works are authored. ≤ 40 words with the fixed copy. */
    layer1: z.object({ tell: z.string().min(1), what_works: z.string().min(1) }).strict(),
    /** Red flags bound to checkables come from inspectables; flags that live in the message text go here. */
    layer2: z
      .object({ message_flags: z.array(z.string().min(1)).default([]), notes: z.string().min(1).optional() })
      .strict()
      .default({ message_flags: [] }),
    /** How to check this on a real phone (UI_SPEC §8.2 item 2). */
    device_tip: z.string().min(1).optional(),
    /** Habit card id (content/habit_cards.yaml). */
    habit_card: slug.optional(),
    /** UI_SPEC §8.2 item 3: split by situation. */
    already_clicked: z
      .object({
        clicked: z.string().min(1).optional(),
        entered_details: z.string().min(1).optional(),
        /** Shared a code or approved a request (ruling QA m10). Required where share_code / approve_prompt actions exist. */
        shared_code: z.string().min(1).optional(),
        paid: z.string().min(1).optional(),
      })
      .strict()
      .refine((a) => a.clicked || a.entered_details || a.shared_code || a.paid, 'already_clicked needs at least one of clicked, entered_details, shared_code, paid')
      .optional(),
    /** Support line for arc slots 2–3 and other safeguarding moments. */
    safeguarding_line: z.string().min(1).optional(),
    sources: z.array(slug).min(1, 'every scenario must cite at least one source (Red Line 6)'),
  })
  .strict();

export const scenarioSchema = z
  .object({
    id: slug,
    chapter: slug,
    role: z.enum(ROLES),
    /** docs/patterns/<id>.md. Genuine twins carry the pattern they mirror (gold off-focus rule, CR-02). */
    pattern: slug.optional(),
    /** Surface theme for the theme-share rule, e.g. parcel, shop-payment. */
    theme: slug.optional(),
    /** The scenario this one mirrors (genuine <-> fraud), same chapter. */
    twin_of: slug.optional(),
    /** Arc beats only: 1–9 (GDD §10.1). */
    arc_slot: z.number().int().min(1).max(9).optional(),
    /** The player started this (reset link they requested, their own sign-in): in-message action is proceed. */
    player_started: z.boolean().default(false),
    learning_objectives: z.array(loId).min(1),
    difficulty: z.number().int().min(1).max(5).optional(),
    is_fraud: z.boolean(),
    /** Genuine standard scenarios: high = asks to pay, log in, enter data or a code, or approve (CR-02). */
    stakes: z.enum(['low', 'high']).optional(),
    device: deviceSchema,
    brands: z.array(slug).default([]),
    cast: z.array(slug).default([]),
    requires_flags: z.array(flagName).default([]),
    arc_branch_on: flagName.optional(),
    pressure: pressureSchema.default({ timer: false, levers: [] }),
    message: messageSchema,
    inspectables: z.array(inspectableSchema).default([]),
    actions: z.array(actionSchema).min(2, 'a scenario offers 2–5 actions').max(5, 'a scenario offers 2–5 actions'),
    banner: bannerSchema.optional(),
    what_now: whatNowSchema.optional(),
    beats: z.array(beatSchema).default([]),
    interrupts: z.array(interruptSchema).default([]),
    outcomes: z.record(snakeId, outcomeSchema),
    debrief: debriefSchema,
  })
  .strict()
  .superRefine((s, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
    const scored = SCORED_ROLES.includes(s.role);

    // Role-dependent fields.
    if (s.role !== 'arc' && s.difficulty === undefined) issue(['difficulty'], `${s.role} scenarios need a difficulty`);
    if (scored && !s.pattern) issue(['pattern'], 'scored scenarios need a pattern (genuine twins: the pattern they mirror)');
    if (scored && !s.theme) issue(['theme'], 'scored scenarios need a surface theme');
    if (scored && !s.is_fraud && !s.stakes) issue(['stakes'], 'genuine scored scenarios need stakes: low | high');
    if (s.is_fraud && s.stakes) issue(['stakes'], 'stakes apply to genuine scenarios only');
    if (s.role === 'boss' && !s.is_fraud) issue(['is_fraud'], 'bosses are always fraud');
    if (s.role === 'boss' && s.beats.length === 0) issue(['beats'], 'a boss has several beats');
    if (s.role === 'arc' && s.arc_slot === undefined) issue(['arc_slot'], 'arc beats need arc_slot (1–9)');
    if (s.role !== 'arc' && s.arc_slot !== undefined) issue(['arc_slot'], 'arc_slot is for arc beats only');
    if ((s.role === 'arc') !== (s.debrief.variant === 'arc')) issue(['debrief', 'variant'], 'debrief.variant is arc exactly for arc beats');
    if (s.pressure.honest_deadline && s.is_fraud) issue(['pressure', 'honest_deadline'], 'honest_deadline is for genuine messages');
    if (s.twin_of === s.id) issue(['twin_of'], 'a scenario cannot be its own twin');

    // Red Line 4 debrief content.
    if ((s.is_fraud || s.role === 'arc') && !s.debrief.already_clicked) {
      issue(['debrief', 'already_clicked'], 'fraud and arc debriefs must say what to do if you already fell for it');
    }
    if (s.role !== 'arc' && !s.debrief.habit_card) issue(['debrief', 'habit_card'], 'debriefs need a habit_card');
    if (s.role !== 'arc' && !s.debrief.device_tip) issue(['debrief', 'device_tip'], 'debriefs need a device_tip (how to check on a real phone)');
    if (s.role === 'arc' && s.arc_slot !== undefined && [2, 3].includes(s.arc_slot) && !s.debrief.safeguarding_line) {
      issue(['debrief', 'safeguarding_line'], 'arc slots 2 and 3 need the safeguarding line (GDD §10.2)');
    }

    // Beats: ids, devices, references.
    const beats: {
      id: string;
      device: Device;
      message: Message;
      inspectables: Inspectable[];
      actions: Action[];
      what_now?: WhatNow | undefined;
      banner?: { device: Device; message: Message } | undefined;
      path: (string | number)[];
      fraud: boolean;
    }[] = [
      { id: 'start', device: s.device, message: s.message, inspectables: s.inspectables, actions: s.actions, what_now: s.what_now, banner: s.banner, path: [], fraud: s.is_fraud },
      ...s.beats.map((b, i) => ({ ...b, path: ['beats', i], fraud: s.is_fraud })),
      ...s.interrupts.map((b, i) => ({ ...b, path: ['interrupts', i], fraud: b.is_fraud })),
    ];
    s.interrupts.forEach((b, i) => {
      if (b.what_now) issue(['interrupts', i, 'what_now'], 'interrupts are single-step: no what_now');
      if (b.after_beat !== undefined && b.after_beat !== 'start' && !s.beats.some((x) => x.id === b.after_beat)) {
        issue(['interrupts', i, 'after_beat'], `after_beat "${b.after_beat}" is not a beat id`);
      }
    });
    const beatIds = new Set<string>(['start']);
    s.beats.forEach((b, i) => {
      if (beatIds.has(b.id)) issue(['beats', i, 'id'], `duplicate beat id "${b.id}"`);
      beatIds.add(b.id);
      if (s.role !== 'boss' && b.arrives_after !== undefined) issue(['beats', i, 'arrives_after'], 'arrives_after is for boss beats');
      if (s.role !== 'boss' && b.timer_seconds !== undefined) issue(['beats', i, 'timer_seconds'], 'timer_seconds is for boss beats');
    });
    const actionIds = new Set<string>();
    const referencedBeats = new Set<string>();
    const usedOutcomes = new Set<string>();
    for (const b of beats) {
      for (const part of DEVICE_PARTS[b.device]) {
        if (b.message[part] === undefined) issue([...b.path, 'message', part], `a ${b.device} message needs ${part}`);
      }
      const visible = new Set(deriveCheckables(b.device, b.message));
      if (b.message.earlier && b.device !== 'sms' && b.device !== 'messenger') issue([...b.path, 'message', 'earlier'], 'earlier (thread history) is for sms and messenger messages only');
      // An ask is the tell itself: it always has an authored reveal (no neutral filler; ruling QA L1).
      if (b.message.ask && !b.inspectables.some((ins) => ins.target === 'request' && ins.type === 'request')) {
        issue([...b.path, 'inspectables'], 'a message with an ask needs an inspectable with target: request and type: request');
      }
      b.inspectables.forEach((ins, i) => {
        if (!visible.has(ins.target)) {
          const hint = ins.target === 'request' ? ' (a request checkable comes from message.ask, the sentence that asks for the code or approval)' : '';
          issue([...b.path, 'inspectables', i, 'target'], `"${ins.target}" is not visible in this ${b.device} message (checkables: ${[...visible].join(', ')})${hint}`);
        }
        // The ask (ruling QA L1) is the beat's single `request` inspectable; its reveal quotes the banner.
        if (ins.target === 'request' && ins.type !== undefined && ins.type !== 'request') {
          issue([...b.path, 'inspectables', i, 'type'], 'a request checkable has type: request');
        }
        if (ins.target === 'request' && b.message.request === 'none') {
          issue([...b.path, 'inspectables', i, 'target'], 'a request checkable needs message.request on the same beat (e.g. share_code or approve), not none');
        }
      });
      if (b.banner && !b.banner.message.body) issue([...b.path, 'banner', 'message', 'body'], 'a banner needs a body: it is displayed on the beat');
      if (b.what_now) {
        const hangUp = b.actions.find((a) => a.kind === 'hang_up');
        if (!hangUp) issue([...b.path, 'what_now'], 'what_now needs a hang_up action on the same beat');
        else if (hangUp.outcome === undefined) issue([...b.path, 'what_now'], 'what_now runs after a hang_up with an outcome (not next_beat)');
        b.what_now.extra.forEach((x, i) => {
          if (actionIds.has(x.id) || b.actions.some((a) => a.id === x.id)) issue([...b.path, 'what_now', 'extra', i, 'id'], `duplicate action id "${x.id}"`);
          actionIds.add(x.id);
          if (x.outcome !== undefined) {
            usedOutcomes.add(x.outcome);
            if (!(x.outcome in s.outcomes)) issue([...b.path, 'what_now', 'extra', i, 'outcome'], `outcome "${x.outcome}" is not defined under outcomes`);
          }
        });
        for (const [choice, key] of Object.entries(b.what_now.outcomes ?? {})) {
          if (key === undefined) continue;
          usedOutcomes.add(key);
          if (!(key in s.outcomes)) issue([...b.path, 'what_now', 'outcomes', choice], `outcome "${key}" is not defined under outcomes`);
        }
      }
      b.actions.forEach((a, i) => {
        if (actionIds.has(a.id)) issue([...b.path, 'actions', i, 'id'], `duplicate action id "${a.id}"`);
        actionIds.add(a.id);
        if (a.outcome !== undefined) {
          usedOutcomes.add(a.outcome);
          if (!(a.outcome in s.outcomes)) issue([...b.path, 'actions', i, 'outcome'], `outcome "${a.outcome}" is not defined under outcomes`);
        }
        if (a.next_beat !== undefined) {
          referencedBeats.add(a.next_beat);
          if (!beatIds.has(a.next_beat) || a.next_beat === 'start') issue([...b.path, 'actions', i, 'next_beat'], `next_beat "${a.next_beat}" is not a beat id`);
        }
      });
    }
    for (const key of Object.keys(s.outcomes)) {
      if (!usedOutcomes.has(key)) issue(['outcomes', key], `outcome "${key}" is never reached by any action`);
    }
    if (s.role !== 'boss') {
      s.beats.forEach((b, i) => {
        if (!referencedBeats.has(b.id)) issue(['beats', i, 'id'], `beat "${b.id}" is never reached (no action has next_beat: ${b.id})`);
      });
    } else {
      // Boss beats arrive on a schedule (arrives_after) or follow an action inside a beat (next_beat), never both.
      s.beats.forEach((b, i) => {
        const reached = referencedBeats.has(b.id);
        if (b.arrives_after === undefined && !reached) issue(['beats', i, 'arrives_after'], 'boss beats arrive on a schedule: set arrives_after (or reach the beat with next_beat)');
        if (b.arrives_after !== undefined && reached) issue(['beats', i, 'arrives_after'], 'a scheduled boss beat cannot also be a next_beat target');
        if (b.timer_seconds !== undefined && b.arrives_after === undefined) issue(['beats', i, 'timer_seconds'], 'timer_seconds is for scheduled boss beats (arrives_after)');
      });
      if (!s.beats.some((b) => b.arrives_after !== undefined)) issue(['beats'], 'a boss needs at least one scheduled beat (arrives_after)');
    }
    for (const [key, o] of Object.entries(s.outcomes)) {
      if (o.arc_effects && s.role !== 'arc') issue(['outcomes', key, 'arc_effects'], 'arc_effects are for arc beats only');
    }

    // Red Line 8: a letter is only ever the carrier of a QR code or URL; the scenario hinges on that digital
    // vector. Checked per letter beat: a later SMS link cannot stand in for the letter's own vector.
    for (const b of beats) {
      if (b.device !== 'letter') continue;
      const vectors = b.inspectables.filter((i) => i.target === 'qr.destination' || /^link(?:#[2-9])?$/.test(i.target));
      if (vectors.length === 0) {
        issue([...b.path, 'inspectables'], 'a letter must carry a QR code or URL with its own inspectable (qr.destination or link) (Red Line 8)');
      } else if (b.fraud && !vectors.some((i) => i.red_flag)) {
        issue([...b.path, 'inspectables'], 'on fraud, the letter\'s QR code or URL is the vector: mark its qr.destination or link as red_flag: true (Red Line 8)');
      }
    }
  });
export type Scenario = z.infer<typeof scenarioSchema>;

// ---------------------------------------------------------------------------
// Chapters, cast, recovery steps, habit cards (GDD §19, CR-07, CR-12).

/** content/chapters/<city>.yaml. `draft` chapters report mix-rule violations as warnings; `complete` as errors. */
export const chapterSchema = z
  .object({
    slot: z.number().int().min(0).max(10),
    city: slug,
    name: z.string().min(1),
    status: z.enum(['draft', 'complete']),
    patterns: z.array(slug).min(1),
    callbacks: z.array(slug).default([]),
    lo_focus: z.array(loId).min(1),
    scenario_order: z.object({ am: z.array(slug), pm: z.array(slug) }).strict(),
    boss: slug.optional(),
    arc_beat: slug.optional(),
    intro: z.string().min(1),
  })
  .strict()
  .superRefine((c, ctx) => {
    const all = [...c.scenario_order.am, ...c.scenario_order.pm];
    const dup = all.find((id, i) => all.indexOf(id) !== i);
    if (dup) ctx.addIssue({ code: 'custom', path: ['scenario_order'], message: `"${dup}" appears twice in scenario_order` });
    if (c.boss && !c.scenario_order.pm.includes(c.boss)) {
      ctx.addIssue({ code: 'custom', path: ['boss'], message: 'the boss plays in the afternoon (scenario_order.pm)' });
    }
    if (c.arc_beat && !all.includes(c.arc_beat)) ctx.addIssue({ code: 'custom', path: ['arc_beat'], message: 'arc_beat must be in scenario_order' });
    if (c.status === 'complete' && !c.boss) ctx.addIssue({ code: 'custom', path: ['boss'], message: 'a complete chapter has a boss' });
  });
export type Chapter = z.infer<typeof chapterSchema>;

/** content/cast.yaml (CR-12). Scammers are never cast members. */
export const castMemberSchema = z
  .object({
    id: slug,
    name: z.string().min(1),
    role: z.string().min(1),
    /** The channel the player already knows for this person (staff directory, saved contact). */
    known_channel: z.object({ label: z.string().min(1), detail: z.string().min(1).optional() }).strict().optional(),
    /** Arc characters' lines are limited to balance session.arc_line_max_words. */
    arc_character: z.boolean().default(false),
    notes: z.string().optional(),
  })
  .strict()
  .refine((c) => c.arc_character || c.known_channel, { message: 'cast members need a known_channel (arc characters excepted)', path: ['known_channel'] });
export const castFileSchema = z.object({ cast: z.array(castMemberSchema) }).strict();
export type CastMember = z.infer<typeof castMemberSchema>;

/** content/recovery_steps.yaml (CR-07). Categories are assigned per scenario outcome. */
export const recoveryStepsFileSchema = z
  .object({
    steps: z.array(
      z
        .object({
          id: snakeId,
          label: z.string().min(1),
          /**
           * Shown after damage control when the step was picked and is harmful in that scenario (GDD §9):
           * why it hurts and what works instead, never a judgement of the person. Required for every step
           * any outcome lists as `harmful` (scripts/lib/rules.ts).
           */
          feedback: z.string().min(1).optional(),
        })
        .strict(),
    ),
  })
  .strict();

/** content/habit_cards.yaml: one card per learning objective (GDD §11, UI_SPEC §9.1). */
export const habitCardSchema = z
  .object({
    id: slug,
    lo: loId,
    title: z.string().min(1),
    habit: z.string().min(1),
    example: z.string().min(1),
    already_clicked: z.string().min(1),
  })
  .strict();
export const habitCardsFileSchema = z.object({ cards: z.array(habitCardSchema) }).strict();
export type HabitCard = z.infer<typeof habitCardSchema>;

// ---------------------------------------------------------------------------
// balance.yaml: the parts content:validate reads. `mix` is strict so a new
// rule added there fails validation until the validator implements it.

const starValue = z.union([z.number().int().min(0).max(3), z.enum(['non_terminal', 'not_allowed'])]);
const starRow = z.object({ fraud: starValue, legit_high: starValue, legit_low: starValue }).strict();
const range = z.tuple([z.number(), z.number()]);
/** A tutorial-grace cell: a softened ★ at most; the cross-check against per_star is in balanceSchema. */
const graceCell = z.object({ stars: z.number().int().min(0).max(1), points: z.number().int().min(0) }).strict();
const ceilShare = z.string().regex(/^ceil\(F\/\d+\)$/, 'expected ceil(F/<n>)');
const spottedExpr = z.string().regex(SPOTTED_EXPR_RE, 'expected ceil(R/<n>) or ceil(<k>*R/<n>)');
const nonNeg = z.number().min(0);
const stressBand = z.tuple([z.number().int().min(0), z.number().int().min(0)]);

export const balanceSchema = z
  .object({
    version: z.number(),
    action_kinds: z.record(
      actionKindSchema,
      z.object({ class: z.enum(ACTION_CLASSES), los: z.array(loId) }).strict(),
    ),
    stars: z
      .object({
        verify: starRow,
        proceed: starRow,
        report: starRow,
        dismiss: starRow,
        engage: starRow,
        comply: starRow,
        timer_expiry: z.enum(ACTION_CLASSES),
      })
      .strict(),
    points: z
      .object({
        per_star: z.number().int().positive(),
        exceptions: z.object({ report_on_legit: z.number().int() }).passthrough(),
        engage_on_fraud: z.object({ terminal: z.boolean(), star_cap: z.number().int().min(0).max(3) }).strict(),
      })
      .passthrough(),
    /**
     * Tutorial grace (design ruling L4): in the listed chapter slots, over-caution on a genuine message
     * (report on genuine; dismiss on genuine high stakes) scores these stars and points instead of the
     * star table. Grace stays below ★★★ and never pays more than ★★ would.
     */
    /** Timer expiry on genuine high stakes (ruling QA L4): these stars and points in every slot. */
    timer_expiry: z.object({ genuine_high: graceCell }).strict(),
    tutorial_grace: z
      .object({
        slots: z.array(z.number().int().min(0)),
        report_on_legit: graceCell,
        dismiss_on_legit_high: graceCell,
      })
      .strict(),
    // Read by the engine (src/engine/*): validated here so the runtime can trust the shape.
    tags: z
      .object({
        per_tagged_red_flag: z.number().int().min(0),
        cap: z.number().int().min(0),
        void_if_any_non_red_flag_tagged: z.boolean(),
        apply_if_final_class_in: z.array(z.enum(ACTION_CLASSES)),
        not_on_timer_expiry: z.boolean(),
      })
      .passthrough(),
    pause: z
      .object({ reduces_stress_by: nonNeg, timer_cost_seconds: nonNeg, cooldown_seconds: nonNeg })
      .passthrough(),
    multi_step: z
      .object({ boss: z.object({ scored_beats_max: z.number().int().positive(), max_points: z.number().int().positive() }).passthrough() })
      .passthrough(),
    recovery: z
      .object({
        pick: z.number().int().positive(),
        points_per_correct_step: z.number().int().min(0),
        max_points: z.number().int().min(0),
        harmful_step_penalty: z.number().int().max(0),
        floor: z.number().int(),
      })
      .passthrough(),
    rating_cap: z.number().positive(),
    stamps: z
      .object({
        bronze: z.object({ requires: z.literal('finished') }).strict(),
        silver: z.object({ min_rating: nonNeg, max_genuine_reported: z.number().int().min(0), min_spotted: spottedExpr }).strict(),
        gold: z
          .object({
            min_rating: nonNeg,
            max_genuine_reported: z.number().int().min(0),
            min_spotted: spottedExpr,
            max_offfocus_doublechecks: z.number().int().min(0),
          })
          .strict(),
      })
      .strict(),
    timers: z
      .object({
        by_slot: z.record(z.string(), z.number().int().positive()),
        boss_beat: z.number().int().positive(),
        call_beat: z.number().int().positive(),
        inspect_cost_seconds: nonNeg,
        escalation_extra_seconds: nonNeg,
        modes: z.object({ standard: z.number().positive(), extended: z.number().positive(), off: z.null() }).strict(),
      })
      .passthrough(),
    pushers: z
      .object({ stress_interval_scale: z.object({ calm: z.number().positive(), tense: z.number().positive(), overwhelmed: z.number().positive() }).strict() })
      .passthrough(),
    stress: z
      .object({
        start_of_chapter: nonNeg,
        on_resume: nonNeg,
        per_pressure_lever: nonNeg,
        on_pusher_message: nonNeg,
        on_interrupt: nonNeg,
        on_timer_expiry: nonNeg,
        on_fall: nonNeg,
        decay_after_scenario: nonNeg,
        thresholds: z.object({ calm: stressBand, tense: stressBand, overwhelmed: stressBand }).strict(),
        cap: z.number().positive(),
      })
      .passthrough(),
    difficulty: z
      .object({
        chapter_slots: z.record(
          z.string(),
          z.object({ band: range, scored: range, boss_difficulty: z.number().int(), target_minutes: range }).strict(),
        ),
        max_new_patterns_per_chapter: z.number().int(),
        max_callbacks_per_chapter: z.number().int(),
      })
      .passthrough(),
    mix: z
      .object({
        legit_share: z.object({ min: z.number(), max: z.number() }).strict(),
        boss_is_fraud: z.boolean(),
        legit_twin_required: z.boolean(),
        max_consecutive_same_truth: z.number().int(),
        max_same_theme_share: z.number(),
        pressure_parity_pp: z.number(),
        min_checkables: z.object({ fraud: z.number().int(), legit: z.number().int() }).strict(),
        min_decoys_on_fraud: z.number().int(),
        sender_or_link_decoy_min_share: ceilShare,
        genuine_at_every_difficulty_used: z.boolean(),
        timer_length_parity: z.literal('same_length_by_slot'),
        genuine_normal_response_kind: actionKindSchema,
        drill_tags_count: z.boolean(),
        approve_prompt_only_on_fraud: z.boolean(),
        no_comply_on_legit_low: z.boolean(),
        language_never_red_flag: z.boolean(),
        padlock_never_reassurance_as_proof: z.boolean(),
        logo_or_sender_name_never_proof: z.boolean(),
        authoring_rule_applies_to_roles: z.array(z.enum(ROLES)),
      })
      .strict(),
    session: z
      .object({
        max_message_words: z.number().int(),
        debrief_layer1_max_words: z.number().int(),
        arc_line_max_words: z.number().int(),
      })
      .passthrough(),
  })
  .passthrough()
  .superRefine((b, ctx) => {
    // Grace must never invert stars and points (ruling L4): a grace cell of n stars pays less than the
    // next star up (n + 1) × per_star, e.g. ★ at 0 points stays below ★★ at 10.
    const cells = [['report_on_legit', b.tutorial_grace.report_on_legit], ['dismiss_on_legit_high', b.tutorial_grace.dismiss_on_legit_high]] as const;
    for (const [key, cell] of cells) {
      const nextUp = (cell.stars + 1) * b.points.per_star;
      if (cell.points >= nextUp) {
        ctx.addIssue({ code: 'custom', path: ['tutorial_grace', key, 'points'], message: `grace ${cell.stars}★ must pay less than ${cell.stars + 1}★ (${nextUp} points), so stars and points never invert` });
      }
    }
  });

export type Balance = z.infer<typeof balanceSchema>;

const hexColour = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'colours are #RRGGBB');
const brandAssetPath = z.string().regex(/^public\/brands\/[a-z0-9-]+\.svg$/, 'logos live at public/brands/<id>.svg');

/**
 * A sanctioned spoof host for scam scenarios. Plain string = may be shown as
 * an address-bar host. Object form = only as text inside an image, letter or
 * post (e.g. capital-letter homoglyphs that lowercasing would undo).
 */
export const lookalikeSchema = z.union([
  z.string().min(1),
  z.object({ host: z.string().min(1), display_text_only: z.boolean() }).strict(),
]);
export type Lookalike = z.infer<typeof lookalikeSchema>;

export const subBrandSchema = z
  .object({
    id: slug,
    name: z.string().min(1),
    purpose: z.string().min(1).optional(),
    domain: z.string().min(1).optional(),
    logo: brandAssetPath.optional(),
  })
  .strict();

/**
 * Fictional brand registry entry (content/brands.yaml, owned by ux-artist).
 * Strict: an unknown or mistyped key fails validation, so no field escapes
 * the host check below or the red-line lint.
 *
 * Review-only fields (rationale, checked_against, web_check) may name real
 * brands; redline:lint exempts exactly those nodes. Everything else is
 * player-facing or feeds player-facing text and is linted.
 */
export const brandSchema = z
  .object({
    id: slug,
    name: z.string().min(1),
    short_name: z.string().min(1).optional(),
    kind: z.enum(['bank', 'courier', 'marketplace', 'payment', 'telecom', 'utility', 'government', 'tech', 'retail', 'other']).optional(),
    /** Free-text sector from the ux-artist registry (T-1.6). */
    sector: z.string().min(1).optional(),
    role_in_game: z.string().min(1).optional(),
    sub_brands: z.array(subBrandSchema).optional(),
    /** Must be non-routable (.example/.test/.invalid); checked by content:validate and redline:lint. */
    domain: z.string().min(1).optional(),
    email_addresses: z.array(z.string().regex(/^[^@\s]+@[^@\s]+$/, 'must be an email address')).optional(),
    app_name: z.string().min(1).optional(),
    sms_sender_id: z.string().min(1).optional(),
    known_channels: z.string().min(1).optional(),
    palette: z.record(z.string().regex(/^[a-z_]+$/), hexColour).optional(),
    logo: z.object({ lockup: brandAssetPath, mark: brandAssetPath.optional() }).strict().optional(),
    typography: z.string().min(1).optional(),
    rationale: z
      .object({ name: z.string().min(1), colour_shape: z.string().min(1), typography: z.string().min(1).optional() })
      .strict()
      .optional(),
    checked_against: z.array(z.string().min(1)).optional(),
    web_check: z.string().min(1).optional(),
    lookalike_examples: z.array(lookalikeSchema).optional(),
    trademark_search: z.string().min(1).optional(),
    status: z.enum(['draft', 'approved', 'retired']).optional(),
    notes: z.string().optional(),
    /** Stub entries awaiting the ux-artist brand registry (T-1.6). */
    placeholder: z.boolean().default(false),
  })
  .strict();
export const brandsFileSchema = z
  .object({
    version: z.number().int().optional(),
    common: z.object({ trademark_search: z.string().min(1).optional() }).strict().optional(),
    brands: z.array(brandSchema),
  })
  .strict();
export type Brand = z.infer<typeof brandSchema>;

export const sourceSchema = z
  .object({
    id: slug,
    title: z.string().min(1),
    publisher: z.string().min(1).optional(),
    /** Public reference page; https only (no http:, javascript:, data: ...). */
    url: z
      .string()
      .refine(isHttpsUrl, 'url must be an absolute https:// URL')
      .optional(),
    accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'accessed must be YYYY-MM-DD').optional(),
    /** Research metadata (fraud-researcher, T-1.3). */
    published: z.string().min(1).optional(),
    region: z.string().min(2).optional(),
    tier: z.number().int().min(1).max(4).optional(),
    used_for: z.array(z.string()).optional(),
    notes: z.string().optional(),
    /** Placeholder ids reserved before fraud-researcher fills them in (T-1.3). */
    placeholder: z.boolean().default(false),
  })
  .strict()
  .superRefine((s, ctx) => {
    if (!s.placeholder) {
      for (const k of ['publisher', 'url', 'accessed'] as const) {
        if (!s[k]) ctx.addIssue({ code: 'custom', path: [k], message: `${k} is required for non-placeholder sources` });
      }
    }
  });
export function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname.length > 0 && !u.username && !u.password;
  } catch {
    return false;
  }
}

export const sourcesFileSchema = z.object({ sources: z.array(sourceSchema) }).strict();
export type Source = z.infer<typeof sourceSchema>;

/** content/i18n/<locale>/*.json: flat snake_case keys to non-empty ICU-style strings. */
export const i18nCatalogueSchema = z
  .record(
    z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/, 'message keys are snake_case, e.g. app_title'),
    z
      .string()
      .min(1)
      .refine(
        (m) => ICU_MESSAGE_RE.test(m) && [...m.matchAll(/\{\w+, plural,/g)].every((x) => m.slice(x.index).includes('other {')),
        'only {name} placeholders and {name, plural, one {…} other {…}} (with an other branch) are supported',
      ),
  )
  .refine((r) => Object.keys(r).length > 0, 'catalogue is empty');
