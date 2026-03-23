"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Autoplay } from "swiper/modules";
import { HottestSliderBlogData } from "../../constant/Alldata";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";

export type HottestBlogCardItem = {
    image: string;
    title: string;
    description?: string;
    href?: string;
};

type Props = {
    data?: any;
    /** Resolved items (e.g. from CMS blog picks); overrides data.items */
    items?: HottestBlogCardItem[];
};

const HottestSliderBlog = ({ data, items: itemsProp }: Props) => {
    const items: HottestBlogCardItem[] =
        itemsProp?.length ? itemsProp : data?.items?.length ? data.items : HottestSliderBlogData;

    return (
        <Swiper
            speed={1000}
            loop={items.length > 1}
            parallax={true}
            slidesPerView={4}
            spaceBetween={30}
            autoplay={{
                delay: 2500,
            }}
            watchSlidesProgress={true}
            modules={[Autoplay]}
            breakpoints={{
                1600: { slidesPerView: 4 },
                1440: { slidesPerView: 3 },
                1300: { slidesPerView: 5 },
                991: { slidesPerView: 4 },
                767: { slidesPerView: 2 },
                575: { slidesPerView: 2 },
                340: { slidesPerView: 1, centeredSlides: true },
            }}
            className="swiper swiper-shop2 swiper-visible"
        >
            {items.map((item, i) => (
                <SwiperSlide key={i}>
                    <div className="shop-card style-7 ">
                        <div className="dz-media">
                            <Link href={item.href || "/blog-grid"}>
                                <Image
                                    src={item.image ? getImageUrl(item.image) : "/assets/images/placeholder.jpg"}
                                    alt=""
                                    width={300}
                                    height={300}
                                    className="w-100 object-cover"
                                />
                            </Link>
                        </div>
                        <div className="dz-content hottest-blog-card-text overflow-hidden">
                            <h5 className="title mb-0">
                                <Link
                                    href={item.href || "/blog-grid"}
                                    className="d-block text-truncate"
                                    title={item.title}
                                >
                                    {item.title}
                                </Link>
                            </h5>
                            <span
                                className="sale-title text-success d-block text-truncate"
                                title={item.description || "Read more"}
                            >
                                {item.description || "Read more"}
                            </span>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default HottestSliderBlog;
