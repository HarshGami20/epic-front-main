"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductInputButton from "./ProductInputButton";
import ShopCardColour from "./ShopCardColour";
import StarRating from "./StarRating";
import { normalizeProductSizes, normalizeVariations } from "@/lib/productOptions";
import { normalizePublicProductRecord } from "@/lib/publicProductNormalize";
import { fetchPublicProductReviews } from "@/lib/publicProductReviewsApi";
import { useCartWishlistStore } from "@/stores/useCartWishlistStore";
import { toast } from "react-toastify";
import { getImageUrl } from "@/lib/imageUtils";

interface thumbnailCardtype {
    productData?: any;
    title?: string;
    para?: string;
    selectedVariationIndex?: number | null;
    onVariationChange?: (index: number | null) => void;
    relatedVariants?: any[];
}

export default function ThumbnailRightProductDetail(props: thumbnailCardtype) {
    const product: any = normalizePublicProductRecord(props.productData ?? {});
    const slug = String(product?.slug || "product");
    const sizeOptions = normalizeProductSizes(product?.sizes);
    const variations = normalizeVariations(product?.variation);
    const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(null);
    const [localColorIndex, setLocalColorIndex] = useState<number | null>(null);
    const [reviewStats, setReviewStats] = useState({ rating: 0, count: 0 });
    const [quantity, setQuantity] = useState<number>(1);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { addToCart, toggleWishlist, isInWishlist } = useCartWishlistStore();

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

    const handleAddToCart = () => {
        const variation = variations[colorIndex ?? -1];
        const size = sizeOptions[selectedSizeIndex ?? -1];
        
        const cartId = `${product.id}${colorIndex !== null ? `-${colorIndex}` : ''}${selectedSizeIndex !== null ? `-${selectedSizeIndex}` : ''}`;
        
        addToCart({
            id: cartId,
            productId: product.id,
            name: product.name,
            price: currentPrice,
            originalPrice: price,
            quantityDiscounts: product.quantityDiscounts,
            quantity: quantity,
            image: Array.isArray(product.thumbImage) ? product.thumbImage[0] : product.thumbImage,
            slug: product.slug,
            variation: {
                color: variation,
                size: size
            }
        });
        toast.success("Added to cart!");
    };

    const handleToggleWishlist = () => {
        toggleWishlist({
            productId: product.id,
            name: product.name,
            price: price,
            image: Array.isArray(product.thumbImage) ? product.thumbImage[0] : product.thumbImage,
            slug: product.slug
        });
        const isNowIn = isInWishlist(product.id);
        // Note: isInWishlist might not be updated immediately due to closure, but store will be
        // Better to just toast based on current state (inverted)
        if (!isNowIn) {
             toast.success("Added to wishlist!");
        } else {
             toast.info("Removed from wishlist");
        }
    };
    const name = product?.name || props.title || 'Product Name';
    const shortHtml =
        typeof product.shortDescription === "string" && product.shortDescription.trim() !== ""
            ? product.shortDescription
            : props.para || "";
    const price = Number(product?.basePrice ?? product?.price ?? 125.75);
    const comparePrice =
        product?.originPrice != null ? Number(product.originPrice) : null;

    // Calculate quantity discount
    const quantityDiscounts = product?.quantityDiscounts || [];
    let quantityDiscountPercent = 0;
    if (Array.isArray(quantityDiscounts)) {
        for (const d of quantityDiscounts) {
            if (quantity >= d.minQuantity && d.discountPercent > quantityDiscountPercent) {
                quantityDiscountPercent = d.discountPercent;
            }
        }
    }
    const currentPrice = price * (1 - quantityDiscountPercent / 100);

    let discount = 0;
    if (comparePrice != null && Number.isFinite(comparePrice) && comparePrice > currentPrice) {
        discount = Math.round(((comparePrice - currentPrice) / comparePrice) * 100);
    } else if (quantityDiscountPercent > 0) {
        discount = quantityDiscountPercent;
    }
    return (
        <>
            <div className="dz-content">
                <div className="dz-content-footer">
                    <div className="dz-content-start">
                        {discount > 0 && (
                            <span className="badge bg-secondary mb-2">
                                {quantityDiscountPercent > 0 ? `BULK ${quantityDiscountPercent}% Off` : `SALE ${discount}% Off`}
                            </span>
                        )}


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
                    <span className="price">
                        {quantityDiscountPercent > 0 ? (
                            <>
                                ₹{currentPrice.toFixed(2)}
                                <del className="text-muted ms-2" style={{ fontSize: '16px' }}>₹{price}</del>
                            </>
                        ) : (
                            <>
                                ₹{price}
                                {comparePrice && <del className="text-muted ms-2" style={{ fontSize: '16px' }}>₹{comparePrice}</del>}
                            </>
                        )}
                    </span>
                </div>
                <div className="product-num product-detail-options d-flex  flex-lg-row align-items-start flex-wrap gap-4 gap-xl-5 w-100">
                    <div className="btn-quantity light d-flex flex-column gap-2  product-detail-option">
                        <label className="form-label mb-0">Quantity</label>
                        <div className="d-flex align-items-center">
                            <ProductInputButton value={quantity} onChange={setQuantity} />
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


                     <div 
                    className="btn-group cart-btn mt-4 flex-wrap gap-2"
                    style={isMobile ? { display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' } : undefined}
                >
                    {product?.hasCustomization && product?.customization && product?.slug && (
                        <Link
                            href={customizeHref}
                            className="btn btn-primary text-uppercase"
                            style={isMobile ? { width: '100%', margin: '0' } : undefined}
                        >
                            Customize
                        </Link>
                    )}
                    {!product?.hasCustomization && (
                        <button 
                            type="button" 
                            className="btn btn-secondary text-uppercase"
                            onClick={handleAddToCart}
                            style={isMobile ? { width: '100%', margin: '0' } : undefined}
                        >
                            Add To Cart
                        </button>
                    )}
                    <button 
                        type="button" 
                        className={`btn btn-icon ${isInWishlist(product.id) ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={handleToggleWishlist}
                        style={isMobile ? { width: '100%', margin: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' } : undefined}
                    >
                        <i className={`icon feather icon-heart${isInWishlist(product.id) ? '-on' : ''} me-2`}></i>
                        {isInWishlist(product.id) ? 'In Wishlist' : 'Add To Wishlist'}
                    </button>
                </div>


                {/* Related Sibling Variants Options - shown before bulk discounts */}
                {props.relatedVariants && props.relatedVariants.length > 0 && (
                    <div className="related-variants-wrapper mb-4 mt-4">
                        <h6 className="d-flex align-items-center gap-2 mb-2.5 font-semibold text-slate-800" style={{ fontSize: '15px' }}>
                             Product Options / Sibling Styles
                        </h6>
                        <style dangerouslySetInnerHTML={{ __html: `
                            .sibling-variants-slider::-webkit-scrollbar {
                                height: 4px;
                            }
                            .sibling-variants-slider::-webkit-scrollbar-track {
                                background: #f1f5f9;
                                border-radius: 4px;
                            }
                            .sibling-variants-slider::-webkit-scrollbar-thumb {
                                background: #cbd5e1;
                                border-radius: 4px;
                            }
                            .sibling-variants-slider::-webkit-scrollbar-thumb:hover {
                                background: #94a3b8;
                            }
                        `}} />
                        <div 
                            className="sibling-variants-slider d-flex gap-2 pb-2"
                            style={{ 
                                overflowX: 'auto', 
                                flexWrap: 'nowrap',
                                WebkitOverflowScrolling: 'touch',
                                scrollSnapType: 'x mandatory'
                            }}
                        >
                            {props.relatedVariants.map((item: any, idx: number) => {
                                const itemPrice = Number(item.basePrice ?? item.price ?? 0);
                                const itemComparePrice = item.originPrice ? Number(item.originPrice) : null;
                                let itemDiscount = 0;
                                if (itemComparePrice && itemComparePrice > itemPrice) {
                                    itemDiscount = Math.round(((itemComparePrice - itemPrice) / itemComparePrice) * 100);
                                }
                                const itemImage = getImageUrl(Array.isArray(item.thumbImage) ? item.thumbImage[0] : (item.thumbImage || ''));

                                return (
                                    <div 
                                        key={item.id || idx} 
                                        className="flex-shrink-0"
                                        style={{ 
                                            width: '135px',
                                            scrollSnapAlign: 'start'
                                        }}
                                    >
                                        <Link 
                                            href={`/products/${item.slug}`}
                                            className="d-flex flex-column h-100 rounded border transition-all text-decoration-none text-dark hover-shadow overflow-hidden bg-white"
                                            style={{ borderColor: '#e2e8f0', minHeight: '190px' }}
                                        >
                                            <div 
                                                className="bg-light w-100 border-bottom position-relative overflow-hidden"
                                                style={{ aspectRatio: '1/1' }}
                                            >
                                                <img 
                                                    src={itemImage} 
                                                    alt={item.name} 
                                                    className="w-100 h-100 object-fit-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                                                    style={{ transition: 'transform 0.3s ease' }}
                                                    onMouseOver={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                                                    onMouseOut={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1.0)'; }}
                                                />
                                                {itemDiscount > 0 && (
                                                    <span 
                                                        className="position-absolute top-2 start-2 badge bg-danger text-white px-1.5 py-0.5"
                                                        style={{ fontSize: '9px', fontWeight: 'bold', zIndex: 2 }}
                                                    >
                                                        -{itemDiscount}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-2 d-flex flex-column flex-grow-1 justify-content-between">
                                                <div 
                                                    className="text-xs fw-semibold mb-1.5 text-slate-800" 
                                                    style={{ 
                                                        fontSize: '12px', 
                                                        lineHeight: '1.3',
                                                        display: '-webkit-box', 
                                                        WebkitLineClamp: 2, 
                                                        WebkitBoxOrient: 'vertical', 
                                                        overflow: 'hidden',
                                                        minHeight: '31px'
                                                    }}
                                                >
                                                    {item.name}
                                                </div>
                                                <div className="d-flex flex-column gap-0.5 mt-auto">
                                                    <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                                        <span className="fw-bold text-slate-900" style={{ fontSize: '13px' }}>
                                                            ₹{itemPrice.toFixed(2)}
                                                        </span>
                                                        {itemComparePrice && (
                                                            <del className="text-muted" style={{ fontSize: '10px' }}>
                                                                ₹{itemComparePrice.toFixed(2)}
                                                            </del>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Bulk Discount Tiers */}
                {quantityDiscounts && quantityDiscounts.length > 0 && (
                    <div 
                        className="p-3 mb-4 rounded-md mt-4"
                        style={{ border: '1px solid #000000', backgroundColor: 'transparent' }}
                    >
                        <h6 className="d-flex align-items-center gap-2 mb-3 font-semibold text-slate-800" style={{ fontSize: '15px' }}>
                             Bulk Purchase Discounts
                        </h6>
                        <div className="d-flex flex-column gap-2">
                            {quantityDiscounts.map((discount: any, idx: number) => {
                                const isActive = quantity >= discount.minQuantity;
                                return (
                                    <div 
                                        key={idx} 
                                        className="d-flex align-items-center border-1 border-black justify-content-between p-2 px-3 rounded  transition-all"
                                        style={isActive ? { 
                                            backgroundColor: '#d1fae5', 
                                            borderColor: '#86efac', 
                                            transform: 'translateX(2px)'
                                        } : { 
                                            backgroundColor: '#ffffff',
                                            borderColor: '#e2e8f0' 
                                        }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <span 
                                                className={`badge me-2 ${isActive ? 'bg-success' : 'bg-secondary'}`}
                                                style={isActive ? { backgroundColor: '#16a34a' } : { backgroundColor: '#64748b' }}
                                            >
                                                {isActive ? 'Active' : `Min. Qty`}
                                            </span>
                                            <span className="fw-medium text-slate-700" style={{ fontSize: '13px' }}>Buy {discount.minQuantity}+ units</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="text-slate-500 small" style={{ fontSize: '11px' }}>
                                                (Save ₹{(price * (discount.discountPercent / 100)).toFixed(2)}/unit)
                                            </span>
                                            <span 
                                                className={`fw-bold ${isActive ? 'text-success' : 'text-slate-800'}`}
                                                style={isActive ? { color: '#16a34a', fontSize: '14px' } : { fontSize: '13px' }}
                                            >
                                                {discount.discountPercent}% Off
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
               
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