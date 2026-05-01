import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FeaturedNowSliderData } from "../../constant/Alldata";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";

import { useState, useEffect } from "react";
import { getPublicApiUrl } from "@/lib/env";

const FeaturedNowSlider = ({ data }: { data?: any }) => {
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hasProductSlugs = data?.items?.some((item: any) => item.productSlug);
        if (!hasProductSlugs) return;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const url = getPublicApiUrl();
                const response = await fetch(`${url}/products?limit=100`);
                const json = await response.json();
                if (json && json.data) {
                    setAllProducts(json.data);
                } else if (Array.isArray(json)) {
                    setAllProducts(json);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [data?.items]);

    const rawItems = data?.items?.length ? data.items : FeaturedNowSliderData;

    const items = rawItems.map((item: any) => {
        if (item.productSlug && allProducts.length > 0) {
            const product = allProducts.find((p: any) => p.slug === item.productSlug);
            if (product) {
                return {
                    ...item,
                    title: product.name,
                    description: item.description || "Top Quality Product",
                    image: product.thumbImage?.[0] || item.image,
                    price: product.basePrice || product.price,
                    slug: product.slug
                };
            }
        }
        return item;
    });

    if (loading && allProducts.length === 0) {
        return <div className="text-center py-5">Loading featured products...</div>;
    }


    return (
        <Swiper
            speed={1000}
            loop={true}
            parallax={true}
            slidesPerView={3}
            spaceBetween={30}
            watchSlidesProgress={true}
            autoplay={{
                delay: 2500,
            }}
            modules={[Autoplay]}
            breakpoints={{
                1400: {
                    slidesPerView: 3,
                },
                1024: {
                    slidesPerView: 2,
                },
                991: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 1.5,
                },
                600: {
                    slidesPerView: 1,
                },
                575: {
                    slidesPerView: 1,
                },
                340: {
                    slidesPerView: 1,
                    centeredSlides: true,
                },
            }}
            className="swiper swiper-product2 swiper-visible"
        >
            {items.map((item: any, ind: number) => (
                <SwiperSlide key={ind}>
                    <div className="shop-card style-4">
                        <div className="dz-media">
                            <Image src={item.image ? getImageUrl(item.image) : '/assets/images/placeholder.jpg'} alt="image" width={300} height={300} className="w-100 object-cover" />
                        </div>
                        <div className="dz-content">
                            <div>
                                <h6 className="title" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '4.2em' }}><Link href={item.slug ? `/products/${item.slug}` : "/shop-list"}>{item.title || item.name}</Link></h6>
                                <span className="sale-title">{item.description || "Up to 40% Off"}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <h6 className="price">{item.price ? `₹${item.price}` : "₹80"}</h6>
                                {/* <span className="review"><i className="fa-solid fa-star" />(2k Review)</span> */}
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default FeaturedNowSlider;