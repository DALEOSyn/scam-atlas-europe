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
import { firstLang, langMarkupIssues, strayLangMarkers } from './inlineLang.ts';
import { DIAL_KINDS, parentKinds } from './callDirection.ts';

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

/** `marketplace` (CR-33): a second-hand marketplace app (listing card, system notices, buyer chats). */
export const DEVICES = ['email', 'sms', 'messenger', 'marketplace', 'call', 'browser', 'qr', 'banking', 'social', 'auth', 'letter'] as const;
export const deviceSchema = z.enum(DEVICES);
export type Device = z.infer<typeof deviceSchema>;

/** GDD §6 / balance.yaml action_kinds. content:validate checks balance.yaml covers exactly this set. */
export const ACTION_KINDS = [
  'verify_in_app', 'call_back_known', 'check_official_list', 'check_with_platform', 'ask_someone', 'verify_identity',
  'report', 'block', 'ignore', 'delete', 'hang_up', 'deny_prompt', 'reply', 'open_link', 'call_number_in_message',
  'scan_qr_and_open', 'pay', 'pay_unprotected', 'enter_details', 'share_code', 'approve_prompt', 'install_or_remote',
  'proceed', 'pay_protected', 'pause', 'start_transfer',
  // CR-40: bad advice to a cast member in an advice scenario (class comply): scores 0, but is not a fall.
  'advise_comply',
] as const;
export const actionKindSchema = z.enum(ACTION_KINDS);
export type ActionKind = z.infer<typeof actionKindSchema>;

/**
 * `step` (CR-18, producer ruling 2026-11-19): `start_transfer` opens a `banking` beat. Non-terminal,
 * never decisive, no star cap, no row in the star table: the banking beat's own action decides.
 */
export const ACTION_CLASSES = ['verify', 'report', 'dismiss', 'engage', 'comply', 'proceed', 'meta', 'step'] as const;
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
  'reference', 'phone_number', 'letterhead', 'prompt', 'image', 'request', 'claim', 'video', 'spelling', 'grammar', 'language', 'other',
  // CR-36: the "Sounds like {name}" voice label on a call (always neutral). CR-37: how a QR code is attached.
  'voice', 'qr_mount',
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

/** CR-37: how a QR code is attached. */
export const QR_MOUNTS = ['printed', 'sticker'] as const;
/** CR-37: devices whose QR code is on a physical surface, so `qr.mount` applies. */
export const QR_MOUNT_DEVICES: readonly Device[] = ['qr', 'letter'];
/** CR-37 (Lisbon): from this chapter slot, every qr / letter beat with a QR code sets `qr.mount` (parity). */
export const CR37_FROM_SLOT = 7;
/** CR-39(b): devices that can show a QR code (a chat message carries one in a bubble). */
export const QR_DEVICES: readonly Device[] = ['qr', 'letter', 'messenger'];

