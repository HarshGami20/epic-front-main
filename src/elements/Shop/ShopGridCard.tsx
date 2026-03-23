import { useState } from "react";
import Link from "next/link";
import { getImageUrl } from '@/lib/imageUtils';

interface cardType {
    product: any;
    showdetailModal?: (() => void | undefined) | undefined;
}

export default function ShopGridCard({ product, showdetailModal }: cardType) {
    const [heartIcon, setHeartIcon] = useState(false);
    const [basketIcon, setBasketIcon] = useState(false);

    const name = product?.name || 'Product';
    const mainImage = product?.thumbImage && product.thumbImage.length > 0
        ? getImageUrl(product.thumbImage[0])
        : '/assets/images/placeholder.jpg';

    const hoverImage = product?.thumbImage && product.thumbImage.length > 1
        ? getImageUrl(product.thumbImage[1])
        : null;

    const price = product?.basePrice || product?.price || 0;
    const comparePrice = product?.originPrice;
    const productUrl = `/products/${product?.slug || ''}`;

    let discount = 0;
    if (comparePrice && comparePrice > price) {
        discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    }

    return (
        <div className="shop-card">
            <div
                className="dz-media"
                onMouseEnter={(e) => {
                    const hoverImg = e.currentTarget.querySelector('.hover-product-image') as HTMLElement;
                    if (hoverImg) hoverImg.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    const hoverImg = e.currentTarget.querySelector('.hover-product-image') as HTMLElement;
                    if (hoverImg) hoverImg.style.opacity = '0';
                }}
            >
                <img src={mainImage} alt={name} width={400} height={500} style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '4/5' }} />
                {hoverImage && (
                    <img
                        className="hover-product-image"
                        src={hoverImage}
                        alt={`${name} hover`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            opacity: 0,
                            transition: 'opacity 0.4s ease-in-out',
                            pointerEvents: 'none'
                        }}
                    />
                )}
                <div className="shop-meta">
                    <div className="btn btn-secondary btn-md btn-rounded"
                        onClick={(e) => { e.preventDefault(); if (showdetailModal) showdetailModal(); }}
                        style={{ cursor: 'pointer' }}
                    >
                        <i className="fa-solid fa-eye d-md-none d-block" />
                        <span className="d-md-block d-none">Quick View</span>
                    </div>
                    <div className={`btn btn-primary meta-icon dz-wishicon ${heartIcon ? "active" : ""}`}
                        onClick={() => setHeartIcon(!heartIcon)}
                    >
                        <i className="icon feather icon-heart dz-heart" />
                        <i className="icon feather icon-heart-on dz-heart-fill" />
                    </div>
                    <div className={`btn btn-primary meta-icon dz-carticon  ${basketIcon ? "active" : ""}`}
                        onClick={() => setBasketIcon(!basketIcon)}
                    >
                        <i className="flaticon flaticon-basket" />
                        <i className="flaticon flaticon-shopping-basket-on dz-heart-fill" />
                    </div>
                </div>
            </div>
            <div className="dz-content mt-3">
                <h6 className="title mb-2" style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <Link href={productUrl} className="text-dark">{name}</Link>
                </h6>
                <div className="d-grid align-items-center flex-wrap">
                    <span className="price text-primary fw-bold m-0" style={{ fontSize: 'clamp(16px, 1vw, 2000px)', textAlign: 'end' }}>₹{price}</span>
                    {comparePrice && comparePrice > price && (
                        <del className="text-muted" style={{ fontSize: 'clamp(14px, 0.7vw, 14px)', textAlign: 'end' }}>₹{comparePrice}</del>
                    )}
                </div>
            </div>
            {discount > 0 && (
                <div className="product-tag">
                    <span className="badge ">Get {discount}% Off</span>
                </div>
            )}
        </div>
    )
}