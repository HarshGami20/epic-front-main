"use client";

import Link from "next/link";
import IMAGES from "../../constant/theme";
import { GreatSavindData } from "../../constant/Alldata";
import SaleDiscountShopCard from "../../components/SaleDiscountShopCard";
import Image, { type StaticImageData } from "next/image";
import { getImageUrl } from "@/lib/imageUtils";
import { useEffect, useMemo, useState } from "react";

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

type ResolvedItem = {
    name: string;
    subtitle: string;
    description?: string;
    image: string | StaticImageData;
    link: string;
    price?: number;
    originPrice?: number;
    star?: string;
};

const GreatSaving = ({ data }: { data?: any }) => {
    const rawItems = data?.items?.length ? data.items : null;
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(!!rawItems?.some((i: any) => i?.productSlug));

    useEffect(() => {
        const needs = rawItems?.some((i: any) => i?.productSlug);
        if (!needs) {
            setLoading(false);
            return;
        }
        const load = async () => {
            try {
                const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
                const res = await fetch(`${url}/products?limit=500`);
                const json = await res.json();
                const list = json?.data ?? (Array.isArray(json) ? json : []);
                setAllProducts(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error("GreatSaving: failed to load products", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [rawItems]);

    const items: ResolvedItem[] = useMemo(() => {
        if (!rawItems?.length) {
            return GreatSavindData.map((item) => ({
                name: item.name,
                subtitle: "",
                description: undefined,
                image: item.image,
                link: "/shop-list",
                star: item.star,
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
                    return {
                        name: p.name || "Product",
                        subtitle:
                            [p.category, p.brand].filter(Boolean).join(" · ") || "Featured",
                        image: img ? getImageUrl(img) : IMAGES.ShopPorductPng1,
                        link: `/products/${p.slug}`,
                        price: parseMoney(p.price),
                        originPrice: parseMoney(p.originPrice),
                        star: item.star,
                    };
                }
                if (item.productSlug) {
                    return {
                        name: item.title || `Product (${item.productSlug})`,
                        subtitle: "",
                        description: item.description,
                        image: item.image
                            ? getImageUrl(item.image)
                            : IMAGES.ShopPorductPng1,
                        link: `/products/${item.productSlug}`,
                        price: parseMoney(item.price),
                        originPrice: parseMoney(item.originPrice),
                        star: item.star,
                    };
                }
                return {
                    name: item.title || item.name || "Item",
                    subtitle: item.subtitle || "",
                    description: item.description,
                    image: item.image
                        ? getImageUrl(item.image)
                        : IMAGES.ShopPorductPng1,
                    link: item.link || "/shop-list",
                    price: parseMoney(item.price),
                    originPrice: parseMoney(item.originPrice),
                    star: item.star,
                };
            })
            .filter((it: any) => it.name);
    }, [rawItems, allProducts]);

    const displayItems = loading && rawItems?.some((i: any) => i?.productSlug) ? [] : items;

    return (
        <div className="row ">
            <div className="col-lg-6 col-md-12 align-self-center">
                {loading ? (
                    <div className="text-center py-5 w-100">Loading…</div>
                ) : (
                    <div className="row">
                        {displayItems.map((item, ind) => (
                            <div className="col-lg-6 col-md-6 col-sm-6 m-b30" key={ind}>
                                <SaleDiscountShopCard
                                    image={item.image || IMAGES.ShopPorductPng1}
                                    name={item.name}
                                    subtitle={item.subtitle || undefined}
                                    description={item.subtitle ? undefined : item.description}
                                    link={item.link}
                                    star={item.star}
                                    price={item.price}
                                    originPrice={item.originPrice}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="col-lg-6 col-md-12 m-b30">
                <div className="about-box style-1  clearfix h-100 right">
                    <div className="dz-media h-100">
                        <Image
                            src={data?.mainImage ? getImageUrl(data.mainImage) : IMAGES.AboutPic1}
                            alt=""
                            width={500}
                            height={500}
                            className="w-100 h-100 object-cover"
                        />
                        <div className="media-contant">
                            <h2 className="title">
                                {data?.title || "Great saving on everyday essentials"}
                            </h2>
                            <h5 className="sub-title">
                                {data?.subtitle || "Up to 60% off + up to $107 cashBACK"}
                            </h5>
                            <Link href="/shop-list" className="btn btn-white btn-lg">
                                See all
                            </Link>
                        </div>
                        <svg className="title animation-text" viewBox="0 0 1320 300">
                            <text x="0" y="">
                                {data?.watermark || "Great saving"}
                            </text>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GreatSaving;
