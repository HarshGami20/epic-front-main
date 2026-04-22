import { getPublicApiUrl } from "@/lib/env";

export interface PublicCmsPage {
  id?: string;
  title?: string;
  slug?: string;
  content?: Record<string, unknown> | null;
  published?: boolean;
}

interface CmsResponse {
  success?: boolean;
  data?: PublicCmsPage;
}

export async function fetchPublicCmsPageBySlug(slug: string): Promise<PublicCmsPage | null> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/cms/slug/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as CmsResponse | PublicCmsPage;
  if ("data" in json) {
    if (!json.success || !json.data) return null;
    return json.data;
  }
  return (json as PublicCmsPage) ?? null;
}

export async function fetchPublicAboutUsPage(): Promise<PublicCmsPage | null> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/public/about-us`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as CmsResponse | PublicCmsPage;
  if ("data" in json) {
    if (!json.success || !json.data) return null;
    return json.data;
  }
  return (json as PublicCmsPage) ?? null;
}
