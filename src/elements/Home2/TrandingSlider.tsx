"use client"
import { useState, useEffect, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { useCartWishlistStore } from "@/stores/useCartWishlistStore";
import { toast } from "react-toastify";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import IMAGES from "../../constant/theme";
import ModalSlider from "../../components/ModalSlider";
import ProductInputButton from "../Shop/ProductInputButton";
import BasicModalData from "../../components/BasicModalData";

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

function TrandingSlider({ data }: modelType) {
    const { addToCart, toggleWishlist, isInWishlist } = useCartWishlistStore();

    const rawItems = data?.items?.length ? data.items : null;
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [detailModal, setDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [modalQuantity, setModalQuantity] = useState(1);

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

    const handleHideModal = () => {
        setDetailModal(false);
        setModalQuantity(1);
    };

    const handleQuickView = (item: any) => {
        if (item.originalProduct) {
            setSelectedProduct({ ...item.originalProduct, isDynamic: true });
        } else {
            setSelectedProduct(null);
        }
        setDetailModal(true);
    };

    const handleModalAddToCart = () => {
        if (!selectedProduct) return;
        addToCart({
            id: selectedProduct.id,
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.basePrice || selectedProduct.price || 0,
            quantity: modalQuantity,
            image: selectedProduct.thumbImage?.[0] || '',
            slug: selectedProduct.slug || ''
        });
        toast.success("Added to cart!");
    };

    const handleModalToggleWishlist = () => {
        if (!selectedProduct) return;
        toggleWishlist({
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.basePrice || selectedProduct.price || 0,
            image: selectedProduct.thumbImage?.[0] || '',
            slug: selectedProduct.slug || ''
        });
        if (!isInWishlist(selectedProduct.id)) {
            toast.success("Added to wishlist!");
        } else {
            toast.info("Removed from wishlist");
        }
    };

    return (
        <>
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
                                <div
                                    className="btn btn-secondary btn-md btn-rounded"
                                    onClick={(e) => { e.preventDefault(); handleQuickView(elem); }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="fa-solid fa-eye d-md-none d-block" />
                                    <span className="d-md-block d-none">Quick View</span>
                                </div>
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
                            <h5 className="title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3em' }}><Link href={elem.href}>{elem.title}</Link></h5>
                            <h5 className="price">{elem.price}</h5>
                        </div>
                        <div className="product-tag">
                            <span className="badge ">Trending</span>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
        <Modal className="quick-view-modal" show={detailModal} onHide={handleHideModal} centered>
            <button type="button" className="btn-close" onClick={handleHideModal}>
                <i className="icon feather icon-x" />
            </button>
            <div className="modal-body">
                <div className="row g-xl-4 g-3">
                    <div className="col-xl-6 col-md-6">
                        <div className="dz-product-detail mb-0" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalSlider productData={selectedProduct} />
                        </div>
                    </div>
                    <div className="col-xl-6 col-md-6">
                        {selectedProduct ? (
                            <div className="dz-product-detail style-2 ps-xl-3 ps-0 pt-2 mb-0" style={{ height: '70vh', overflowY: 'auto', overflowX: "hidden" }}>
                                <div className="dz-content">
                                    <div className="dz-content-footer">
                                        <div className="dz-content-start">
                                            {selectedProduct?.originPrice && selectedProduct.originPrice > (selectedProduct?.basePrice || selectedProduct?.price || 0) && (
                                                <span className="badge bg-secondary mb-2">
                                                    SALE {Math.round(((selectedProduct.originPrice - (selectedProduct?.basePrice || selectedProduct?.price || 0)) / selectedProduct.originPrice) * 100)}% Off
                                                </span>
                                            )}
                                            <h4 className="title mb-1">
                                                <Link href={`/products/${selectedProduct?.slug || ''}`}>{selectedProduct?.name}</Link>
                                            </h4>
                                            <div className="review-num">
                                                <ul className="dz-rating me-2">
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li><i className="flaticon-star-1" /></li>
                                                    <li><i className="flaticon-star-1" /></li>
                                                </ul>
                                                <span className="text-secondary me-2">4.7 Rating</span>
                                                <Link href={"#"}>(5 customer reviews)</Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="para-text"
                                        dangerouslySetInnerHTML={{ __html: selectedProduct?.description || "" }}
                                        style={{
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            whiteSpace: 'pre-wrap',
                                            overflowX: 'hidden',
                                            maxWidth: '95%'
                                        }}
                                    />
                                    <div className="meta-content m-b20 d-flex align-items-end">
                                        <div className="me-3">
                                            <span className="form-label">Price</span>
                                            <span className="price">
                                                ₹{selectedProduct?.basePrice || selectedProduct?.price || 0}
                                                {selectedProduct?.originPrice && <del>₹{selectedProduct.originPrice}</del>}
                                            </span>
                                        </div>
                                        <div className="btn-quantity light me-0">
                                            <label className="form-label">Quantity</label>
                                            <ProductInputButton value={modalQuantity} onChange={setModalQuantity} />
                                        </div>
                                    </div>
                                    <div className=" cart-btn">
                                        {!selectedProduct?.hasCustomization && (
                                            <button
                                                type="button"
                                                onClick={handleModalAddToCart}
                                                className="btn btn-secondary text-uppercase"
                                            >
                                                Add To Cart
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleModalToggleWishlist}
                                            className={`btn btn-md btn-icon ${isInWishlist(selectedProduct.id) ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                        >
                                            <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.24805 16.9986C8.99179 16.9986 8.74474 16.9058 8.5522 16.7371C7.82504 16.1013 7.12398 15.5038 6.50545 14.9767L6.50229 14.974C4.68886 13.4286 3.12289 12.094 2.03333 10.7794C0.815353 9.30968 0.248047 7.9162 0.248047 6.39391C0.248047 4.91487 0.755203 3.55037 1.67599 2.55157C2.60777 1.54097 3.88631 0.984375 5.27649 0.984375C6.31552 0.984375 7.26707 1.31287 8.10464 1.96065C8.52734 2.28763 8.91049 2.68781 9.24805 3.15459C9.58574 2.68781 9.96875 2.28763 10.3916 1.96065C11.2292 1.31287 12.1807 0.984375 13.2197 0.984375C14.6098 0.984375 15.8885 1.54097 16.8202 2.55157C17.741 3.55037 18.248 4.91487 18.248 6.39391C18.248 7.9162 17.6809 9.30968 16.4629 10.7792C15.3733 12.094 13.8075 13.4285 11.9944 14.9737C11.3747 15.5016 10.6726 16.1001 9.94376 16.7374C9.75136 16.9058 9.50417 16.9986 9.24805 16.9986ZM5.27649 2.03879C4.18431 2.03879 3.18098 2.47467 2.45108 3.26624C1.71033 4.06975 1.30232 5.18047 1.30232 6.39391C1.30232 7.67422 1.77817 8.81927 2.84508 10.1066C3.87628 11.3509 5.41011 12.658 7.18605 14.1715L7.18935 14.1743C7.81021 14.7034 8.51402 15.3033 9.24654 15.9438C9.98344 15.302 10.6884 14.7012 11.3105 14.1713C13.0863 12.6578 14.6199 11.3509 15.6512 10.1066C16.7179 8.81927 17.1938 7.67422 17.1938 6.39391C17.1938 5.18047 16.7858 4.06975 16.045 3.26624C15.3152 2.47467 14.3118 2.03879 13.2197 2.03879C12.4197 2.03879 11.6851 2.29312 11.0365 2.79465C10.4585 3.24179 10.0558 3.80704 9.81975 4.20255C9.69835 4.40593 9.48466 4.52733 9.24805 4.52733C9.01143 4.52733 8.79774 4.40593 8.67635 4.20255C8.44041 3.80704 8.03777 3.24179 7.45961 2.79465C6.811 2.29312 6.07643 2.03879 5.27649 2.03879Z" fill="currentColor" />
                                            </svg>
                                            {isInWishlist(selectedProduct.id) ? 'In Wishlist' : 'Add To Wishlist'}
                                        </button>
                                    </div>
                                    <div className="dz-info mb-0">
                                        <ul>
                                            <li><strong>Category:</strong></li>
                                            <li><Link href={`/shop?category=${selectedProduct?.category}`}>{selectedProduct?.category}</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <BasicModalData />
                        )}
                    </div>
                </div>
            </div>
        </Modal>
        </>
    )
}

export default TrandingSlider;