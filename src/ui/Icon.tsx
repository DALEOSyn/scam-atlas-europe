/**
 * Original line icons (UI_SPEC §1.6): 24 px grid, 2 px stroke, rounded caps, currentColor.
 * Decorative only (aria-hidden): every icon sits next to visible text or inside a named control.
 * No OS icon fonts, no shields, no real app glyphs.
 */
export type IconName =
  | 'magnifier'
  | 'checked'
  | 'flag'
  | 'flag-filled'
  | 'close'
  | 'breath'
  | 'hourglass'
  | 'stress-calm'
  | 'stress-tense'
  | 'stress-overwhelmed'
  | 'phone-answer'
  | 'phone-end'
  | 'lock'
  | 'info'
  | 'seal'
  | 'tag-crossed'
  | 'attach'
  | 'back'
  | 'menu'
  | 'camera'
  | 'battery'
  | 'star'
  | 'star-empty'
  | 'gate';

const PATHS: Record<IconName, string> = {
  magnifier: 'M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5 21 21',
  checked: 'M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5 21 21M7.5 10.5l2 2 3.5-4',
  flag: 'M5 21V4h11l-2 4 2 4H5',
  'flag-filled': 'M5 21V4h11l-2 4 2 4H5z',
  close: 'M6 6l12 12M18 6 6 18',
  breath: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
  hourglass: 'M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9',
  'stress-calm': 'M2 12h20',
  'stress-tense': 'M2 12c3-5 6-5 9 0s6 5 9 0',
  'stress-overwhelmed': 'M2 7c3-3 6-3 9 0s6 3 9 0M2 12c3-3 6-3 9 0s6 3 9 0M2 17c3-3 6-3 9 0s6 3 9 0',
  'phone-answer': 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  'phone-end': 'M3 14c5-5 13-5 18 0l-2 3-4-1v-3a10 10 0 0 0-6 0v3l-4 1z',
  lock: 'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  info: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 11v6M12 7.5v.5',
  seal: 'M12 3l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2zM8.5 12l2.5 2.5 4.5-5',
  'tag-crossed': 'M3 12V4h8l10 10-7 7zM7.5 7.5h.01M4 20 20 4',
  attach: 'M20 11l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10 17a2 2 0 0 1-3-3l7.5-7.5',
  back: 'M15 5l-7 7 7 7',
  menu: 'M4 7h16M4 12h16M4 17h16',
  camera: 'M4 8h4l2-3h4l2 3h4v11H4zM12 10.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
  battery: 'M3 8h15v8H3zM21 11v2',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  'star-empty': 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  gate: 'M5 21V9a7 7 0 0 1 14 0v12M5 14h14M9 21v-7M15 21v-7',
};

const FILLED: ReadonlySet<IconName> = new Set<IconName>(['flag-filled', 'star']);

export function Icon({ name, class: cls, size = 20 }: { name: IconName; class?: string; size?: number }) {
  return (
    <svg
      class={cls}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={FILLED.has(name) ? 'currentColor' : 'none'}
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
