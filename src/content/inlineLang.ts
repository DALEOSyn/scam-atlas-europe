/**
 * CR-45 (WCAG 3.1.2): inline language spans in action labels and outcome narratives.
 * `Reply: {lang:es}¡sí, gracias!{/lang}` renders "Reply: " in the page language and "¡sí, gracias!"
 * as `<span lang="es">`. Pure and Zod-free: shared by the schema (validation), the engine and the UI.
 */
export const LANG_TAG_RE = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;
const SPAN_RE = /\{lang:([^}]*)\}([\s\S]*?)\{\/lang\}/g;

export interface LangPiece {
  text: string;
  /** Set on a marked span only. */
  lang?: string;
}

/** Split text into plain pieces and marked spans (markers removed). Unmarked text is one piece. */
export function langPieces(text: string): LangPiece[] {
  if (!text.includes('{lang:')) return [{ text }];
  const out: LangPiece[] = [];
  let at = 0;
  for (const m of text.matchAll(SPAN_RE)) {
    if (m.index > at) out.push({ text: text.slice(at, m.index) });
    out.push({ text: m[2] ?? '', lang: m[1] ?? '' });
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/** The text as shown, without markers (word counts, accessible names, comparisons). */
export function stripLang(text: string): string {
  return langPieces(text)
    .map((p) => p.text)
    .join('');
}

/** The first marked language in the text, if any (the language a translation is from). */
export function firstLang(text: string): string | undefined {
  return langPieces(text).find((p) => p.lang !== undefined)?.lang;
}

/** Fields where inline language spans are rendered (paths in a scenario, numeric indexes as `N`). */
export const LANG_SPAN_FIELDS: readonly RegExp[] = [
  /^actions\.N\.label$/,
  /^(?:beats|interrupts)\.N\.actions\.N\.label$/,
  /^(?:beats\.N\.)?what_now\.extra\.N\.label$/,
  /^outcomes\.[^.]+\.narrative$/,
];

/** Paths (dotted) of strings anywhere in `value` that carry a language marker outside LANG_SPAN_FIELDS. */
export function strayLangMarkers(value: unknown, path: (string | number)[] = []): (string | number)[][] {
  if (typeof value === 'string') {
    if (!value.includes('{lang:') && !value.includes('{/lang}')) return [];
    const shape = path.map((p) => (typeof p === 'number' ? 'N' : p)).join('.');
    return LANG_SPAN_FIELDS.some((re) => re.test(shape)) ? [] : [path];
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => strayLangMarkers(v, [...path, i]));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strayLangMarkers(v, [...path, k]));
  return [];
}

/** Authoring errors in the markup: bad tags, unclosed or stray markers, nesting, empty or English spans. */
export function langMarkupIssues(text: string): string[] {
  const issues: string[] = [];
  const pieces = langPieces(text);
  for (const p of pieces) {
    if (p.lang === undefined) {
      if (p.text.includes('{lang:') || p.text.includes('{/lang}')) issues.push('an inline language marker is not closed: write {lang:es}…{/lang}');
      continue;
    }
    if (!LANG_TAG_RE.test(p.lang)) issues.push(`"${p.lang}" is not a valid language tag: use a BCP 47 tag, e.g. {lang:es} or {lang:pt-PT}`);
    else if (p.lang === 'en') issues.push('{lang:en} marks nothing: English is the page language');
    if (p.text.trim() === '') issues.push('an inline language span is empty');
    if (p.text.includes('{lang:')) issues.push('inline language spans cannot be nested');
  }
  return [...new Set(issues)];
}
