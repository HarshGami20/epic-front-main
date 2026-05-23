import type { FabricObject } from 'fabric';

const FONT_MIN = 8;
const FONT_MAX = 220;
const LINE_HEIGHT_MULT = 1.16;

/** Reference preset size used to compare Title / Heading / Paragraph ratios */
const PRESET_REF = 48;

export interface ZoneLike {
  width: number;
  height: number;
  type?: 'text' | 'image';
  fontSize?: number;
}

export interface TextBounds {
  width: number;
  height: number;
}

/**
 * Font size from zone dimensions: scales with the smaller printable dimension.
 * Presets (72/48/24) keep their relative sizes. Optional admin `zone.fontSize`
 * anchors paragraph size when `type === 'text'`.
 */
export function computeAdaptiveFontSizeForZone(
  zone: ZoneLike,
  presetFontSize: number
): number {
  const minDim = Math.min(zone.width, zone.height);
  let refPx: number;
  if (zone.type === 'text' && zone.fontSize != null && zone.fontSize > 0) {
    refPx = zone.fontSize;
  } else {
    refPx = Math.min(FONT_MAX, Math.max(FONT_MIN, minDim * 0.12));
  }
  const ratio = presetFontSize / PRESET_REF;
  return Math.round(
    Math.min(FONT_MAX, Math.max(FONT_MIN, refPx * ratio))
  );
}

/** Collapse line breaks and extra spaces so canvas text stays on one line. */
export function toSingleLineText(text: string): string {
  return text.replace(/\s*[\r\n\u2028\u2029]+\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

type TextLike = FabricObject & {
  text?: string;
  fontSize?: number;
  lineHeight?: number;
  calcTextWidth?: () => number;
  initDimensions?: () => void;
  zoneMaxFontSize?: number;
  _textLines?: string[][];
};

function normalizeSingleLineText(obj: TextLike): void {
  const raw = typeof obj.text === 'string' ? obj.text : '';
  const single = toSingleLineText(raw) || ' ';
  if (single !== raw) {
    obj.set('text', single);
  }
  obj.set({
    whiteSpace: 'nowrap',
    splitByGrapheme: false,
    dynamicMinWidth: 0,
  });
}

function getTextLineCount(obj: TextLike): number {
  const lines = obj._textLines;
  return Array.isArray(lines) ? lines.length : 1;
}

function measureTextFitsInBounds(
  obj: TextLike,
  fontSize: number,
  maxW: number,
  maxH: number
): boolean {
  obj.set({
    fontSize,
    width: maxW,
    scaleX: 1,
    scaleY: 1,
    whiteSpace: 'nowrap',
    splitByGrapheme: false,
    dynamicMinWidth: 0,
  });
  if (typeof obj.initDimensions === 'function') {
    obj.initDimensions();
  }

  if (getTextLineCount(obj) > 1) {
    return false;
  }

  const lh = typeof obj.lineHeight === 'number' ? obj.lineHeight : LINE_HEIGHT_MULT;
  const textH = fontSize * lh;
  if (textH > maxH + 0.5) {
    return false;
  }

  if (typeof obj.calcTextWidth === 'function') {
    return obj.calcTextWidth() <= maxW + 0.5;
  }

  obj.setCoords();
  const br = obj.getBoundingRect();
  return br.width <= maxW + 0.5 && br.height <= maxH + 0.5;
}

/**
 * One line only, inside the field box. Uses the largest font up to max that fits;
 * short text grows, long text shrinks.
 */
export function fitSingleLineTextInZone(
  obj: FabricObject,
  bounds: TextBounds,
  maxFontSize?: number
): void {
  const t = obj.type;
  if (t !== 'textbox' && t !== 'i-text' && t !== 'text') return;

  const text = obj as TextLike;
  normalizeSingleLineText(text);

  const maxW = Math.max(1, bounds.width);
  const maxH = Math.max(1, bounds.height);

  const storedMax = text.zoneMaxFontSize;
  const cap =
    maxFontSize ??
    storedMax ??
    text.fontSize ??
    FONT_MAX;
  const ceiling = Math.min(FONT_MAX, Math.max(FONT_MIN, cap));
  if (storedMax == null) {
    text.zoneMaxFontSize = ceiling;
  }

  let lo = FONT_MIN;
  let hi = ceiling;
  let best = FONT_MIN;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (measureTextFitsInBounds(text, mid, maxW, maxH)) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  text.set({
    fontSize: best,
    width: maxW,
    scaleX: 1,
    scaleY: 1,
    whiteSpace: 'nowrap',
    splitByGrapheme: false,
    dynamicMinWidth: 0,
  });
  if (typeof text.initDimensions === 'function') {
    text.initDimensions();
  }
  text.setCoords();
}

/** @deprecated Use fitSingleLineTextInZone when zone bounds are known. */
export function enforceSingleLineTextbox(
  obj: FabricObject,
  bounds?: TextBounds,
  maxFontSize?: number
): void {
  if (bounds) {
    fitSingleLineTextInZone(obj, bounds, maxFontSize);
    return;
  }
  const text = obj as TextLike;
  normalizeSingleLineText(text);
  if (typeof text.initDimensions === 'function') {
    text.initDimensions();
  }
  text.setCoords();
}

export function bakeTextboxScaleIntoMetrics(obj: FabricObject): boolean {
  const t = obj.type;
  if (t !== 'textbox' && t !== 'i-text' && t !== 'text') return false;

  const sx = obj.scaleX ?? 1;
  const sy = obj.scaleY ?? 1;
  if (Math.abs(sx - 1) < 1e-6 && Math.abs(sy - 1) < 1e-6) return false;

  if (t === 'textbox') {
    const tb = obj as FabricObject & {
      fontSize?: number;
      width?: number;
    };
    const fs = (tb.fontSize ?? 16) * sy;
    const w = (tb.width ?? 200) * sx;
    tb.set({ fontSize: fs, width: w, scaleX: 1, scaleY: 1 });
    tb.setCoords();
    return true;
  }

  const it = obj as FabricObject & { fontSize?: number };
  const fs = (it.fontSize ?? 16) * Math.sqrt(sx * sy);
  it.set({ fontSize: fs, scaleX: 1, scaleY: 1 });
  it.setCoords();
  return true;
}

/** Uniform shrink for font only (width stays zone-sized). */
export function applyUniformScaleToTextMetrics(obj: FabricObject, s: number): boolean {
  if (Math.abs(s - 1) < 1e-9) return false;
  const t = obj.type;
  if (t === 'textbox') {
    const tb = obj as FabricObject & { fontSize?: number };
    const newFS = Math.max(FONT_MIN, (tb.fontSize ?? 16) * s);
    tb.set({
      fontSize: newFS,
      scaleX: 1,
      scaleY: 1,
    });
    tb.setCoords();
    return true;
  }
  if (t === 'i-text' || t === 'text') {
    const it = obj as FabricObject & { fontSize?: number };
    it.set({ fontSize: Math.max(FONT_MIN, (it.fontSize ?? 16) * s), scaleX: 1, scaleY: 1 });
    it.setCoords();
    return true;
  }
  return false;
}
