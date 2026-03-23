import Link from "next/link";
import ProductInputButton from "./ProductInputButton";
import ShopCardColour from "./ShopCardColour";
import StarRating from "./StarRating";

interface thumbnailCardtype {
    productData?: any;
    title?: string;
    para?: string;
}

export default function ThumbnailRightProductDetail(props: thumbnailCardtype) {
    const product = props.productData || {};
    const name = product?.name || props.title || 'Product Name';
    const description = product?.shortDescription || product?.description || props.para || '';
    const price = product?.basePrice || product?.price || 125.75;
    const comparePrice = product?.originPrice || null;

    let discount = 0;
    if (comparePrice && comparePrice > price) {
        discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    }
    return(
        <>
            <div className="dz-content">
                <div className="dz-content-footer">
                    <div className="dz-content-start">
                        {discount > 0 && <span className="badge bg-secondary mb-2">SALE {discount}% Off</span>}
                        <h4 className="title mb-1">{name}</h4>
                        <div className="review-num">
                            <ul className="dz-rating me-2">                                                       
                                <StarRating />
                            </ul>
                            <span className="text-secondary me-2">4.7 Rating</span>
                            <Link href="#">(5 customer reviews)</Link>
                        </div>
                    </div>
                </div>
                <div className="para-text mt-3" dangerouslySetInnerHTML={{ __html: description }} />

                <div className="meta-content m-b20 mt-3">
                    <span className="form-label">Price</span>
                    <span className="price">₹{price} {comparePrice && <del className="text-muted ms-2" style={{ fontSize: '16px' }}>₹{comparePrice}</del>}</span>
                </div>
                <div className="product-num gap-md-2 gap-xl-0">
                    <div className="btn-quantity light">
                        <label className="form-label">Quantity</label>
                        <ProductInputButton />
                    </div>
                    <div className="d-block">
                        <label className="form-label">Size</label>
                        <div className="btn-group product-size m-0">
                            <input type="radio" className="btn-check" name="btnradio1" id="btnradio101" defaultChecked />
                            <label className="btn" htmlFor="btnradio101">S</label>

                            <input type="radio" className="btn-check" name="btnradio1" id="btnradiol02" />
                            <label className="btn" htmlFor="btnradiol02">M</label>

                            <input type="radio" className="btn-check" name="btnradio1" id="btnradiol03" />
                            <label className="btn" htmlFor="btnradiol03">L</label>
                        </div>
                    </div>
                    <div className="meta-content">
                        <label className="form-label">Color</label>
                        <div className="d-flex align-items-center color-filter">
                            <ShopCardColour />
                        </div>
                    </div>
                </div>
                <div className="btn-group cart-btn mt-4">
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
                                <i className="fa-brands fa-facebook-f"/>
                            </Link>
                        </li>
                        <li>
                            <Link href="/https://www.linkedin.com/showcase/3686700/admin/" target="_blank">
                                <i className="fa-brands fa-linkedin-in"/>
                            </Link>
                        </li>
                        <li>
                            <Link href="/https://www.instagram.com/dexignzone/" target="_blank">
                                <i className="fa-brands fa-instagram"/>
                            </Link>
                        </li>
                        <li>
                            <Link href="/https://twitter.com/dexignzones" target="_blank">
                                <i className="fa-brands fa-twitter"/>
                            </Link>
                        </li>
                    </ul>
                </div>
                <ul className="d-md-flex d-none align-items-center">
                    <li className="icon-bx-wraper style-3 me-xl-4 me-2">
                        <div className="icon-bx">
                            <i className="flaticon flaticon-ship"/>
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