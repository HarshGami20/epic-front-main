"use client"
import { useState, useEffect, useMemo } from "react";
import { useCartWishlistStore } from "@/stores/useCartWishlistStore";
import { toast } from "react-toastify";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import IMAGES from "../../constant/theme";

interface trandingType {
    price: string;
    image: string;
    title: string;
}

const trandingSliderData: trandingType[] = [
    { price: '$80', image: IMAGES.shopproduct1, title: 'Cozy Knit Cardigan Sweater' },
    { price: '$70', image: IMAGES.shopproduct2, title: 'Sophisticated Swagger Suit' },
    { price: '$65', image: IMAGES.shopproduct3, title: 'Classic Denim Skinny Jeans' },
    { price: '$85', image: IMAGES.shopproduct4, title: 'Athletic Mesh Sports Leggings' },
    { price: '$78', image: IMAGES.shopproduct2, title: 'Cozy Knit Cardigan Sweater' },
    { price: '$63', image: IMAGES.shopproduct3, title: 'Sophisticated Swagger Suit' },
    { price: '$75', image: IMAGES.shopproduct1, title: 'Classic Denim Skinny Jeans' },
    { price: '$74', image: IMAGES.shopproduct4, title: 'Athletic Mesh Sports Leggings' },
];

interface modelType {
    showdetailModal?: (() => void | undefined) | undefined;
    data?: any;
}


function pickProductImage(p: any): string {
    const imgs = p?.images;
    const thumbs = p?.thumbImage;
    const first =
        (Array.isArray(imgs) && imgs.length && imgs[0]) ||
        (Array.isArray(thumbs) && thumbs.length && thumbs[0]);
    if (!first) return "";
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    return "";
}

function parseMoney(v: unknown): number | undefined {
    if (v == null || v === "") return undefined;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : undefined;
}

function TrandingSlider({ showdetailModal, data }: modelType) {
    const { addToCart, toggleWishlist, isInWishlist } = useCartWishlistStore();

    const rawItems = data?.items?.length ? data.items : null;
    const [allProducts, setAllProducts] = useState<any[]>([]);

    useEffect(() => {
        if (!rawItems?.some((i: any) => i?.productSlug)) return;
        const load = async () => {
            try {
                const url = getPublicApiUrl();
                const res = await fetch(`${url}/products?limit=500`);
                const json = await res.json();
                const list = json?.data ?? (Array.isArray(json) ? json : []);
                setAllProducts(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error("TrandingSlider: failed to load products", e);
            }
        };
        load();
    }, [rawItems]);

    const items = useMemo(() => {
        if (!rawItems?.length) {
            return trandingSliderData.map(row => ({
                title: row.title,
                price: row.price,
                image: row.image,
                href: "/shop-list"
            }));
        }

        const bySlug = Object.fromEntries(
            allProducts.filter((p) => p?.slug).map((p) => [p.slug, p])
        );

        return rawItems.map((item: any) => {
            if (item.productSlug && bySlug[item.productSlug]) {
                const p = bySlug[item.productSlug];
                const img = pickProductImage(p);
                const sale = parseMoney(p.price);
                return {
                    id: p.id,
                    title: p.name || "Product",
                    image: img || IMAGES.shopproduct1,
                    href: `/products/${p.slug}`,
                    price: sale != null ? `₹${sale.toFixed(2)}` : '₹80',
                    originalProduct: p,
                    slug: p.slug
                };
            }
            return {
                id: `static-${item.productSlug || Math.random()}`,
                title: "Trending Product",
                image: IMAGES.shopproduct1,
                href: "/shop-list",
                price: "₹80",
                slug: ""
            };
        });
    }, [rawItems, allProducts]);

    const handleAddToCart = (item: any) => {
        if (!item.originalProduct) return;
        const p = item.originalProduct;
        addToCart({
            id: p.id,
            productId: p.id,
            name: p.name,
            price: p.basePrice || p.price || 0,
            quantity: 1,
            image: p.thumbImage?.[0] || '',
            slug: p.slug || ''
        });
        toast.success("Added to cart!");
    };

    const handleToggleWishlist = (item: any) => {
        if (!item.originalProduct) return;
        const p = item.originalProduct;
        toggleWishlist({
            productId: p.id,
            name: p.name,
            price: p.basePrice || p.price || 0,
            image: p.thumbImage?.[0] || '',
            slug: p.slug || ''
        });
        if (!isInWishlist(p.id)) {
            toast.success("Added to wishlist!");
        } else {
            toast.info("Removed from wishlist");
        }
    };

    return (
        <Swiper
            slidesPerView={4}
            speed={1000}
            loop={true}
            parallax={true}
            spaceBetween={30}
            autoplay={{
                delay: 2500,
            }}
            navigation={{
                nextEl: ".tranding-button-next",
                prevEl: ".tranding-button-prev",
            }}
            modules={[Autoplay, Navigation]}
            breakpoints={{
                1200: {
                    slidesPerView: 4,
                },
                1024: {
                    slidesPerView: 4,
                },
                991: {
                    slidesPerView: 3,
                },
                591: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                340: {
                    slidesPerView: 1,
                    spaceBetween: 15,
                },
            }}
            className="swiper-four"
        >
            {items.map((elem: any, ind: number) => (
                <SwiperSlide key={ind}>
                    <div className="shop-card wow fadeInUp" data-wow-delay="0.2s">
                        <div className="dz-media">
                            <Image src={typeof elem.image === 'string' ? getImageUrl(elem.image) : elem.image} alt="card" width={500} height={500} className="w-100 object-cover" />
                            <div className="shop-meta">
                                <Link href="#" className="btn btn-secondary btn-md btn-rounded" onClick={showdetailModal}>
                                    <i className="fa-solid fa-eye d-md-none d-block" />
                                    <span className="d-md-block d-none">Quick View</span>
                                </Link>
                                <div className={`btn btn-primary meta-icon dz-wishicon ${isInWishlist(elem.id) ? "active" : ""}`}
                                    onClick={() => handleToggleWishlist(elem)}
                                >
                                    <i className="icon feather icon-heart dz-heart" />
                                    <i className="icon feather icon-heart-on dz-heart-fill" />
                                </div>
                                <div className={`btn btn-primary meta-icon dz-carticon`}
                                    onClick={() => handleAddToCart(elem)}
                                >
                                    <i className="flaticon flaticon-basket" />
                                    <i className="flaticon flaticon-basket-on dz-heart-fill" />
                                </div>
                            </div>
                        </div>
                        <div className="dz-content">
                            <h5 className="title"><Link href={elem.href}>{elem.title}</Link></h5>
                            <h5 className="price">{elem.price}</h5>
                        </div>
                        <div className="product-tag">
                            <span className="badge ">Trending</span>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}

export default TrandingSlider;