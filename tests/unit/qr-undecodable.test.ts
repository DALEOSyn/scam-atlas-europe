/**
 * Red Line 3: the in-game QR picture must not scan. Rasterise exactly the shapes QrGraphic draws
 * (anti-aliased by 4×4 supersampling, several module sizes, many routes) and run two independent
 * decoders on it: ZXing (finder-pattern detection, normal + try-harder + pure-barcode decode) and jsQR.
 */
import { describe, expect, it } from 'vitest';
import { BarcodeFormat, BinaryBitmap, DecodeHintType, QRCodeWriter, HybridBinarizer, QRCodeDecoderFormatInformation, QRCodeReader, RGBLuminanceSource } from '@zxing/library';
import Detector from '@zxing/library/esm/core/qrcode/detector/Detector.js';
import jsQR from 'jsqr';
import { CORNER_MARKS, DISC_CORNER, QR_SIZE, qrMatrix } from '../../src/ui/devices/QrGraphic.tsx';

const QUIET = 2;

function inRoundRect(px: number, py: number, x0: number, y0: number, w: number, h: number, r: number): boolean {
  if (px < x0 || py < y0 || px > x0 + w || py > y0 + h) return false;
  const cx = Math.min(Math.max(px, x0 + r), x0 + w - r);
  const cy = Math.min(Math.max(py, y0 + r), y0 + h - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
}

/** Is the point (module coordinates) dark in the SVG QrGraphic renders? */
function darkAt(m: boolean[][], px: number, py: number): boolean {
  for (const [x, y] of CORNER_MARKS) {
    // stroke 1 centred on a 6×6 rect at +0.5 (rx 1.2): outer 7×7 (r 1.7) minus inner 5×5 (r 0.7)
    if (inRoundRect(px, py, x, y, 7, 7, 1.7) && !inRoundRect(px, py, x + 1, y + 1, 5, 5, 0.7)) return true;
    if (inRoundRect(px, py, x + 3, y + 3, 1, 1, 0.3)) return true;
  }
  const [dx, dy] = DISC_CORNER;
  if ((px - dx - 3.5) ** 2 + (py - dy - 3.5) ** 2 <= 3.5 ** 2) return true;
  const mx = Math.floor(px);
  const my = Math.floor(py);
  return m[my]?.[mx] === true && inRoundRect(px, py, mx + 0.1, my + 0.1, 0.8, 0.8, 0.3);
}

function rasterise(route: string, scale: number): { lum: Uint8ClampedArray; rgba: Uint8ClampedArray; size: number } {
  const m = qrMatrix(route);
  const size = (QR_SIZE + 2 * QUIET) * scale;
  const lum = new Uint8ClampedArray(size * size);
  const rgba = new Uint8ClampedArray(size * size * 4);
  const ss = 4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let dark = 0;
      for (let sy = 0; sy < ss; sy++)
        for (let sx = 0; sx < ss; sx++) if (darkAt(m, (x + (sx + 0.5) / ss) / scale - QUIET, (y + (sy + 0.5) / ss) / scale - QUIET)) dark++;
      const v = Math.round(255 * (1 - dark / (ss * ss)));
      lum[y * size + x] = v;
      rgba.set([v, v, v, 255], (y * size + x) * 4);
    }
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
