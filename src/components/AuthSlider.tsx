"use client";
import { useState, useEffect } from "react";
import IMAGES from "@/constant/theme";
import { getPublicApiUrl } from "@/lib/env";
import { getImageUrl } from "@/lib/imageUtils";

export default function AuthSlider() {
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const base = getPublicApiUrl();
                const res = await fetch(`${base}/cms/auth-slider`);
                const json = await res.json();
                if (json.success && json.data?.content && Array.isArray(json.data.content) && json.data.content.length > 0) {
                    setImages(json.data.content);
                } else {
                    setImages([IMAGES.RegistrationPng3.src]);
                }
            } catch (error) {
                console.error("Failed to fetch auth slider images:", error);
                setImages([IMAGES.RegistrationPng3.src]);
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images]);

    if (images.length === 0) return null;

    return (
        <>
            {/* ── Desktop (≥992px): absolutely anchored to the bottom of .start-side-content ── */}
            <div className="auth-slider-desktop">
                {images.map((src, index) => (
                    <img
                        key={index}
                        src={getImageUrl(src)}
                        alt={`Auth Slider ${index + 1}`}
                        className={`auth-slider-desktop__img${index === currentIndex ? ' active' : ''}`}
                    />
                ))}

                {/* Dots float inside the image area at the top so they don't add height */}
                {images.length > 1 && (
                    <div className="auth-slider-desktop__dots">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`auth-slider-desktop__dot${i === currentIndex ? ' active' : ''}`}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Mobile/Tablet (<992px): aspect-ratio box pinned bottom-right of panel ── */}
            <div className="auth-slider-mobile">
                {images.map((src, index) => (
                    <img
                        key={index}
                        src={getImageUrl(src)}
                        alt={`Auth Slider ${index + 1}`}
                        className={`auth-slider-mobile__img${index === currentIndex ? ' active' : ''}`}
                    />
                ))}
            </div>

            <style>{`
                /* ======== DESKTOP ≥992px ======== */
                .auth-slider-desktop {
                    display: block;
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 85%;
                    /* height comes from the images themselves */
                }
                /* All images stacked at bottom=0, cross-fading */
                .auth-slider-desktop__img {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    height: 600px;
                    object-fit: contain;
                    object-position: bottom center;
                    opacity: 0;
                    transition: opacity 0.9s ease-in-out;
                    z-index: 0;
                }
                .auth-slider-desktop__img.active {
                    opacity: 1;
                    z-index: 1;
                }
                @media (max-width: 1200px) {
                    .auth-slider-desktop__img { height: 520px; }
                }
                @media (max-width: 991px) {
                    .auth-slider-desktop { display: none; }
                }

                /* Dots: absolute inside the wrapper, near the top of the image — never add height */
                .auth-slider-desktop__dots {
                    position: absolute;
                    top: 16px;           /* sits inside the image, not below it */
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 8px;
                    z-index: 10;
                }
                .auth-slider-desktop__dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.5);
                    border: 1px solid rgba(0,0,0,0.15);
                    cursor: pointer;
                    padding: 0;
                    transition: background 0.3s, transform 0.3s;
                }
                .auth-slider-desktop__dot.active {
                    background: var(--color-secondary, #f5a623);
                    transform: scale(1.35);
                }

                /* ======== MOBILE / TABLET <992px ======== */
                .auth-slider-mobile {
                    display: none;
                }
                @media (max-width: 991px) {
                    .auth-slider-mobile {
                        display: block;
                        position: absolute;
                        right: 10%;
                        bottom: 0;
                        width: 42%;
                    }
                    /* Aspect-ratio spacer so the box has height */
                    .auth-slider-mobile::before {
                        content: '';
                        display: block;
                        padding-bottom: 130%;
                    }
                }
                @media (max-width: 575px) {
                    .auth-slider-mobile { right: 5%; width: 50%; }
                }
                @media (max-width: 380px) {
                    .auth-slider-mobile { right: 2%; width: 56%; }
                }

                .auth-slider-mobile__img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: bottom center;
                    opacity: 0;
                    transition: opacity 0.9s ease-in-out;
                    z-index: 0;
                }
                .auth-slider-mobile__img.active {
                    opacity: 1;
                    z-index: 1;
                }
            `}</style>
        </>
    );
}
