// @vitest-environment jsdom
/**
 * Red Line 3: the in-game QR picture must not scan. Render QrGraphic (jsdom), read back the SVG
 * shapes it actually draws, rasterise those (anti-aliased by 4×4 supersampling, several module sizes,
 * many routes) and run two independent decoders: ZXing (finder-pattern detection, normal +
 * try-harder + pure-barcode decode) and jsQR. The geometry comes from the rendered markup, never
 * from a copy, so the test and the component cannot drift (sceptic note 3).
 */
import { describe, expect, it } from 'vitest';
import { h } from 'preact';
import { render } from '@testing-library/preact';
import { BarcodeFormat, BinaryBitmap, DecodeHintType, QRCodeWriter, HybridBinarizer, QRCodeDecoderFormatInformation, QRCodeReader, RGBLuminanceSource } from '@zxing/library';
import Detector from '@zxing/library/esm/core/qrcode/detector/Detector.js';
import jsQR from 'jsqr';
import { QR_SIZE, qrMatrix, QrGraphic } from '../../src/ui/devices/QrGraphic.tsx';

/** A dark shape read from the rendered SVG, in viewBox units. */
type Shape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx: number }
  | { kind: 'ring'; x: number; y: number; w: number; h: number; rx: number; sw: number }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'circleRing'; cx: number; cy: number; r: number; sw: number };

const num = (el: Element, a: string): number => Number(el.getAttribute(a) ?? '0');

/** Every element painted in currentColor (fill or stroke). The paper background is styled, not painted. */
function renderedShapes(route: string): { shapes: Shape[]; viewBox: [number, number, number, number]; cells: number } {
  const { container, unmount } = render(h(QrGraphic, { route }));
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('no svg');
  const vb = (svg.getAttribute('viewBox') ?? '').split(/\s+/).map(Number) as [number, number, number, number];
  const shapes: Shape[] = [];
  let cells = 0;
  for (const el of svg.querySelectorAll('rect, circle, path, polygon, line, ellipse, polyline')) {
    const fill = el.getAttribute('fill');
    const stroke = el.getAttribute('stroke');
    if (fill !== 'currentColor' && stroke !== 'currentColor') {
      // Only the background may be unpainted, and it must not be dark.
      expect(el.tagName.toLowerCase()).toBe('rect');
      expect(el.getAttribute('style') ?? '').toMatch(/paper/);
      continue;
    }
    const tag = el.tagName.toLowerCase();
    const sw = num(el, 'stroke-width') || 1;
    if (tag === 'rect') {
      const r = { x: num(el, 'x'), y: num(el, 'y'), w: num(el, 'width'), h: num(el, 'height'), rx: num(el, 'rx') };
      if (fill === 'currentColor') {
        shapes.push({ kind: 'rect', ...r });
        if (!el.closest('[data-corner-mark]')) cells++;
      }
      if (stroke === 'currentColor') shapes.push({ kind: 'ring', ...r, sw });
    } else if (tag === 'circle') {
      const c = { cx: num(el, 'cx'), cy: num(el, 'cy'), r: num(el, 'r') };
      if (fill === 'currentColor') shapes.push({ kind: 'circle', ...c });
      if (stroke === 'currentColor') shapes.push({ kind: 'circleRing', ...c, sw });
    } else {
      throw new Error(`unexpected painted <${tag}> in QrGraphic: extend the rasteriser`);
    }
  }
  unmount();
  return { shapes, viewBox: vb, cells };
}

function inRoundRect(px: number, py: number, x0: number, y0: number, w: number, h: number, r: number): boolean {
  if (w <= 0 || h <= 0 || px < x0 || py < y0 || px > x0 + w || py > y0 + h) return false;
  const rr = Math.min(Math.max(r, 0), w / 2, h / 2);
  const cx = Math.min(Math.max(px, x0 + rr), x0 + w - rr);
  const cy = Math.min(Math.max(py, y0 + rr), y0 + h - rr);
  return (px - cx) ** 2 + (py - cy) ** 2 <= rr * rr;
}

function covers(s: Shape, px: number, py: number): boolean {
  switch (s.kind) {
    case 'rect':
      return inRoundRect(px, py, s.x, s.y, s.w, s.h, s.rx);
    case 'ring': {
      const o = s.sw / 2;
      return inRoundRect(px, py, s.x - o, s.y - o, s.w + s.sw, s.h + s.sw, s.rx + o) && !inRoundRect(px, py, s.x + o, s.y + o, s.w - s.sw, s.h - s.sw, s.rx - o);
    }
    case 'circle':
      return (px - s.cx) ** 2 + (py - s.cy) ** 2 <= s.r ** 2;
    case 'circleRing': {
      const d = Math.hypot(px - s.cx, py - s.cy);
      return d <= s.r + s.sw / 2 && d >= s.r - s.sw / 2;
    }
  }
}

function bbox(s: Shape): [number, number, number, number] {
  switch (s.kind) {
    case 'rect':
      return [s.x, s.y, s.x + s.w, s.y + s.h];
    case 'ring':
      return [s.x - s.sw / 2, s.y - s.sw / 2, s.x + s.w + s.sw / 2, s.y + s.h + s.sw / 2];
    case 'circle':
      return [s.cx - s.r, s.cy - s.r, s.cx + s.r, s.cy + s.r];
    case 'circleRing':
      return [s.cx - s.r - s.sw, s.cy - s.r - s.sw, s.cx + s.r + s.sw, s.cy + s.r + s.sw];
  }
}

