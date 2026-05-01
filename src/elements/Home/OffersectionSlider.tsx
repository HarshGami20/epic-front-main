"use client";

import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import IMAGES from "../../constant/theme";
import { FeaturedOfferCard, type FeaturedOfferItem } from "./FeaturedOfferCard";

const defaultOffers: FeaturedOfferItem[] = [
    { image: IMAGES.ClothesPng1.src, subTitle: "20% Off", title: "Luxury Bras", titleStyle: "product-name", buttonText: "Collect Now", linkUrl: "/shop-list" },
    { image: IMAGES.ClothesPng2.src, subTitle: "Sale Up to 50% Off", title: "Summer", spanText: new Date().getFullYear().toString(), titleStyle: "sub-title1", spanStyle: "year", buttonText: "Collect Now", linkUrl: "/shop-list" },
    { image: IMAGES.ClothesPng3.src, subTitle: "20% Off", title: "Swimwear", spanText: "Sale", titleStyle: "sub-title2", spanStyle: "bg-title", buttonText: "Collect Now", linkUrl: "/shop-list" },
    { image: IMAGES.ClothesPng1.src, subTitle: "20% Off", title: "Luxury Bras", titleStyle: "product-name", buttonText: "Collect Now", linkUrl: "/shop-list" },
    { image: IMAGES.ClothesPng2.src, subTitle: "Sale Up to 50% Off", title: "Summer", spanText: new Date().getFullYear().toString(), titleStyle: "sub-title1", spanStyle: "year", buttonText: "Collect Now", linkUrl: "/shop-list" },
    { image: IMAGES.ClothesPng3.src, subTitle: "20% Off", title: "Swimwear", spanText: "Sale", titleStyle: "sub-title2", spanStyle: "bg-title", buttonText: "Collect Now", linkUrl: "/shop-list" },
];

const OffersectionSlider = ({ data }: { data?: any }) => {
    const items: FeaturedOfferItem[] =
        data?.items?.length > 0 ? data.items : defaultOffers;
    const loop = items.length > 2;

    return (
        <Swiper
            speed={1000}
            loop={loop}
            parallax={true}
            slidesPerView={3}
            spaceBetween={15}
            autoplay={
                items.length
                    ? {
                          delay: 2500,
                          disableOnInteraction: false,
                      }
                    : false
            }
            breakpoints={{
                1400: { slidesPerView: 3 },
                1024: { slidesPerView: 2 },
                991: { slidesPerView: 2 },
                767: { slidesPerView: 1.5 },
                600: { slidesPerView: 1 },
                575: { slidesPerView: 1 },
                340: { slidesPerView: 1, centeredSlides: true },
            }}
            modules={[Autoplay]}
            className="swiper-product product-style2"
        >
            {items.map((item, ind) => (
                <SwiperSlide key={ind}>
                    <FeaturedOfferCard item={item} wowDelay={`${0.4 + ind * 0.2}s`} />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default OffersectionSlider;
