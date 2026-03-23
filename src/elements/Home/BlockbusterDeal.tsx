"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { BlockbusterSliderData } from "../../constant/Alldata";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";
import { useEffect, useMemo, useState } from "react";
import type { StaticImageData } from "next/image";

function pickProductImage(p: any): string {
    const imgs = p?.images;
    const thumbs = p?.thumbImage;
    const first =
        (Array.isArray(imgs) && imgs.length && imgs[0]) ||
        (Array.isArray(thumbs) && thumbs.length && thumbs[0]);
    if (!first) return "";
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    return "";
}

function parseMoney(v: unknown): number | undefined {
    if (v == null || v === "") return undefined;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : undefined;
}

/** Match reference: "Up To 79% Off" */
function promoPctOff(pct: number): string {
    const p = Math.min(99, Math.max(1, Math.round(pct)));
    return `Up To ${p}% Off`;
}

type Slide = {
    title: string;
    promoLine: string;
    image: string | StaticImageData;
    href: string;
    price?: number;
    originPrice?: number;
};

const BlockbusterDeal = ({ data }: { data?: any }) => {
    const rawItems = data?.items?.length ? data.items : null;
    const [allProducts, setAllProducts] = useState<any[]>([]);

    useEffect(() => {
        if (!rawItems?.some((i: any) => i?.productSlug)) return;
        const load = async () => {
            try {
                const url = getPublicApiUrl();
                const res = await fetch(`${url}/products?limit=500`);
                const json = await res.json();
                const list = json?.data ?? (Array.isArray(json) ? json : []);
                setAllProducts(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error("BlockbusterDeal: failed to load products", e);
            }
        };
        load();
    }, [rawItems]);

    const items: Slide[] = useMemo(() => {
        if (!rawItems?.length) {
            return BlockbusterSliderData.map((row) => ({
                title: row.title,
                promoLine: promoPctOff(79),
                image: row.image,
                href: "/shop-list",
                price: 80,
                originPrice: 95,
            }));
        }

        const bySlug = Object.fromEntries(
            allProducts.filter((p) => p?.slug).map((p) => [p.slug, p])
        );

        return rawItems
            .map((item: any) => {
                if (item.productSlug && bySlug[item.productSlug]) {
                    const p = bySlug[item.productSlug];
                    const img = pickProductImage(p);
                    const sale = parseMoney(p.price);
                    const orig = parseMoney(p.originPrice);
                    const hasDisc =
                        orig != null &&
                        sale != null &&
                        orig > sale &&
                        orig > 0;
                    let promo = "";
                    if (hasDisc && orig && sale) {
                        const pct = Math.round(((orig - sale) / orig) * 100);
                        promo =
                            pct > 0 ? promoPctOff(pct) : promoPctOff(79);
                    } else {
                        promo =
                            [p.category, p.brand].filter(Boolean).join(" · ") ||
                            "Featured";
                    }
                    return {
                        title: p.name || "Product",
                        promoLine: promo,
                        image: img || "/assets/images/placeholder.jpg",
                        href: `/products/${p.slug}`,
                        price: sale,
                        originPrice: orig,
                    };
                }
                if (item.productSlug) {
                    return {
                        title: item.title || `Product (${item.productSlug})`,
                        promoLine: promoPctOff(79),
                        image: item.image || "/assets/images/placeholder.jpg",
                        href: `/products/${item.productSlug}`,
                        price: parseMoney(item.price),
                        originPrice: parseMoney(item.originPrice),
                    };
                }
                return {
                    title: item.title || "Deal",
                    promoLine: promoPctOff(79),
                    image: item.image,
                    href: "/shop-list",
                    price: parseMoney(item.price) ?? 80,
                    originPrice: parseMoney(item.originPrice),
                };
            })
            .filter((s: Slide) => s.title);
    }, [rawItems, allProducts]);

    return (
        <div className="blockbuster-deal-swiper-outer" style={{ overflow: "visible" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .blockbuster-deal-swiper-outer .swiper.blockbuster-deal-swiper,
                .blockbuster-deal-swiper-outer .blockbuster-deal-swiper .swiper-wrapper,
                .blockbuster-deal-swiper-outer .blockbuster-deal-swiper .swiper-slide {
                    overflow: visible !important;
                }
                .blockbuster-deal-swiper-outer .blockbuster-deal-swiper .swiper-slide {
                    padding: 72px 12px 36px;
                    box-sizing: border-box;
                    height: auto;
                }
                .blockbuster-deal-swiper-outer .blockbuster-deal-swiper .swiper-slide > * {
                    height: 100%;
                }
                .blockbuster-deal-card.shop-card.style-2 {
                    position: relative;
                    z-index: 1;
                    background: linear-gradient(
                        180deg,
                        #fff -30.2%,
                        rgba(255, 255, 255, 0) 92.95%
                    ) !important;
                    filter: drop-shadow(5px -15px 30px rgba(82, 48, 0, 0.13));
                    border-radius: 16px !important;
                    overflow: visible !important;
                    margin-top: 52px;
                    box-shadow: 5px -20px 30px 0 rgba(82, 48, 0, 0.1);
                }
                .blockbuster-deal-card.shop-card.style-2 .dz-media,
                .blockbuster-deal-card.shop-card.style-2 .dz-content {
                    position: relative;
                    z-index: 1;
                }
                .blockbuster-deal-card.shop-card.style-2::after {
                    content: "";
                    position: absolute;
                    left: 6%;
                    right: 6%;
                    bottom: -32px;
                    height: 56px;
                    background: radial-gradient(
                        ellipse 90% 50% at 50% 0%,
                        rgba(82, 48, 0, 0.18) 0%,
                        rgba(82, 48, 0, 0.06) 55%,
                        transparent 78%
                    );
                    filter: blur(28px);
                    z-index: -1;
                    pointer-events: none;
                }
                .blockbuster-deal-card.shop-card.style-2 .dz-media {
                    overflow: visible !important;
                    padding: 16px 18px 0 !important;
                }
                .blockbuster-deal-card.shop-card.style-2 .dz-media img {
                    margin-top: -64px !important;
                    border-radius: 14px;
                }
                .blockbuster-deal-card.shop-card.style-2:hover .dz-media {
                    transform: translateY(-8px);
                }
                .blockbuster-deal-dz-content {
                    position: relative;
                    z-index: 1;
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: flex-end !important;
                    justify-content: space-between !important;
                    gap: 12px 20px;
                    padding: 18px 20px 22px !important;
                }
                .blockbuster-deal-copy {
                    min-width: 0;
                    flex: 1;
                    text-align: left;
                }
                .blockbuster-deal-card .blockbuster-deal-promo {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: #d81b60;
                    text-transform: none;
                    letter-spacing: 0.01em;
                    margin-bottom: 8px;
                    line-height: 1.25;
                }
                .blockbuster-deal-card .blockbuster-deal-title {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    font-weight: 700;
                    font-size: 15px;
                    line-height: 1.3;
                    color: #111;
                    margin: 0;
                    text-transform: capitalize;
                }
                .blockbuster-deal-card .blockbuster-deal-title a {
                    color: inherit;
                    text-decoration: none;
                }
                .blockbuster-deal-card .blockbuster-deal-title a:hover {
                    color: var(--primary);
                }
                .blockbuster-deal-price-col {
                    flex-shrink: 0;
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 2px;
                }
                .blockbuster-deal-price-col .bd-price-current {
                    font-size: 18px;
                    font-weight: 700;
                    color: #111;
                    line-height: 1.05;
                }
                .blockbuster-deal-price-col .bd-price-was {
                    font-size: 12px;
                    font-weight: 500;
                    color: #9aa0a6;
                    text-decoration: line-through;
                }
            `}} />
            <Swiper
                speed={1000}
                loop={items.length > 1}
                parallax={true}
                slidesPerView={4}
                spaceBetween={30}
                watchSlidesProgress={true}
                autoplay={{
                    delay: 2500,
                }}
                modules={[Autoplay]}
                className="swiper-four swiper-visible blockbuster-deal-swiper"
                breakpoints={{
                    1200: { slidesPerView: 4 },
                    1024: { slidesPerView: 4 },
                    991: { slidesPerView: 3 },
                    591: { slidesPerView: 2, spaceBetween: 20 },
                    340: { slidesPerView: 1, spaceBetween: 15 },
                }}
            >
                {items.map((item, i) => {
                    const src =
                        typeof item.image === "string"
                            ? getImageUrl(item.image)
                            : item.image;
                    const sale = item.price;
                    const orig = item.originPrice;
                    const hasDiscount =
                        orig != null && sale != null && orig > sale && orig > 0;
                    const displaySale =
                        sale != null && sale > 0 ? sale : 80;
                    return (
                        <SwiperSlide key={i}>
                            <div className="shop-card style-2 h-100 blockbuster-deal-card">
                                <div className="dz-media about-img">
                                    <Link href={item.href}>
                                        <Image
                                            src={src || "/assets/images/placeholder.jpg"}
                                            alt=""
                                            width={500}
                                            height={500}
                                            className="w-100 object-cover"
                                        />
                                    </Link>
                                </div>
                                <div className="dz-content min-w-0 w-100 blockbuster-deal-dz-content">
                                    <div className="blockbuster-deal-copy">
                                        <span
                                            className="blockbuster-deal-promo"
                                            title={item.promoLine}
                                        >
                                            {item.promoLine}
                                        </span>
                                        <h5 className="blockbuster-deal-title">
                                            <Link
                                                href={item.href}
                                                title={item.title}
                                            >
                                                {item.title}
                                            </Link>
                                        </h5>
                                    </div>
                                    <div className="blockbuster-deal-price-col">
                                        {hasDiscount && sale != null ? (
                                            <>
                                                <span className="bd-price-current">
                                                    ${sale.toFixed(0)}
                                                </span>
                                                <span className="bd-price-was">
                                                    ${orig!.toFixed(0)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="bd-price-current">
                                                ${Number(displaySale).toFixed(0)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default BlockbusterDeal;
