import type { FabricObject } from 'fabric';

const FONT_MIN = 8;
const FONT_MAX = 220;

/** Reference preset size used to compare Title / Heading / Paragraph ratios */
const PRESET_REF = 48;

export interface ZoneLike {
  width: number;
  height: number;
  type?: 'text' | 'image';
  fontSize?: number;
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

/**
 * Converts Fabric scale handles into real font metrics so text stays sharp and
 * resizing the box updates logical font size / width instead of bitmap scaling.
 */
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

/** Uniform shrink/expand for fitting inside a zone (same factor on font + box width). */
export function applyUniformScaleToTextMetrics(obj: FabricObject, s: number): boolean {
  if (Math.abs(s - 1) < 1e-9) return false;
  const t = obj.type;
  if (t === 'textbox') {
    const tb = obj as FabricObject & { fontSize?: number; width?: number };
    tb.set({
      fontSize: (tb.fontSize ?? 16) * s,
      width: (tb.width ?? 200) * s,
      scaleX: 1,
      scaleY: 1,
    });
    tb.setCoords();
    return true;
  }
  if (t === 'i-text' || t === 'text') {
    const it = obj as FabricObject & { fontSize?: number };
    it.set({ fontSize: (it.fontSize ?? 16) * s, scaleX: 1, scaleY: 1 });
    it.setCoords();
    return true;
  }
  return false;
}
