/**
 * Check (magnifier) and tag ("Mark as suspicious") data (GDD §5, §7.1;
 * UI_SPEC §4). Pure.
 *
 * Checkables come from the device template (src/content/checkables.ts), never
 * from the authored inspectables, so their number never hints at the verdict.
 * Authored inspectables only supply reveal text; every other checkable reveals
 * the neutral filler ("Nothing unusual here"). The list never shows a count.
 */
import { deriveCheckables, linksIn, type BannerLike } from '../content/checkables.ts';
import type { Device, Inspectable, Message } from '../content/schema.ts';
import { tagIsCorrect, type TagTally } from './scoring.ts';

/** A beat-like thing that can be checked: opening message, beat or interrupt. */
export interface CheckableBeat {
  id: string;
  device: Device;
  message: Message;
  inspectables: Inspectable[];
  /** In-beat notification (displayed; no checkables). */
  banner?: BannerLike | undefined;
}

export interface CheckableItem {
  /** Stable key `${beatId}|${target}` used for checks and tags. */
  key: string;
  beatId: string;
  /** The beat's device ("What the caller asks" on a call). */
  device: Device;
  /** e.g. sender.detail, link#2 */
  target: string;
  /** What the element shows (for "You see"), when the message has it. */
  shown: string | undefined;
  /** Authored reveal, or undefined for the neutral filler. */
  reveal: string | undefined;
  /**
   * CR-27 (WCAG 3.1.2): the language of `shown` when it is message text in another language (the ask, a
   * claim, an attachment name), from message.lang. Undefined for English and for language-neutral details.
   */
  lang?: string | undefined;
  /** CR-27: the authored English translation of `shown` (ask.translation, claims[].translation), if any. */
  translation?: string | undefined;
}

/** Targets whose shown text is the message's own words, so it carries the message language. */
const WORDS_TARGETS = new Set(['request', 'claim', 'attachment']);

/** Language and translation of a checkable's shown text (CR-27). */
export function shownLanguage(m: Message, target: string): { lang?: string; translation?: string } {
  const base = target.replace(/#\d$/, '');
  if (!m.lang || m.lang === 'en' || !WORDS_TARGETS.has(base)) return {};
  const translation = base === 'request' ? m.ask?.translation : base === 'claim' ? nth(m.claims, target)?.translation : undefined;
  return { lang: m.lang, ...(translation ? { translation } : {}) };
}

export const keyOf = (beatId: string, target: string): string => `${beatId}|${target}`;

/** The authored inspectable for a target on a beat. */
export function inspectableFor(beat: CheckableBeat, target: string): Inspectable | undefined {
  return beat.inspectables.find((i) => i.target === target);
}

function nth<T>(list: readonly T[] | undefined, target: string): T | undefined {
  const m = /#(\d)$/.exec(target);
  return list?.[m ? Number(m[1]) - 1 : 0];
}

/** What the player sees for a checkable (address-bar host, number, file name…). */
export function shownText(device: Device, m: Message, target: string, links: readonly string[]): string | undefined {
  const base = target.replace(/#\d$/, '');
  switch (base) {
    case 'sender.detail':
    case 'caller_id':
      return m.sender ? (m.sender.detail ?? m.sender.display) : undefined;
    case 'link':
      return nth(links, target);
    case 'attachment':
      return nth(m.attachments, target)?.name;
    case 'reference':
      return nth(m.references, target);
    case 'phone_number':
      return nth(m.phone_numbers, target);
    case 'qr.destination':
      return m.qr?.destination;
    case 'page.address':
      return m.page?.address;
    case 'page.info':
      return m.page?.title;
    case 'payee.name_check':
    case 'payee.name':
      return m.payee?.name;
    case 'payee.iban':
      return m.payee?.iban;
    case 'prompt.service':
      return m.prompt?.service;
    case 'prompt.where':
      return m.prompt?.where;
    case 'prompt.device':
      return m.prompt?.device;
    case 'prompt.when':
      return m.prompt?.when;
    case 'prompt.number':
      return m.prompt?.number === undefined ? undefined : String(m.prompt.number);
    case 'letterhead':
      return m.letterhead;
    case 'image':
      return m.image?.alt;
    case 'request':
      return m.ask?.text;
    case 'claim':
      return nth(m.claims, target)?.text;
    case 'video':
      return m.video?.alt;
    default:
      return device === 'call' ? m.sender?.detail : undefined;
  }
}

/** All checkables of a beat in reading order, each with its reveal (or the neutral filler). */
export function checkablesOf(beat: CheckableBeat): CheckableItem[] {
  const transcript = beat.message.transcript?.map((l) => l.text).join('\n');
  const links = [...linksIn(beat.message.body), ...linksIn(transcript)];
  return deriveCheckables(beat.device, beat.message).map((target) => ({
    key: keyOf(beat.id, target),
    beatId: beat.id,
    device: beat.device,
    target,
    shown: shownText(beat.device, beat.message, target, links),
    reveal: inspectableFor(beat, target)?.reveal,
    ...shownLanguage(beat.message, target),
  }));
}

/**
 * Check-list presentation (balance `difficulty.checkable_list_by_slot`). The
 * same for every scenario in every chapter slot: never a count, neutral filler
 * on every element without an authored reveal. Exposed so devices never improvise.
 */
export function checklistPresentation(_slot: number): { showCount: false; neutralFillers: true } {
  return { showCount: false, neutralFillers: true };
}

/** Tally tags on one beat. Any tag that is not a correct red flag is wrong (decoys, fillers, genuine details). */
export function tallyTags(beat: CheckableBeat, beatIsFraud: boolean, taggedTargets: Iterable<string>): TagTally {
  let correct = 0;
  let wrong = 0;
  for (const target of taggedTargets) {
    if (tagIsCorrect(inspectableFor(beat, target), beatIsFraud)) correct++;
    else wrong++;
  }
  return { correct, wrong };
}

/** Red flags the player can tag on a beat (fraud red flags, or quoted examples). */
export function redFlagsOf(beat: CheckableBeat, beatIsFraud: boolean): Inspectable[] {
  return beat.inspectables.filter((i) => tagIsCorrect(i, beatIsFraud));
}
