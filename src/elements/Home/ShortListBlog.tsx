"use client";

import { useEffect, useMemo, useState } from "react";
import type { StaticImageData } from "next/image";
import SaleDiscountShopCard from "../../components/SaleDiscountShopCard";
import { GreatSavindData } from "../../constant/Alldata";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";

function blogHref(slug: string) {
    return `/blog/${encodeURIComponent(slug)}`;
}

type CardRow =
    | {
          kind: "blog";
          image: string | StaticImageData;
          name: string;
          subtitle: string;
          link: string;
      }
    | {
          kind: "product";
          image: any;
          name: string;
          star?: string;
      };

const ShortListBlog = ({ data }: { data?: any }) => {
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
                console.error("ShortListBlog: failed to load blogs", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [rawItems]);

    const cards: CardRow[] = useMemo(() => {
        if (!rawItems?.length) {
            return GreatSavindData.map((item) => ({
                kind: "product" as const,
                image: item.image,
                name: item.name,
                star: item.star,
            }));
        }

        const bySlug = Object.fromEntries(
            allBlogs.filter((b) => b?.slug).map((b) => [b.slug, b])
        );

        return rawItems.map((item: any): CardRow => {
            if (item.blogSlug && bySlug[item.blogSlug]) {
                const b = bySlug[item.blogSlug];
                const rawImg = b.thumbImg || b.coverImg || "";
                let img: string | StaticImageData;
                if (typeof rawImg === "string") {
                    img = getImageUrl(rawImg) as string;
                } else if (rawImg && typeof rawImg === "object") {
                    img = rawImg as StaticImageData;
                } else {
                    img = "/assets/images/default.jpg";
                }
                const categoryOnly =
                    typeof b.category === "string" ? b.category.trim() : "";
                return {
                    kind: "blog",
                    image: img,
                    name: b.title || "Blog",
                    subtitle: categoryOnly,
                    link: blogHref(b.slug),
                };
            }
            if (item.blogSlug) {
                const fallback = item.image
                    ? typeof item.image === "string"
                        ? (getImageUrl(item.image) as string)
                        : item.image
                    : "/assets/images/default.jpg";
                return {
                    kind: "blog",
                    image: fallback,
                    name: item.title || `Blog (${item.blogSlug})`,
                    subtitle: "",
                    link: blogHref(item.blogSlug),
                };
            }
            return {
                kind: "product",
                image: item.image,
                name: item.title || item.name || "Item",
                star: item.star,
            };
        });
    }, [rawItems, allBlogs]);

    const needsBlogData = !!rawItems?.some((i: any) => i?.blogSlug);

    if (needsBlogData && loading) {
        return (
            <div className="row">
                <div className="col-12 d-flex justify-content-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading blogs…</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="row">
            {cards.map((card, ind) => (
                <div className="col-lg-6 col-md-6 col-sm-6 m-b30" key={ind}>
                    {card.kind === "blog" ? (
                        <SaleDiscountShopCard
                            image={card.image}
                            name={card.name}
                            subtitle={card.subtitle}
                            link={card.link}
                            showPrice={false}
                            isBlogCard
                        />
                    ) : (
                        <SaleDiscountShopCard
                            image={card.image}
                            name={card.name}
                            star={card.star}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ShortListBlog;
