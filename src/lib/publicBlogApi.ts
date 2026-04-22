import { getPublicApiUrl } from "@/lib/env";

export type PublicBlog = {
    id: string;
    category: string;
    tag: string;
    title: string;
    date: string;
    author: string;
    avatar: string;
    thumbImg: string;
    coverImg: string;
    subImg: string[];
    shortDesc: string;
    description: string;
    /** Rich HTML below the additional images section */
    contentBelowImages?: string;
    slug: string;
};

export type BlogPagination = {
    page: number;
    limit: number;
    total: number;
    pages: number;
};

interface PaginatedJson {
    success?: boolean;
    data?: PublicBlog[];
    pagination?: BlogPagination;
}

interface SuccessJson<T> {
    success?: boolean;
    data?: T;
}

function apiBase(): string {
    return getPublicApiUrl();
}

export async function fetchPublicBlogs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
}): Promise<{ data: PublicBlog[]; pagination: BlogPagination | null }> {
    const search = new URLSearchParams();
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.category?.trim()) search.set("category", params.category.trim());
    if (params?.tag?.trim()) search.set("tag", params.tag.trim());
    if (params?.search?.trim()) search.set("search", params.search.trim());

    const qs = search.toString();
    const url = `${apiBase()}/public/blogs${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { data: [], pagination: null };
    const json = (await res.json()) as PaginatedJson;
    if (!json.success || !Array.isArray(json.data)) return { data: [], pagination: json.pagination ?? null };
    return { data: json.data, pagination: json.pagination ?? null };
}

export async function fetchPublicBlogBySlug(slug: string): Promise<PublicBlog | null> {
    const res = await fetch(`${apiBase()}/public/blogs/slug/${encodeURIComponent(slug)}`, {
        cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as SuccessJson<PublicBlog>;
    if (!json.success || !json.data) return null;
    return json.data;
}

export async function fetchPublicBlogCategories(): Promise<string[]> {
    const res = await fetch(`${apiBase()}/public/blogs/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as SuccessJson<string[]>;
    if (!json.success || !Array.isArray(json.data)) return [];
    return json.data;
}

export async function fetchPublicBlogTags(): Promise<string[]> {
    const res = await fetch(`${apiBase()}/public/blogs/tags`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as SuccessJson<string[]>;
    if (!json.success || !Array.isArray(json.data)) return [];
    return json.data;
}
