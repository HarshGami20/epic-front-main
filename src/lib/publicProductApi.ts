import { getPublicApiUrl } from "@/lib/env";
import { normalizePublicProductRecord } from "@/lib/publicProductNormalize";

/**
 * Fetches a single product from the public detail API (full record, not list projection).
 * GET /api/public/products/slug/:slug
 */
export async function fetchPublicProductBySlug(slug: string): Promise<unknown | null> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/public/products/slug/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success?: boolean; data?: unknown };
  if (!json.success || json.data == null) return null;
  return normalizePublicProductRecord(json.data);
}
