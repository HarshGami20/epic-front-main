"use client";

import IMAGES, { SVGICON } from "../../constant/theme";
import Link from "next/link";
import ProductRollup from "../../components/ProductRollup";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";
import { useEffect, useMemo, useState } from "react";

const singleProductData = [
    { name: "Cozy Knit Cardigan Sweater", image: IMAGES.ShopPorductPng1 },
    { name: "Sophisticated Swagger Suit", image: IMAGES.ShopPorductPng2 },
    { name: "Classic Denim Skinny Jeans", image: IMAGES.ShopPorductPng3 },
];

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

function stripHtml(html: string) {
    if (!html || typeof html !== "string") return "";
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export type ResolvedProductionItem = {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    /** Current / sale price */
    price?: number;
    /** Original (list) price when on sale */
    originPrice?: number;
    slug?: string;
};

function parseMoney(v: unknown): number | undefined {
    if (v == null || v === "") return undefined;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : undefined;
}

const AllProduction = ({ data }: { data?: any }) => {
    const rawItems = data?.items?.length ? data.items : null;
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(!!rawItems?.some((i: any) => i?.productSlug));

    useEffect(() => {
        const needsProducts = rawItems?.some((i: any) => i?.productSlug);
        if (!needsProducts) {
            setLoading(false);
            return;
        }
        const load = async () => {
            try {
                const url = getPublicApiUrl();
                const response = await fetch(`${url}/products?limit=500`);
                const json = await response.json();
                const list = json?.data ?? (Array.isArray(json) ? json : []);
                setAllProducts(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error("AllProduction: failed to load products", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [rawItems]);

    const items: ResolvedProductionItem[] = useMemo(() => {
        if (!rawItems?.length) {
            return singleProductData.map((p) => ({
                title: p.name,
                subtitle: "",
                description: "",
                image: typeof p.image === "string" ? p.image : "",
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
                    const price = parseMoney(p.price);
                    const origin = parseMoney(p.originPrice);
                    return {
                        title: p.name || item.title || "Product",
                        subtitle: [p.category, p.brand].filter(Boolean).join(" · ") || "",
                        description: stripHtml(p.description || ""),
                        image: img,
                        price,
                        originPrice: origin,
                        slug: p.slug,
                    };
                }
                if (item.productSlug) {
                    return {
                        title: item.title || `Product (${item.productSlug})`,
                        subtitle: "",
                        description: stripHtml(item.description || ""),
                        image: item.image || "",
                        price: parseMoney(item.price),
                        originPrice: parseMoney(item.originPrice),
                        slug: item.productSlug,
                    };
                }
                return {
                    title: item.title || item.name || "Item",
                    subtitle: item.subtitle || "",
                    description: stripHtml(item.description || ""),
                    image: item.image || "",
                    price: parseMoney(item.price),
                    originPrice: parseMoney(item.originPrice),
                    slug: item.link,
                };
            })
            .filter((it: ResolvedProductionItem) => it.title);
    }, [rawItems, allProducts]);

    const mainSrc = data?.mainImage ? getImageUrl(data.mainImage) : IMAGES.AboutPic3;
    const sectionTitle = data?.title || "Users Who Viewed This Also Checked Out These Similar Profiles";
    const sectionSubtitle = data?.subtitle || "";
    const sectionDescription = data?.description || "";

    return (
        <div className="row align-items-xl-center align-items-start">
            <div className=" col-lg-5 col-md-12 m-b30 align-self-center">
                <div className="dz-media style-1 img-ho1">
                    <Image
                        src={mainSrc}
                        alt={sectionTitle}
                        width={500}
                        height={500}
                        className="w-100 object-cover"
                    />
                </div>
            </div>
            <div className="col-lg-7 col-md-12 col-sm-12">
                <div className="row justify-content-between align-items-center">
                    <div className="col-lg-8 col-md-8 col-sm-12">
                        <div className="section-head style-1">
                            <div className="left-content">
                                {sectionSubtitle ? (
                                    <span className="sub-title d-block m-b10">{sectionSubtitle}</span>
                                ) : null}
                                <h2 className="title">{sectionTitle}</h2>
                                {sectionDescription ? (
                                    <p className="text m-t15 m-b0 wow fadeInUp" data-wow-delay="0.2s">
                                        {sectionDescription}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-12 text-md-end">
                        <Link href="/shop" className="icon-button d-md-block d-none ms-md-auto m-b30">
                            <div className="text-row word-rotate-box c-black">
                                <ProductRollup />
                                <svg
                                    className="badge__emoji"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="40"
                                    height="40"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    dangerouslySetInnerHTML={{ __html: SVGICON.ArrowRightSvg }}
                                />
                            </div>
                        </Link>
                    </div>
                </div>
                {loading ? (
                    <div className="text-center py-5 w-100">Loading products…</div>
                ) : (
                    <div className="row">
                        {items.map((item, ind) => {
                            const imgSrc = item.image ? getImageUrl(item.image) : IMAGES.ShopPorductPng1;
                            const href = item.slug ? `/products/${item.slug}` : "/shop-list";
                            return (
                                <div className="col-lg-4 col-md-4 col-sm-6 m-b15" key={ind}>
                                    <div className="shop-card style-5">
                                        <div className="dz-media">
                                            <Link href={href}>
                                                <Image
                                                    src={imgSrc}
                                                    alt={item.title}
                                                    width={300}
                                                    height={300}
                                                    className="w-100 object-cover"
                                                />
                                            </Link>
                                        </div>
                                        <div className="dz-content">
                                            <div>
                                                {item.subtitle ? (
                                                    <span className="sale-title">{item.subtitle}</span>
                                                ) : (
                                                    <span className="sale-title">Featured</span>
                                                )}
                                                <h6 className="title m-b0">
                                                    <Link
                                                        href={href}
                                                        className="text-inherit"
                                                        style={{
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: "vertical" as const,
                                                            overflow: "hidden",
                                                            wordBreak: "break-word",
                                                            lineHeight: 1.35,
                                                            maxHeight: "2.7em",
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </h6>
                                            </div>
                                            <h6 className="price d-flex flex-wrap align-items-baseline gap-2">
                                                {(() => {
                                                    const sale = item.price;
                                                    const orig = item.originPrice;
                                                    const hasDiscount =
                                                        orig != null &&
                                                        sale != null &&
                                                        orig > sale &&
                                                        orig > 0;
                                                    if (hasDiscount && sale != null) {
                                                        return (
                                                            <>
                                                                <span className="text-primary fw-semibold">
                                                                    ₹{sale.toFixed(2)}
                                                                </span>
                                                                <span className="text-muted text-decoration-line-through font-14 fw-normal">
                                                                    ₹{orig!.toFixed(2)}
                                                                </span>
                                                            </>
                                                        );
                                                    }
                                                    if (sale != null && sale > 0) {
                                                        return `₹${sale.toFixed(2)}`;
                                                    }
                                                    return "$80";
                                                })()}
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllProduction;
