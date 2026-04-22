"use client";

import Link from "next/link";
import IMAGES, { SVGICON } from "../../constant/theme";
import HottestSliderBlog, { type HottestBlogCardItem } from "./HottestSliderBlog";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";
import { useEffect, useMemo, useState } from "react";

const hottestBlogMap = [
    { image: IMAGES.productmedium3, title: "Cozy Knit Cardigan Sweater", design: "area-box1" },
    { image: IMAGES.productmedium4, title: "Sophisticated Swagger Suit", design: "area-box2" },
    { image: IMAGES.productmedium5, title: "Classic Denim Skinny Jeans", design: "area-box3" },
];

function stripHtml(html: string) {
    if (!html || typeof html !== "string") return "";
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function blogHref(slug: string) {
    return `/blog/${encodeURIComponent(slug)}`;
}

const HottestBlog = ({ data }: { data?: any }) => {
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
                console.error("HottestBlog: failed to load blogs", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [rawItems]);

    const resolvedItems: HottestBlogCardItem[] & { design?: string }[] = useMemo(() => {
        if (!rawItems?.length) {
            return hottestBlogMap.map((m) => ({
                image: typeof m.image === "string" ? m.image : (m.image as { src: string }).src,
                title: m.title,
                description: "up to 79% off",
                href: "/blog",
                design: m.design,
            }));
        }

        const bySlug = Object.fromEntries(
            allBlogs.filter((b) => b?.slug).map((b) => [b.slug, b])
        );

        return rawItems.map((item: any, i: number) => {
            const design = item.design || `area-box${(i % 3) + 1}`;
            if (item.blogSlug && bySlug[item.blogSlug]) {
                const b = bySlug[item.blogSlug];
                const img = b.thumbImg || b.coverImg || "";
                const short = stripHtml(b.shortDesc || "").slice(0, 72);
                return {
                    image: img,
                    title: b.title || "Blog",
                    description: short || b.category || "Read more",
                    href: blogHref(b.slug),
                    design,
                };
            }
            if (item.blogSlug) {
                return {
                    image: item.image || "",
                    title: item.title || `Blog (${item.blogSlug})`,
                    description: stripHtml(item.description || "").slice(0, 72) || "Read more",
                    href: blogHref(item.blogSlug),
                    design,
                };
            }
            return {
                image: item.image || "",
                title: item.title || item.name || "Item",
                description: stripHtml(item.description || "").slice(0, 72) || "up to 79% off",
                href: item.link || "/blog",
                design,
            };
        });
    }, [rawItems, allBlogs]);

    /**
     * Map: always exactly 3 pins. Slot i → CSS class area-box(i+1) only (fixed positions).
     * CMS "design" must not move multiple pins onto the same coordinates.
     */
    const needsBlogData = !!rawItems?.some((i: any) => i?.blogSlug);
    const mapSlots = [1, 2, 3] as const;
    const topThree = resolvedItems.slice(0, 3);

    const mapItemsForMap = mapSlots.map((slot, i) => {
        const positionClass = `area-box${slot}`;
        if (needsBlogData && loading) {
            const m = hottestBlogMap[i];
            return {
                positionClass,
                image: typeof m.image === "string" ? m.image : (m.image as { src: string }).src,
                title: "…",
                description: "Loading",
                href: "/blog",
                isPlaceholder: true,
            };
        }
        const item = topThree[i];
        if (item) {
            return {
                positionClass,
                image: item.image,
                title: item.title,
                description: item.description,
                href: item.href || "/blog",
                isPlaceholder: false,
            };
        }
        const m = hottestBlogMap[i];
        return {
            positionClass,
            image: typeof m.image === "string" ? m.image : (m.image as { src: string }).src,
            title: m.title,
            description: "up to 79% off",
            href: "/blog",
            isPlaceholder: false,
        };
    });

    const sliderItems = resolvedItems;

    return (
        <div className="row align-items-start">
            <div className="col-xl-7 col-lg-12 col-md-12">
                <div className="map-area">
                    <Image src={IMAGES.map2} alt="" className="map-area__base-img" priority />
                    <div className="map-line" id="map-line">
                        <Image src={IMAGES.mapline} alt="" />
                    </div>
                    <div
                        className="loction-b"
                        dangerouslySetInnerHTML={{ __html: SVGICON.locationSvgB }}
                    />
                    <div
                        className="loction-center"
                        dangerouslySetInnerHTML={{ __html: SVGICON.KiloMeterSvg }}
                    />
                    <div
                        className="loction-a"
                        dangerouslySetInnerHTML={{ __html: SVGICON.locationSvgA }}
                    />
                    {mapItemsForMap.map((pin, i) => (
                        <div className={`${pin.positionClass} animated hottest-blog-map-pin`} key={i}>
                            <div className={`shop-card style-7 ${pin.isPlaceholder ? "opacity-75" : ""}`}>
                                <div className="dz-media hottest-blog-map-pin__media">
                                    <Link href={pin.href}>
                                        <Image
                                            src={
                                                pin.image
                                                    ? getImageUrl(pin.image)
                                                    : "/assets/images/placeholder.jpg"
                                            }
                                            alt=""
                                            width={200}
                                            height={120}
                                            className="object-cover w-100"
                                            style={{ maxHeight: 100, width: "100%", objectFit: "cover" }}
                                        />
                                    </Link>
                                </div>
                                <div className="dz-content hottest-blog-card-text overflow-hidden">
                                    <h5 className="title mb-0">
                                        <Link
                                            href={pin.href}
                                            className="d-block text-truncate"
                                            title={pin.title}
                                        >
                                            {pin.title}
                                        </Link>
                                    </h5>
                                    <span
                                        className="sale-title d-block text-truncate"
                                        title={pin.description || "Read more"}
                                    >
                                        {pin.description || "Read more"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-xl-5 col-lg-12 col-md-12 custom-width">
                <div className="section-head style-1 d-lg-flex align-items-end justify-content-between">
                    <div className="left-content">
                        <h2 className="title">
                            {data?.title || "Discovering the Hottest Nearby Destinations in Your Area"}
                        </h2>
                        <p className="text-capitalize text-secondary m-0">
                            {data?.subtitle || "Up to 60% off + up to $107 cashBACK"}
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="text-secondary font-14 d-flex align-items-center gap-1 m-b15"
                    >
                        See All
                        <i className="icon feather icon-chevron-right font-18" />
                    </Link>
                </div>
                <HottestSliderBlog items={sliderItems} data={data} />
            </div>
        </div>
    );
};

export default HottestBlog;
