import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from '@/lib/imageUtils';
import { normalizePublicProductRecord } from "@/lib/publicProductNormalize";

interface cardType {
    product: any;
    inputtype?: string;
}

export default function ShopListCard({ product, inputtype }: cardType) {
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
                        <div className="d-flex">
                            <Link href="/shop-cart" className="btn btn-secondary btn-md btn-icon">
                                <i className="icon feather icon-shopping-cart d-md-none d-block" />
                                <span className="d-md-block d-none">Add to cart</span>
                            </Link>
                            <div className="bookmark-btn style-1">
                                <input className="form-check-input" type="checkbox" id={inputtype} />
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