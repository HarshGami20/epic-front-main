"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { getPublicApiUrl } from "@/lib/env";
import { normalizePublicProductRecord } from "@/lib/publicProductNormalize";
import { getImageUrl } from "@/lib/imageUtils";

export default function SearchCategorySlider() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const url = getPublicApiUrl();
                const res = await fetch(`${url}/public/products?page=1&limit=12`);
                const json = await res.json();
                let list: any[] = [];
                if (json?.data && Array.isArray(json.data)) list = json.data;
                else if (Array.isArray(json)) list = json;
                if (!cancelled) setProducts(list.map((p) => normalizePublicProductRecord(p)));
            } catch {
                if (!cancelled) setProducts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return <div className="text-center py-3 text-secondary small">Loading products…</div>;
    }

    if (products.length === 0) {
        return <div className="text-center py-3 text-secondary small">No products to show.</div>;
    }

    return (
        <Swiper
            className="category-swiper2"
            slidesPerView={6}
            centeredSlides={false}
            spaceBetween={20}
            loop={products.length > 6}
            autoplay={{
                delay: 3000,
            }}
            breakpoints={{
                1600: {
                    slidesPerView: 6,
                    spaceBetween: 40,
                },
                1200: {
                    slidesPerView: 6,
                    spaceBetween: 20,
                },
                991: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                },
                591: {
                    slidesPerView: 3,
                    spaceBetween: 15,
                },
                320: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                },
            }}
        >
            {products.map((p, ind) => {
                const name = p?.name || "Product";
                const thumb = p?.thumbImage?.length
                    ? getImageUrl(p.thumbImage[0])
                    : "/assets/images/placeholder.jpg";
                const price = p?.basePrice ?? p?.price ?? 0;
                const href = `/products/${p?.slug || ""}`;

                return (
                    <SwiperSlide key={p?.id ?? ind}>
                        <div className="shop-card">
                            <div className="dz-media">
                                <Link href={href}>
                                    <img src={thumb} alt={name} width={200} height={250} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </Link>
                            </div>
                            <div className="dz-content">
                                <h6 className="title">
                                    <Link href={href}>{name}</Link>
                                </h6>
                                <h6 className="price">₹{Number(price).toFixed(2)}</h6>
                            </div>
                        </div>
                    </SwiperSlide>
                );
            })}
        </Swiper>
    );
}
