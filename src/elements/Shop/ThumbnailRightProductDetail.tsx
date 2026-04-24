"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductInputButton from "./ProductInputButton";
import ShopCardColour from "./ShopCardColour";
import StarRating from "./StarRating";
import { normalizeProductSizes, normalizeVariations } from "@/lib/productOptions";
import { normalizePublicProductRecord } from "@/lib/publicProductNormalize";
import { fetchPublicProductReviews } from "@/lib/publicProductReviewsApi";

interface thumbnailCardtype {
    productData?: any;
    title?: string;
    para?: string;
    selectedVariationIndex?: number | null;
    onVariationChange?: (index: number | null) => void;
}

export default function ThumbnailRightProductDetail(props: thumbnailCardtype) {
    const product: any = normalizePublicProductRecord(props.productData ?? {});
    const slug = String(product?.slug || "product");
    const sizeOptions = normalizeProductSizes(product?.sizes);
    const variations = normalizeVariations(product?.variation);
    const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(null);
    const [localColorIndex, setLocalColorIndex] = useState<number | null>(null);
    const [reviewStats, setReviewStats] = useState({ rating: 0, count: 0 });

    const parentControlsColor = props.onVariationChange != null;
    const colorIndex: number | null = parentControlsColor
        ? (props.selectedVariationIndex ?? null)
        : localColorIndex;

    useEffect(() => {
        setSelectedSizeIndex(null);
        setLocalColorIndex(null);
    }, [product?.id, slug]);

    useEffect(() => {
        if (!slug || slug === "product") return;
        fetchPublicProductReviews(slug, { limit: 1 })
            .then(data => {
                if (data?.summary) {
                    setReviewStats({
                        rating: data.summary.averageRating || 0,
                        count: data.summary.totalCount || 0
                    });
                }
            })
            .catch(err => console.error("Failed to load reviews summary", err));
    }, [slug]);

    const handleColorSelect = (index: number) => {
        if (parentControlsColor) props.onVariationChange?.(index);
        else setLocalColorIndex(index);
    };

    const customizeHref = (() => {
        if (!product?.slug || !product?.hasCustomization || !product?.customization) {
            return `/customize/${product?.slug || ""}`;
        }
        const idx = colorIndex;
        const vid =
            idx !== null && variations[idx]?.id ? String(variations[idx].id) : null;
        const variantMap = product.customization?.variants;
        if (
            vid &&
            variantMap &&
            typeof variantMap === "object" &&
            vid in variantMap
        ) {
            return `/customize/${product.slug}?variant=${encodeURIComponent(vid)}`;
        }
        return `/customize/${product.slug}`;
    })();

    const clearColor = () => {
        if (parentControlsColor) props.onVariationChange?.(null);
        else setLocalColorIndex(null);
    };
    const name = product?.name || props.title || 'Product Name';
    const shortHtml =
        typeof product.shortDescription === "string" && product.shortDescription.trim() !== ""
            ? product.shortDescription
            : props.para || "";
    const price = Number(product?.basePrice ?? product?.price ?? 125.75);
    const comparePrice =
        product?.originPrice != null ? Number(product.originPrice) : null;

    let discount = 0;
    if (comparePrice != null && Number.isFinite(comparePrice) && comparePrice > price) {
        discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    }
    return (
        <>
            <div className="dz-content">
                <div className="dz-content-footer">
                    <div className="dz-content-start">
                        {discount > 0 && <span className="badge bg-secondary mb-2">SALE {discount}% Off</span>}


                        <h4 className="title mb-1">{name}</h4>
                        <div className="review-num">
                            <ul className="dz-rating me-2">
                                <StarRating rating={reviewStats.rating} />
                            </ul>
                            <span className="text-secondary me-2">{reviewStats.rating.toFixed(1)} Rating</span>
                            <Link href="#">({reviewStats.count} customer reviews)</Link>
                        </div>
                    </div>
                </div>

                {shortHtml && (
                    <div
                        className="para-text mb-2"
                        dangerouslySetInnerHTML={{ __html: shortHtml }}
                    />
                )}

                <div className="meta-content m-b20 mt-3">
                    <span className="form-label">Price</span>
                    <span className="price">₹{price} {comparePrice && <del className="text-muted ms-2" style={{ fontSize: '16px' }}>₹{comparePrice}</del>}</span>
                </div>
                <div className="product-num product-detail-options d-flex  flex-lg-row align-items-start flex-wrap gap-4 gap-xl-5 w-100">
                    <div className="btn-quantity light d-flex flex-column gap-2  product-detail-option">
                        <label className="form-label mb-0">Quantity</label>
                        <div className="d-flex align-items-center">
                            <ProductInputButton />
                        </div>
                    </div>
                    {sizeOptions.length > 0 && (
                        <div className="d-flex flex-column gap-2  product-detail-option">
                            <div className="d-flex align-items-center justify-content-between gap-2 w-100">
                                <label className="form-label mb-0">Size</label>
                                {selectedSizeIndex !== null && (
                                    <button
                                        type="button"
                                        className="btn btn-link btn-sm text-secondary text-decoration-none p-0 flex-shrink-0"
                                        onClick={() => setSelectedSizeIndex(null)}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="btn-group product-size m-0" role="group" aria-label="Size">
                                {sizeOptions.map((label, index) => {
                                    const id = `${slug}-size-${index}`;
                                    return (
                                        <span key={`${label}-${index}`}>
                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name={`${slug}-size`}
                                                id={id}
                                                checked={selectedSizeIndex !== null && selectedSizeIndex === index}
                                                onChange={() => setSelectedSizeIndex(index)}
                                            />
                                            <label className="btn" htmlFor={id}>{label}</label>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {variations.length > 0 && (
                        <div className="d-flex flex-column gap-2  product-detail-option">
                            <div className="d-flex align-items-center justify-content-between gap-2 w-100">
                                <label className="form-label mb-0">Color</label>
                                {colorIndex !== null && (
                                    <button
                                        type="button"
                                        className="btn btn-link btn-sm text-secondary text-decoration-none p-0 flex-shrink-0"
                                        onClick={clearColor}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="d-flex align-items-center color-filter flex-wrap gap-1">
                                <ShopCardColour
                                    variations={variations}
                                    idPrefix={slug}
                                    selectedIndex={
                                        colorIndex === null
                                            ? null
                                            : Math.min(Math.max(0, colorIndex), variations.length - 1)
                                    }
                                    onSelect={handleColorSelect}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="btn-group cart-btn mt-4 flex-wrap gap-2">
                    {product?.hasCustomization && product?.customization && product?.slug && (
                        <Link
                            href={customizeHref}
                            className="btn btn-primary text-uppercase"
                        >
                            Customize
                        </Link>
                    )}
                    <Link href="/shop-cart" className="btn btn-secondary text-uppercase">Add To Cart</Link>
                    <Link href="/shop-wishlist" className="btn btn-outline-secondary btn-icon">
                        <i className="icon feather icon-heart"></i>
                        Add To Wishlist
                    </Link>
                </div>
                <div className="dz-info mt-4">
                    <ul>
                        <li><strong>SKU:</strong></li>
                        <li>{product?.sku || 'PRT584E63A'}</li>
                    </ul>
                    <ul>
                        <li><strong>Category:</strong></li>
                        <li><Link href={`/shop?category=${product?.category || ''}`}>{product?.category || 'General'}</Link></li>
                    </ul>
                    <ul>
                        <li><strong>Brand:</strong></li>
                        {product?.brand ? (
                            <li><Link href={`/shop?brand=${product.brand}`}>{product.brand}</Link></li>
                        ) : (
                            <li><Link href="/shop">Epiclance</Link></li>
                        )}
                    </ul>
                    <ul className="social-icon">
                        <li><strong>Share:</strong></li>
                        <li>
                            <Link href="/https://www.facebook.com/dexignzone" target="_blank">
                                <i className="fa-brands fa-facebook-f" />
                            </Link>
                        </li>
                        <li>
                            <Link href="/https://www.linkedin.com/showcase/3686700/admin/" target="_blank">
                                <i className="fa-brands fa-linkedin-in" />
                            </Link>
                        </li>
                        <li>
                            <Link href="/https://www.instagram.com/dexignzone/" target="_blank">
                                <i className="fa-brands fa-instagram" />
                            </Link>
                        </li>
                        <li>
                            <Link href="/https://twitter.com/dexignzones" target="_blank">
                                <i className="fa-brands fa-twitter" />
                            </Link>
                        </li>
                    </ul>
                </div>
                <ul className="d-md-flex d-none align-items-center">
                    <li className="icon-bx-wraper style-3 me-xl-4 me-2">
                        <div className="icon-bx">
                            <i className="flaticon flaticon-ship" />
                        </div>
                        <div className="info-content">
                            <span>FREE</span>
                            <h6 className="dz-title mb-0">Shipping</h6>
                        </div>
                    </li>
                    <li className="icon-bx-wraper style-3">
                        <div className="icon-bx">
                            <i className="flaticon-fast-delivery-1"></i></div>
                        <div className="info-content">
                            <span>Easy Returns</span>
                            <h6 className="dz-title mb-0">30 Days</h6>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="banner-social-media">
                <ul>
                    <li>
                        <Link href="https://www.instagram.com/dexignzone/">Instagram</Link>
                    </li>
                    <li>
                        <Link href="https://www.facebook.com/dexignzone">Facebook</Link>
                    </li>
                    <li>
                        <Link href="https://twitter.com/dexignzones">twitter</Link>
                    </li>
                </ul>
            </div>
        </>
    )
}