/** QR codes may only resolve to an in-game route (Red Line 3). */
export const QR_PAYLOAD_RE = /^\/qr\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const qrSchema = z
  .object({
    payload: z.string().regex(QR_PAYLOAD_RE, 'QR payload must be an in-game route /qr/<id>'),
    /** Host shown on the destination chip ("QR code · opens trundle-redelivery.example"). */
    destination: fictionalAddress('qr.destination'),
    caption: z.string().min(1).optional(),
    /**
     * CR-37: how the code is attached, on `qr` and `letter` beats: printed on the surface, or a sticker over the
     * printed code. Checkable `qr.mount` (after qr.destination) when set. "Printed" is never proof; a sticker
     * may be a red flag. Required on every qr / letter QR beat from slot CR37_FROM_SLOT (rules.ts), for parity.
     */
    mount: z.enum(QR_MOUNTS).optional(),
    /**
     * CR-37 (S1): what a printed code is printed on, for the text "Printed on the {surface}" (e.g. "panel" on a
     * parking meter). Without it: "Printed on it" (qr) or "Printed on the letter" (letter). Needs `mount: printed`.
     */
    surface: z.string().regex(/^[a-z][a-z' -]{0,29}$/u, 'surface is a short lower-case noun such as panel or poster').optional(),
  })
  .strict()
  .refine((q) => q.surface === undefined || q.mount === 'printed', { message: 'surface names what a printed code is printed on: it needs mount: printed (CR-37)', path: ['surface'] });

export const senderSchema = z
  .object({
    display: z.string().min(1),
    detail: z.string().min(1).optional(),
    /**
     * CR-19: a chat from a number that is not a saved contact. Messenger only. Shows the neutral
     * "Not in your contacts · {detail}" banner on every unknown number, genuine or fraud (UI_SPEC §3.3).
     */
    new_contact: z.boolean().optional(),
  })
  .strict();

/** The four payee-name check results (GDD §23.5, Reg. (EU) 2024/886): match, close match, no match, couldn't check. */
export const NAME_CHECK_RESULTS = ['match', 'close_match', 'mismatch', 'unavailable'] as const;

/** A verbatim quote from the message: the `ask` (request checkable) or a `claim` (CR-17). */
const quoteSchema = z.object({ text: z.string().min(1), translation: z.string().min(1).optional() }).strict();

/**
 * Requests whose message may carry `ask` (share_code / approve since T-2.8; pay / enter_details / reply since CR-17;
 * CR-30: call, log_in, open_link and none, where the ask is the sentence telling the reader what to do).
 */
export const ASK_REQUESTS: readonly (typeof REQUESTS)[number][] = ['share_code', 'approve', 'pay', 'enter_details', 'reply', 'call', 'log_in', 'open_link', 'none'];
/**
 * CR-30: from slot 4 on, every scored scheduled beat on these devices needs `message.ask`, whatever its request
 * (never banking, interrupts or `scored: false` beats), genuine and fraud alike.
 */
export const CR30_ASK_DEVICES: readonly Device[] = ['sms', 'messenger', 'marketplace', 'email', 'social', 'call'];
/** CR-30: the chapter slot from which CR30_ASK_DEVICES need an ask on every scored scheduled beat. */
export const CR30_FROM_SLOT = 4;
/** CR-17: from slot 2 on, these requests need `message.ask` on every scored non-banking beat, genuine or fraud. */
export const CR17_ASK_REQUESTS: readonly (typeof REQUESTS)[number][] = ['pay', 'enter_details', 'reply'];

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
    page: z
      .object({
        address: fictionalAddress('page.address'),
        title: z.string().min(1).optional(),
        /**
         * CR-42: a browser warning drawn over the page as a game-styled panel (the Waymarker training frame; no
         * operating-system, browser or security-product look, no sound, no fullscreen, no real countdown). Its
         * body is the beat's message text: phone numbers, claims, the ask and references are quoted from it.
         * A visible "Close" picks the beat's dismiss action (rules.ts: exactly one). Browser only.
         */
        overlay: z.object({ title: z.string().min(1).max(60), body: z.string().min(1) }).strict().optional(),
      })
      .strict()
      .optional(),
    /**
     * CR-40: a message a cast member forwards to you, drawn as a quoted card inside their bubble (advice
     * scenarios). Its sender (`forwarded.sender`) and its body are the beat's checkables: claims, the ask and
     * references are quoted from `forwarded.body`; the cast member's own bubble is never checkable.
     * Messenger only. `app` is the brand id of the app it came from (in the scenario's brands).
     */
    forwarded: z
      .object({
        app: slug,
        sender: z.object({ display: z.string().min(1), detail: z.string().min(1).optional() }).strict(),
        body: z.string().min(1),
      })
      .strict()
      .optional(),
    /**
     * CR-33: the marketplace app the beat is shown in (its header): a brand id from content/brands.yaml,
     * listed in the scenario's brands. Marketplace only, required there.
     */
    app: z.object({ brand: slug }).strict().optional(),
    /** CR-33: the listing card ("Rucksack · €35.00"). Marketplace only. Checkable as the first `reference`. */
    listing: z.object({ title: z.string().min(1), price: z.string().min(1) }).strict().optional(),
    /**
     * CR-33: a system notice from the marketplace itself (sender row "Swaploft · Notice"), not a buyer's chat.
     * Marketplace only; sender.display is then the app's own name.
     */
    notice: z.boolean().optional(),
    /**
     * Who gets the money. On a `banking` beat: the transfer form (payee name, IBAN, amount) and the
     * payee-name check result (CR-23), or a payment-request page (`payment_request: true`, CR-18(c):
     * "Request from <name> · amount · note", no check runs). On email / messenger only: the "Bank details"
     * card (CR-22), IBAN checkable only, no name check outside the bank app.
     */
    payee: z
      .object({
        name: z.string().min(1),
        iban: z.string().min(1).optional(),
        name_check: z.enum(NAME_CHECK_RESULTS).optional(),
        /** The real account holder's name: shown on close match only, never on no match (CR-23). */
        holder: z.string().min(1).optional(),
        /** Prefilled demo amount, e.g. "€84.00". */
        amount: z.string().min(1).optional(),
        /** Payment-request note ("Canal boat, Saturday"). Request pages only. */
        note: z.string().min(1).optional(),
        payment_request: z.boolean().optional(),
        /**
         * CR-34: the bank app's confirmation after a payment code was shared: "Confirm payment · amount · to
         * {name}". Banking only, reached by a share_code; no name check, no IBAN; `payee.name` is checkable.
         */
        code_confirm: z.boolean().optional(),
      })
      .strict()
      .optional(),
    transcript: z.array(z.object({ speaker: z.enum(['caller', 'you']), text: z.string().min(1) }).strict()).optional(),
    /**
     * CR-36: the voice label on a call, "Sounds like {cast name}" under the caller ID once answered (the cast
     * id is in the scenario's cast and in content/cast.yaml). Checkable `voice` after `caller_id`, always
     * neutral: a voice can be copied, so it never proves anything either way. Call only. Never audio.
     */
    voice: z.object({ sounds_like: slug }).strict().optional(),
    /** CR-20: a recorded-message call. The header says "Recorded message" and "you" lines are not shown. Call only. */
    recorded: z.boolean().optional(),
    /**
     * CR-24: a video call, shown as a stylised illustration of a fictional person plus the transcript.
     * No photoreal image, no synthesised voice audio, no glitch effects. Call only. Checkable `video`.
     */
    video: z
      .object({
        /**
         * A vector illustration in public/art/video/ (ux-artist, ART_DIRECTION §12). content:validate checks
         * the file exists and is drawn as code (no embedded raster, page, script or external reference).
         */
        illustration: z.string().regex(/^public\/art\/video\/[a-z0-9-]+\.svg$/, 'video.illustration is an SVG at public/art/video/<id>.svg'),
        alt: z.string().min(1),
      })
      .strict()
      .optional(),
    /**
     * CR-27: the bank app shown in the banking header: a bank-sector brand id from content/brands.yaml, or
     * one of its sub-brand ids (e.g. a bank sub-brand such as Paris's larchwick-pro). Banking only.
     * content:validate rejects non-bank ids. Default: the player's bank (Larchwick).
     */
    bank: z.object({ brand: slug }).strict().optional(),
    /**
     * CR-26: whose money it is, on banking beats ("Ruchelune · current account"). CR-45: `kind` sets the
     * bank header's sub-label: `business` → "Business account"; `personal` (default) → the screen's own
     * sub-label ("Payments", "Payment request", "Confirm payment").
     */
    account: z.object({ nickname: z.string().min(1), kind: z.enum(['business', 'personal']).default('personal') }).strict().optional(),
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
     * from message.translation when the message is not in English. Requests in ASK_REQUESTS only
     * (share_code, approve; CR-17: pay, enter_details, reply).
     */
    ask: quoteSchema.optional(),
    /**
     * CR-17(b): what the sender claims (an offer, a promise, an excuse), verbatim from the body or one
     * caller line, at most 2. Checkables `claim`, `claim#2` ("What they say" / "What the caller says").
     * Authoring rule: a claim is never a deadline (T-2.4b ruling 2).
     */
    claims: z.array(quoteSchema).min(1).max(2).optional(),
    /**
     * Earlier texts in the same thread (ruling QA L5), oldest first, shown muted above today's message
     * under "Earlier". SMS and messenger only. Never checkable, no actions, links shown as plain text.
     */
    earlier: z
      .array(
        z
          .object({
            when: z.string().min(1),
            /** Email threads (CR-25): who wrote the earlier message, shown in the quoted header. */
            from: z.string().min(1).optional(),
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
    const callerLines = (m.transcript ?? []).filter((l) => l.speaker === 'caller').map((l) => l.text);
    // CR-40 / CR-42: a forwarded message or a page overlay is the message text; the bubble or page around it is not.
    const own = checkableText(m);
    const where = m.forwarded ? 'forwarded.body' : m.page?.overlay ? 'page.overlay.body' : 'the body or from one caller line of the transcript';
    const quoteRules = (q: { text: string; translation?: string | undefined }, path: (string | number)[], what: string) => {
      if (!(own ?? '').includes(q.text) && (own !== m.body || !callerLines.some((l) => l.includes(q.text)))) {
        ctx.addIssue({ code: 'custom', path: [...path, 'text'], message: `${what}.text must be copied verbatim from ${where}` });
      }
      if (m.lang && m.lang !== 'en') {
        if (!q.translation) ctx.addIssue({ code: 'custom', path: [...path, 'translation'], message: `the message is in "${m.lang}": ${what}.translation is required` });
        else if (!(m.translation ?? '').includes(q.translation)) ctx.addIssue({ code: 'custom', path: [...path, 'translation'], message: `${what}.translation must be copied verbatim from message.translation` });
      }
    };
    if (m.ask) {
      // A whole request, not a fragment like "the code" (sceptic T-2.8).
      if (m.ask.text.trim().split(/\s+/u).filter(Boolean).length < 4) ctx.addIssue({ code: 'custom', path: ['ask', 'text'], message: 'ask.text must be at least 4 words: the sentence that asks, not a fragment' });
      quoteRules(m.ask, ['ask'], 'ask');
      if (!ASK_REQUESTS.includes(m.request)) ctx.addIssue({ code: 'custom', path: ['ask'], message: `ask is only for messages whose request is ${ASK_REQUESTS.join(', ')}` });
    }
    (m.claims ?? []).forEach((c, i) => {
      if (c.text.trim().split(/\s+/u).filter(Boolean).length < 3) ctx.addIssue({ code: 'custom', path: ['claims', i, 'text'], message: 'a claim is at least 3 words: what they say, not a fragment' });
      quoteRules(c, ['claims', i], 'claims[]');
      if (m.ask && (m.ask.text.includes(c.text) || c.text.includes(m.ask.text))) ctx.addIssue({ code: 'custom', path: ['claims', i, 'text'], message: 'a claim must not overlap the ask (they are separate checkables)' });
    });
    if (m.claims && m.claims.length === 2 && m.claims[0]?.text === m.claims[1]?.text) ctx.addIssue({ code: 'custom', path: ['claims', 1], message: 'duplicate claim' });
    const p = m.payee;
    if (p) {
      // CR-23: the bank shows the holder's name on a close match only (Reg. (EU) 2024/886 Art. 5c), never on a no match.
      if (p.name_check === 'close_match' && !p.holder) ctx.addIssue({ code: 'custom', path: ['payee', 'holder'], message: 'a close match shows the account holder: payee.holder is required' });
      if (p.name_check !== 'close_match' && p.holder) ctx.addIssue({ code: 'custom', path: ['payee', 'holder'], message: 'payee.holder is shown only on a close match (never on match, no match or couldn\'t check)' });
      if (p.payment_request && p.name_check) ctx.addIssue({ code: 'custom', path: ['payee', 'name_check'], message: 'no payee-name check runs on a payment-request page (CR-18(c))' });
      if (p.note && !p.payment_request) ctx.addIssue({ code: 'custom', path: ['payee', 'note'], message: 'payee.note is for payment-request pages (payment_request: true)' });
      if (p.code_confirm) {
        if (p.name_check || p.holder || p.payment_request || p.note) ctx.addIssue({ code: 'custom', path: ['payee', 'code_confirm'], message: 'a code confirmation shows the payee name and amount only: no name_check, holder, payment_request or note (CR-34)' });
        if (p.iban) ctx.addIssue({ code: 'custom', path: ['payee', 'iban'], message: 'a code confirmation shows no IBAN (CR-34): "Confirm payment · amount · to {name}"' });
        if (!p.amount) ctx.addIssue({ code: 'custom', path: ['payee', 'amount'], message: 'a code confirmation shows the amount: payee.amount is required (CR-34)' });
      }
    }
    if (m.notice && !m.sender) ctx.addIssue({ code: 'custom', path: ['notice'], message: 'a notice shows the app as its sender: sender is required (CR-33)' });
  });
export type Message = z.infer<typeof messageSchema>;

/** "It fits…" opens reassuring reveals; never on details that cannot prove anything (CR-36 RM2, CR-37 LS2). */
export function startsWithItFits(reveal: string): boolean {
  return /^\s*it fits\b/iu.test(reveal);
}

/**
 * The text a beat's inline checkables (claims, ask, references, phone numbers, links) are quoted from:
 * a forwarded message (CR-40), else a page overlay (CR-42), else the body.
 */
export function checkableText(m: Pick<Message, 'body' | 'forwarded' | 'page'>): string | undefined {
  return m.forwarded?.body ?? m.page?.overlay?.body ?? m.body;
}

/**
 * Message parts that only some devices render (CR-19 … CR-26). Returns [path under message, error].
 * Pure; shared by the scenario schema (beats, interrupts) and banners.
 */
export function deviceOnlyIssues(device: Device, m: Message): [(string | number)[], string][] {
  const out: [(string | number)[], string][] = [];
  if (m.sender?.new_contact && device !== 'messenger') out.push([['sender', 'new_contact'], 'new_contact (the "Not in your contacts" banner) is for messenger chats (CR-19)']);
  if (m.sender?.new_contact && !m.sender.detail) out.push([['sender', 'detail'], 'a new contact shows its number: sender.detail is required (CR-19)']);
  if (m.recorded && device !== 'call') out.push([['recorded'], 'recorded is for call beats (CR-20)']);
  if (m.voice && device !== 'call') out.push([['voice'], 'voice (the "Sounds like" label) is for call beats (CR-36)']);
  if (m.qr && !QR_DEVICES.includes(device)) out.push([['qr'], `a QR code is shown on ${QR_DEVICES.join(', ')} beats, not on ${device} (CR-39(b))`]);
  if (m.qr?.mount && !QR_MOUNT_DEVICES.includes(device)) out.push([['qr', 'mount'], `qr.mount (how the code is attached) is for ${QR_MOUNT_DEVICES.join(' and ')} beats (CR-37)`]);
  if (m.video && device !== 'call') out.push([['video'], 'video is for call beats (CR-24)']);
  if (m.account && device !== 'banking') out.push([['account'], 'account (whose money it is) is for banking beats (CR-26)']);
  if (m.bank && device !== 'banking') out.push([['bank'], 'bank (the bank app header) is for banking beats (CR-27)']);
  if (m.app && device !== 'marketplace') out.push([['app'], 'app (the marketplace header) is for marketplace beats (CR-33)']);
  if (m.listing && device !== 'marketplace') out.push([['listing'], 'listing (the listing card) is for marketplace beats (CR-33)']);
  if (m.notice && device !== 'marketplace') out.push([['notice'], 'notice (a system notice from the app) is for marketplace beats (CR-33)']);
  if (m.payee?.code_confirm && device !== 'banking') out.push([['payee', 'code_confirm'], 'code_confirm is the bank app\'s confirmation: banking beats only (CR-34)']);
  if (m.forwarded && device !== 'messenger') out.push([['forwarded'], 'forwarded (a message a cast member forwards) is for messenger beats (CR-40)']);
  if (m.page?.overlay && device !== 'browser') out.push([['page', 'overlay'], 'page.overlay (the warning drawn over a page) is for browser beats (CR-42)']);
  const p = m.payee;
  if (p && device !== 'banking') {
    // CR-22: the "Bank details" card. No name check outside the bank app.
    if (device !== 'email' && device !== 'messenger') out.push([['payee'], `payee is shown on banking beats, or as a bank-details card on email or messenger, not on ${device} (CR-22)`]);
    if (!p.iban) out.push([['payee', 'iban'], 'a bank-details card shows the IBAN: payee.iban is required (CR-22)']);
    if (p.name_check || p.holder) out.push([['payee', 'name_check'], 'the payee-name check runs only in the bank app (banking beats), never on a bank-details card (CR-22)']);
    if (p.payment_request || p.note) out.push([['payee', 'payment_request'], 'payment-request pages are banking beats (CR-18(c))']);
  }
  return out;
}

/** Message parts each device template needs. */
export const DEVICE_PARTS: Record<Device, readonly (keyof Message)[]> = {
  email: ['sender', 'subject', 'body'],
  sms: ['sender', 'body'],
  messenger: ['sender', 'body'],
  marketplace: ['app', 'sender', 'body'],
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
                /**
                 * CR-21: bound to a beat. `at_seconds` then counts from when that beat opens, and the
                 * follow-up never fires if the beat is not reached (e.g. 2-7's "11 tasks to go" on top_up).
                 */
                beat: snakeId.optional(),
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

/**
 * CR-45: inline language spans in `text` (an action label or outcome narrative) and the optional translation.
 * Returns [field, message] pairs; `text` = the label/narrative, `translation` = the translation.
 */
export function langFieldIssues(text: string, translation: string | undefined): ['text' | 'translation', string][] {
  const out: ['text' | 'translation', string][] = langMarkupIssues(text).map((m) => ['text', m]);
  if (translation !== undefined && firstLang(text) === undefined) out.push(['translation', 'a translation needs an inline language span to translate: {lang:es}…{/lang}']);
  if (translation !== undefined && translation.includes('{lang:')) out.push(['translation', 'the translation is English: no inline language spans']);
  return out;
}

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
    /**
     * CR-31(b), ruling R16: on a `start_transfer`, `engage` caps every outcome of its group at ★★, like an
     * engage (the banking beat's call-back, report and cancel included); a fall stays a fall. Required when
     * the source beat is a call on a fraud scenario (rules.ts), forbidden on genuine scenarios.
     */
    cap: z.literal('engage').optional(),
    /**
     * CR-45 (WCAG 3.1.2): English translation of the label's inline language span(s)
     * (`Reply: {lang:es}¡sí, gracias!{/lang}`), offered with a Translate toggle next to the button.
     */
    translation: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((a, ctx) => {
    langFieldIssues(a.label, a.translation).forEach(([field, message]) => ctx.addIssue({ code: 'custom', path: [field === 'text' ? 'label' : 'translation'], message }));
    if (a.cap !== undefined && a.kind !== 'start_transfer') ctx.addIssue({ code: 'custom', path: ['cap'], message: 'cap: engage is for start_transfer actions (CR-31(b))' });
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
          .superRefine((x, ctx) => langMarkupIssues(x.label).forEach((message) => ctx.addIssue({ code: 'custom', path: ['label'], message })))
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
    /**
     * CR-45, call beats only: `outgoing` = the player dialled ("Calling …", then connected; no Answer or
     * Decline), `incoming` = it rings. Default: outgoing when every action leading here dials
     * (call_number_in_message, call_back_known; src/content/callDirection.ts), else incoming.
     */
    direction: z.enum(['incoming', 'outgoing']).optional(),
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
    /**
     * With after_beat (Amsterdam QA q): wait until that beat's "What now?" choice is made, so a reassuring
     * message (e.g. the real colleague: "Just landed, all fine here") does not give the answer away
     * while the player is still choosing. Without "What now?" it changes nothing.
     */
    after_what_now: z.boolean().default(false),
    /**
     * CR-27: with after_beat, what happens when the player fell for something in this scenario (a fall is
     * followed by damage control). `skip` (default): the interrupt is not delivered, so a cheerful
     * "Have a good weekend!" never lands right after losing money. `show`: delivered as usual.
     */
    on_fall: z.enum(['show', 'skip']).default('skip'),
    is_fraud: z.boolean(),
    ...beatBody,
  })
  .strict()
  .refine((i) => (i.at_seconds === undefined) !== (i.after_beat === undefined), 'an interrupt has exactly one of at_seconds or after_beat');

/**
 * CR-43(c), GDD §30.6: what a red-flag timeline string never contains: "fell", "fooled", "mistake", a currency
 * amount or any figure (no `alex_invested` value, no count of falls, no score per slot), or a count word.
 */
export function timelineTextIssues(text: string): string[] {
  const out: string[] = [];
  const t = text.normalize('NFKC');
  const blame = /\b(fell|fall(?:s|en)?\s+for|fooled|mistakes?)\b/iu.exec(t);
  if (blame) out.push(`no blame words ("${blame[1] ?? blame[0]}")`);
  if (/[€$£¥]|\b(?:EUR|USD|GBP|PLN|SEK|euros?|cents?)\b/iu.test(t)) out.push('no money or currency');
  if (/\p{Nd}/u.test(t)) out.push('no figures (no amounts, counts or scores)');
  if (/\b(?:twice|thrice|times)\b/iu.test(t)) out.push('no counts ("twice", "times")');
  return out;
}

/** R22 (psych M1): the flag the finale's close beat and Teo's chat set when the player told or checked with someone. */
export const ARC_TOLD_SOMEONE = 'arc_told_someone';
const TOLD_KINDS: readonly ActionKind[] = ['report', 'verify_identity', 'ask_someone'];

/** CR-40: what nobody does in an advice scenario (the player advises; the cast member stays safe). */
export const ADVICE_UNSAFE_KINDS: readonly ActionKind[] = ['pay', 'pay_unprotected', 'pay_protected', 'enter_details', 'share_code', 'approve_prompt', 'install_or_remote', 'proceed', 'start_transfer', 'open_link', 'scan_qr_and_open', 'call_number_in_message'];

/** CR-38: what the Fairmeasure register shows for a firm. */
export const REGISTER_RESULTS = ['authorised', 'not_listed', 'warning_list'] as const;
export type RegisterResult = (typeof REGISTER_RESULTS)[number];
/** A masked phone number hides at least 4 digits behind bullets (Red Line 3), e.g. "+353 1 ••• ••42". */
export const MASKED_PHONE_RE = /(?:•[^•]*){4}/u;

/** CR-38: the register's own contact details for an authorised firm; masked phone (Red Line 3). */
const registerContact = {
  address: z.string().min(1).optional(),
  phone: z.string().min(1).refine((v) => MASKED_PHONE_RE.test(v), 'the register\'s phone number hides at least 4 digits behind • (Red Line 3)').optional(),
};

/**
 * CR-38: the Fairmeasure result card a `check_official_list` outcome opens. `firm` is the name looked up;
 * address and phone only for `authorised` (the register's own details, as in content/brands.yaml).
 */
export const registerCardSchema = z
  .object({ firm: z.string().min(1), result: z.enum(REGISTER_RESULTS), ...registerContact })
  .strict()
  .superRefine((r, ctx) => {
    if (r.result !== 'authorised' && (r.address || r.phone)) ctx.addIssue({ code: 'custom', path: ['result'], message: 'address and phone are shown for authorised firms only (CR-38)' });
  });
export type RegisterCard = z.infer<typeof registerCardSchema>;

export const outcomeSchema = z
  .object({
    narrative: z.string().min(1),
    /** CR-45: English translation of the narrative's inline language span(s) (`{lang:es}¡Genial!{/lang}`). */
    translation: z.string().min(1).optional(),
    /** CR-38: the Fairmeasure result card (check_official_list outcomes only). */
    register: registerCardSchema.optional(),
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
    /**
     * R22 (psych M4): an optional authored note on the damage-control feedback screen ("Your steps"), after the
     * picks, e.g. the recovery offer: "…scammers share victims' details. That says nothing about you." Needs recovery.
     */
    recovery_note: z
      .string()
      .min(1)
      .refine((v) => v.trim().split(/\s+/u).length <= 30, 'recovery_note is at most 30 words (R22)')
      .optional(),
    sets_flags: z.array(flagName).optional(),
    /**
     * CR-32: damage control for a cast member (a drill): "Pick the step {name} should take first, then 2 more."
     * Scenario `feedback` on harmful steps is then shown in that person's voice. Needs `recovery`.
     * CR-41: for someone off-cast, `{ label, voiced_by }`: "Pick the step {label} should take first, then 2
     * more.", with the scenario feedback voiced by the cast member `voiced_by` (e.g. Noor about her friend).
     */
    recovery_for: z
      .union([
        slug,
        z
          .object({
            label: z
              .string()
              .min(1)
              .max(40)
              .refine((v) => sceneArtefacts(v).length === 0, 'recovery_for.label is a plain description of the person ("Noor\'s friend"): no numbers, links or names of accounts'),
            voiced_by: slug,
          })
          .strict(),
      ])
      .optional(),
    /**
     * CR-43(b): this outcome opens the reveal card (one portrait, the finale chapter's `arc_finale.reveal_names`,
     * under "The same picture {name} used."). Finale scenarios only, on verify_identity or report outcomes.
     */
    reveal: z.literal(true).optional(),
    /** Arc scenarios only, e.g. { alex_invested: 50 }. */
    arc_effects: z.record(flagName, z.union([z.number(), z.boolean()])).optional(),
  })
  .strict()
  .superRefine((o, ctx) => {
    langFieldIssues(o.narrative, o.translation).forEach(([field, message]) => ctx.addIssue({ code: 'custom', path: [field === 'text' ? 'narrative' : 'translation'], message }));
  });
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
        /**
         * CR-45: the sub-heading over each situation's text, when the fixed one does not fit the content
         * (e.g. `clicked: "Called the number"`, `paid: "Moved money"`). Without one: the game's heading for
         * that situation (`clicked` follows the scenario's own action: link, call, reply or QR code).
         */
        headings: z
          .object({
            clicked: z.string().min(1).optional(),
            entered_details: z.string().min(1).optional(),
            shared_code: z.string().min(1).optional(),
            paid: z.string().min(1).optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .refine((a) => a.clicked || a.entered_details || a.shared_code || a.paid, 'already_clicked needs at least one of clicked, entered_details, shared_code, paid')
      .superRefine((a, ctx) => {
        for (const [k, v] of Object.entries(a.headings ?? {})) {
          if (v !== undefined && !a[k as 'clicked' | 'entered_details' | 'shared_code' | 'paid']) ctx.addIssue({ code: 'custom', path: ['headings', k], message: `a heading for "${k}" needs already_clicked.${k} (the text under it)` });
        }
      })
      .optional(),
    /** Support line for arc slots 2–3 and other safeguarding moments. */
    safeguarding_line: z.string().min(1).optional(),
    /**
     * CR-40: advice scenarios with an `advise_comply` action: the line the debrief adds, without blame, after that
     * advice (authored, e.g. "Noor asked, and that was the smart bit. With an offer like this, the answer is always no.").
     */
    advice_line: z
      .string()
      .min(1)
      .refine((v) => v.trim().split(/\s+/u).length <= 20, 'advice_line is at most 20 words (shown in layer 1 next to the "You chose" line, CR-40)')
      .optional(),
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
    /**
     * CR-43: an arc scenario of the finale block (instead of `arc_slot`): the close beat, the recovery-agency test or
     * Teo's chat, named by the finale chapter's `arc_finale`. Unscored like every arc beat; a fall here runs its
     * damage control (banked as arc points), unlike slots 1–9.
     */
    finale: z.enum(['close', 'recovery_offer', 'teo']).optional(),
    /**
     * CR-40: an advice scenario: a cast member forwards a message and asks you; you advise them. They never act on
     * bad advice (`advise_comply` scores 0 and is not a fall), and no outcome makes them pay or share anything.
     */
    advice: z.object({ for: slug }).strict().optional(),
    /** The player started this (reset link they requested, their own sign-in): in-message action is proceed. */
    player_started: z.boolean().default(false),
    /**
     * Scene-setting line shown above the first beat (e.g. a boss's "18:40, the last working day…").
     * Rendered by ScenarioView as a lead-in paragraph above the first beat (CR-27).
     */
    setup: z.string().min(1).optional(),
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
    /** 2–5; CR-45: an opener with `request: none` may offer 1, a setup step (e.g. "Wait for the code"). */
    actions: z.array(actionSchema).min(1, 'a scenario offers 2–5 actions').max(5, 'a scenario offers 2–5 actions'),
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
    if (s.role === 'arc' && (s.arc_slot === undefined) === (s.finale === undefined)) issue(['arc_slot'], 'arc beats need arc_slot (1–9), or `finale` for the finale block (CR-43), not both');
    if (s.role !== 'arc' && s.finale !== undefined) issue(['finale'], 'finale is for arc scenarios (CR-43)');
    if (s.finale !== undefined && s.pressure.timer) issue(['pressure', 'timer'], 'the finale block has no timer: pressure.timer: false (CR-43, R22)');
    if (s.role !== 'arc' && s.arc_slot !== undefined) issue(['arc_slot'], 'arc_slot is for arc beats only');
    if ((s.role === 'arc') !== (s.debrief.variant === 'arc')) issue(['debrief', 'variant'], 'debrief.variant is arc exactly for arc beats');
    if (s.pressure.honest_deadline && s.is_fraud) issue(['pressure', 'honest_deadline'], 'honest_deadline is for genuine messages');
    if (s.twin_of === s.id) issue(['twin_of'], 'a scenario cannot be its own twin');
    // CR-45 (sceptic): inline language spans render only in action labels and outcome narratives; a marker
    // anywhere else would show as raw text, so it is an error.
    for (const at of strayLangMarkers(s)) issue(at, 'inline language markers ({lang:xx}…{/lang}) are only for action labels and outcome narratives (CR-45); mark a whole message with message.lang');
    // CR-45: one opening action only on an opener that asks nothing, and then it leads on (next_beat).
    // Sceptic B1: only a real setup step (isSetupStep): genuine, request: none, a proceed with next_beat. The
    // class check (proceed) needs balance.yaml, so it is in scripts/lib/rules.ts.
    if (s.actions.length === 1) {
      if (s.is_fraud || s.message.request !== 'none') issue(['actions'], 'a scenario offers 2–5 actions (only a genuine opener with request: none may offer a single setup step)');
      else if (s.actions[0]?.next_beat === undefined) issue(['actions', 0, 'next_beat'], 'a single opening action is a setup step: it needs next_beat (CR-45)');
    }

    // Red Line 4 debrief content.
    if ((s.is_fraud || s.role === 'arc') && !s.debrief.already_clicked) {
      issue(['debrief', 'already_clicked'], 'fraud and arc debriefs must say what to do if you already fell for it');
    }
    if (s.role !== 'arc' && !s.debrief.habit_card) issue(['debrief', 'habit_card'], 'debriefs need a habit_card');
    if (s.role !== 'arc' && !s.debrief.device_tip) issue(['debrief', 'device_tip'], 'debriefs need a device_tip (how to check on a real phone)');
    // CR-43(c): each arc slot's layer-1 tell is shown on the red-flag timeline: no blame words, amounts or counts.
    if (s.role === 'arc' && s.arc_slot !== undefined) {
      for (const what of timelineTextIssues(s.debrief.layer1.tell)) issue(['debrief', 'layer1', 'tell'], `this tell is shown on the red-flag timeline: ${what} (CR-43(c))`);
    }
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
      if (b.after_what_now && b.after_beat === undefined) issue(['interrupts', i, 'after_what_now'], 'after_what_now needs after_beat');
      if (b.on_fall === 'show' && b.after_beat === undefined) issue(['interrupts', i, 'on_fall'], 'on_fall is for after_beat interrupts (at_seconds interrupts arrive on the clock)');
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
      // CR-25: thread history on email too.
      if (b.message.earlier && !['sms', 'messenger', 'marketplace', 'email'].includes(b.device)) issue([...b.path, 'message', 'earlier'], 'earlier (thread history) is for sms, messenger, marketplace and email messages only');
      deviceOnlyIssues(b.device, b.message).forEach(([part, message]) => issue([...b.path, 'message', ...part], message));
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
        // CR-30: a `none` message may quote what it tells the reader to do ("Print your label…") as its ask.
        if (ins.target === 'request' && b.message.request === 'none' && !b.message.ask) {
          issue([...b.path, 'inspectables', i, 'target'], 'a request checkable needs message.request on the same beat (e.g. share_code or approve), or message.ask on a request: none message (CR-30)');
        }
        // CR-17(b), CR-24: claim and video checkables carry their own type.
        if (/^claim(?:#2)?$/.test(ins.target) && ins.type !== undefined && ins.type !== 'claim') issue([...b.path, 'inspectables', i, 'type'], 'a claim checkable has type: claim');
        if (ins.target === 'video' && ins.type !== undefined && ins.type !== 'video') issue([...b.path, 'inspectables', i, 'type'], 'a video checkable has type: video');
        if (ins.type === 'claim' && !/^claim(?:#2)?$/.test(ins.target)) issue([...b.path, 'inspectables', i, 'type'], 'type: claim is only for the claim / claim#2 checkables');
        if (ins.type === 'video' && ins.target !== 'video') issue([...b.path, 'inspectables', i, 'type'], 'type: video is only for the video checkable');
        // CR-36 (RM2): the voice is neutral everywhere: never a red flag, never "It fits" (a voice can be copied).
        if (ins.target === 'voice') {
          if (ins.type !== undefined && ins.type !== 'voice') issue([...b.path, 'inspectables', i, 'type'], 'a voice checkable has type: voice');
          if (ins.red_flag) issue([...b.path, 'inspectables', i, 'red_flag'], 'the voice is never a red flag: a voice can be copied, so it proves nothing either way (CR-36, RM2)');
          if (startsWithItFits(ins.reveal)) issue([...b.path, 'inspectables', i, 'reveal'], 'a voice reveal never starts with "It fits": a voice can be copied (CR-36, RM2)');
        }
        if (ins.type === 'voice' && ins.target !== 'voice') issue([...b.path, 'inspectables', i, 'type'], 'type: voice is only for the voice checkable');
        // CR-37 (LS2): how the code is attached is never "It fits"; only a sticker can be a red flag ("printed" is never proof).
        if (ins.target === 'qr.mount') {
          if (ins.type !== undefined && ins.type !== 'qr_mount') issue([...b.path, 'inspectables', i, 'type'], 'a qr.mount checkable has type: qr_mount');
          if (ins.red_flag && b.message.qr?.mount !== 'sticker') issue([...b.path, 'inspectables', i, 'red_flag'], 'qr.mount can be a red flag only when the code is a sticker (CR-37)');
          if (startsWithItFits(ins.reveal)) issue([...b.path, 'inspectables', i, 'reveal'], 'a qr.mount reveal never starts with "It fits": printed is never proof (CR-37, LS2)');
        }
        if (ins.type === 'qr_mount' && ins.target !== 'qr.mount') issue([...b.path, 'inspectables', i, 'type'], 'type: qr_mount is only for the qr.mount checkable');
      });
      // CR-36: the voice label always carries its lesson (RM2), never the neutral filler.
      if (b.message.voice && !b.inspectables.some((ins) => ins.target === 'voice')) issue([...b.path, 'inspectables'], 'a call with voice needs an inspectable with target: voice (its reveal: a voice can be copied, CR-36)');
      // CR-37, CR-39(b): scanning needs a code on the same beat.
      b.actions.forEach((a, i) => {
        if (a.kind === 'scan_qr_and_open' && !b.message.qr) issue([...b.path, 'actions', i, 'kind'], 'scan_qr_and_open needs a QR code on the same beat (message.qr)');
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
    // CR-45: a dialled call is reached by an action; one the player dialled never rings.
    s.beats.forEach((b, i) => {
      if (b.direction === undefined) return;
      if (b.device !== 'call') issue(['beats', i, 'direction'], 'direction is for call beats (CR-45)');
      else if (b.direction === 'outgoing' && (b.arrives_after !== undefined || !referencedBeats.has(b.id))) issue(['beats', i, 'direction'], 'an outgoing call is one the player dials: it is reached by an action (next_beat), never on a schedule (CR-45)');
      else if (b.direction === 'incoming') {
        const kinds = parentKinds(s, b.id);
        if (kinds.length > 0 && kinds.every((k) => DIAL_KINDS.includes(k))) issue(['beats', i, 'direction'], `every action leading here dials (${kinds.join(', ')}): the player placed this call, so it cannot ring as incoming (CR-45)`);
      }
    });
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

    // CR-18(a), (b), (e): start_transfer opens a banking beat with a payee (class rules in scripts/lib/rules.ts).
    const storyBeats = beats.filter((b) => b.path[0] !== 'interrupts');
    const beatOf = (id: string) => storyBeats.find((b) => b.id === id);
    const scheduledIds = new Set(['start', ...s.beats.filter((b) => b.arrives_after !== undefined).map((b) => b.id)]);
    for (const b of beats) {
      b.actions.forEach((a, i) => {
        if (a.kind !== 'start_transfer') return;
        const at = [...b.path, 'actions', i];
        if (b.path[0] === 'interrupts') return issue(at, 'start_transfer is not offered on interrupts');
        if (!SCORED_ROLES.includes(s.role)) issue(at, 'start_transfer is for standard and boss scenarios (CR-18(a))');
        if (a.next_beat === undefined) return issue([...at, 'next_beat'], 'start_transfer opens the banking app: it needs next_beat to a banking beat, never an outcome (CR-18(b))');
        const target = beatOf(a.next_beat);
        if (target && (target.device !== 'banking' || !target.message.payee)) issue([...at, 'next_beat'], `start_transfer leads to a banking beat with a payee; "${a.next_beat}" is ${target.device === 'banking' ? 'missing message.payee' : `a ${target.device} beat`} (CR-18(b))`);
        if (s.role === 'boss' && !scheduledIds.has(b.id)) issue(at, 'in a boss, start_transfer is offered on a scheduled beat only (start or arrives_after): one banking sub-beat per scheduled beat (CR-18(e))');
        if (target?.device === 'banking' && target.actions.some((x) => x.kind === 'start_transfer')) issue([...at, 'next_beat'], `the banking beat "${target.id}" cannot chain another start_transfer (CR-18(e))`);
        if (target?.message.payee?.code_confirm) issue([...at, 'next_beat'], `"${a.next_beat}" is a code confirmation: only a share_code leads there (CR-34)`);
        // CR-31(b), ruling R16: following a fraud caller's steps into your own bank app caps the group at ★★.
        if (a.cap === 'engage' && !s.is_fraud) issue([...at, 'cap'], 'cap: engage is for fraud scenarios; a genuine start_transfer stays a step (CR-31(b), CR-18)');
        if (a.cap === undefined && s.is_fraud && b.device === 'call') issue([...at, 'cap'], 'a start_transfer from a call on a fraud scenario needs cap: engage: following the caller\'s steps caps the beat at ★★ (ruling R16, CR-31(b))');
      });
      // CR-34: a share_code may lead (next_beat) to the bank app's confirmation, on fraud only.
      b.actions.forEach((a, i) => {
        if (a.kind !== 'share_code' || a.next_beat === undefined) return;
        const at = [...b.path, 'actions', i, 'next_beat'];
        if (b.path[0] === 'interrupts') return issue(at, 'a share_code on an interrupt is single-step: no next_beat (CR-34)');
        if (!s.is_fraud) issue(at, 'a share_code leads to a code confirmation on fraud scenarios only (CR-34)');
        const target = beatOf(a.next_beat);
        if (target && (target.device !== 'banking' || !target.message.payee?.code_confirm)) issue(at, `a share_code with next_beat leads to a banking beat with payee.code_confirm: true; "${a.next_beat}" is not one (CR-34)`);
      });
    }
    // CR-34: the code confirmation is reached by a share_code only.
    for (const b of storyBeats) {
      if (!b.message.payee?.code_confirm || b.device !== 'banking') continue;
      if (b.id === 'start') issue([...b.path, 'message', 'payee', 'code_confirm'], 'a code confirmation follows a share_code: it cannot be the opening message (CR-34)');
      const via = storyBeats.flatMap((x) => x.actions.filter((a) => a.next_beat === b.id).map((a) => a.kind));
      if (via.some((k) => k !== 'share_code')) issue([...b.path, 'message', 'payee', 'code_confirm'], `the code confirmation "${b.id}" is reached only by share_code actions (CR-34)`);
      if (b.actions.some((a) => a.next_beat !== undefined)) issue([...b.path, 'actions'], `the code confirmation "${b.id}" ends the beat: its actions have outcomes, not next_beat (CR-34)`);
    }
    // CR-38: the Fairmeasure result card is what you see when you look the firm up yourself.
    for (const [key, o] of Object.entries(s.outcomes)) {
      if (!o.register) continue;
      const via = beats.flatMap((b) => [
        ...b.actions.filter((a) => a.outcome === key).map((a) => a.kind),
        ...(b.what_now?.extra ?? []).filter((x) => x.outcome === key).map((x) => x.kind),
        ...Object.values(b.what_now?.outcomes ?? {}).filter((x) => x === key).map(() => 'what_now' as const),
      ]);
      if (via.some((k) => k !== 'check_official_list')) issue(['outcomes', key, 'register'], 'a register result card is reached only by check_official_list actions (CR-38)');
    }
    // CR-32: damage control for a cast member, in a drill. CR-41: for someone off-cast, voiced by a cast member.
    for (const [key, o] of Object.entries(s.outcomes)) {
      if (o.recovery_for === undefined) continue;
      const voice = typeof o.recovery_for === 'string' ? o.recovery_for : o.recovery_for.voiced_by;
      if (!o.recovery?.length) issue(['outcomes', key, 'recovery_for'], 'recovery_for names whose damage control it is: the outcome needs recovery steps (CR-32)');
      if (s.role !== 'drill') issue(['outcomes', key, 'recovery_for'], 'recovery_for is for drills (damage control for a cast member, CR-32, CR-41)');
      if (!s.cast.includes(voice)) issue(['outcomes', key, 'recovery_for'], `recovery_for "${voice}" must be in the scenario's cast list (CR-32, CR-41)`);
    }
    // CR-40: advice scenarios. The cast member is always safe: the player only advises.
    const allActions = beats.flatMap((b) => b.actions.map((a, i) => ({ a, path: [...b.path, 'actions', i] })));
    const advise = allActions.filter((x) => x.a.kind === 'advise_comply');
    if (s.advice) {
      if (!s.cast.includes(s.advice.for)) issue(['advice', 'for'], `advice.for "${s.advice.for}" must be in the scenario's cast list (CR-40)`);
      if (s.role !== 'standard' && s.role !== 'arc') issue(['advice'], 'advice scenarios are standard scenarios or arc beats (CR-40)');
      for (const x of allActions) {
        if (ADVICE_UNSAFE_KINDS.includes(x.a.kind)) issue([...x.path, 'kind'], `in an advice scenario nobody pays, enters details, shares a code, approves or installs anything: "${x.a.kind}" is not an option (CR-40; bad advice is advise_comply)`);
      }
      for (const [key, o] of Object.entries(s.outcomes)) {
        if (o.recovery?.length) issue(['outcomes', key, 'recovery'], 'an advice scenario keeps the cast member safe: no outcome has damage control (CR-40)');
      }
      if (advise.length > 0 && !s.debrief.advice_line) issue(['debrief', 'advice_line'], 'an advice scenario with advise_comply needs debrief.advice_line, the line shown without blame after that advice (CR-40)');
    }
    for (const x of advise) {
      if (!s.advice) issue([...x.path, 'kind'], 'advise_comply is for advice scenarios (advice: { for: <cast id> }, CR-40)');
      if (!s.is_fraud) issue([...x.path, 'kind'], 'advise_comply is for fraud scenarios (CR-40)');
      if (x.a.outcome === undefined) issue([...x.path, 'outcome'], 'advise_comply ends the beat: it needs an outcome (CR-40)');
    }
    if (s.debrief.advice_line && advise.length === 0) issue(['debrief', 'advice_line'], 'advice_line is shown after advise_comply: this scenario has none (CR-40)');
    if (s.message.forwarded && !s.brands.includes(s.message.forwarded.app)) issue(['message', 'forwarded', 'app'], `forwarded.app "${s.message.forwarded.app}" must be listed in the scenario's brands (CR-40)`);
    for (const b of beats) {
      if (b.message.forwarded && !s.advice) issue([...b.path, 'message', 'forwarded'], 'a forwarded message belongs to an advice scenario (advice: { for: <cast id> }, CR-40)');
    }
    // CR-43(b), R22 (psych M1): every player sees the reveal. In the close beat and Teo's chat every outcome an
    // action reaches opens it; elsewhere in the finale it follows a photo check or a report.
    const revealKinds: readonly ActionKind[] = s.finale === 'close' || s.finale === 'teo' ? ['verify_identity', 'report', 'ignore', 'advise_comply', 'ask_someone'] : ['verify_identity', 'report'];
    for (const [key, o] of Object.entries(s.outcomes)) {
      const via = beats.flatMap((b) => b.actions.filter((a) => a.outcome === key).map((a) => a.kind));
      if ((s.finale === 'close' || s.finale === 'teo') && via.length > 0 && !o.reveal) issue(['outcomes', key, 'reveal'], `every outcome of the finale's ${s.finale === 'close' ? 'close beat' : "Teo's chat"} opens the reveal card: reveal: true (R22, psych M1)`);
      if (!o.reveal) continue;
      if (s.finale === undefined) issue(['outcomes', key, 'reveal'], 'the reveal card is shown in the finale block only (scenarios with finale, CR-43(b))');
      if (via.some((k) => !revealKinds.includes(k))) issue(['outcomes', key, 'reveal'], `the reveal card is reached by ${revealKinds.join(', ')} actions only here (CR-43(b), R22)`);
    }
    for (const [key, o] of Object.entries(s.outcomes)) if (o.recovery_note && !o.recovery?.length) issue(['outcomes', key, 'recovery_note'], 'recovery_note is shown with damage control: this outcome has no recovery (R22)');
    // R22 (psych M1): ending lines that say the player told someone are gated on ARC_TOLD_SOMEONE; it is set exactly
    // where it is true (a report, a photo check, asking someone) and never by stepping away.
    if (s.finale === 'close' || s.finale === 'teo') {
      for (const [key, o] of Object.entries(s.outcomes)) {
        const via = beats.flatMap((b) => b.actions.filter((a) => a.outcome === key).map((a) => a.kind));
        const told = o.sets_flags?.includes(ARC_TOLD_SOMEONE) === true;
        if (via.some((k) => TOLD_KINDS.includes(k)) && !told) issue(['outcomes', key, 'sets_flags'], `a report, photo check or asking someone sets ${ARC_TOLD_SOMEONE} (R22, psych M1)`);
        if (told && via.length > 0 && via.every((k) => k === 'ignore')) issue(['outcomes', key, 'sets_flags'], `stepping away is not telling someone: no ${ARC_TOLD_SOMEONE} here (R22)`);
      }
    }
    if (s.role === 'boss') {
      // CR-18(e): a scheduled boss beat chains through start_transfer to exactly one banking sub-beat.
      for (const id of scheduledIds) {
        const b = beatOf(id);
        if (!b) continue;
        const subs = new Set(b.actions.filter((a) => a.kind === 'start_transfer' && a.next_beat !== undefined).map((a) => a.next_beat as string));
        if (subs.size > 1) issue([...b.path, 'actions'], `beat "${id}" chains to ${subs.size} banking sub-beats; a scheduled boss beat chains to at most one (CR-18(e))`);
      }
      const owners = new Map<string, string>();
      for (const id of scheduledIds) {
        for (const a of beatOf(id)?.actions ?? []) {
          if (a.kind !== 'start_transfer' || a.next_beat === undefined) continue;
          const prev = owners.get(a.next_beat);
          if (prev !== undefined && prev !== id) issue(['beats'], `the banking sub-beat "${a.next_beat}" is chained from two scheduled beats ("${prev}", "${id}"); each scheduled beat has its own (CR-18(e))`);
          owners.set(a.next_beat, id);
        }
      }
    }

    /** The scheduled beat whose group reaches `id` through next_beat (the opening in a standard scenario). */
    const groupOwnerOf = (id: string): string | undefined => {
      for (const start of scheduledIds) {
        const seen = new Set<string>([start]);
        const queue = [start];
        while (queue.length > 0) {
          const cur = queue.shift() as string;
          if (cur === id) return start;
          for (const a of beatOf(cur)?.actions ?? []) {
            if (a.next_beat !== undefined && !seen.has(a.next_beat) && !scheduledIds.has(a.next_beat)) {
              seen.add(a.next_beat);
              queue.push(a.next_beat);
            }
          }
        }
      }
      return undefined;
    };
    // CR-21: beat-bound follow-ups name a follow-up beat; one beat's follow-ups are listed together, in time order.
    const pushers = s.pressure.pusher?.messages ?? [];
    let lastBeat: string | undefined;
    const closed = new Set<string>();
    pushers.forEach((m, i) => {
      const path = ['pressure', 'pusher', 'messages', i, 'beat'];
      if (m.beat === undefined) {
        if (lastBeat !== undefined) issue(path, 'list unbound follow-ups before beat-bound ones (CR-21)');
        return;
      }
      if (m.beat === 'start' || !s.beats.some((b) => b.id === m.beat)) issue(path, `"${m.beat}" is not a follow-up beat id (CR-21)`);
      // A follow-up bound to a banking beat or a page is shown as coming from the group's scheduled beat
      // (src/engine/runner.ts viewOf): that beat must be a message from a sender (sceptic T-3.3).
      const bound = beatOf(m.beat);
      if (bound && (bound.device === 'banking' || !bound.message.sender)) {
        const owner = groupOwnerOf(m.beat);
        const ob = owner !== undefined ? beatOf(owner) : undefined;
        if (!ob || !ob.message.sender || !['sms', 'messenger', 'marketplace', 'social', 'email', 'call'].includes(ob.device)) {
          issue(path, `a follow-up bound to the ${bound.device} beat "${m.beat}" must resolve to a chat sender: its group's scheduled beat${owner ? ` "${owner}"` : ''} is not a message from a sender (CR-21)`);
        }
      }
      if (m.beat !== lastBeat) {
        if (closed.has(m.beat)) issue(path, `follow-ups bound to "${m.beat}" must be listed together (CR-21)`);
        if (lastBeat !== undefined) closed.add(lastBeat);
        lastBeat = m.beat;
      } else {
        const prev = pushers[i - 1];
        if (prev && prev.at_seconds >= m.at_seconds) issue(['pressure', 'pusher', 'messages', i, 'at_seconds'], `follow-ups bound to "${m.beat}" are listed in time order (CR-21)`);
      }
    });

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
    /**
     * The chapter's rules as a framed "pinned card" on the chapter intro, after the intro text (CR-27
     * round 2, psych M1), e.g. a company's payment procedure the player is scored on. Shown again with
     * "Continue" when a run resumes (psych M2).
     */
    rules: z.object({ title: z.string().min(1), items: z.array(z.string().min(1)).min(1) }).strict().optional(),
    /**
     * Story scenes (S3, STORY §3, §6): `arrival` before the first scenario, `turn` at the half-day stop
     * point (after "Keep going"), `resolution` after the last debrief and before the summary (it ends on
     * the If-then panel). `placed` holds spec-placed beats that play after a named scenario's debrief
     * (Amsterdam's local problem, Paris's turn after 3-5). All optional: a chapter plays without scenes.
     */
    scenes: z
      .object({
        arrival: slug.optional(),
        turn: slug.optional(),
        /**
         * One scene, or (CR-43(d), the finale) several in order, e.g. [opening, ending variants…, feelings, part 2].
         * Scenes with `if_arc_ending` play only for those endings. The last one ends on the If-then panel.
         */
        resolution: z.union([slug, z.array(slug).min(1).max(8)]).optional(),
        placed: z.array(z.object({ scene: slug, after: slug }).strict()).max(3).default([]),
      })
      .strict()
      .optional(),
    /** Content note shown before the chapter starts (STORY §5.6, exact wording), with a way out. */
    content_note: z.string().min(1).optional(),
    /** Brussels: the note when the Alex arc already closed with "Tell me now" (STORY §5.6). */
    content_note_arc_closed: z.string().min(1).optional(),
    /** Habit cards the chapter's Atlas page links to (STORY §1.3; an Atlas page = If-then line + these). */
    atlas_cards: z.array(slug).max(5).optional(),
    /**
     * CR-43: the finale (slot 10 only). After the last scenario's debrief and damage control, before the resolution,
     * the engine plays the Alex ending from the saved arc state (GDD §30.6): the close beat, the reveal, arc damage
     * control, the recovery-agency test, Teo's chat and the red-flag timeline. The three scenarios are role arc with
     * the matching `finale`; `reveal_names` are the three names under the one portrait (the arc character's first);
     * `damage_control` is ending C's arc damage control (banked as arc points, no amounts).
     */
    arc_finale: z
      .object({
        close: slug,
        recovery_offer: slug,
        teo: slug,
        reveal_names: z.tuple([z.string().min(1).max(20), z.string().min(1).max(20), z.string().min(1).max(20)]),
        /**
         * R22 (sceptic nb4): the finale's reveal step (an arc closed earlier) is authored: its tell and habit lines
         * are content, so the engine owns no lesson wording. Shown under the reveal card and its fixed line.
         */
        reveal: z.object({ tell: z.string().min(1).max(120), habit: z.string().min(1).max(120) }).strict(),
        damage_control: z
          .array(z.object({ step: snakeId, category: z.enum(RECOVERY_CATEGORIES), feedback: z.string().min(1).optional() }).strict())
          .min(5)
          .max(6),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((c, ctx) => {
    if (c.content_note_arc_closed && !c.content_note) ctx.addIssue({ code: 'custom', path: ['content_note_arc_closed'], message: 'needs content_note too' });
    for (const key of ['content_note', 'content_note_arc_closed'] as const) {
      const text = c[key];
      if (text) for (const what of sceneArtefacts(text)) ctx.addIssue({ code: 'custom', path: [key], message: `no scam artefacts in content notes: this looks like ${what}` });
    }
    if (c.scenes) {
      const all = [...c.scenario_order.am, ...c.scenario_order.pm];
      c.scenes.placed.forEach((p, i) => {
        if (!all.includes(p.after)) ctx.addIssue({ code: 'custom', path: ['scenes', 'placed', i, 'after'], message: `"${p.after}" is not in scenario_order` });
      });
      const ids = [c.scenes.arrival, c.scenes.turn, ...resolutionList(c.scenes.resolution), ...c.scenes.placed.map((p) => p.scene)].filter((x): x is string => !!x);
      if (Array.isArray(c.scenes.resolution) && c.scenes.resolution.length > 1 && !c.arc_finale) ctx.addIssue({ code: 'custom', path: ['scenes', 'resolution'], message: 'a resolution of several scenes is for the finale (arc_finale, CR-43(d))' });
      const dupScene = ids.find((id, i) => ids.indexOf(id) !== i);
      if (dupScene) ctx.addIssue({ code: 'custom', path: ['scenes'], message: `scene "${dupScene}" is placed twice` });
      if (c.scenes.turn && (c.scenario_order.am.length === 0 || c.scenario_order.pm.length === 0)) {
        ctx.addIssue({ code: 'custom', path: ['scenes', 'turn'], message: 'the turn plays at the half-day stop point; this chapter has no stop point (place it with `placed` instead)' });
      }
    }
    const all = [...c.scenario_order.am, ...c.scenario_order.pm];
    const dup = all.find((id, i) => all.indexOf(id) !== i);
    if (dup) ctx.addIssue({ code: 'custom', path: ['scenario_order'], message: `"${dup}" appears twice in scenario_order` });
    if (c.boss && !c.scenario_order.pm.includes(c.boss)) {
      ctx.addIssue({ code: 'custom', path: ['boss'], message: 'the boss plays in the afternoon (scenario_order.pm)' });
    }
    if (c.arc_beat && !all.includes(c.arc_beat)) ctx.addIssue({ code: 'custom', path: ['arc_beat'], message: 'arc_beat must be in scenario_order' });
    if (c.status === 'complete' && !c.boss) ctx.addIssue({ code: 'custom', path: ['boss'], message: 'a complete chapter has a boss' });
    if (c.arc_finale) {
      const f = c.arc_finale;
      if (c.slot !== 10) ctx.addIssue({ code: 'custom', path: ['arc_finale'], message: 'arc_finale is for the finale (slot 10, CR-43)' });
      if (c.arc_beat) ctx.addIssue({ code: 'custom', path: ['arc_beat'], message: 'the finale has no arc beat: slot 9 is the last one, played before it (CR-43(f))' });
      for (const k of ['close', 'recovery_offer', 'teo'] as const) {
        if (all.includes(f[k])) ctx.addIssue({ code: 'custom', path: ['arc_finale', k], message: `"${f[k]}" plays in the finale block, not in scenario_order (CR-43)` });
      }
      if (new Set([f.close, f.recovery_offer, f.teo]).size < 3) ctx.addIssue({ code: 'custom', path: ['arc_finale'], message: 'close, recovery_offer and teo are three different scenarios' });
      if (new Set(f.reveal_names.map((n) => n.trim().toLowerCase())).size < 3) ctx.addIssue({ code: 'custom', path: ['arc_finale', 'reveal_names'], message: 'three different names under the one picture (CR-43(b))' });
      f.reveal_names.forEach((n, i) => {
        for (const what of sceneArtefacts(n)) ctx.addIssue({ code: 'custom', path: ['arc_finale', 'reveal_names', i], message: `a profile name only: this looks like ${what}` });
      });
      for (const k of ['tell', 'habit'] as const) for (const what of timelineTextIssues(f.reveal[k])) ctx.addIssue({ code: 'custom', path: ['arc_finale', 'reveal', k], message: `the reveal is never blame: ${what} (R22)` });
      if (!f.damage_control.some((x) => x.category === 'harmful')) ctx.addIssue({ code: 'custom', path: ['arc_finale', 'damage_control'], message: 'damage control offers at least one harmful step (GDD §9)' });
      if (!f.damage_control.some((x) => x.category === 'stop')) ctx.addIssue({ code: 'custom', path: ['arc_finale', 'damage_control'], message: 'damage control offers at least one stop step (GDD §9)' });
      if (new Set(f.damage_control.map((x) => x.step)).size !== f.damage_control.length) ctx.addIssue({ code: 'custom', path: ['arc_finale', 'damage_control'], message: 'a step is listed twice' });
      if (c.boss && c.scenario_order.pm.at(-1) !== c.boss) ctx.addIssue({ code: 'custom', path: ['boss'], message: 'in the finale the boss is the last scenario: the arc finale block follows its debrief (CR-43(a))' });
    }
  });

/** The chapter's resolution scenes in order (one id or a list, CR-43(d)). */
export function resolutionList(r: string | readonly string[] | undefined): string[] {
  return r === undefined ? [] : typeof r === 'string' ? [r] : [...r];
}
export type Chapter = z.infer<typeof chapterSchema>;

// ---------------------------------------------------------------------------
// Story scenes (S3; STORY §4, ART_DIRECTION §4–§9). content/scenes/<city>/<id>.yaml and
// content/scenes/interludes/<id>.yaml. Scenes carry people, places and habits, never scams.

export const SCENE_SLOTS = ['arrival', 'turn', 'resolution', 'beat', 'interlude'] as const;
/** GDD §10.3 arc endings (mirrors ArcEnding in src/engine/arc.ts): R, C, A′ (A_prime), A, B. */
export const ARC_ENDINGS = ['A', 'A_prime', 'B', 'C', 'R'] as const;
export type SceneSlot = (typeof SCENE_SLOTS)[number];
/** The folder interludes live in (they belong to no city: keyed to play position, STORY §3.12). */
export const INTERLUDE_FOLDER = 'interludes';

/** The shared expression set (STORY §2, ART_DIRECTION §4.4). */
export const EXPRESSIONS = ['calm', 'warm', 'laughing', 'thinking', 'worried', 'relieved', 'sheepish', 'proud', 'focused'] as const;
export type Expression = (typeof EXPRESSIONS)[number];
/** ART_DIRECTION §9.7: the fixed alt-text word per expression; it must appear in the panel's alt. */
export const EXPRESSION_ALT_WORDS: Record<Expression, string> = {
  calm: 'calm',
  warm: 'smiling',
  laughing: 'laughing',
  thinking: 'thinking',
  worried: 'looking worried',
  relieved: 'relieved',
  sheepish: 'with a sheepish smile',
  proud: 'proud',
  focused: 'concentrating',
};
/** A sensitive scene never ends on these (ART_DIRECTION §14 F, STORY §5.3). */
export const NEVER_LAST_ON_SENSITIVE: readonly Expression[] = ['worried', 'sheepish'];
/** Listeners are never more expressive than the speaker: calm or warm only (ART_DIRECTION §7.1). */
export const LISTENER_EXPRESSIONS: readonly Expression[] = ['calm', 'warm'];
/** STORY §4.1: lines ≤ 25 words; the If-then line too (§4.4). */
export const SCENE_LINE_MAX_WORDS = 25;
export const SCENE_MAX_PANELS = 6;
export const INTERLUDE_MAX_PANELS = 4;
/** ART_DIRECTION §9.2 and §9.8. */
export const SCENE_ALT_MAX = 150;
export const SCENE_ALT_BACKDROP_MAX = 80;
/** Interlude placeholders (STORY §3.12): cities done and the last city's name. */
export const SCENE_PLACEHOLDERS = ['count', 'lastCity'] as const;

/** `calm`, `relieved-parcels`, `warm-phone-ear`: an expression, optionally with a pose (ART_DIRECTION §4.4). */
export const expressionId = z
  .string()
  .regex(new RegExp(`^(?:${EXPRESSIONS.join('|')})(?:-[a-z0-9]+)*$`), `an expression from the shared set (${EXPRESSIONS.join(', ')}), optionally with a pose, e.g. relieved-parcels`);

export function baseExpression(id: string): Expression {
  return (id.split('-')[0] ?? 'calm') as Expression;
}

export function sceneWordCount(text: string | undefined): number {
  return text ? text.trim().split(/\s+/u).filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
}

/**
 * STORY §4.2 rule 1: no scam artefacts in scenes. Stricter than redline:lint (which allows fictional
 * domains and masked numbers in device content): a scene line has no address of any kind, no number that
 * could be a phone, code, IBAN or amount, and no masked digits.
 */
const TLDS = 'com|net|org|info|biz|example|test|invalid|eu|de|nl|fr|es|it|pl|pt|ie|se|be|at|ch|uk|co|io|app|online|shop|site';
const SCENE_ARTEFACTS: { re: RegExp; what: string }[] = [
  { re: /(?<![\p{L}\p{N}])(?:h[tx]{2}ps?|ftp|mailto|javascript):|(?<![\p{L}\p{N}])www\s*\./iu, what: 'a link' },
  // A dot with no space on either side, or with spaces on both sides ("www . parcel . example"); a sentence end has neither.
  { re: /[\p{L}\p{N}-]+(?:(?:\.|\s+\.\s+)[\p{L}\p{N}-]+)*(?:\.|\s+\.\s+)\p{L}{2,}(?![\p{L}])/u, what: 'a web address or domain' },
  { re: new RegExp(`(?<![\\p{L}])(?:dot|punkt|point|punto)\\s+(?:${TLDS})(?![\\p{L}])`, 'iu'), what: 'a spelled-out web address' },
  { re: /(?<![\p{L}])slash(?![\p{L}])/iu, what: 'a spelled-out web address' },
  { re: /\S@\S/u, what: 'an e-mail address or handle' },
  { re: /\/qr\//i, what: 'a QR route' },
  { re: /(?<![\p{L}\p{N}])[A-Z]{2}\p{Nd}{2}(?:[ ]?[A-Z0-9]{2,4}){2,}/u, what: 'an IBAN' },
  { re: /\+\s?\p{Nd}|\p{Nd}(?:[ ().-]?\p{Nd}){5,}/u, what: 'a phone number' },
  { re: /\p{Nd}{4,}|\p{Nd}(?:\s\p{Nd}){3,}/u, what: 'a code or long number (write numbers in words)' },
  { re: /[•*]{2,}|\p{Nd}[•*]|[•*]\p{Nd}/u, what: 'a masked number' },
  { re: /[€£$¥₺]|\p{Nd}\s?(?:eur|euro|euros|usd|gbp|chf|pln|sek|kr|zł)(?!\p{L})|(?<!\p{L})(?:eur|euro|euros)\s?\p{Nd}/iu, what: 'an amount of money' },
];

/**
 * Fold look-alike characters before matching: NFKC (full-width ０-９ ＋ ＠ ．, mathematical digits),
 * zero-width and other format characters (removed), ideographic full stops, and defanged dots ("[.]", "(.)", "{dot}").
 */
export function normaliseSceneText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/\p{Cf}/gu, '')
    .replace(/[。．｡]/g, '.')
    .replace(/\s*[[({]\s*(?:\.|dot)\s*[\])}]\s*/giu, '.');
}

export function sceneArtefacts(text: string): string[] {
  // Placeholders ({count}) and the ellipsis "…" are fine; dotted abbreviations ("a.m.") have 1-letter parts.
  const clean = normaliseSceneText(text).replace(/\{(?:count|lastCity)\}/g, ' ');
  return [...new Set(SCENE_ARTEFACTS.filter((a) => a.re.test(clean)).map((a) => a.what))];
}

const sceneText = z.string().min(1);

export const sceneLocalPhraseSchema = z
  .object({ text: sceneText, lang: z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, 'a BCP 47 language tag such as de or nl-NL'), translation: sceneText })
  .strict();

export const scenePanelSchema = z
  .object({
    /** public/art/backdrops/<backdrop>.svg; absent = a plain wall (video calls, captions). */
    backdrop: slug.optional(),
    /** ART_DIRECTION §6.1: one backdrop, three camera positions. */
    crop: z.enum(['left', 'centre', 'right']).default('centre'),
    /** A cast id (content/cast.yaml), `you` (the player: label "You", never drawn), or absent (narration). */
    speaker: z.union([slug, z.literal('you')]).optional(),
    /** Required for a cast speaker; `x-<expression>` must exist in public/art/cast/<speaker>.svg. */
    expression: expressionId.optional(),
    /** Speaker stands on the right, facing the centre (ART_DIRECTION §7.1). */
    flip: z.boolean().default(false),
    /** One listener, calm or warm only (ART_DIRECTION §7.1). */
    with: z.object({ id: slug, expression: expressionId }).strict().optional(),
    /** Video-call panel (ART_DIRECTION §7.6): caption "On a video call". */
    video: z.boolean().default(false),
    line: sceneText.optional(),
    /** At most one local-language phrase per scene, with its inline translation (STORY §4.1). */
    local: sceneLocalPhraseSchema.optional(),
    /** Narration ("Later that evening."): no tail, sunken background (ART_DIRECTION §7.4). */
    caption: sceneText.optional(),
    /** The If-then panel (STORY §4.4): last panel of a resolution; caption "Postcard to Teo" is added by the player. */
    if_then: z
      .object({
        cue: sceneText.refine((t) => /^If\b/.test(t), 'the cue starts with "If"'),
        action: sceneText.refine((t) => /^then\b/.test(t), 'the action starts with "then"'),
        /** An extra line under it on the postcard and Atlas page ("A real job pays you."), never inside the line. */
        extra: sceneText.optional(),
      })
      .strict()
      .optional(),
    /** Flip the postcard (STORY §3.12): the engine picks the line; the player taps to flip. Unscored. */
    flip_postcard: z.literal(true).optional(),
    /** Optional rehearsal choice (STORY §4.1): 2–3 options, one shared reply; never scores and sets no flag. */
    choice: z
      .object({
        prompt: sceneText,
        options: z.array(sceneText).min(2).max(3),
        reply: sceneText,
      })
      .strict()
      .optional(),
    /** Story-only variant flags (STORY §4.2 rule 5): the panel shows only when the chapter run has (or lacks) the flag. */
    if_flag: flagName.optional(),
    unless_flag: flagName.optional(),
    /** CR-43(d): the panel shows only for these arc endings (finale resolution scenes). */
    if_arc_ending: z.array(z.enum(ARC_ENDINGS)).min(1).optional(),
    /**
     * CR-44(b): this panel's line opens the end screen "Your Atlas" as its epigraph (Adaeze's last line, STORY §1.5).
     * At most one, in a resolution scene, a cast member's line, shown to everyone.
     */
    epigraph: z.literal(true).optional(),
    /** ART_DIRECTION §9: who → expression word → doing → where; ≤ 150 characters (≤ 80 backdrop-only). */
    alt: sceneText,
  })
  .strict()
  .superRefine((p, ctx) => {
    const drawn = p.speaker !== undefined && p.speaker !== 'you';
    if (drawn && !p.expression) ctx.addIssue({ code: 'custom', path: ['expression'], message: 'a cast speaker needs an expression' });
    if (!drawn && p.expression) ctx.addIssue({ code: 'custom', path: ['expression'], message: 'only a cast speaker has an expression (the player and narration are never drawn)' });
    if (p.speaker === 'you' && p.flip) ctx.addIssue({ code: 'custom', path: ['flip'], message: 'the player is never drawn' });
    if (!p.line && !p.caption && !p.if_then && !p.flip_postcard) ctx.addIssue({ code: 'custom', path: ['line'], message: 'a panel needs a line, a caption, an if_then or flip_postcard' });
    if (p.line && !p.speaker) ctx.addIssue({ code: 'custom', path: ['speaker'], message: 'a line needs a speaker (use caption for narration)' });
    if (p.if_then && !drawn) ctx.addIssue({ code: 'custom', path: ['if_then'], message: 'the If-then line is spoken by a cast member (STORY §4.4)' });
    if (p.if_then && p.choice) ctx.addIssue({ code: 'custom', path: ['choice'], message: 'no choice on the If-then panel' });
    if (p.flip_postcard && (p.if_then || p.choice)) ctx.addIssue({ code: 'custom', path: ['flip_postcard'], message: 'flip the postcard is a panel of its own' });
    if (p.if_flag && p.unless_flag) ctx.addIssue({ code: 'custom', path: ['unless_flag'], message: 'use if_flag or unless_flag, not both' });
    if (p.epigraph && (!p.line || !drawn)) ctx.addIssue({ code: 'custom', path: ['epigraph'], message: 'the epigraph is a cast member\'s line (CR-44(b))' });
    if (p.epigraph && (p.if_flag || p.unless_flag || p.if_arc_ending)) ctx.addIssue({ code: 'custom', path: ['epigraph'], message: 'the epigraph panel is shown to everyone (no variant)' });
    if (p.with) {
      if (!LISTENER_EXPRESSIONS.includes(baseExpression(p.with.expression)) || p.with.expression.includes('-')) {
        ctx.addIssue({ code: 'custom', path: ['with', 'expression'], message: 'a listener is calm or warm only (ART_DIRECTION §7.1)' });
      }
      if (p.with.id === p.speaker) ctx.addIssue({ code: 'custom', path: ['with', 'id'], message: 'the listener is not the speaker' });
      if (!drawn) ctx.addIssue({ code: 'custom', path: ['with'], message: 'a listener stands with a drawn speaker' });
    }
    const texts: [string, string | undefined][] = [
      ['line', p.line],
      ['caption', p.caption],
      ['local.text', p.local?.text],
      ['local.translation', p.local?.translation],
      ['if_then.extra', p.if_then?.extra],
      ['choice.prompt', p.choice?.prompt],
      ['choice.reply', p.choice?.reply],
      ...(p.choice?.options ?? []).map((o, i): [string, string] => [`choice.options.${i}`, o]),
    ];
    for (const [path, text] of texts) {
      if (text !== undefined && sceneWordCount(text) > SCENE_LINE_MAX_WORDS) ctx.addIssue({ code: 'custom', path: path.split('.'), message: `at most ${SCENE_LINE_MAX_WORDS} words (has ${sceneWordCount(text)})` });
    }
    if (p.if_then && sceneWordCount(`${p.if_then.cue} ${p.if_then.action}`) > SCENE_LINE_MAX_WORDS) {
      ctx.addIssue({ code: 'custom', path: ['if_then'], message: `the If-then line is at most ${SCENE_LINE_MAX_WORDS} words` });
    }
    for (const [path, text] of [...texts, ['if_then.cue', p.if_then?.cue], ['if_then.action', p.if_then?.action], ['alt', p.alt]] as [string, string | undefined][]) {
      if (text === undefined) continue;
      for (const what of sceneArtefacts(text)) ctx.addIssue({ code: 'custom', path: path.split('.'), message: `no scam artefacts in scenes: this looks like ${what} (STORY §4.2 rule 1)` });
      if (path !== 'alt' && /\{(?!count\}|lastCity\})[^}]*\}/.test(text)) ctx.addIssue({ code: 'custom', path: path.split('.'), message: 'only {count} and {lastCity} placeholders are supported' });
    }
    // Alt text (ART_DIRECTION §9).
    if (/^\s*(?:image|picture|illustration) of\b/i.test(p.alt)) ctx.addIssue({ code: 'custom', path: ['alt'], message: 'alt text does not start with "Image of"' });
    const max = drawn || p.with ? SCENE_ALT_MAX : SCENE_ALT_BACKDROP_MAX;
    if (p.alt.length > max) ctx.addIssue({ code: 'custom', path: ['alt'], message: `alt text is at most ${max} characters (has ${p.alt.length})` });
    if (drawn && p.expression) {
      const word = EXPRESSION_ALT_WORDS[baseExpression(p.expression)];
      if (!p.alt.toLowerCase().includes(word)) ctx.addIssue({ code: 'custom', path: ['alt'], message: `alt text must contain "${word}" for ${baseExpression(p.expression)} (ART_DIRECTION §9.7)` });
    }
    if (p.line && p.alt.trim().toLowerCase().includes(p.line.trim().toLowerCase())) ctx.addIssue({ code: 'custom', path: ['alt'], message: 'alt text does not repeat the line (ART_DIRECTION §9.3)' });
  });
export type ScenePanel = z.infer<typeof scenePanelSchema>;

export const sceneSchema = z
  .object({
    id: slug,
    /** The city (chapter id), or `interludes` for travel interludes. */
    chapter: slug,
    slot: z.enum(SCENE_SLOTS),
    /**
     * Overrides the slot title ("Arrival", "Later", "Story", "Before you go"; interludes "Between cities")
     * in the heading and on the replay button ("Watch: {title}") [P] (review T-S3 item 6).
     */
    title: sceneText.max(40).optional(),
    /** true → content note before the scene and a prominent "Need to talk?" help link (STORY §5). */
    sensitive: z.boolean().default(false),
    /** The note shown before a sensitive scene; defaults to the chapter's content_note. */
    content_note: sceneText.optional(),
    /** Interludes only: shown after this many middle cities are finished (STORY §3.12: 2, 4, 6, 8). */
    after_middle: z.union([z.literal(2), z.literal(4), z.literal(6), z.literal(8)]).optional(),
    /** CR-43(d): a finale resolution scene that plays only for these arc endings (e.g. the ending-C scene: [C]). */
    if_arc_ending: z.array(z.enum(ARC_ENDINGS)).min(1).optional(),
    /**
     * CR-43(d): with `if_arc_ending`, the scene also needs (or must lack) this flag; in the finale the arc variables
     * that are set count as flags (`if_flag: alex_invested`: ending R with money in plays C's scene).
     */
    if_flag: flagName.optional(),
    unless_flag: flagName.optional(),
    panels: z.array(scenePanelSchema).min(1).max(SCENE_MAX_PANELS),
    notes: z.string().optional(),
  })
  .strict()
  .superRefine((sc, ctx) => {
    const interlude = sc.slot === 'interlude';
    if (sc.title) for (const what of sceneArtefacts(sc.title)) ctx.addIssue({ code: 'custom', path: ['title'], message: `no scam artefacts in scenes: this looks like ${what} (STORY §4.2 rule 1)` });
    if (sc.content_note) for (const what of sceneArtefacts(sc.content_note)) ctx.addIssue({ code: 'custom', path: ['content_note'], message: `no scam artefacts in scenes: this looks like ${what} (STORY §4.2 rule 1)` });
    if (interlude !== (sc.chapter === INTERLUDE_FOLDER)) ctx.addIssue({ code: 'custom', path: ['chapter'], message: `interludes (and only they) use chapter: ${INTERLUDE_FOLDER}` });
    if (interlude !== (sc.after_middle !== undefined)) ctx.addIssue({ code: 'custom', path: ['after_middle'], message: 'after_middle is required on interludes and only there' });
    if (interlude && sc.panels.length > INTERLUDE_MAX_PANELS) ctx.addIssue({ code: 'custom', path: ['panels'], message: `an interlude has at most ${INTERLUDE_MAX_PANELS} panels` });
    const ifThen = sc.panels.map((p, i) => (p.if_then ? i : -1)).filter((i) => i >= 0);
    if (ifThen.length > 1) ctx.addIssue({ code: 'custom', path: ['panels'], message: 'at most one If-then panel per scene' });
    for (const i of ifThen) {
      if (sc.slot !== 'resolution') ctx.addIssue({ code: 'custom', path: ['panels', i, 'if_then'], message: 'the If-then panel is in a resolution scene' });
      if (i !== sc.panels.length - 1) ctx.addIssue({ code: 'custom', path: ['panels', i, 'if_then'], message: 'the If-then panel is the last panel (STORY §3)' });
      if (sc.panels[i]?.if_flag || sc.panels[i]?.unless_flag || sc.panels[i]?.if_arc_ending) ctx.addIssue({ code: 'custom', path: ['panels', i], message: 'the If-then panel is shown to everyone (no variant flag)' });
      if (sc.if_arc_ending) ctx.addIssue({ code: 'custom', path: ['if_arc_ending'], message: 'a scene with the If-then panel is shown to everyone (no if_arc_ending)' });
    }
    const count = (f: (p: ScenePanel) => unknown) => sc.panels.filter(f).length;
    if (count((p) => p.choice) > 1) ctx.addIssue({ code: 'custom', path: ['panels'], message: 'at most one choice per scene (STORY §4.1)' });
    if (count((p) => p.local) > 1) ctx.addIssue({ code: 'custom', path: ['panels'], message: 'at most one local-language phrase per scene (STORY §4.1)' });
    if (count((p) => p.flip_postcard) > 1) ctx.addIssue({ code: 'custom', path: ['panels'], message: 'at most one flip-the-postcard panel per scene' });
    if (count((p) => p.epigraph) > 1) ctx.addIssue({ code: 'custom', path: ['panels'], message: 'at most one epigraph panel per scene (CR-44(b))' });
    if ((sc.if_flag || sc.unless_flag) && !sc.if_arc_ending) ctx.addIssue({ code: 'custom', path: ['if_flag'], message: 'a scene-level if_flag / unless_flag goes with if_arc_ending (finale resolution scenes, CR-43(d)); use panel flags elsewhere' });
    if (sc.if_flag && sc.unless_flag) ctx.addIssue({ code: 'custom', path: ['unless_flag'], message: 'use if_flag or unless_flag, not both' });
    if (sc.slot !== 'resolution' && (sc.if_arc_ending || sc.panels.some((p) => p.if_arc_ending || p.epigraph))) {
      ctx.addIssue({ code: 'custom', path: ['slot'], message: 'if_arc_ending and epigraph are for finale resolution scenes (CR-43(d), CR-44(b))' });
    }
    sc.panels.forEach((p, i) => {
      if (p.flip_postcard && sc.slot !== 'interlude' && sc.slot !== 'resolution') ctx.addIssue({ code: 'custom', path: ['panels', i, 'flip_postcard'], message: 'flip the postcard is for interludes and the Open Evening (resolution)' });
      if (!interlude && /\{(?:count|lastCity)\}/.test(`${p.line ?? ''} ${p.caption ?? ''}`)) ctx.addIssue({ code: 'custom', path: ['panels', i], message: '{count} and {lastCity} are for interludes' });
    });
    // A sensitive scene never ends on worried or sheepish; every panel that can be last is checked (variants).
    if (sc.sensitive) {
      for (let i = sc.panels.length - 1; i >= 0; i--) {
        const p = sc.panels[i];
        if (!p) break;
        if (p.expression && NEVER_LAST_ON_SENSITIVE.includes(baseExpression(p.expression))) {
          ctx.addIssue({ code: 'custom', path: ['panels', i, 'expression'], message: `a sensitive scene never ends on ${baseExpression(p.expression)} (STORY §5.3, ART_DIRECTION §14 F)` });
        }
        if (!p.if_flag && !p.unless_flag && !p.if_arc_ending) break;
      }
    }
    if (sc.panels.every((p) => p.if_flag || p.unless_flag || p.if_arc_ending)) ctx.addIssue({ code: 'custom', path: ['panels'], message: 'at least one panel is shown to everyone' });
  });
export type Scene = z.infer<typeof sceneSchema>;

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
    /** Recurring story cast (STORY §2): drawn in every chapter's scenes; art checks derive their list from this. */
    recurring: z.boolean().default(false),
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
        /** CR-34: a payment code shared, then the bank app's confirmation declined: the group's star cap. */
        code_then_confirm: z.object({ star_cap: z.number().int().min(0).max(3) }).strict(),
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
            /** R24 (CR-48): at most this many falls in the chapter (a fallen standard scenario or scheduled boss beat = 1). */
            max_falls: z.number().int().min(0),
            /** R24 (CR-48): every fall's damage control must meet LO-16 (≥ 6 points, `stop` first). */
            falls_need_lo16_recovery: z.boolean(),
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
    /**
     * CR-38: the firm's entry with Fairmeasure, the in-world regulator: on the register of authorised firms
     * (with the register's own contact details) or on the warning list. Read by the regulator view.
     */
    register: z
      .object({ status: z.enum(['authorised', 'warning_list']), ...registerContact })
      .strict()
      .superRefine((r, ctx) => {
        if (r.status !== 'authorised' && (r.address || r.phone)) ctx.addIssue({ code: 'custom', path: ['status'], message: 'contact details are listed for authorised firms only (CR-38)' });
      })
      .optional(),
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
