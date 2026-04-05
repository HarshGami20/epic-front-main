"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEditor } from "@pixel/contexts/EditorContext";
import type { CustomizationVariantOption } from "@pixel/lib/productCustomization";
import {
  getCustomizationVariantOptions,
  getDefaultCustomizationVariantId,
  ROOT_CUSTOMIZATION_VARIANT_ID,
} from "@pixel/lib/productCustomization";

type InnerProps = {
  options: CustomizationVariantOption[];
  defaultId: string | null;
};

function CustomizeVariantBarInner({ options, defaultId }: InnerProps) {
  const { selectedVariantId, setSelectedVariantId } = useEditor();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDefaultSelection =
    (defaultId === null && selectedVariantId === null) ||
    (defaultId != null && selectedVariantId != null && selectedVariantId === defaultId);

  useEffect(() => {
    const current = searchParams.get("variant");
    if (selectedVariantId === null) {
      if (!current) return;
      const params = new URLSearchParams(searchParams.toString());
      params.delete("variant");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
      return;
    }
    if (current === selectedVariantId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", selectedVariantId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedVariantId, pathname, router, searchParams]);

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-border bg-editor-panel/90 text-sm shrink-0 z-10">
      <span className="text-muted-foreground font-medium">Variant</span>
      <select
        id="customize-variant-select"
        aria-label="Product customization variant"
        className="rounded-md border border-border bg-background px-3 py-1.5 text-foreground min-w-[12rem] text-sm"
        value={selectedVariantId ?? ROOT_CUSTOMIZATION_VARIANT_ID}
        onChange={(e) => {
          const v = e.target.value;
          setSelectedVariantId(v === ROOT_CUSTOMIZATION_VARIANT_ID ? null : v);
        }}
      >
        {options.map((o) => (
          <option key={o.id || "root"} value={o.id}>
            {o.label}
            {defaultId === null && o.id === ROOT_CUSTOMIZATION_VARIANT_ID
              ? " — default"
              : defaultId != null && o.id === defaultId
                ? " — default"
                : ""}
          </option>
        ))}
      </select>
      {isDefaultSelection && (
        <span className="inline-flex items-center rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-xs font-medium">
          Default variant
        </span>
      )}
    </div>
  );
}

/**
 * Customize flow only: variant dropdown + “Default variant” when the resolved choice
 * matches the product’s canonical default (same rules as opening /customize without ?variant=).
 */
export const CustomizeVariantBar: React.FC = () => {
  const { editorSource, editorProduct } = useEditor();

  const options = useMemo(() => getCustomizationVariantOptions(editorProduct), [editorProduct]);
  const defaultId = useMemo(() => getDefaultCustomizationVariantId(editorProduct), [editorProduct]);

  if (editorSource !== "product" || options.length < 2) return null;

  return <CustomizeVariantBarInner options={options} defaultId={defaultId} />;
};
