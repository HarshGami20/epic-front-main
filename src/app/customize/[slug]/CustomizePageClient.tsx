"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EditorProvider } from "@/features/pixel-editor/contexts/EditorContext";
import { PhotoEditor } from "@/features/pixel-editor/components/editor/PhotoEditor";
import type { ProductForEditor } from "@/features/pixel-editor/lib/productCustomization";
import { fetchPublicProductBySlug } from "@/lib/publicProductApi";

export default function CustomizePageClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const variant = searchParams.get("variant");
  const [product, setProduct] = useState<ProductForEditor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPublicProductBySlug(slug);
        setProduct((data as ProductForEditor) ?? null);
      } catch (e) {
        console.error(e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 gap-4">
        <p className="text-sm font-medium">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 gap-4 px-4 text-center">
        <p>Product not found.</p>
        <Link href="/shop" className="text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2">
          Back to shop
        </Link>
      </div>
    );
  }

  const c = product.customization;
  const hasSlice =
    !!c &&
    (Boolean(c.baseImage) ||
      Boolean(
        c.variants &&
          Object.values(c.variants).some(
            (v) => v && typeof v === 'object' && Boolean((v as { baseImage?: string }).baseImage)
          )
      ));

  if (!hasSlice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 gap-4 px-4 text-center">
        <p>This product does not have customization data yet.</p>
        <Link
          href={`/products/${slug}`}
          className="text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2"
        >
          Back to product
        </Link>
      </div>
    );
  }

  return (
    <EditorProvider initialProduct={product} initialVariantId={variant}>
      <PhotoEditor />
    </EditorProvider>
  );
}
