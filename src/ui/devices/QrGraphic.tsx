/**
 * A deliberately NON-decodable, stylised QR pattern (GDD §5, UI_SPEC §3.6, Red Line 3).
 * Only two finder squares are drawn (a decoder needs three; the third corner is a round dot),
 * there are no timing patterns and no format information, and the module field is a hash
 * of the in-game route. Nothing here encodes a URL; the route (/qr/<id>) is game data only.
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

/** Module coordinates of the pattern (exported for the unit test). */
export function qrModules(route: string): { finders: [number, number][]; cells: [number, number][] } {
  const r = rng(route);
  const finders: [number, number][] = [
    [0, 0],
    [QR_SIZE - 7, 0],
  ];
  const reserved = (x: number, y: number) => (x < 8 && y < 8) || (x >= QR_SIZE - 8 && y < 8) || (x < 8 && y >= QR_SIZE - 8);
  const cells: [number, number][] = [];
  for (let y = 0; y < QR_SIZE; y++) for (let x = 0; x < QR_SIZE; x++) if (!reserved(x, y) && r() < 0.48) cells.push([x, y]);
  return { finders, cells };
}

export function QrGraphic({ route, size = 168 }: { route: string; size?: number }) {
  const { finders, cells } = qrModules(route);
  return (
    <svg style={{ color: "var(--p-ink-900)" }} width={size} height={size} viewBox={`-2 -2 ${QR_SIZE + 4} ${QR_SIZE + 4}`} aria-hidden="true" focusable="false" data-route={route} data-finders={finders.length}>
      <rect x={-2} y={-2} width={QR_SIZE + 4} height={QR_SIZE + 4} style={{ fill: "var(--p-paper-0)" }} />
      {finders.map(([x, y]) => (
        <g key={`${x}-${y}`} data-finder="">
          <rect x={x + 0.5} y={y + 0.5} width={6} height={6} rx={1.2} fill="none" stroke="currentColor" stroke-width={1} />
          <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="currentColor" />
        </g>
      ))}
      <circle cx={3.5} cy={QR_SIZE - 3.5} r={3} fill="none" stroke="currentColor" stroke-width={1} />
      <circle cx={3.5} cy={QR_SIZE - 3.5} r={1.3} fill="currentColor" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.1} y={y + 0.1} width={0.8} height={0.8} rx={0.3} fill="currentColor" />
      ))}
    </svg>
  );
}
