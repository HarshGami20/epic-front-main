import type { FabricObject } from 'fabric';
import { applyUniformScaleToTextMetrics } from '@pixel/lib/textAdaptiveSizing';

/** Printable / safe area (canvas coordinates), including bleed padding */
export interface PrintableZone {
  x: number;
  y: number;
  width: number;
  height: number;
  bleed: number;
}

/**
 * Keeps an object fully inside the zone (including bleed): scales down uniformly if the
 * axis-aligned bounding box is too large, then clamps position. Works with rotation.
 */
export function fitObjectInZone(obj: FabricObject, zone: PrintableZone): void {
  if ((obj as { isBackground?: boolean }).isBackground) return;

  const bleed = zone.bleed;
  const minX = zone.x - bleed;
  const minY = zone.y - bleed;
  const maxX = zone.x + zone.width + bleed;
  const maxY = zone.y + zone.height + bleed;
  const maxW = Math.max(0, maxX - minX);
  const maxH = Math.max(0, maxY - minY);
  if (maxW <= 0 || maxH <= 0) return;

  for (let i = 0; i < 8; i++) {
    obj.setCoords();
    const br = obj.getBoundingRect();

    const inside =
      br.width <= maxW + 0.5 &&
      br.height <= maxH + 0.5 &&
      br.left >= minX - 0.5 &&
      br.top >= minY - 0.5 &&
      br.left + br.width <= maxX + 0.5 &&
      br.top + br.height <= maxY + 0.5;

    if (inside) {
      return;
    }

    if (br.width > maxW || br.height > maxH) {
      const sx = br.width > maxW ? maxW / br.width : 1;
      const sy = br.height > maxH ? maxH / br.height : 1;
      const s = Math.min(sx, sy);
      const kind = obj.type;
      if (kind === 'textbox' || kind === 'i-text' || kind === 'text') {
        applyUniformScaleToTextMetrics(obj, s);
      } else {
        obj.set({
          scaleX: (obj.scaleX || 1) * s,
          scaleY: (obj.scaleY || 1) * s,
        });
      }
      obj.setCoords();
    }

    const br2 = obj.getBoundingRect();
    let dx = 0;
    let dy = 0;
    if (br2.left < minX) dx = minX - br2.left;
    if (br2.top < minY) dy = minY - br2.top;
    if (br2.left + br2.width > maxX) dx += maxX - br2.left - br2.width;
    if (br2.top + br2.height > maxY) dy += maxY - br2.top - br2.height;

    if (dx !== 0 || dy !== 0) {
      obj.set({
        left: (obj.left ?? 0) + dx,
        top: (obj.top ?? 0) + dy,
      });
    }
  }

  obj.setCoords();
}
