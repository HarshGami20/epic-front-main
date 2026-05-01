import { getPublicApiUrl } from "@/lib/env";
import { normalizePublicProductRecord } from "@/lib/publicProductNormalize";

/**
 * Fetches a single product from the public detail API (full record, not list projection).
 * GET /api/public/products/slug/:slug
 */
export async function fetchPublicProductBySlug(slug: string): Promise<any | null> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/public/products/slug/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success?: boolean; data?: unknown };
  if (!json.success || json.data == null) return null;
  return normalizePublicProductRecord(json.data);
}

export async function fetchPublicProducts(params: { limit?: number; category?: string } = {}): Promise<any[]> {
  const base = getPublicApiUrl();
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.category) query.set("category", params.category);

  const res = await fetch(`${base}/products?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  const products = json.data || json.products || [];
  return Array.isArray(products) ? products.map(normalizePublicProductRecord) : [];
}
