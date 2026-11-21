/**
 * G4 deploy gate (T-4.9). Pure logic, Node built-ins only, so the deploy workflow can run
 * `node scripts/g4-gate.ts` (Node 22 type stripping) before `npm ci`.
 *
 * docs/DECISIONS.md, section "## G4", must hold exactly one marker line per condition 1, 2 and 3:
 *
 *   - [x] G4 condition 1 met: 2026-12-03, A. Reader (tone reader), 2 findings fixed and reviewed in #80, confirmed by Roman 2026-12-04 (decision card)
 *
 * Fields: met date (YYYY-MM-DD, a real calendar date), who, result (may contain commas), then
 * ", confirmed by Roman <YYYY-MM-DD> (<how>)" where <how> names the confirmation (a decision-card
 * tap or his message in the project thread). Rules: lower-case `x` only; no `<placeholder>` text;
 * met date <= confirmation date; confirmation on or after the G4 approval (2026-11-21); no date
 * after today. Any line in the G4 section that starts like a marker but does not parse fails the gate.
 */

export const G4_APPROVED = '2026-11-21';
export const CONDITIONS = [1, 2, 3] as const;

export interface GateResult {
  ok: boolean;
  errors: string[];
}

const MARKER_START = /^\s*[-*]\s*\[[^\]]*\]\s*G4 condition\b/i;
const MARKER = /^- \[([ x])\] G4 condition ([1-9]) met: (.*)$/;
const CONFIRM_SEP = ', confirmed by Roman ';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date in YYYY-MM-DD form. */
export function isIsoDate(s: string): boolean {
  if (!ISO_DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** The lines of the "## G4" section (up to the next "## " heading); null if the heading is missing or repeated. */
export function g4Section(markdown: string): string[] | null {
  const lines = markdown.split(/\r?\n/);
  const starts = lines.flatMap((l, i) => (/^## G4\b/.test(l) ? [i] : []));
  if (starts.length !== 1) return null;
  const start = starts[0] as number;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^#{1,2} /.test(l));
  return end === -1 ? rest : rest.slice(0, end);
}

const placeholder = (s: string) => /[<>]/.test(s);

/** Checks one ticked marker body ("<date>, <who>, <result>, confirmed by Roman <date> (<how>)"). */
function checkBody(n: number, body: string, today: string): string[] {
  const errs: string[] = [];
  const at = body.lastIndexOf(CONFIRM_SEP);
  if (at === -1 || body.indexOf(CONFIRM_SEP) !== at) {
    return [`condition ${n}: needs exactly one "${CONFIRM_SEP.trim()} <YYYY-MM-DD> (<how>)"`];
  }
  const [date = '', who = '', ...resultParts] = body.slice(0, at).split(', ');
  const result = resultParts.join(', ');
  const confirm = /^(\S+) \((.*)\)$/.exec(body.slice(at + CONFIRM_SEP.length));
  if (!isIsoDate(date.trim()) || date !== date.trim()) errs.push(`condition ${n}: met date "${date}" is not YYYY-MM-DD`);
  if (who.trim() === '' || placeholder(who)) errs.push(`condition ${n}: "who" is empty or a placeholder`);
  if (result.trim() === '' || placeholder(result)) errs.push(`condition ${n}: "result" is empty or a placeholder`);
  if (!confirm) {
    errs.push(`condition ${n}: confirmation must read "confirmed by Roman <YYYY-MM-DD> (<how>)"`);
    return errs;
  }
  const [, cDate = '', how = ''] = confirm;
  if (!isIsoDate(cDate)) errs.push(`condition ${n}: confirmation date "${cDate}" is not YYYY-MM-DD`);
  if (how.trim() === '' || placeholder(how)) errs.push(`condition ${n}: the confirmation (how Roman confirmed) is empty or a placeholder`);
  if (errs.length > 0) return errs;
  if (date > cDate) errs.push(`condition ${n}: met ${date} is after Roman's confirmation ${cDate}`);
  if (cDate < G4_APPROVED) errs.push(`condition ${n}: confirmation ${cDate} is before the G4 approval ${G4_APPROVED}`);
  if (date > today || cDate > today) errs.push(`condition ${n}: a date is in the future (today ${today})`);
  return errs;
}

/** Evaluates docs/DECISIONS.md. `today` is YYYY-MM-DD (UTC), injectable for tests. */
export function checkG4Gate(markdown: string, today: string = new Date().toISOString().slice(0, 10)): GateResult {
  const section = g4Section(markdown);
  if (!section) return { ok: false, errors: ['docs/DECISIONS.md: expected exactly one "## G4" section'] };
  const errors: string[] = [];
  const seen = new Map<number, number>();
  for (const line of section) {
    if (!MARKER_START.test(line)) continue;
    const m = MARKER.exec(line);
    const n = Number(m?.[2]);
    if (!m || !(CONDITIONS as readonly number[]).includes(n)) {
      errors.push(`malformed G4 marker: ${line.trim()}`);
      continue;
    }
    seen.set(n, (seen.get(n) ?? 0) + 1);
    if (m[1] !== 'x') {
      errors.push(`condition ${n}: not met (unticked)`);
      continue;
    }
    errors.push(...checkBody(n, m[3] ?? '', today));
  }
  for (const n of CONDITIONS) {
    const count = seen.get(n) ?? 0;
    if (count === 0) errors.push(`condition ${n}: no marker line`);
    if (count > 1) errors.push(`condition ${n}: ${count} marker lines (exactly one allowed)`);
  }
  return { ok: errors.length === 0, errors };
}
