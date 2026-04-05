import { getPublicAssetOrigin } from '@/lib/env';

/** Matches epiclance-admin `CustomizationEditor` stage size */
export const DESIGN_CANVAS_WIDTH = 500;
export const DESIGN_CANVAS_HEIGHT = 600;

export interface EditableAreaDef {
  id: string;
  type: 'text' | 'image';
  label: string;
  x: number;
  y: number;
  xPercent?: number;
  yPercent?: number;
  width: number;
  height: number;
  rotation?: number;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  maxLength?: number;
  imageUrl?: string;
}

export interface ProductCustomizationPayload {
  baseImage?: string;
  editableAreas?: EditableAreaDef[];
  /** When true, storefront shows text tools only; when false, image upload only (single area). */
  textOnly?: boolean;
  allowedFonts?: string[];
  variants?: Record<
    string,
    {
      baseImage: string;
      editableAreas: EditableAreaDef[];
    }
  >;
}

export interface ProductForEditor {
  id?: string;
  name?: string;
  slug?: string;
  customization?: ProductCustomizationPayload | null;
  variation?: Array<{ id: string; color?: string; colorCode?: string; colorImage?: string }>;
}

export function resolveProductAssetUrl(path: string): string {
  if (!path || path === '/placeholder.svg') return path;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const origin = getPublicAssetOrigin();
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Root / “default product” slice lives on customization itself; color-specific slices live under `variants`. */
export function hasRootCustomizationSlice(
  customization: ProductCustomizationPayload | null | undefined
): boolean {
  if (!customization) return false;
  return Boolean(
    customization.baseImage &&
      Array.isArray(customization.editableAreas) &&
      customization.editableAreas.length > 0
  );
}

export function pickCustomizationSlice(
  customization: ProductCustomizationPayload | null | undefined,
  variantId: string | null
): { baseImage: string; editableAreas: EditableAreaDef[] } | null {
  if (!customization) return null;

  // Falsy variantId (null, undefined, '') → admin “default” row: baseImage + editableAreas on customization
  if (!variantId && hasRootCustomizationSlice(customization)) {
    return {
      baseImage: customization.baseImage as string,
      editableAreas: customization.editableAreas || [],
    };
  }

  if (variantId && customization.variants?.[variantId]) {
    const v = customization.variants[variantId];
    return {
      baseImage: v.baseImage,
      editableAreas: v.editableAreas || [],
    };
  }

  if (hasRootCustomizationSlice(customization)) {
    return {
      baseImage: customization.baseImage as string,
      editableAreas: customization.editableAreas || [],
    };
  }

  const firstVariantKey = customization.variants ? Object.keys(customization.variants)[0] : null;
  if (firstVariantKey && customization.variants?.[firstVariantKey]) {
    const v = customization.variants[firstVariantKey];
    return {
      baseImage: v.baseImage,
      editableAreas: v.editableAreas || [],
    };
  }

  return null;
}

/**
 * Resolves which customization variant to use (same rules as the editor on load).
 * `preferredVariantId` is usually the `variant` URL query when present and valid.
 */
export function resolveInitialCustomizationVariantId(
  product: ProductForEditor | null | undefined,
  preferredVariantId: string | null | undefined
): string | null {
  const c = product?.customization;
  if (!c) return null;

  const variantKeys = c.variants ? Object.keys(c.variants) : [];
  const hasRoot = hasRootCustomizationSlice(c);

  // URL / query requests a specific color variant
  if (preferredVariantId && variantKeys.includes(preferredVariantId)) {
    return preferredVariantId;
  }

  // Admin stores default mockup + zone on customization; per-color overrides under variants.
  // When both exist, open on root (null) unless URL selected a variant above.
  if (hasRoot && variantKeys.length > 0) {
    return null;
  }

  // Only variant entries (no root) — must pick one variant id for the editor
  if (variantKeys.length > 0) {
    const fromVariation = product?.variation?.find((v) => variantKeys.includes(v.id));
    if (fromVariation) return fromVariation.id;
    return variantKeys[0];
  }

  // Root only
  if (hasRoot) return null;

  if (preferredVariantId) return preferredVariantId;
  if (product?.variation?.[0]?.id) return product.variation[0].id;

  return null;
}

/** Canonical default variant id (shopper has not requested a specific one). For “Default variant” UI. */
export function getDefaultCustomizationVariantId(
  product: ProductForEditor | null | undefined
): string | null {
  return resolveInitialCustomizationVariantId(product, null);
}

/** One row per entry in `customization.variants`, labels from `product.variation` when ids match */
export interface CustomizationVariantOption {
  id: string;
  label: string;
  color?: string;
  colorCode?: string;
  colorImage?: string;
}

/** Empty string id = root / base product slice (customization.baseImage + editableAreas). */
export const ROOT_CUSTOMIZATION_VARIANT_ID = '';

export function getCustomizationVariantOptions(
  product: ProductForEditor | null | undefined
): CustomizationVariantOption[] {
  const c = product?.customization;
  if (!c) return [];

  const variation = product?.variation ?? [];
  const byId = new Map(variation.map((v) => [v.id, v]));

  const variantKeys =
    c.variants && typeof c.variants === 'object' ? Object.keys(c.variants) : [];
  const hasRoot = hasRootCustomizationSlice(c);

  const out: CustomizationVariantOption[] = [];

  if (hasRoot && variantKeys.length > 0) {
    out.push({
      id: ROOT_CUSTOMIZATION_VARIANT_ID,
      label: 'Default (base product)',
    });
  }

  for (const id of variantKeys) {
    const v = byId.get(id);
    out.push({
      id,
      label: (v?.color || v?.id || id).trim() || id,
      color: v?.color,
      colorCode: v?.colorCode,
      colorImage: v?.colorImage,
    });
  }

  if (out.length > 0) return out;

  if (variantKeys.length > 0) {
    return variantKeys.map((id) => {
      const v = byId.get(id);
      return {
        id,
        label: (v?.color || v?.id || id).trim() || id,
        color: v?.color,
        colorCode: v?.colorCode,
        colorImage: v?.colorImage,
      };
    });
  }

  return [];
}

/** Map admin design-space coordinates to Fabric canvas space over the displayed mockup image */
export function mapEditableAreaToCanvas(
  area: EditableAreaDef,
  bgLeft: number,
  bgTop: number,
  displayWidth: number,
  displayHeight: number
): { x: number; y: number; width: number; height: number } {
  const x =
    bgLeft + (area.x / DESIGN_CANVAS_WIDTH) * displayWidth;
  const y =
    bgTop + (area.y / DESIGN_CANVAS_HEIGHT) * displayHeight;
  const w = (area.width / DESIGN_CANVAS_WIDTH) * displayWidth;
  const h = (area.height / DESIGN_CANVAS_HEIGHT) * displayHeight;
  return { x, y, width: w, height: h };
}
