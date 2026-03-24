"use client";

import Link from "next/link";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FeaturedSliderData } from "../../constant/Alldata";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";
import { useEffect, useMemo, useState } from "react";
import type { StaticImageData } from "next/image";

function flattenCategories(cats: any[]): any[] {
    const out: any[] = [];
    for (const c of cats || []) {
        if (!c) continue;
        out.push(c);
        if (Array.isArray(c.children) && c.children.length) {
            out.push(...flattenCategories(c.children));
        }
    }
    return out;
}

type SlideItem = {
    name: string;
    image: string | StaticImageData;
    link: string;
};

const FeaturedCategorySlider = ({ data }: { data?: any }) => {
    const raw = data?.categories?.length ? data.categories : null;
    const needsResolve = !!raw?.some((c: any) => c?.categorySlug);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(needsResolve);

    useEffect(() => {
        if (!needsResolve) {
            setLoading(false);
            return;
        }
        const load = async () => {
            try {
                const base = getPublicApiUrl();
                const res = await fetch(`${base}/public/categories`);
                const json = await res.json();
                const list = json?.data ?? [];
                const flat = Array.isArray(list) ? flattenCategories(list) : [];
                setAllCategories(flat);
            } catch (e) {
                console.error("FeaturedCategorySlider: categories fetch failed", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [needsResolve, raw?.length]);

    const categories: SlideItem[] = useMemo(() => {
        if (!raw?.length) {
            return FeaturedSliderData.map((item) => ({
                name: item.name,
                image: item.image,
                link: "/shop-with-category",
            }));
        }

        const bySlug = Object.fromEntries(
            allCategories.filter((c) => c?.slug).map((c) => [c.slug, c])
        );

        return raw
            .map((item: any) => {
                if (item.categorySlug && bySlug[item.categorySlug]) {
                    const c = bySlug[item.categorySlug];
                    return {
                        name: c.name,
                        image: c.image || "",
                        link: `/shop?category=${encodeURIComponent(c.name)}`,
                    };
                }
                if (item.categorySlug) {
                    return {
                        name: item.name || item.categorySlug,
                        image: item.image || "",
                        link: `/shop?category=${encodeURIComponent(item.name || item.categorySlug)}`,
                    };
                }
                return {
                    name: item.name || "Category",
                    image: item.image,
                    link: item.link || "/shop-with-category",
                };
            })
            .filter((x: any) => x.name);
    }, [raw, allCategories]);

    const slides = loading && needsResolve ? [] : categories;

    return (
        <Swiper
            slidesPerView={5}
            spaceBetween={15}
            loop={slides.length > 1}
            navigation={{
                nextEl: ".shop-button-next",
                prevEl: ".shop-button-prev",
            }}
            className="swiper-shop"
            modules={[Navigation]}
            breakpoints={{
                1600: { slidesPerView: 5 },
                1400: { slidesPerView: 4 },
                991: { slidesPerView: 3 },
                767: { slidesPerView: 3 },
                575: { slidesPerView: 2 },
                340: { slidesPerView: 2 },
            }}
        >
            {slides.length === 0 && loading ? (
                <SwiperSlide>
                    <div className="shop-box style-1 p-4 text-muted">Loading categories…</div>
                </SwiperSlide>
            ) : (
                slides.map((item, ind) => {
                    const src =
                        typeof item.image === "string"
                            ? item.image
                                ? getImageUrl(item.image)
                                : "/assets/images/placeholder.jpg"
                            : item.image;
                    return (
                        <SwiperSlide key={ind}>
                            <div
                                className="shop-box style-1 wow fadeInUp"
                                data-wow-delay="0.2s"
                            >
                                <div className="dz-media">
                                    <Link href={item.link}>
                                        <img
                                            src={src}
                                            alt=""
                                            width={300}
                                            height={300}
                                            className="w-100 object-cover"
                                        />
                                    </Link>
                                </div>
                                <h6 className="product-name">
                                    <Link href={item.link}>{item.name}</Link>
                                </h6>
                            </div>
                        </SwiperSlide>
                    );
                })
            )}
        </Swiper>
    );
};

export default FeaturedCategorySlider;
