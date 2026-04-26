"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Slider, { type Settings } from "react-slick";
import Image from "next/image";
import Link from "next/link";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { MainSwiperData, MainSwiperData2 } from "../../constant/Alldata";
import { getImageUrl } from "@/lib/imageUtils";

/** CMS may store video as string path/URL or `{ url: string }` from upload. */
function resolveVideoSrc(video: unknown): string {
    if (video == null || video === "") return "";
    if (typeof video === "string") {
        const s = video.trim();
        if (!s) return "";
        const out = getImageUrl(s);
        return typeof out === "string" ? out : "";
    }
    if (typeof video === "object" && video !== null && "url" in video) {
        const u = (video as { url?: string }).url;
        if (typeof u === "string" && u.trim()) {
            const out = getImageUrl(u.trim());
            return typeof out === "string" ? out : "";
        }
    }
    return "";
}

function resolvePosterSrc(image: unknown): string | undefined {
    if (image == null || image === "") return undefined;
    const out = getImageUrl(image);
    if (typeof out === "string" && out && !out.includes("default.jpg")) return out;
    if (typeof out === "object" && out !== null && "src" in (out as object)) {
        return (out as { src: string }).src;
    }
    return typeof out === "string" ? out : undefined;
}

/** Main hero: slide copy + image/video from CMS (`data` from Main Banner Slider 2 section). */
const MainBannerSlider2 = ({ data }: { data?: any }) => {
    const mainSliderRef = useRef<Slider | null>(null);
    const thumbSliderRef = useRef<Slider | null>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    const [nav1, setNav1] = useState<Slider | undefined>(undefined);
    const [nav2, setNav2] = useState<Slider | undefined>(undefined);
    const [videoFallback, setVideoFallback] = useState<Record<number, boolean>>({});
    /** Below `lg` (992px): smaller hero title + shorter media (was broken: `>= 500` is not “mobile”, and width never updated on resize). */
    const [isNarrowLayout, setIsNarrowLayout] = useState(false);

    useEffect(() => {
        setNav1(mainSliderRef.current || undefined);
        setNav2(thumbSliderRef.current || undefined);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 991.98px)");
        const apply = () => setIsNarrowLayout(mq.matches);
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, []);

    const slidesData = data?.slides?.length ? data.slides : MainSwiperData;
    const thumbData = data?.slides?.length ? data.slides : MainSwiperData2;

    const syncVideos = useCallback((activeIndex: number) => {
        videoRefs.current.forEach((el, idx) => {
            if (!el) return;
            if (idx === activeIndex) {
                el.play().catch(() => { });
            } else {
                el.pause();
            }
        });
    }, []);

    const mainSettings: Settings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: false,
        infinite: true,
        asNavFor: nav2,
        afterChange: syncVideos,
    };

    const thumbSettings: Settings = {
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: false,
        centerMode: false,
        infinite: true,
        focusOnSelect: true,
        asNavFor: nav1,
        afterChange: syncVideos,
    };

    useEffect(() => {
        syncVideos(0);
    }, [syncVideos, slidesData.length]);

    return (
        <div className="row main-slide">
            <div className="col-lg-6">
                <Slider ref={mainSliderRef} {...mainSettings} className="slider-main">
                    {slidesData.map((item: any, index: number) => {
                        const headline = item.title?.trim?.() || item.title || "";
                        const short = item.shortTitle?.trim?.() || item.shortTitle || "";
                        const priceVal = item.price ?? item.priceOverride ?? "";
                        const priceLabel = (item.priceLabel?.trim?.() || item.priceLabel || "Price") as string;
                        const addToCart =
                            item.addToCartText?.trim?.() || item.addToCartText || "ADD TO CART";
                        const viewDetail =
                            item.viewDetailText?.trim?.() || item.viewDetailText || "VIEW DETAIL";
                        const productPath = item.productSlug ? `/products/${item.productSlug}` : null;
                        const detailHref = productPath || "/product-default";

                        return (
                            <div className="content-info" key={index}>
                                {short ? (
                                    <p className="font-14 text-uppercase letter-spacing-1 text-primary mb-2 mb-lg-3">
                                        {short}
                                    </p>
                                ) : null}
                                <h1 className="title" style={{ fontSize: isNarrowLayout ? "28px" : "48px" }}>
                                    {isNarrowLayout ? (
                                        <Link href={detailHref} className="text-reset text-decoration-none">
                                            {headline || " "}
                                        </Link>
                                    ) : (
                                        headline || " "
                                    )}
                                </h1>
                                {!isNarrowLayout ? (
                                    <>
                                        <div className="swiper-meta-items">
                                            <div className="meta-content">
                                                <span className="price-name">{priceLabel}</span>
                                                <span className="price-num d-inline-block">
                                                    {priceVal !== "" && priceVal != null
                                                        ? `₹\u00A0${String(priceVal).replace(/^\$/, "")}`
                                                        : "—"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="content-btn m-b30">
                                            <Link
                                                href={productPath || "/shop-cart"}
                                                className="btn btn-secondary me-xl-3 me-2 btnhover20"
                                            >
                                                {addToCart}
                                            </Link>
                                            <Link
                                                href={detailHref}
                                                className="btn btn-outline-secondary btnhover20"
                                            >
                                                {viewDetail}
                                            </Link>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        );
                    })}
                </Slider>
            </div>
            <div className="col-lg-6">
                <Slider ref={thumbSliderRef} {...thumbSettings} className="slider-thumbs">
                    {thumbData.map((item: any, i: number) => {
                        const mediaStyle: React.CSSProperties = {
                            width: "100%",
                            height: isNarrowLayout
                                ? "clamp(290px, 42vh, 380px)"
                                : "clamp(700px, 71vh, 650px)",
                            objectFit: "cover",
                            borderRadius: "40px",
                            display: "block",
                        };
                        const videoSrc = resolveVideoSrc(item.video);
                        const poster = resolvePosterSrc(item.image);
                        const showVideo = Boolean(videoSrc) && !videoFallback[i];
                        const imgSrc = getImageUrl(item.image);

                        return (
                            <div
                                className="banner-media"
                                key={i}
                                data-name={item.shortTitle || item.title || item.name || "DRESS"}
                            >
                                <div className="img-preview">
                                    {showVideo ? (
                                        <video
                                            ref={(el) => {
                                                videoRefs.current[i] = el;
                                            }}
                                            key={videoSrc}
                                            src={videoSrc}
                                            style={mediaStyle}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            poster={poster}
                                            preload="metadata"
                                            className="main-banner-slide-video"
                                            onError={() =>
                                                setVideoFallback((prev) => ({ ...prev, [i]: true }))
                                            }
                                        />
                                    ) : (
                                        <Image
                                            src={
                                                typeof imgSrc === "string"
                                                    ? imgSrc
                                                    : (imgSrc as { src: string }).src
                                            }
                                            alt="banner-media"
                                            width={800}
                                            height={1000}
                                            style={mediaStyle}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </Slider>
            </div>
        </div>
    );
};

export default MainBannerSlider2;
