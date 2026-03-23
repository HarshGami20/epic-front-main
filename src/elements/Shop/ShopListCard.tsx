import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from '@/lib/imageUtils';

interface cardType {
    product: any;
    inputtype?: string;
}

export default function ShopListCard({ product, inputtype }: cardType) {
    const name = product?.name || 'Product';
    const mainImage = product?.thumbImage && product.thumbImage.length > 0 
        ? getImageUrl(product.thumbImage[0]) 
        : '/assets/images/placeholder.jpg';

    const price = product?.basePrice || product?.price || 0;
    const comparePrice = product?.originPrice;
    const productUrl = `/products/${product?.slug || ''}`;
    
    // Parse description dynamically
    let shortDescription = 'No description available for this product.';
    if (product?.description) {
        // Strip out HTML tags for a clean preview, limit to ~150 chars
        const st = product.description.replace(/<[^>]*>?/gm, '');
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
                        {product?.category && (
                            <ul className="dz-tags">
                                <li><Link href={`/shop-list?category=${product.category}`}>{product.category}</Link></li>
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