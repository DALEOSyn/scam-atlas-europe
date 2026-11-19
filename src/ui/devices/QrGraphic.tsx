/**
 * A stylised QR-like picture that is built not to scan (GDD §5, UI_SPEC §3.6, Red Line 3).
 *
 * - No finder patterns: the two square corner marks are a ring, a wide gap and a one-module dot
 *   (run ratio 1:2:1:2:1, outside a decoder's 1:1:3:1:1 tolerance); the third corner is a solid disc.
 * - The data field never has three dark modules in a row or column, so no finder-like run appears
 *   by chance, and every data module is drawn with a gap around it.
 * - Both format-information strips hold a fixed palindromic pattern at Hamming distance 5 from
 *   every valid format code (masked or unmasked), so a decoder that samples the grid anyway
 *   (pure-barcode mode) cannot read format information.
 * - No timing patterns, no version information. The pattern is a hash of the in-game route
 *   (/qr/<id>); nothing here encodes a URL. tests/unit/qr-undecodable.test.ts runs ZXing and jsQR
 *   on a rasterised copy and asserts nothing is detected or decoded.
 */
function rng(seed: string): () => number {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489917) >>> 0;
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export const QR_SIZE = 21;

/** Distance 5 from all 64 format codes; a palindrome, so mirrored reading gives the same bits. */
const FORMAT_BITS = '010100101001010';

/** Format-strip positions [x, y] in the order a decoder reads them (copy 1 and copy 2). */
const FORMAT_1: [number, number][] = [
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8], [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
];
const FORMAT_2: [number, number][] = [
  [8, 20], [8, 19], [8, 18], [8, 17], [8, 16], [8, 15], [8, 14], [13, 8], [14, 8], [15, 8], [16, 8], [17, 8], [18, 8], [19, 8], [20, 8],
];

/** Square corner marks (top left, top right); the bottom-left corner is a solid disc. */
export const CORNER_MARKS: [number, number][] = [
  [0, 0],
  [QR_SIZE - 7, 0],
];
export const DISC_CORNER: [number, number] = [0, QR_SIZE - 7];

const reserved = (x: number, y: number) => (x < 8 && y < 8) || (x >= QR_SIZE - 8 && y < 8) || (x < 8 && y >= QR_SIZE - 8);

/** The data-field modules (dark = true), indexed [y][x]; corner areas are empty. Exported for tests. */
export function qrMatrix(route: string): boolean[][] {
  const r = rng(route);
  const m: boolean[][] = Array.from({ length: QR_SIZE }, () => Array<boolean>(QR_SIZE).fill(false));
  const fixed = new Set<string>();
  for (const list of [FORMAT_1, FORMAT_2]) {
    list.forEach(([x, y], i) => {
      const row = m[y];
      if (row) row[x] = FORMAT_BITS[i] === '1';
      fixed.add(`${x},${y}`);
    });
  }
  // The module a real code keeps dark next to copy 2; here it mirrors bit 7 so a mirrored read matches too.
  const dark = m[13];
  if (dark) dark[8] = FORMAT_BITS[7] === '1';
  fixed.add('8,13');
  const at = (x: number, y: number) => m[y]?.[x] === true;
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (reserved(x, y) || fixed.has(`${x},${y}`)) continue;
      const roll = r() < 0.48;
      const runH = at(x - 1, y) && at(x - 2, y);
      const runV = at(x, y - 1) && at(x, y - 2);
      const row = m[y];
      if (row) row[x] = roll && !runH && !runV;
    }
  }
  return m;
}

export function QrGraphic({ route, size = 168 }: { route: string; size?: number }) {
  const m = qrMatrix(route);
  const cells: [number, number][] = [];
  m.forEach((row, y) => row.forEach((on, x) => on && cells.push([x, y])));
  const [dx, dy] = DISC_CORNER;
  return (
    <svg
      style={{ color: 'var(--p-ink-900)' }}
      width={size}
      height={size}
      viewBox={`-2 -2 ${QR_SIZE + 4} ${QR_SIZE + 4}`}
      aria-hidden="true"
      focusable="false"
      data-route={route}
      data-corner-marks={CORNER_MARKS.length}
    >
      <rect x={-2} y={-2} width={QR_SIZE + 4} height={QR_SIZE + 4} style={{ fill: 'var(--p-paper-0)' }} />
      {CORNER_MARKS.map(([x, y]) => (
        <g key={`${x}-${y}`} data-corner-mark="">
          {/* ring 1 module, gap 2, dot 1: run ratio 1:2:1:2:1, not a finder pattern */}
          <rect x={x + 0.5} y={y + 0.5} width={6} height={6} rx={1.2} fill="none" stroke="currentColor" stroke-width={1} />
          <rect x={x + 3} y={y + 3} width={1} height={1} rx={0.3} fill="currentColor" />
        </g>
      ))}
      <circle cx={dx + 3.5} cy={dy + 3.5} r={3.5} fill="currentColor" data-disc-corner="" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.1} y={y + 0.1} width={0.8} height={0.8} rx={0.3} fill="currentColor" />
      ))}
    </svg>
  );
}
