import { getPublicAssetOrigin } from '@/lib/env';

/** Default design space when admin has not set `designWidth` / `designHeight` */
export const DESIGN_CANVAS_WIDTH = 500;
export const DESIGN_CANVAS_HEIGHT = 600;

export interface CustomTextFieldDef {
  id: string;
  label: string;
  text: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  maxLength?: number;
  maxWords?: number;
  allowedColors?: string[];
  allowedFonts?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

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
  maxWords?: number;
  maxElements?: number;
  allowedColors?: string[];
  allowedFonts?: string[];
  allowedImages?: string[];
  imageUrl?: string;
  textFields?: CustomTextFieldDef[];
}

export interface CustomizationStyleVariantPayload {
  id: string;
  title: string;
  priceAddon: number;
  baseImage: string;
  editableAreas: EditableAreaDef[];
  designWidth?: number;
  designHeight?: number;
  textOnly?: boolean;
  allowedFonts?: string[];
}

export interface ProductCustomizationPayload {
  baseImage?: string;
  editableAreas?: EditableAreaDef[];
  /** When true, storefront shows text tools only; when false, image upload only (single area). */
  textOnly?: boolean;
  allowedFonts?: string[];
  logoUploadPrice?: number;
  enableLogoUpload?: boolean;
  /** Logical design stage in px (from admin crop / canvas). */
  designWidth?: number;
  designHeight?: number;
  variants?: Record<
    string,
    {
      baseImage: string;
      editableAreas: EditableAreaDef[];
      designWidth?: number;
      designHeight?: number;
    }
  >;
  styleVariants?: CustomizationStyleVariantPayload[];
}

export interface ProductForEditor {
  id?: string;
  name?: string;
  slug?: string;
  basePrice?: number;
  price?: number;
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

export interface ResolvedStorefrontCustomization {
  slice: { baseImage: string; editableAreas: EditableAreaDef[] } | null;
  designSize: { width: number; height: number };
  usesStyleVariants: boolean;
  styleVariants: CustomizationStyleVariantPayload[];
  /** Effective textOnly for the active slice (style row overrides root). */
  effectiveTextOnly: boolean | undefined;
}

/**
 * When `styleVariants` exist, the storefront uses them as the primary mockup source (not color `variants`).
 * Otherwise behavior matches legacy `pickCustomizationSlice` + root design size.
 */
export function resolveStorefrontCustomization(
  product: ProductForEditor | null | undefined,
  colorVariantId: string | null,
  styleVariantId: string | null
): ResolvedStorefrontCustomization | null {
  const c = product?.customization;
  if (!c) return null;

  const styles = Array.isArray(c.styleVariants) ? c.styleVariants : [];

  if (styles.length > 0) {
    const sid =
      styleVariantId && styles.some((s) => s.id === styleVariantId)
        ? styleVariantId
        : styles[0].id;
    const row = styles.find((s) => s.id === sid);
    if (!row) return null;
    const dw = row.designWidth ?? c.designWidth ?? DESIGN_CANVAS_WIDTH;
    const dh = row.designHeight ?? c.designHeight ?? DESIGN_CANVAS_HEIGHT;

    // If the style variant's editableAreas lack textFields or certain constraints that are present in the root editableAreas,
    // merge them in so that storefront users always get the latest field definitions even if the style variant was saved prior to adding text fields!
    const rootAreasMap = new Map((c.editableAreas || []).map(a => [a.id, a]));
    const mergedAreas = (row.editableAreas || []).map(a => {
      const rootA = rootAreasMap.get(a.id);
      if (rootA) {
        return {
          ...a,
          label: a.label || rootA.label,
          maxLength: a.maxLength ?? rootA.maxLength,
          maxWords: a.maxWords ?? rootA.maxWords,
          maxElements: a.maxElements ?? rootA.maxElements,
          allowedColors: (a.allowedColors && a.allowedColors.length > 0) ? a.allowedColors : rootA.allowedColors,
          allowedFonts: (a.allowedFonts && a.allowedFonts.length > 0) ? a.allowedFonts : rootA.allowedFonts,
          allowedImages: (a.allowedImages && a.allowedImages.length > 0) ? a.allowedImages : rootA.allowedImages,
          fontFamily: a.fontFamily || rootA.fontFamily,
          fontSize: a.fontSize || rootA.fontSize,
          textColor: a.textColor || rootA.textColor,
          textFields: (a.textFields && a.textFields.length > 0) ? a.textFields : rootA.textFields,
        };
      }
      return a;
    });

    // Also include any new areas added to the root customization that aren't in this style variant
    const sAreaIds = new Set((row.editableAreas || []).map(a => a.id));
    for (const rootA of (c.editableAreas || [])) {
      if (!sAreaIds.has(rootA.id)) {
        mergedAreas.push({
          ...rootA,
          textFields: rootA.textFields ? rootA.textFields.map(tf => ({ ...tf })) : undefined,
        });
      }
    }

    return {
      slice: {
        baseImage: row.baseImage,
        editableAreas: updateGenericLabels(mergedAreas),
      },
      designSize: { width: dw, height: dh },
      usesStyleVariants: true,
      styleVariants: styles,
      effectiveTextOnly: row.textOnly ?? c.textOnly,
    };
  }

  const slice = pickCustomizationSlice(c, colorVariantId);
  if (!slice) return null;
  const dw = c.designWidth ?? DESIGN_CANVAS_WIDTH;
  const dh = c.designHeight ?? DESIGN_CANVAS_HEIGHT;
  return {
    slice: {
      ...slice,
      editableAreas: updateGenericLabels(slice.editableAreas),
    },
    designSize: { width: dw, height: dh },
    usesStyleVariants: false,
    styleVariants: [],
    effectiveTextOnly: c.textOnly,
  };
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
  displayHeight: number,
  designWidth: number = DESIGN_CANVAS_WIDTH,
  designHeight: number = DESIGN_CANVAS_HEIGHT
): { x: number; y: number; width: number; height: number } {
  const x = bgLeft + (area.x / designWidth) * displayWidth;
  const y = bgTop + (area.y / designHeight) * displayHeight;
  const w = (area.width / designWidth) * displayWidth;
  const h = (area.height / designHeight) * displayHeight;
  return { x, y, width: w, height: h };
}

export function updateGenericLabels(areas: EditableAreaDef[]): EditableAreaDef[] {
  let textCount = 0;
  let imageCount = 0;
  return areas.map((area) => {
    const labelTrim = (area.label || '').trim();
    const isGeneric =
      !labelTrim ||
      /^(text|image)\s*\d*$/i.test(labelTrim) ||
      labelTrim.toLowerCase() === 'text area' ||
      labelTrim.toLowerCase() === 'image area';

    if (isGeneric) {
      if (area.type === 'text') {
        textCount++;
        return { ...area, label: `Text ${textCount}` };
      } else {
        imageCount++;
        return { ...area, label: `Image ${imageCount}` };
      }
    }
    return area;
  });
}
