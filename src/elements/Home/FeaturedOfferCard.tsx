"use client";

import Link from "next/link";
import IMAGES from "@/constant/theme";
import { getImageUrl } from "@/lib/imageUtils";

export type FeaturedOfferItem = {
    image?: string | { src?: string };
    subTitle?: string;
    description?: string;
    title?: string;
    spanText?: string;
    buttonText?: string;
    linkUrl?: string;
    titleStyle?: string;
    spanStyle?: string;
};

function resolveImage(item: FeaturedOfferItem): string {
    const im = item.image;
    if (im && typeof im === "object" && "src" in im && im.src) return im.src as string;
    if (typeof im === "string") return getImageUrl(im) || im;
    return IMAGES.ClothesPng1.src;
}

export function resolveOfferHref(linkUrl?: string): string {
    const u = (linkUrl || "").trim();
    if (!u) return "/shop-list";
    if (/^https?:\/\//i.test(u)) return u;
    return u.startsWith("/") ? u : `/${u}`;
}

export function FeaturedOfferCard({
    item,
    className = "",
    wowDelay = "0s",
}: {
    item: FeaturedOfferItem;
    className?: string;
    wowDelay?: string;
}) {
    const bg = resolveImage(item);
    const href = resolveOfferHref(item.linkUrl);
    const external = /^https?:\/\//i.test(href);
    const offerText = item.description || item.subTitle || "20% Off";
    const btn = item.buttonText || "Collect Now";

    const Btn = external ? (
        <a href={href} className="btn btn-outline-secondary btn-rounded btn-lg" target="_blank" rel="noopener noreferrer">
            {btn}
        </a>
    ) : (
        <Link href={href} className="btn btn-outline-secondary btn-rounded btn-lg">
            {btn}
        </Link>
    );

    return (
        <div className={`product-box style-2 wow fadeInUp ${className}`.trim()} data-wow-delay={wowDelay}>
            <div
                className="product-media"
                style={{ backgroundImage: `url(${bg})` }}
            />
            <div className="product-content">
                <div className="main-content">
                    <span className="offer">{offerText}</span>
                    <h2 className={item.titleStyle || "product-name"}>
                        {item.title || "Offer"}
                        {item.spanText ? (
                            <span className={item.spanStyle || "year"}>{item.spanText}</span>
                        ) : null}
                    </h2>
                    {Btn}
                </div>
            </div>
        </div>
    );
}
