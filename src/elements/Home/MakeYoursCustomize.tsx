"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getImageUrl } from "@/lib/imageUtils";

const DESIGN_W = 500;
const DESIGN_H = 600;

export interface MakeYoursFontRow {
  label: string;
  googleFont: string;
}

export interface MakeYoursOverlay {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MakeYoursVariantRow {
  label: string;
  image: string;
  overlay: MakeYoursOverlay;
}

export interface MakeYoursCustomizeData {
  heading?: string;
  subtitle?: string;
  disclaimer?: string;
  helperText?: string;
  addToCartText?: string;
  productSlug?: string;
  variants?: MakeYoursVariantRow[];
  fonts?: MakeYoursFontRow[];
}

const ACCENT = "#5c4033";

function buildGoogleFontsHref(fontList: MakeYoursFontRow[]): string {
  const names = [...new Set(fontList.map((f) => f.googleFont).filter(Boolean))];
  if (names.length === 0) return "";
  const fam = names.map((n) => `family=${encodeURIComponent(n)}`).join("&");
  return `https://fonts.googleapis.com/css2?${fam}&display=swap`;
}

function AdaptivePreviewText({
  text,
  fontFamily,
}: {
  text: string;
  fontFamily: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(22);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const t = text.trim() || "Preview";
      const len = Math.max(t.length, 3);
      const byW = w / (len * 0.55);
      const byH = h * 0.42;
      const next = Math.max(11, Math.min(byW, byH, 64));
      setFontSize(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, fontFamily]);

  return (
    <div
      ref={boxRef}
      className="w-100 h-100 d-flex align-items-center justify-content-center text-center px-1"
    >
      <span
        style={{
          fontFamily,
          fontSize,
          lineHeight: 1.05,
          wordBreak: "break-word",
          color: "#1a1a1a",
        }}
      >
        {text.trim() || "Preview"}
      </span>
    </div>
  );
}

export default function MakeYoursCustomize({ data }: { data: MakeYoursCustomizeData }) {
  const fontLinkId = `make-yours-gf-${useId().replace(/:/g, "")}`;
  const variants = useMemo(
    () => (Array.isArray(data?.variants) ? data.variants.filter((v) => v.image) : []),
    [data?.variants]
  );
  const fonts = useMemo(
    () =>
      Array.isArray(data?.fonts) && data.fonts.length > 0
        ? data.fonts
        : [{ label: "Sample", googleFont: "Great Vibes" }],
    [data?.fonts]
  );

  const [variantIndex, setVariantIndex] = useState(0);
  const [fontIndex, setFontIndex] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    setVariantIndex(0);
  }, [variants.length]);

  useEffect(() => {
    const href = buildGoogleFontsHref(fonts);
    if (!href) return;
    let el = document.getElementById(fontLinkId) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement("link");
      el.id = fontLinkId;
      el.rel = "stylesheet";
      document.head.appendChild(el);
    }
    el.href = href;
  }, [fonts, fontLinkId]);

  const safeVariantIndex =
    variants.length === 0 ? -1 : Math.min(variantIndex, variants.length - 1);
  const current = safeVariantIndex >= 0 ? variants[safeVariantIndex] : null;
  const overlay = current?.overlay ?? {
    x: 50,
    y: 40,
    width: 400,
    height: 140,
  };
  const activeFont = fonts[Math.min(fontIndex, fonts.length - 1)];

  const productHref =
    typeof data?.productSlug === "string" && data.productSlug.trim()
      ? `/products/${data.productSlug.trim()}`
      : "/shop";

  if (variants.length === 0) {
    return (
      <div className="row justify-content-center">
        <div className="col-lg-10 text-center py-5 text-muted small">
          Add image variants in Epiclance CMS → Home Page → this section to show the Make Yours block.
        </div>
      </div>
    );
  }

  return (
    <div className="row g-4 g-xl-5 align-items-start container">
      <div className=''>
        <h2 className="title mb-1" style={{  color: ACCENT }}>
          {data?.heading || "Make Yours Now!"}
        </h2>
        <p className="text-muted  small">{data?.subtitle || ""}</p>
      </div>
      <div className="col-lg-6 ">
        <div
          className="position-relative mx-auto rounded overflow-hidden bg-light shadow-sm"
          style={{ maxWidth: 520 }}
        >
          <div className="position-relative w-100" style={{ aspectRatio: `${DESIGN_W} / ${DESIGN_H}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(current!.image)}
              alt={current?.label || "Preview"}
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ objectFit: "cover" }}
            />
            <div
              className="position-absolute overflow-hidden"
              style={{
                left: `${(overlay.x / DESIGN_W) * 100}%`,
                top: `${(overlay.y / DESIGN_H) * 100}%`,
                width: `${(overlay.width / DESIGN_W) * 100}%`,
                height: `${(overlay.height / DESIGN_H) * 100}%`,
              }}
            >
              <AdaptivePreviewText
                text={name}
                fontFamily={`'${activeFont.googleFont}', cursive, serif`}
              />
            </div>
          </div>
        </div>
        {data?.disclaimer ? (
          <p className="small text-muted mt-3 mb-0">{data.disclaimer}</p>
        ) : null}
      </div>

      <div className="col-lg-6">
        {variants.length > 1 ? (
          <div className="mb-4">
            <span className="form-label d-block mb-2 small text-uppercase text-muted">
              Variant
            </span>
            <div className="d-flex flex-wrap gap-2">
              {variants.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn-sm rounded-pill"
                  onClick={() => setVariantIndex(i)}
                  style={
                    i === safeVariantIndex
                      ? { backgroundColor: ACCENT, color: "#fff", borderColor: ACCENT }
                      : { borderColor: "#dee2e6" }
                  }
                >
                  {v.label || `Option ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ color: ACCENT }}>
            1) Enter Name
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Type name (one line)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            autoComplete="off"
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ color: ACCENT }}>
            2) Choose Font
          </label>
          <div
            className="d-grid gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            }}
          >
            {fonts.map((f, i) => {
              const selected = i === fontIndex;
              return (
                <button
                  key={i}
                  type="button"
                  className="btn btn-sm py-2 px-2 rounded-2 border"
                  onClick={() => setFontIndex(i)}
                  style={{
                    backgroundColor: selected ? ACCENT : "#fff",
                    color: selected ? "#fff" : "#333",
                    borderColor: selected ? ACCENT : "#dee2e6",
                    fontFamily: `'${f.googleFont}', cursive, serif`,
                    fontSize: "0.95rem",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <Link
          href={productHref}
          className="btn text-white w-100 py-3 text-uppercase fw-semibold mb-2"
          style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
        >
          {data?.addToCartText?.trim() || "Add to Cart"}
        </Link>
        {data?.helperText ? (
          <p className="small text-muted text-center mb-0">{data.helperText}</p>
        ) : null}
      </div>
    </div>
  );
}
