"use client";

import Link from "next/link";
import { SVGICON } from "@/constant/theme";
import CircularLabelText from "./CircularLabelText";

/** Matches reference: two “LATEST NEWS” segments with dashes (27 chars = even ring). */
export const TRENDING_NEWS_RING_TEXT = "LATEST NEWS - LATEST NEWS -";

function normalizeHref(url: string) {
    const u = url.trim();
    if (!u) return "/blog";
    if (u.startsWith("/") || u.startsWith("http")) return u;
    return `/${u}`;
}

/**
 * Circular “See all” — cream disc, black uppercase ring text, centered arrow (design ref image).
 */
export default function TrendingBlogCircleCta({
    linkUrl,
}: {
    linkUrl?: string;
    linkText?: string;
}) {
    const href = normalizeHref(typeof linkUrl === "string" ? linkUrl : "/blog");

    return (
        <Link
            className="icon-button trending-blog-circle-cta d-md-inline-block d-none"
            href={href}
            aria-label="See all latest news"
        >
            <div className="text-row word-rotate-box c-black trending-blog-circle-ring">
                <CircularLabelText text={TRENDING_NEWS_RING_TEXT} preserveCase />
                <svg
                    className="badge__emoji"
                    xmlns="http://www.w3.org/2000/svg"
                    width={40}
                    height={40}
                    viewBox="0 0 40 40"
                    fill="none"
                    dangerouslySetInnerHTML={{ __html: SVGICON.ArrowRightSvg }}
                />
            </div>
        </Link>
    );
}
