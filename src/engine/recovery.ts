/**
 * Damage control (GDD §9, balance `recovery`). Pure.
 * "Pick the step you'd do first, then 2 more": +3 per helpful pick, −2 per
 * harmful pick, floor 0, max 9. LO-16 needs ≥ 6 and a first pick with
 * category `stop` in this scenario.
 */
import type { ActionKind, Balance, Outcome, Scenario } from '../content/schema.ts';

export type RecoveryCategory = 'stop' | 'secure' | 'report' | 'warn' | 'harmful';
export interface RecoveryOption {
  step: string;
  category: RecoveryCategory;
  /** Scenario-specific harmful-pick feedback; overrides the generic line in recovery_steps.yaml. */
  feedback?: string;
}

type RecoveryTable = Pick<Balance, 'recovery'>;

export interface RecoveryResult {
  points: number;
  /** Per pick, in order: helps or not. */
  picks: { step: string; category: RecoveryCategory; helps: boolean }[];
  lo16: boolean;
  /** Stars for a standalone fall: 1 if points ≥ 6, else 0. */
  stars: 0 | 1;
}

/** Deterministic shuffle (FNV-1a seeded by the scenario id) so harmful options never sit in an authored position. */
export function orderOptions(options: readonly RecoveryOption[], seed: string): RecoveryOption[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const out = [...options];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    const j = h % (i + 1);
    const a = out[i];
    const bb = out[j];
    if (a !== undefined && bb !== undefined) {
      out[i] = bb;
      out[j] = a;
    }
  }
  return out;
}

export function scoreRecovery(b: RecoveryTable, options: readonly RecoveryOption[], picks: readonly string[]): RecoveryResult {
  const r = b.recovery;
  const unique = [...new Set(picks)].slice(0, r.pick);
  const scored = unique.flatMap((step) => {
    const o = options.find((x) => x.step === step);
    return o ? [{ step, category: o.category, helps: o.category !== 'harmful' }] : [];
  });
  const raw = scored.reduce((sum, p) => sum + (p.helps ? r.points_per_correct_step : r.harmful_step_penalty), 0);
  const points = Math.min(r.max_points, Math.max(r.floor, raw));
  const lo16 = points >= 6 && scored[0]?.category === 'stop';
  return { points, picks: scored, lo16, stars: points >= 6 ? 1 : 0 };
}

/**
 * Which "Already clicked?" situation fits what the player did (UI_SPEC §8.2 item 3). Severity
 * (ruling QA m10): paid > shared_code > entered_details > clicked.
 */
export type AlreadySituation = 'clicked' | 'entered_details' | 'shared_code' | 'paid';

const PAID: readonly ActionKind[] = ['pay', 'pay_unprotected'];
const SHARED: readonly ActionKind[] = ['share_code', 'approve_prompt'];
const ENTERED: readonly ActionKind[] = ['enter_details', 'install_or_remote'];
const CLICKED: readonly ActionKind[] = ['open_link', 'scan_qr_and_open', 'call_number_in_message', 'reply'];

/** CR-45: what the scenario's "clicked" situation is: opening a link, calling the number, replying or scanning a code. */
export type ClickedVia = 'link' | 'call' | 'reply' | 'qr' | 'mixed';
const VIA: Partial<Record<ActionKind, ClickedVia>> = { open_link: 'link', call_number_in_message: 'call', reply: 'reply', scan_qr_and_open: 'qr' };

/**
 * The way the player could "click" in this scenario: the one kind shared by every CLICKED-class action of
 * the opening, the beats and the What-now extras; `mixed` for several kinds; `link` when there is none.
 * Interrupts are not counted: their replies are small talk with someone else, not the scenario's "click".
 */
export function clickedViaOf(s: Pick<Scenario, 'actions' | 'beats' | 'what_now'>): ClickedVia {
  const kinds = [...s.actions, ...s.beats.flatMap((b) => b.actions), ...(s.what_now?.extra ?? []), ...s.beats.flatMap((b) => b.what_now?.extra ?? [])].map((a) => a.kind);
  const vias = new Set(kinds.flatMap((k) => (VIA[k] ? [VIA[k]] : [])));
  return vias.size === 0 ? 'link' : vias.size === 1 ? ([...vias][0] ?? 'link') : 'mixed';
}

/** The most serious situation among the actions taken; undefined if the player never engaged. */
export function situationOf(kinds: readonly ActionKind[]): AlreadySituation | undefined {
  if (kinds.some((k) => PAID.includes(k))) return 'paid';
  if (kinds.some((k) => SHARED.includes(k))) return 'shared_code';
  if (kinds.some((k) => ENTERED.includes(k))) return 'entered_details';
  if (kinds.some((k) => CLICKED.includes(k))) return 'clicked';
  return undefined;
}

/**
 * The already_clicked line for layer 1: the player's own situation if authored,
 * else the most serious authored one (so layer 1 always carries Red Line 4 content).
 */
export function alreadyClickedLine(
  s: Pick<Scenario, 'debrief'>,
  situation: AlreadySituation | undefined,
): { situation: AlreadySituation; text: string } | undefined {
  const ac = s.debrief.already_clicked;
  if (!ac) return undefined;
  const order: AlreadySituation[] = situation ? [situation, 'paid', 'shared_code', 'entered_details', 'clicked'] : ['clicked', 'entered_details', 'shared_code', 'paid'];
  for (const k of order) {
    const text = ac[k];
    if (text) return { situation: k, text };
  }
  return undefined;
}

export function recoveryOptionsOf(o: Outcome | undefined): RecoveryOption[] {
  return o?.recovery ? o.recovery.map((r) => ({ step: r.step, category: r.category, ...(r.feedback ? { feedback: r.feedback } : {}) })) : [];
}
