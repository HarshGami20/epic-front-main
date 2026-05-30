"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Slider, { type Settings } from "react-slick";
import Image from "next/image";
import Link from "next/link";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { MainSwiperData, MainSwiperData2 } from "../../constant/Alldata";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicAssetOrigin } from "@/lib/env";

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

/** Start downloading hero videos while the home page is still loading. */
export function prefetchHeroVideos(slides: unknown[] | undefined) {
    if (!slides?.length || typeof document === "undefined") return;

    slides.slice(0, 2).forEach((slide) => {
        const src = resolveVideoSrc((slide as { video?: unknown })?.video);
        if (!src) return;

        const preload = document.createElement("link");
        preload.rel = "preload";
        preload.as = "video";
        preload.href = src;
        document.head.appendChild(preload);
    });
}

function playVideoElement(el: HTMLVideoElement) {
    el.muted = true;
    el.playsInline = true;

    const start = () => {
        void el.play().catch(() => {});
    };

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        start();
        return;
    }

    const onReady = () => {
        el.removeEventListener("canplay", onReady);
        el.removeEventListener("loadeddata", onReady);
        start();
    };

    el.addEventListener("canplay", onReady);
    el.addEventListener("loadeddata", onReady);
    el.load();
}

function resolveSlideImageSrc(image: unknown): string | null {
    const out = getImageUrl(image);
    if (typeof out === "string" && out && !out.includes("default.jpg")) return out;
    if (typeof out === "object" && out !== null && "src" in (out as object)) {
        return (out as { src: string }).src;
    }
    return null;
}

function BannerMediaSkeleton({ style }: { style: React.CSSProperties }) {
    return <div className="banner-media-sk" style={style} aria-hidden="true" />;
}

function SliderNextArrow(props: { onClick?: () => void }) {
    const { onClick } = props;
    return (
        <button
            type="button"
            className="slick-arrow slick-next"
            onClick={onClick}
            aria-label="Next slide"
        />
    );
}

function SliderPrevArrow() {
    return <button type="button" className="slick-arrow slick-prev d-none" aria-hidden="true" tabIndex={-1} />;
}

