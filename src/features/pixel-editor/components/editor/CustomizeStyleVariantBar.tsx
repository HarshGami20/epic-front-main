"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEditor } from "@pixel/contexts/EditorContext";
import { resolveProductAssetUrl } from "@pixel/lib/productCustomization";
import { cn } from "@pixel/lib/utils";
import { Button } from "@pixel/components/ui/button";

const CARD_W = 128;
const SCROLL_STEP = CARD_W + 8;

export const CustomizeStyleVariantBar: React.FC = () => {
  const {
    editorSource,
    usesStyleVariants,
    styleVariantsForPicker,
    selectedStyleVariantId,
    setSelectedStyleVariantId,
  } = useEditor();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!usesStyleVariants || !selectedStyleVariantId) return;
    const current = searchParams.get("style");
    if (current === selectedStyleVariantId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("style", selectedStyleVariantId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [usesStyleVariants, selectedStyleVariantId, pathname, router, searchParams]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !selectedStyleVariantId) return;
    const btn = el.querySelector<HTMLElement>(`[data-style-id="${CSS.escape(selectedStyleVariantId)}"]`);
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedStyleVariantId, styleVariantsForPicker]);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });
  }, []);

  if (editorSource !== "product" || !usesStyleVariants || styleVariantsForPicker.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border bg-editor-panel/90 px-2 py-2.5 sm:px-3 text-sm shrink-0 z-10">
      <div className="flex items-center gap-1 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Scroll options left"
          onClick={() => scrollByDir(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollerRef}
          className={cn(
            "flex gap-2 overflow-x-auto flex-1 min-w-0 py-0.5",
            "scroll-smooth snap-x snap-mandatory",
            "[scrollbar-width:thin]",
            "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
          )}
        >
          {styleVariantsForPicker.map((s) => {
            const active = selectedStyleVariantId === s.id;
            const mockup = resolveProductAssetUrl(s.baseImage);
            return (
              <button
                key={s.id}
                type="button"
                data-style-id={s.id}
                onClick={() => setSelectedStyleVariantId(s.id)}
                style={{ width: CARD_W, minWidth: CARD_W }}
                className={cn(
                  "snap-start shrink-0 flex flex-col rounded-lg border p-2 text-left transition-colors",
                  active
                    ? "border-primary ring-2 ring-primary/25 bg-primary/5 shadow-sm"
                    : "border-border bg-background/80 hover:bg-muted/50 hover:border-muted-foreground/30"
                )}
              >
                <div className="relative w-full aspect-square rounded-md overflow-hidden border bg-muted/30 mb-1.5">
                  <img src={mockup} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="min-h-0 px-0.5">
                  <div className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
                    {s.title}
                  </div>
                  {s.priceAddon > 0 ? (
                    <div className="text-[10px] text-muted-foreground mt-0.5">+${Number(s.priceAddon).toFixed(2)}</div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground mt-0.5">Included</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Scroll options right"
          onClick={() => scrollByDir(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
