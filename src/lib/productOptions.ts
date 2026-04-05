/** Normalize API `sizes` (string[] or { name, size, ... }[]) to display labels */
export function normalizeProductSizes(sizes: unknown): string[] {
  if (!Array.isArray(sizes) || sizes.length === 0) return [];
  return sizes
    .map((s) => {
      if (typeof s === 'string') return s.trim();
      if (s && typeof s === 'object') {
        const o = s as Record<string, unknown>;
        return String(o.name ?? o.size ?? o.id ?? '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

export interface ProductVariationLike {
  id?: string;
  color?: string;
  colorCode?: string;
  colorImage?: string;
  images?: string[];
}

export function normalizeVariations(variation: unknown): ProductVariationLike[] {
  if (!Array.isArray(variation)) return [];
  return variation.filter((v) => v != null && typeof v === 'object') as ProductVariationLike[];
}
