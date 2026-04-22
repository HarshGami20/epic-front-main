"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import CommanBanner from "@/components/CommanBanner";
import CommanLayout from "@/components/CommanLayout";
import IMAGES from "@/constant/theme";
import { getImageUrl } from "@/lib/imageUtils";
import {
    fetchPublicBlogs,
    fetchPublicBlogCategories,
    fetchPublicBlogTags,
    type PublicBlog,
} from "@/lib/publicBlogApi";

const PAGE_SIZE = 9;

function stripHtml(html: string) {
    if (!html || typeof html !== "string") return "";
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatShortDate(input?: string) {
    if (!input || typeof input !== "string") return "";
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) return input;
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(parsed);
}

export default function BlogListClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [blogs, setBlogs] = useState<PublicBlog[]>([]);
    const [pagination, setPagination] = useState<{ page: number; pages: number; total: number } | null>(
        null
    );
    const [categories, setCategories] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const category = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";
    const search = searchParams.get("search") || "";

    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data, pagination: pag } = await fetchPublicBlogs({
                page,
                limit: PAGE_SIZE,
                category: category || undefined,
                tag: tag || undefined,
                search: search || undefined,
            });
            setBlogs(data);
            setPagination(pag ? { page: pag.page, pages: pag.pages, total: pag.total } : null);
        } finally {
            setLoading(false);
        }
    }, [page, category, tag, search]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        (async () => {
            const [c, t] = await Promise.all([fetchPublicBlogCategories(), fetchPublicBlogTags()]);
            setCategories(c);
            setTags(t);
        })();
    }, []);

    const setQuery = (next: Record<string, string | undefined>) => {
        const p = new URLSearchParams(searchParams.toString());
        Object.entries(next).forEach(([k, v]) => {
            if (v === undefined || v === "") p.delete(k);
            else p.set(k, v);
        });
        if (next.page === undefined && (next.category !== undefined || next.tag !== undefined || next.search !== undefined))
            p.set("page", "1");
        router.push(`/blog?${p.toString()}`);
    };

    const hrefWithPage = (newPage: number) => {
        const p = new URLSearchParams(searchParams.toString());
        p.set("page", String(newPage));
        return `/blog?${p.toString()}`;
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const p = new URLSearchParams(searchParams.toString());
        if (searchInput.trim()) p.set("search", searchInput.trim());
        else p.delete("search");
        p.set("page", "1");
        router.push(`/blog?${p.toString()}`);
    };

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner
                    parentText="Home"
                    mainText="Blog"
                    currentText="Blog"
                    image={IMAGES.BackBg1.src}
                />
                <section className="content-inner-1 z-index-unset pb-3">
                    <div className="container">
                        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-end mb-4">
                            <div className="col-md-4 col-lg-3">
                                <label className="form-label small text-muted mb-1">Category</label>
                                <select
                                    className="form-select"
                                    value={category}
                                    onChange={(e) =>
                                        setQuery({ category: e.target.value || undefined, page: "1" })
                                    }
                                >
                                    <option value="">All categories</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 col-lg-3">
                                <label className="form-label small text-muted mb-1">Tag</label>
                                <select
                                    className="form-select"
                                    value={tag}
                                    onChange={(e) =>
                                        setQuery({ tag: e.target.value || undefined, page: "1" })
                                    }
                                >
                                    <option value="">All tags</option>
                                    {tags.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 col-lg-4">
                                <label className="form-label small text-muted mb-1">Search</label>
                                <input
                                    type="search"
                                    className=" form-select  w-100 "
                                    // style={{
                                    //     backgroundColor: "#fffaf3",
                                    //     borderColor: "#ced4da",
                                    //     color: "#5e626f",
                                    //     fontSize: "16px",
                                    //     fontWeight: "400",
                                    //     lineHeight: "1.234",
                                    //     borderRadius: "20px"
                                    // }}
                                    placeholder="Search posts…"
                                    value={searchInput}

                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <div className="col-md-12 col-lg-2">
                                <button type="submit" className="btn btn-secondary w-100">
                                    Search
                                </button>
                            </div>
                        </form>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading…</span>
                                </div>
                            </div>
                        ) : blogs.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p className="mb-0">No blog posts found.</p>
                                {(category || tag || search) && (
                                    <Link href="/blog" className="btn btn-link">
                                        Clear filters
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="row">
                                    <div className="col-xl-12">
                                        <div className="row">
                                            {blogs.map((elem, ind) => {
                                                const img = elem.thumbImg || elem.coverImg || "";
                                                const src = img ? getImageUrl(img) : IMAGES.BlogGridPic1;
                                                const excerpt = stripHtml(elem.shortDesc || "").slice(0, 120);
                                                const delay = `${0.1 + (ind % 9) * 0.08}s`;
                                                const formattedDate = formatShortDate(elem.date);
                                                return (
                                                    <div
                                                        className="col-lg-4 col-md-6 col-sm-6 m-b30 wow fadeInUp"
                                                        data-wow-delay={delay}
                                                        key={elem.id}
                                                    >
                                                        <div className="dz-card style-5">
                                                            <div
                                                                className="dz-media position-relative overflow-hidden"
                                                                style={{ aspectRatio: "3 / 2" }}
                                                            >
                                                                <img
                                                                    src={src}
                                                                    alt={elem.title}
                                                                    
                                                                    className="object-cover "
                                                                    sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
                                                                />
                                                            </div>
                                                            <div className="dz-info">
                                                                
                                                                <h4 className="dz-title">
                                                                    <Link
                                                                        className="text-white"
                                                                        href={`/blog/${encodeURIComponent(elem.slug)}`}
                                                                        style={{
                                                                            display: "-webkit-box",
                                                                            WebkitLineClamp: 1,
                                                                            WebkitBoxOrient: "vertical",
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                        }}
                                                                    >
                                                                        {elem.title}
                                                                    </Link>
                                                                </h4>
                                                                {excerpt ? (
                                                                    <p className="font-14 text-white-50 mb-3" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" , lineHeight: 1.234 }}>
                                                                        {excerpt}
                                                                        …
                                                                    </p>
                                                                ) : null}
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                   
                                                                    <div className="dz-meta m-0">
                                                                        <ul>
                                                                            <li className="post-date m-0">
                                                                                {formattedDate || elem.date}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                    <Link
                                                                        href={`/blog/${encodeURIComponent(elem.slug)}`}
                                                                        className="font-14 mt-auto read-btn"
                                                                        >
                                                                        Read More
                                                                        <i className="icon feather icon-chevron-right" />
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                {pagination && pagination.total > 0 ? (
                                    <p className="text-center text-muted small mb-3">
                                        {pagination.total} post{pagination.total === 1 ? "" : "s"}
                                        {pagination.pages > 1
                                            ? ` · Page ${pagination.page} of ${pagination.pages}`
                                            : ""}
                                    </p>
                                ) : null}
                                {pagination && pagination.pages > 1 ? (
                                    <nav className="d-flex justify-content-center gap-2 flex-wrap mt-2" aria-label="Blog pagination">
                                        {page > 1 ? (
                                            <Link href={hrefWithPage(page - 1)} className="btn btn-outline-secondary btn-sm">
                                                Previous
                                            </Link>
                                        ) : (
                                            <span className="btn btn-outline-secondary btn-sm disabled">Previous</span>
                                        )}
                                        {page < pagination.pages ? (
                                            <Link href={hrefWithPage(page + 1)} className="btn btn-outline-secondary btn-sm">
                                                Next
                                            </Link>
                                        ) : (
                                            <span className="btn btn-outline-secondary btn-sm disabled">Next</span>
                                        )}
                                    </nav>
                                ) : null}
                            </>
                        )}
                    </div>
                </section>
            </div>
        </CommanLayout>
    );
}