/** Main hero: slide copy + image/video from CMS (`data` from Main Banner Slider 2 section). */
const MainBannerSlider2 = ({ data }: { data?: any }) => {
    const mainSliderRef = useRef<Slider | null>(null);
    const thumbSliderRef = useRef<Slider | null>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    const [nav1, setNav1] = useState<Slider | undefined>(undefined);
    const [nav2, setNav2] = useState<Slider | undefined>(undefined);
    const [videoFallback, setVideoFallback] = useState<Record<number, boolean>>({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [videoReady, setVideoReady] = useState<Record<number, boolean>>({});
    /** Below `lg` (992px): smaller hero title + shorter media (was broken: `>= 500` is not “mobile”, and width never updated on resize). */
    const [isNarrowLayout, setIsNarrowLayout] = useState(false);

    const slidesData = data?.slides?.length ? data.slides : MainSwiperData;
    const thumbData = data?.slides?.length ? data.slides : MainSwiperData2;
    const slideCount = thumbData.length;

    const videoSources = useMemo(
        () =>
            thumbData.map((item: any, index: number) => ({
                index,
                src: resolveVideoSrc(item.video),
                poster: resolvePosterSrc(item.image),
            })),
        [thumbData],
    );

    const shouldMountVideo = useCallback(
        (index: number) => {
            const src = videoSources[index]?.src;
            if (!src || videoFallback[index]) return false;
            if (slideCount <= 1) return true;

            const prev = (activeIndex - 1 + slideCount) % slideCount;
            const next = (activeIndex + 1) % slideCount;
            return index === activeIndex || index === prev || index === next;
        },
        [activeIndex, slideCount, videoFallback, videoSources],
    );

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

    // Warm CDN connection + prefetch first hero videos before the slider paints.
    useEffect(() => {
        const origin = getPublicAssetOrigin();
        const cleanup: (() => void)[] = [];

        if (origin.startsWith("http")) {
            const preconnect = document.createElement("link");
            preconnect.rel = "preconnect";
            preconnect.href = origin;
            preconnect.crossOrigin = "anonymous";
            document.head.appendChild(preconnect);
            cleanup.push(() => preconnect.remove());
        }

        videoSources.slice(0, 2).forEach((entry: { src: string }) => {
            const src = entry.src;
            if (!src) return;
            const preload = document.createElement("link");
            preload.rel = "preload";
            preload.as = "video";
            preload.href = src;
            document.head.appendChild(preload);
            cleanup.push(() => preload.remove());
        });

        return () => cleanup.forEach((fn) => fn());
    }, [videoSources]);

    const syncVideos = useCallback(
        (nextIndex: number) => {
            setActiveIndex(nextIndex);
            setVideoReady((prev) => {
                if (prev[nextIndex]) return prev;
                return { ...prev, [nextIndex]: false };
            });

            videoRefs.current.forEach((el, idx) => {
                if (!el) return;
                if (idx === nextIndex) {
                    playVideoElement(el);
                } else {
                    el.pause();
                }
            });
        },
        [],
    );

    useEffect(() => {
        const el = videoRefs.current[activeIndex];
        if (el) playVideoElement(el);
    }, [activeIndex, videoSources]);

    const handleSlideChange = useCallback(
        (_current: number, next: number) => {
            syncVideos(next);
        },
        [syncVideos],
    );

    const mainSettings: Settings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: false,
        infinite: true,
        asNavFor: nav2,
    };

    const thumbSettings: Settings = {
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: false,
        centerMode: false,
        infinite: true,
        focusOnSelect: true,
        asNavFor: nav1,
        beforeChange: handleSlideChange,
        arrows: true,
        nextArrow: <SliderNextArrow />,
        prevArrow: <SliderPrevArrow />,
    };

    useEffect(() => {
        syncVideos(0);
    }, [syncVideos]);

    return (
        <>
            <style>{`
                .banner-media-sk {
                    background: linear-gradient(90deg, #e8ecf3 0%, #f4f6fa 40%, #e8ecf3 80%);
                    background-size: 220% 100%;
                    animation: bannerMediaSkShimmer 1.35s ease-in-out infinite;
                }
                @keyframes bannerMediaSkShimmer {
                    0% { background-position: 120% 0; }
                    100% { background-position: -120% 0; }
                }
                .main-slide .banner-media .img-preview {
                    overflow: visible !important;
                }
                .main-slide .banner-media .img-preview::after {
                    z-index: 4 !important;
                    pointer-events: none;
                }
                .main-slide .main-banner-slide-video {
                    background: transparent !important;
                    object-fit: cover;
                    z-index: 2;
                }
                .main-slide .slider-thumbs .slick-arrow.slick-next {
                    z-index: 6;
                }
                @media only screen and (max-width: 575px) {
                    .main-slide .banner-media .img-preview::after {
                        bottom: 32px;
                        width: 30px;
                    }
                }
            `}</style>
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
                                {isNarrowLayout ? (
                                    <div className="content-btn m-b30">
                                        <Link
                                            href={detailHref}
                                            className="btn btn-outline-secondary btnhover20"
                                        >
                                            {viewDetail}
                                        </Link>
                                    </div>
                                ) : (
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
                                )}
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
                        const videoSrc = videoSources[i]?.src || "";
                        const poster = videoSources[i]?.poster;
                        const showVideo = Boolean(videoSrc) && !videoFallback[i];
                        const mountVideo = showVideo && shouldMountVideo(i);
                        const slideImageSrc = poster || resolveSlideImageSrc(item.image);
                        const isActiveSlide = i === activeIndex;
                        const previewStyle: React.CSSProperties = {
                            position: "relative",
                            width: "100%",
                            height: mediaStyle.height,
                            overflow: "visible",
                        };
                        const cropStyle: React.CSSProperties = {
                            position: "relative",
                            width: "100%",
                            height: mediaStyle.height,
                            overflow: "hidden",
                            borderRadius: "40px",
                        };
                        const fillStyle: React.CSSProperties = {
                            ...mediaStyle,
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                        };

                        return (
                            <div
                                className="banner-media"
                                key={i}
                                data-name={item.shortTitle || item.title || item.name || "DRESS"}
                            >
                                <div className="img-preview" style={previewStyle}>
                                    <div style={cropStyle}>
                                    {showVideo && mountVideo ? (
                                        <>
                                            {slideImageSrc ? (
                                                <Image
                                                    src={slideImageSrc}
                                                    alt="banner-media"
                                                    width={800}
                                                    height={1000}
                                                    priority={i === 0}
                                                    style={{ ...fillStyle, zIndex: 1 }}
                                                />
                                            ) : (
                                                !videoReady[i] && (
                                                    <BannerMediaSkeleton
                                                        style={{ ...fillStyle, zIndex: 1 }}
                                                    />
                                                )
                                            )}
                                            <video
                                                ref={(el) => {
                                                    videoRefs.current[i] = el;
                                                    if (el && isActiveSlide) {
                                                        playVideoElement(el);
                                                    }
                                                }}
                                                src={videoSrc}
                                                style={{
                                                    ...fillStyle,
                                                    opacity: videoReady[i] ? 1 : 0,
                                                    transition: "opacity 0.35s ease",
                                                    zIndex: 2,
                                                    backgroundColor: "transparent",
                                                }}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                poster={slideImageSrc || undefined}
                                                preload="auto"
                                                className="main-banner-slide-video"
                                                onPlaying={() =>
                                                    setVideoReady((prev) => ({ ...prev, [i]: true }))
                                                }
                                                onError={() => {
                                                    setVideoFallback((prev) => ({ ...prev, [i]: true }));
                                                    setVideoReady((prev) => ({ ...prev, [i]: false }));
                                                }}
                                            />
                                        </>
                                    ) : showVideo && !mountVideo ? (
                                        slideImageSrc ? (
                                            <Image
                                                src={slideImageSrc}
                                                alt="banner-media"
                                                width={800}
                                                height={1000}
                                                priority={i === 0}
                                                style={fillStyle}
                                            />
                                        ) : (
                                            <BannerMediaSkeleton style={fillStyle} />
                                        )
                                    ) : slideImageSrc ? (
                                        <Image
                                            src={slideImageSrc}
                                            alt="banner-media"
                                            width={800}
                                            height={1000}
                                            priority={i === 0}
                                            style={fillStyle}
                                        />
                                    ) : (
                                        <BannerMediaSkeleton style={fillStyle} />
                                    )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Slider>
            </div>
        </div>
        </>
    );
};

export default MainBannerSlider2;
