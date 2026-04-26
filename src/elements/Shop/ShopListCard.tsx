"use client"
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from '@/lib/imageUtils';
import { normalizePublicProductRecord } from "@/lib/publicProductNormalize";
import { useCartWishlistStore } from "@/stores/useCartWishlistStore";
import { toast } from "react-toastify";

interface cardType {
    product: any;
    inputtype?: string;
}

export default function ShopListCard({ product, inputtype }: cardType) {
    const { addToCart, toggleWishlist, isInWishlist } = useCartWishlistStore();
    const p = normalizePublicProductRecord(product ?? {});
    const name = p?.name || 'Product';
    const mainImage = p?.thumbImage && Array.isArray(p.thumbImage) && p.thumbImage.length > 0
        ? getImageUrl(String(p.thumbImage[0]))
        : '/assets/images/placeholder.jpg';

    const price = p?.basePrice || p?.price || 0;
    const comparePrice = p?.originPrice;
    const productUrl = `/products/${p?.slug || ''}`;
    
    // Prefer admin short description; fall back to truncated long description
    let shortDescription = 'No description available for this product.';
    const rawShort = typeof p.shortDescription === "string" ? p.shortDescription : "";
    if (rawShort.trim()) {
        const st = rawShort.replace(/<[^>]*>?/gm, '');
        shortDescription = st.length > 150 ? st.substring(0, 150) + "..." : st;
    } else if (typeof p.description === "string" && p.description) {
        const st = p.description.replace(/<[^>]*>?/gm, '');
        shortDescription = st.length > 150 ? st.substring(0, 150) + "..." : st;
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart({
            id: p.id,
            productId: p.id,
            name: name,
            price: price,
            quantity: 1,
            image: Array.isArray(p.thumbImage) ? p.thumbImage[0] : (p.thumbImage || ''),
            slug: p.slug || ''
        });
        toast.success("Added to cart!");
    };

    const handleToggleWishlist = () => {
        toggleWishlist({
            productId: p.id,
            name: name,
            price: price,
            image: Array.isArray(p.thumbImage) ? p.thumbImage[0] : (p.thumbImage || ''),
            slug: p.slug || ''
        });
        if (!isInWishlist(p.id)) {
            toast.success("Added to wishlist!");
        } else {
            toast.info("Removed from wishlist");
        }
    };

    return (
        <div className="dz-shop-card style-2">
            <div className="dz-media">
                <img src={mainImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="dz-content">
                <div className="dz-header">
                    <div>
                        <h4 className="title mb-0"><Link href={productUrl}>{name}</Link></h4>
                        {p?.category && (
                            <ul className="dz-tags">
                                <li><Link href={`/shop-list?category=${String(p.category)}`}>{String(p.category)}</Link></li>
                            </ul>
                        )}
                    </div>
                    <div className="review-num">
                        <ul className="dz-rating">
                            <li className="star-fill"><i className="flaticon-star-1" /></li>
                            <li className="star-fill"><i className="flaticon-star-1" /></li>
                            <li className="star-fill"><i className="flaticon-star-1" /></li>
                            <li className="star-fill"><i className="flaticon-star-1" /></li>
                            <li><i className="flaticon-star-1" /></li>
                        </ul>
                        <span><Link href="#"> 4.0 Rating</Link></span>
                    </div>
                </div>
                <div className="dz-body">
                    <div className="dz-rating-box">
                        <div>
                            <p className="dz-para">{shortDescription}</p>
                        </div>
                    </div>
                    <div className="rate">
                        <div className="d-flex align-items-center mb-xl-3 mb-2">
                            <div className="meta-content m-0">
                                <span className="price-name">Price</span>
                                <span className="price">₹{price}</span>
                                {comparePrice && <del className="text-muted fs-6 ms-2">₹{comparePrice}</del>}
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <button onClick={handleAddToCart} className="btn btn-secondary btn-md btn-icon me-2">
                                <i className="icon feather icon-shopping-cart d-md-none d-block" />
                                <span className="d-md-block d-none">Add to cart</span>
                            </button>
                            <div className="bookmark-btn style-1">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id={inputtype} 
                                    checked={isInWishlist(p.id)}
                                    onChange={handleToggleWishlist}
                                />
                                <label className="form-check-label" htmlFor={inputtype}>
                                    <i className="fa-solid fa-heart" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}