/** Rasterise the rendered shapes at `scale` px per viewBox unit with 4×4 supersampling. */
function rasterise(route: string, scale: number): { lum: Uint8ClampedArray; rgba: Uint8ClampedArray; size: number } {
  const { shapes, viewBox } = renderedShapes(route);
  const [vx, vy, vw] = viewBox;
  const size = Math.round(vw * scale);
  const ss = 4;
  const n = size * ss;
  const dark = new Uint8Array(n * n);
  for (const s of shapes) {
    const [x0, y0, x1, y1] = bbox(s);
    const sx0 = Math.max(0, Math.floor((x0 - vx) * scale * ss));
    const sy0 = Math.max(0, Math.floor((y0 - vy) * scale * ss));
    const sx1 = Math.min(n - 1, Math.ceil((x1 - vx) * scale * ss));
    const sy1 = Math.min(n - 1, Math.ceil((y1 - vy) * scale * ss));
    for (let y = sy0; y <= sy1; y++)
      for (let x = sx0; x <= sx1; x++) if (!dark[y * n + x] && covers(s, (x + 0.5) / (scale * ss) + vx, (y + 0.5) / (scale * ss) + vy)) dark[y * n + x] = 1;
  }
  const lum = new Uint8ClampedArray(size * size);
  const rgba = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let d = 0;
      for (let a = 0; a < ss; a++) for (let b = 0; b < ss; b++) d += dark[(y * ss + a) * n + x * ss + b] ?? 0;
      const v = Math.round(255 * (1 - d / (ss * ss)));
      lum[y * size + x] = v;
      rgba.set([v, v, v, 255], (y * size + x) * 4);
    }
  return { lum, rgba, size };
}

const routes = Array.from({ length: 40 }, (_, i) => `/qr/test-${i}`).concat(['/qr/parking-1', '/qr/menu', '/qr/parcel-locker']);
const scales = [3, 5, 8, 12];

function zxingThrows(fn: () => unknown): boolean {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
}

describe('in-game QR picture is not decodable (Red Line 3)', () => {
  it('positive control: the same harness decodes a real QR code (in-game route only)', () => {
    const bits = new QRCodeWriter().encode('/qr/control', BarcodeFormat.QR_CODE, 29, 29, new Map());
    const n = bits.getWidth();
    const scale = 5;
    const size = n * scale;
    const lum = new Uint8ClampedArray(size * size);
    const rgba = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const v = bits.get(Math.floor(x / scale), Math.floor(y / scale)) ? 0 : 255;
        lum[y * size + x] = v;
        rgba.set([v, v, v, 255], (y * size + x) * 4);
      }
    const bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(lum, size, size)));
    expect(new QRCodeReader().decode(bitmap).getText()).toBe('/qr/control');
    expect(jsQR(rgba, size, size)?.data).toBe('/qr/control');
  });

  it('the rendered SVG draws exactly the module field qrMatrix describes, with a quiet zone', () => {
    for (const r of ['/qr/parking-1', '/qr/test-7']) {
      const { viewBox, cells } = renderedShapes(r);
      expect(viewBox[0]).toBeLessThanOrEqual(-2);
      expect(viewBox[2]).toBeGreaterThanOrEqual(QR_SIZE + 4);
      expect(cells).toBe(qrMatrix(r).flat().filter(Boolean).length);
    }
  });

  it('the format strips are no valid format code in either copy, masked or not', () => {
    const bits = parseInt('010100101001010', 2);
    expect(QRCodeDecoderFormatInformation.decodeFormatInformation(bits, bits)).toBeNull();
  });

  it('the data field never has three dark modules in a row or column', () => {
    for (const r of routes) {
      const m = qrMatrix(r);
      for (let y = 0; y < QR_SIZE; y++)
        for (let x = 0; x < QR_SIZE; x++) {
          if (y === 8 || x === 8) continue; // the fixed format strips
          const at = (a: number, b: number) => m[b]?.[a] === true;
          expect(at(x, y) && at(x + 1, y) && at(x + 2, y), `${r} row ${y} col ${x}`).toBe(false);
          expect(at(x, y) && at(x, y + 1) && at(x, y + 2), `${r} col ${x} row ${y}`).toBe(false);
        }
    }
  });

  it('ZXing finds no finder patterns and decodes nothing; jsQR decodes nothing', () => {
    const tryHarder = new Map<DecodeHintType, unknown>([[DecodeHintType.TRY_HARDER, true]]);
    const pure = new Map<DecodeHintType, unknown>([[DecodeHintType.PURE_BARCODE, true]]);
    const reader = new QRCodeReader();
    let runs = 0;
    for (const r of routes) {
      for (const s of scales) {
        const { lum, rgba, size } = rasterise(r, s);
        const bitmap = () => new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(lum, size, size)));
        expect(zxingThrows(() => new Detector(bitmap().getBlackMatrix()).detect(tryHarder)), `finder patterns detected: ${r} @${s}`).toBe(true);
        expect(zxingThrows(() => reader.decode(bitmap())), `decoded: ${r} @${s}`).toBe(true);
        expect(zxingThrows(() => reader.decode(bitmap(), tryHarder)), `decoded (try harder): ${r} @${s}`).toBe(true);
        expect(zxingThrows(() => reader.decode(bitmap(), pure)), `decoded (pure barcode): ${r} @${s}`).toBe(true);
        expect(jsQR(rgba, size, size, { inversionAttempts: 'attemptBoth' }), `jsQR decoded: ${r} @${s}`).toBeNull();
        runs++;
      }
    }
    expect(runs).toBe(routes.length * scales.length);
  }, 120_000);
});
