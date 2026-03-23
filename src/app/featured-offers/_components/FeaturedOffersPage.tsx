"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { FeaturedOfferCard, type FeaturedOfferItem } from "@/elements/Home/FeaturedOfferCard";
import IMAGES from "@/constant/theme";
import { getPublicApiUrl } from "@/lib/env";

const LAYOUT_SLUG = "startupkit-home-layout";
const FALLBACK_OFFER_SLUG = "startupkit-featured-offers";

const defaultOffers: FeaturedOfferItem[] = [
    { image: IMAGES.ClothesPng1.src, subTitle: "20% Off", title: "Luxury Bras", titleStyle: "product-name", buttonText: "Collect Now", linkUrl: "/shop-list" },
    { image: IMAGES.ClothesPng2.src, subTitle: "Sale Up to 50% Off", title: "Summer", spanText: "2024", titleStyle: "sub-title1", spanStyle: "year", buttonText: "Collect Now", linkUrl: "/shop-list" },
    { image: IMAGES.ClothesPng3.src, subTitle: "20% Off", title: "Swimwear", spanText: "Sale", titleStyle: "sub-title2", spanStyle: "bg-title", buttonText: "Collect Now", linkUrl: "/shop-list" },
];

async function fetchJson(url: string) {
    const res = await fetch(url, {
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    if (!res.ok) return null;
    return res.json();
}

function pickContent(payload: any): Record<string, unknown> | null {
    return (payload?.data?.content ?? payload?.content ?? null) as Record<string, unknown> | null;
}

type LoadState = "loading" | "cms_empty" | "cms_ready" | "fallback";

export default function FeaturedOffersPage() {
    const [title, setTitle] = useState("Featured Offers");
    const [subtitle, setSubtitle] = useState("");
    const [items, setItems] = useState<FeaturedOfferItem[]>([]);
    const [loadState, setLoadState] = useState<LoadState>("loading");

    useEffect(() => {
        const api = getPublicApiUrl();

        (async () => {
            try {
                const layoutPayload = await fetchJson(`${api}/cms/slug/${LAYOUT_SLUG}`);
                const layoutContent = pickContent(layoutPayload) as { sections?: any[] } | null;
                const sections = layoutContent?.sections;
                const offerSec = Array.isArray(sections)
                    ? sections.find((s: any) => s?.type === "offerSectionSlider" && s.enabled !== false)
                    : null;

                const slug = offerSec?.slug as string | undefined;
                let sectionData: Record<string, unknown> | null = null;

                if (slug) {
                    const secPayload = await fetchJson(`${api}/cms/slug/${slug}`);
                    sectionData = pickContent(secPayload);
                }
                if (!sectionData?.items && FALLBACK_OFFER_SLUG !== slug) {
                    const fb = await fetchJson(`${api}/cms/slug/${FALLBACK_OFFER_SLUG}`);
                    const fbContent = pickContent(fb);
                    if (fbContent && Array.isArray(fbContent.items)) {
                        sectionData = fbContent;
                    }
                }

                if (sectionData) {
                    const t = sectionData.title;
                    if (typeof t === "string" && t.trim()) setTitle(t.trim());
                    const ps = sectionData.pageSubtitle;
                    if (typeof ps === "string") setSubtitle(ps);
                    const list = sectionData.items;
                    if (Array.isArray(list) && list.length > 0) {
                        setItems(list as FeaturedOfferItem[]);
                        setLoadState("cms_ready");
                    } else {
                        setItems([]);
                        setLoadState("cms_empty");
                    }
                } else {
                    setLoadState("fallback");
                }
            } catch {
                setLoadState("fallback");
            }
        })();
    }, []);

    const displayItems = useMemo(() => {
        if (loadState === "fallback") return defaultOffers;
        return items;
    }, [loadState, items]);

    return (
        <>
            <div className="page-banner-sm bg-light">
                <div className="container">
                    <div className="row py-4 py-lg-5 align-items-center">
                        <div className="col-12">
                            <nav aria-label="breadcrumb" className="mb-2">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link href="/">Home</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        {title}
                                    </li>
                                </ol>
                            </nav>
                            <h1 className="title mb-2">{title}</h1>
                            {subtitle ? <p className="text-secondary mb-0 max-w-2xl">{subtitle}</p> : null}
                        </div>
                    </div>
                </div>
            </div>

            <section className="content-inner-2">
                <div className="container">
                    {loadState === "loading" ? (
                        <div className="d-flex justify-content-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading…</span>
                            </div>
                        </div>
                    ) : loadState === "cms_empty" ? (
                        <div className="text-center py-5">
                            <p className="text-muted mb-3">No featured offers yet. Add them in the CMS (Offer Section Slider).</p>
                            <Link href="/shop-list" className="btn btn-primary">
                                Shop now
                            </Link>
                        </div>
                    ) : (
                        <div className="row product-style2 g-4">
                            {displayItems.map((item, ind) => (
                                <div key={ind} className="col-lg-4 col-md-6 col-sm-12">
                                    <FeaturedOfferCard item={item} wowDelay={`${0.1 + ind * 0.08}s`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
