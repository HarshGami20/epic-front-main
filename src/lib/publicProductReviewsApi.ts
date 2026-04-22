import { getPublicApiUrl } from "@/lib/env";

export type PublicProductReview = {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
};

export type PublicProductReviewsSummary = {
  averageRating: number;
  totalCount: number;
  /** Percentages for 5★ … 1★ (indices 0–4). */
  histogram: number[];
};

export type PublicProductReviewsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type PublicProductReviewsPayload = {
  reviews: PublicProductReview[];
  pagination: PublicProductReviewsPagination;
  summary: PublicProductReviewsSummary;
};

type ReviewsJson = {
  success?: boolean;
  data?: PublicProductReviewsPayload;
  message?: string;
};

export async function fetchPublicProductReviews(
  slug: string,
  params?: { sort?: "top" | "recent"; page?: number; limit?: number }
): Promise<PublicProductReviewsPayload | null> {
  if (!slug?.trim()) return null;
  const base = getPublicApiUrl();
  const q = new URLSearchParams();
  if (params?.sort) q.set("sort", params.sort);
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.limit != null) q.set("limit", String(params.limit));
  const qs = q.toString();
  const url = `${base}/public/products/slug/${encodeURIComponent(slug.trim())}/reviews${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as ReviewsJson;
  if (!res.ok || !json.success || !json.data) return null;
  return json.data;
}

export type CreateProductReviewInput = {
  authorName: string;
  authorEmail: string;
  rating: number;
  title: string;
  body: string;
  /** Up to 6 absolute URLs (e.g. after upload to your CDN). */
  images?: string[];
};

export async function createPublicProductReview(
  slug: string,
  input: CreateProductReviewInput
): Promise<{ id: string; createdAt: string } | null> {
  if (!slug?.trim()) return null;
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/public/products/slug/${encodeURIComponent(slug.trim())}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      rating: input.rating,
      title: input.title,
      body: input.body,
      images: input.images?.length ? input.images.slice(0, 6) : [],
    }),
  });
  const json = (await res.json()) as { success?: boolean; data?: { id: string; createdAt: string }; message?: string };
  if (!res.ok) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  if (!json.success || !json.data) return null;
  return json.data;
}
