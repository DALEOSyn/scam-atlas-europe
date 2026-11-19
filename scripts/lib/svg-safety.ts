/**
 * SVG safety (Red Lines 1–2, ART_DIRECTION §12.3, sceptic T-3.3): an SVG under public/ must be drawn as
 * code. It may not embed a raster or a page (a photo, a real face or logo the linter cannot read), run
 * script, or load anything from outside the file. Pure; used by redline:lint (every SVG under public/)
 * and content:validate (video-call illustrations, CR-24).
 */
export interface SvgIssue {
  match: string;
  index: number;
  message: string;
}

const RULES: { re: RegExp; message: string }[] = [
  { re: /<image\b/gi, message: 'SVG embeds an <image> (a raster or external picture); draw it as vector code' },
  { re: /<foreignObject\b/gi, message: 'SVG embeds a <foreignObject> (HTML inside the SVG)' },
  { re: /<script\b/gi, message: 'SVG contains a <script>' },
  { re: /data:image\//gi, message: 'SVG contains a data:image/ URI (an embedded raster)' },
  { re: /\b(?:xlink:)?href\s*=\s*(["'])(?!#)[^"']*\1/gi, message: 'SVG links outside the file (href must point at a local #id)' },
  // Engine review follow-up b: no DTD (entities can smuggle text or references past the other rules), no CSS imports.
  { re: /<!DOCTYPE\b/gi, message: 'SVG contains a <!DOCTYPE> (no DTDs in art files)' },
  { re: /<!ENTITY\b/gi, message: 'SVG declares an <!ENTITY> (entities can hide text and references from the linter)' },
  { re: /@import\b/gi, message: 'SVG uses @import in CSS (it would load a stylesheet from outside the file)' },
  { re: /url\(\s*(?!["']?#)[^)]*\)/gi, message: 'SVG uses url() outside the file (only url(#local-id) is allowed)' },
];

export function svgSafetyIssues(text: string): SvgIssue[] {
  const out: SvgIssue[] = [];
  for (const { re, message } of RULES) {
    for (const m of text.matchAll(re)) out.push({ match: m[0].slice(0, 60), index: m.index, message });
  }
  return out.sort((a, b) => a.index - b.index);
}
