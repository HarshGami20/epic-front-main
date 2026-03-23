"use client";

import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { SVGICON } from "../../constant/theme";
import { TradingSliderBlogdata } from "../../constant/Alldata";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";

function blogHref(slug: string) {
    return `/post-left-sidebar?slug=${encodeURIComponent(slug)}`;
}

function formatPostDate(iso?: string) {
    if (!iso || typeof iso !== "string") return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const TradingSliderBlog = ({ data }: { data?: any }) => {
    const rawItems = data?.items?.length ? data.items : null;
    const [allBlogs, setAllBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(!!rawItems?.some((i: any) => i?.blogSlug));

    useEffect(() => {
        const needs = rawItems?.some((i: any) => i?.blogSlug);
        if (!needs) {
            setLoading(false);
            return;
        }
        const load = async () => {
            try {
                const base = getPublicApiUrl();
                const res = await fetch(`${base}/public/blogs?limit=300`);
                const json = await res.json();
                const list = json?.data ?? [];
                setAllBlogs(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error("TradingSliderBlog: failed to load blogs", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [rawItems]);

    const items = useMemo(() => {
        if (!rawItems?.length) {
            return TradingSliderBlogdata.map((row) => ({
                image: typeof row.image === "string" ? row.image : (row.image as { src: string }).src,
                title: row.name,
                date: row.date,
                href: "/blog-grid",
            }));
        }

        const bySlug = Object.fromEntries(
            allBlogs.filter((b) => b?.slug).map((b) => [b.slug, b])
        );

        return rawItems.map((item: any) => {
            if (item.blogSlug && bySlug[item.blogSlug]) {
                const b = bySlug[item.blogSlug];
                const rawImg = b.thumbImg || b.coverImg || "";
                const resolved = typeof rawImg === "string" ? getImageUrl(rawImg) : rawImg;
                const imageStr =
                    typeof resolved === "string"
                        ? resolved
                        : resolved && typeof resolved === "object" && "src" in resolved
                          ? (resolved as { src: string }).src
                          : "/assets/images/placeholder.jpg";
                return {
                    image: imageStr,
                    title: b.title || "Blog",
                    date: formatPostDate(b.date) || "",
                    href: blogHref(b.slug),
                };
            }
            if (item.blogSlug) {
                const r = item.image ? getImageUrl(item.image) : "/assets/images/placeholder.jpg";
                const imgFallback =
                    typeof r === "string" ? r : (r as { src?: string })?.src || "/assets/images/placeholder.jpg";
                return {
                    image: imgFallback,
                    title: item.title || `Blog (${item.blogSlug})`,
                    date: item.date || "",
                    href: blogHref(item.blogSlug),
                };
            }
            const r = item.image ? getImageUrl(item.image) : "/assets/images/placeholder.jpg";
            const img =
                typeof r === "string" ? r : (r as { src?: string })?.src || "/assets/images/placeholder.jpg";
            return {
                image: img,
                title: item.title || item.name || "Post",
                date: item.date || "",
                href: item.href || "/blog-grid",
            };
        });
    }, [rawItems, allBlogs]);

    const loop = items.length > 5;
    const needsBlogData = !!rawItems?.some((i: any) => i?.blogSlug);

    if (needsBlogData && loading) {
        return (
            <div className="container">
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading…</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Swiper
            slidesPerView={4.5}
            spaceBetween={30}
            loop={loop}
            speed={1000}
            breakpoints={{
                1600: { slidesPerView: 4.5 },
                1400: { slidesPerView: 3.5 },
                1024: { slidesPerView: 2.5 },
                991: { slidesPerView: 2 },
                767: { slidesPerView: 1.5, spaceBetween: 15, centeredSlides: true },
                575: { slidesPerView: 1.5, spaceBetween: 15, centeredSlides: true },
                300: { slidesPerView: 1.2, spaceBetween: 15 },
            }}
            className="swiper swiper-blog-post"
        >
            {items.map((item: any, ind: number) => (
                <SwiperSlide key={ind}>
                    <div className="dz-card style-2">
                        <div className="dz-media">
                            <Link href={item.href}>
                                <Image
                                    src={item.image}
                                    alt=""
                                    width={500}
                                    height={500}
                                    className="w-100 object-cover"
                                />
                            </Link>
                            <div className="post-date">{item.date || "—"}</div>
                        </div>
                        <div className="dz-info">
                            <h4
                                className="dz-title mb-0"
                                style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical" as const,
                                    overflow: "hidden",
                                    wordBreak: "break-word",
                                    lineHeight: 1.35,
                                    maxHeight: "4.05em",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                <Link href={item.href} title={item.title}>
                                    {item.title}
                                </Link>
                            </h4>
                            <ul className="blog-social">
                                <li>
                                    <Link href="#" className="share-btn" onClick={(e) => e.preventDefault()} dangerouslySetInnerHTML={{ __html: SVGICON.ArrowUp15Degree }} />
                                    <ul className="sub-team-social">
                                        <li>
                                            <Link href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-facebook-f" />
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-twitter" />
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-instagram" />
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
                                                <i className="fa-brands fa-linkedin-in" />
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default TradingSliderBlog;
