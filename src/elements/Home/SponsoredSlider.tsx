"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { SponsoredSliderData } from "../../constant/Alldata";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";

function normalizeCardHref(raw?: string) {
    if (!raw || typeof raw !== "string") return "";
    const u = raw.trim();
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    return u.startsWith("/") ? u : `/${u}`;
}

const SponsoredSlider = ({ data }: { data?: any }) => {
    const items = data?.items?.length ? data.items : SponsoredSliderData;
    const loop = items.length > 4;

    return (
        <Swiper
            slidesPerView={4}
            spaceBetween={30}
            loop={loop}
            breakpoints={{
                1200: {
                    slidesPerView: 4,
                },
                991: {
                    slidesPerView: 3,
                },
                767: {
                    slidesPerView: 2,
                },
                575: {
                    slidesPerView: 1.5,
                },
                340: {
                    slidesPerView: 1,
                    centeredSlides: true,
                },
            }}
            className="swiper swiper-company"
        >
            {items.map((item: any, i: number) => {
                const mainSrc = item.image
                    ? typeof item.image === "object" && item.image !== null && "src" in item.image
                        ? (item.image as { src: string }).src
                        : getImageUrl(item.image)
                    : "/assets/images/placeholder.jpg";
                const mainStr = typeof mainSrc === "string" ? mainSrc : "/assets/images/placeholder.jpg";
                const cardHref = normalizeCardHref(item.itemUrl || item.url);

                const card = (
                    <div className="company-box style-1">
                        <div className="dz-media">
                            <Image
                                src={mainStr}
                                alt=""
                                width={300}
                                height={300}
                                className="company-img object-cover"
                            />
                            {item.image2 && (
                                <Image
                                    src={getImageUrl(item.image2)}
                                    alt=""
                                    width={100}
                                    height={100}
                                    className="logo object-contain"
                                />
                            )}
                            {item.store === "store" ? <span className="sale-badge">in Store</span> : null}
                        </div>
                        <div className="dz-content">
                            <h6 className="title">{item.title || "Outdoor Shoes"}</h6>
                            <span className="sale-title">{item.description || "Min. 30% Off"}</span>
                        </div>
                    </div>
                );

                const wrapped =
                    cardHref ? (
                        /^https?:\/\//i.test(cardHref) ? (
                            <a
                                href={cardHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-block text-reset text-decoration-none"
                            >
                                {card}
                            </a>
                        ) : (
                            <Link href={cardHref} className="d-block text-reset text-decoration-none">
                                {card}
                            </Link>
                        )
                    ) : (
                        card
                    );

                return (
                    <SwiperSlide key={i}>
                        {wrapped}
                    </SwiperSlide>
                );
            })}
        </Swiper>
    );
};

export default SponsoredSlider;
