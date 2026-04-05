"use client";

import { getImageUrl } from '@/lib/imageUtils';

export type ShopCardVariation = {
  id?: string;
  color?: string;
  colorCode?: string;
  colorImage?: string;
};

type ShopCardColourProps = {
  /** When set, renders one swatch per variation (API `product.variation`). */
  variations?: ShopCardVariation[];
  /** Prefix for stable radio `name` / `id` (e.g. product slug). */
  idPrefix?: string;
  /** `null` = no swatch selected (all unchecked). */
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
};

const STATIC_SWATCHES = ['#24262B', '#8CB2D1', '#0D775E', '#FEC4C4'];

export default function ShopCardColour({
  variations,
  idPrefix = 'color',
  selectedIndex = 0,
  onSelect,
}: ShopCardColourProps) {
  const dynamic = Array.isArray(variations) && variations.length > 0;
  const selected = selectedIndex === null ? null : selectedIndex;

  if (dynamic) {
    return (
      <>
        {variations.map((v, index) => {
          const hex = v.colorCode?.trim() || '#cccccc';
          const inputId = `${idPrefix}-color-${v.id ?? index}`;
          const label = v.color?.trim() || `Option ${index + 1}`;
          return (
            <div className="form-check" key={v.id ?? index}>
              <input
                className="form-check-input"
                type="radio"
                name={`${idPrefix}-variation`}
                id={inputId}
                checked={selected !== null && selected === index}
                onChange={() => onSelect?.(index)}
                value={hex}
                aria-label={label}
              />
              {v.colorImage ? (
                <span className="d-inline-flex rounded-circle overflow-hidden border border-secondary" style={{ width: 28, height: 28 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(v.colorImage)} alt="" className="w-100 h-100 object-cover" />
                </span>
              ) : (
                <span style={{ backgroundColor: hex }} title={label} />
              )}
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      {STATIC_SWATCHES.map((hex, index) => (
        <div className="form-check" key={hex}>
          <input
            className="form-check-input"
            type="radio"
            name={`${idPrefix}-static`}
            id={`${idPrefix}-static-${index}`}
            value={hex}
            defaultChecked={index === 0}
          />
          <span style={{ backgroundColor: hex }} />
        </div>
      ))}
    </>
  );
}