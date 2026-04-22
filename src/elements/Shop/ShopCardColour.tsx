"use client";

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

/** Visible color disc size (px); theme default was ~16px. */
const SWATCH_SIZE_PX = 25;

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
            <div
              className="form-check m-0 position-relative flex-shrink-0"
              key={v.id ?? index}
              style={{ width: SWATCH_SIZE_PX, height: SWATCH_SIZE_PX }}
            >
              <input
                className="form-check-input position-absolute top-0 start-0 m-0"
                type="radio"
                name={`${idPrefix}-variation`}
                id={inputId}
                checked={selected !== null && selected === index}
                onChange={() => onSelect?.(index)}
                value={hex}
                aria-label={label}
                style={{
                  width: SWATCH_SIZE_PX,
                  height: SWATCH_SIZE_PX,
                  cursor: "pointer",
                }}
              />
              <span
                className="m-0"
                style={{
                  backgroundColor: hex,
                  width: SWATCH_SIZE_PX,
                  height: SWATCH_SIZE_PX,
                  borderRadius: "50%",
                  display: "block",
                  pointerEvents: "none",
                }}
                title={label}
              />
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      {STATIC_SWATCHES.map((hex, index) => (
        <div
          className="form-check m-0 position-relative flex-shrink-0"
          key={hex}
          style={{ width: SWATCH_SIZE_PX, height: SWATCH_SIZE_PX }}
        >
          <input
            className="form-check-input position-absolute top-0 start-0 m-0"
            type="radio"
            name={`${idPrefix}-static`}
            id={`${idPrefix}-static-${index}`}
            value={hex}
            defaultChecked={index === 0}
            style={{
              width: SWATCH_SIZE_PX,
              height: SWATCH_SIZE_PX,
              cursor: "pointer",
            }}
          />
          <span
            className="m-0"
            style={{
              backgroundColor: hex,
              width: SWATCH_SIZE_PX,
              height: SWATCH_SIZE_PX,
              borderRadius: "50%",
              display: "block",
              pointerEvents: "none",
            }}
          />
        </div>
      ))}
    </>
  );
}