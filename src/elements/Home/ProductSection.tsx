"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import ModalSlider from "../../components/ModalSlider";
import ProductInputButton from "../Shop/ProductInputButton";
import Image from "next/image";
import { getImageUrl } from '@/lib/imageUtils';

import { masonryData, headfilterData } from "../../constant/Alldata";

const ProductSection = ({ data }: { data?: any }) => {
    const tabsData = data?.tabs?.length ? data.tabs : undefined;

    const [activeMenu, setActiveMenu] = useState(0);
    const [detailModal, setDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [heartIcon, setHeartIcon] = useState<{ [key: string]: boolean }>({});
    const [basketIcon, setBasketIcon] = useState<{ [key: string]: boolean }>({});

    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
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
    }, []);

    const handleHide = () => {
        setDetailModal(false);
    };

    const toggleHeart = (id: string) => {
        setHeartIcon(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleBasket = (id: string) => {
        setBasketIcon(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filterCategory = (ind: number) => {
        document.querySelectorAll(".card-container").forEach((ell) => {
            ell.setAttribute("style", "transform:scale(0);");
        });
        setActiveMenu(ind);
        setTimeout(() => {
            document.querySelectorAll(".card-container").forEach((ell) => {
                ell.setAttribute("style", "transform:scale(1);transition:all .5s linear");
            });
        }, 200);
    };

    let displayProducts: any[] = [];
    let displayTabs: any[] = [];
    let isDynamic = false;

    if (tabsData && tabsData.length > 0) {
        isDynamic = true;
        displayTabs = tabsData;
        const currentTab = tabsData[activeMenu];
        if (currentTab?.products && Array.isArray(currentTab.products)) {
            const productSlugs = currentTab.products.map((p: any) => p.productSlug);
            displayProducts = allProducts.filter(p => productSlugs.includes(p.slug));
        }
    }

    // Fallback logic for when the product section has not been configured in admin CMS.
    if (!isDynamic || allProducts.length === 0) {
        displayTabs = headfilterData;
    }

    return (
        <>
            <div className="row justify-content-md-between align-items-start">
                <div className="col-lg-6 col-md-12">
                    <div className="section-head style-1 m-b30 ">
                        <div className="left-content">
                            <h2 className="title">{data?.title || "Most popular products"}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 col-md-12">
                    <div className="site-filters clearfix style-1 align-items-center ms-lg-auto">
                        <ul className="filters">
                            {displayTabs.map((item: any, ind: number) => (
                                <li className={`btn ${activeMenu === ind ? "active" : ""}`} key={ind}
                                    onClick={(e) => { e.preventDefault(); filterCategory(ind); }}
                                >
                                    <input type="radio" />
                                    <Link href={"#"} onClick={(e) => e.preventDefault()}>
                                        {isDynamic ? item.tabName : item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="clearfix">
                <ul id="masonry" className="row g-xl-4 g-3">
                    {loading && isDynamic ? (
                        <div className="text-center w-100 py-5">Loading products...</div>
                    ) : (
                        (isDynamic ? displayProducts : masonryData).map((item: any, ind: number) => {

                            console.log(item)
                            // Extract values mapping correctly from Prisma Product scheme to Masonry style UI
                            const id = isDynamic ? item.id : ind.toString();
                            const name = isDynamic ? item.name : item.name;
                            const mainImage = isDynamic
                                ? (item.thumbImage && item.thumbImage.length > 0 ? getImageUrl(item.thumbImage[0]) : '/assets/images/placeholder.jpg')
                                : item.image;

                            const hoverImage = isDynamic && item.thumbImage && item.thumbImage.length > 1
                                ? getImageUrl(item.thumbImage[1])
                                : null;
                            const price = isDynamic ? (item?.basePrice?.toString() || item?.price?.toString() || '0') : item.price;
                            const comparePrice = isDynamic && item?.originPrice ? item.originPrice.toString() : null;
                            const productUrl = isDynamic ? `/products/${item?.slug || ''}` : "/shop-list";

                            let discount = isDynamic ? 0 : item.discount;
                            if (isDynamic && comparePrice && comparePrice > price) {
                                discount = Math.round(((comparePrice - price) / comparePrice) * 100);
                            }

                            return (
                                <div className="card-container col-6 col-xl-3 col-lg-3 col-md-4 col-sm-6 Tops wow fadeInUp" data-wow-delay={`${0.2 + (ind * 0.1)}s`} key={id}>
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
                                            {isDynamic ? (
                                                <>
                                                    <img src={getImageUrl(mainImage)} alt={name} width={400} height={500} style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '4/5' }} />
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
                                                </>
                                            ) : (
                                                <img src={mainImage} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                            <div className="shop-meta">
                                                <div className="btn btn-secondary btn-md btn-rounded"
                                                    onClick={(e) => { e.preventDefault(); setSelectedProduct({ ...item, isDynamic }); setDetailModal(true); }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <i className="fa-solid fa-eye d-md-none d-block" />
                                                    <span className="d-md-block d-none">Quick View</span>
                                                </div>
                                                <div className={`btn btn-primary meta-icon dz-wishicon ${heartIcon[id] ? "active" : ""}`}
                                                    onClick={() => toggleHeart(id)}
                                                >
                                                    <i className="icon feather icon-heart dz-heart" />
                                                    <i className="icon feather icon-heart-on dz-heart-fill" />
                                                </div>
                                                <div className={`btn btn-primary meta-icon dz-carticon ${basketIcon[id] ? "active" : ""}`}
                                                    onClick={() => toggleBasket(id)}
                                                >
                                                    <i className="flaticon flaticon-basket" />
                                                    <i className="flaticon flaticon-basket-on dz-heart-fill" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dz-content">
                                            <h5 className="title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}><Link href={productUrl}>{name}</Link></h5>
                                            <h5 className="price">₹{price} {comparePrice && <del className="text-muted fs-6 ms-2">₹{comparePrice}</del>}</h5>
                                        </div>
                                        {discount > 0 && (
                                            <div className="product-tag">
                                                <span className="badge ">Get {discount}% Off</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </ul>
            </div>
            <Modal className="quick-view-modal" show={detailModal} onHide={handleHide} centered>
                <button type="button" className="btn-close"
                    onClick={handleHide}
                >
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
                            <div className="dz-product-detail style-2 ps-xl-3 ps-0 pt-2 mb-0" style={{ height: '70vh', overflowY: 'auto', overflowX: "hidden" }}>
                                <div className="dz-content">
                                    <div className="dz-content-footer">
                                        <div className="dz-content-start">
                                            {selectedProduct?.discount > 0 && <span className="badge bg-secondary mb-2">SALE {selectedProduct.discount}% Off</span>}
                                            <h4 className="title mb-1"><Link href={selectedProduct?.isDynamic ? `/products/${selectedProduct?.slug || ''}` : "/shop-list"}>{selectedProduct?.name || "Product Name"}</Link></h4>
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
                                    ></div>
                                    <div className="meta-content m-b20 d-flex align-items-end">
                                        <div className="me-3">
                                            <span className="form-label">Price</span>
                                            <span className="price">₹{selectedProduct?.isDynamic ? (selectedProduct?.basePrice || selectedProduct?.price || 0) : selectedProduct?.price} {selectedProduct?.isDynamic && selectedProduct?.originPrice && <del>₹{selectedProduct.originPrice}</del>}</span>
                                        </div>
                                        <div className="btn-quantity light me-0">
                                            <label className="form-label">Quantity</label>
                                            <ProductInputButton />
                                        </div>
                                    </div>
                                    <div className=" cart-btn">
                                        <Link href="/shop-cart" className="btn btn-secondary text-uppercase">Add To Cart</Link>
                                        <Link href="/shop-wishlist" className="btn btn-md btn-outline-secondary btn-icon">
                                            <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.24805 16.9986C8.99179 16.9986 8.74474 16.9058 8.5522 16.7371C7.82504 16.1013 7.12398 15.5038 6.50545 14.9767L6.50229 14.974C4.68886 13.4286 3.12289 12.094 2.03333 10.7794C0.815353 9.30968 0.248047 7.9162 0.248047 6.39391C0.248047 4.91487 0.755203 3.55037 1.67599 2.55157C2.60777 1.54097 3.88631 0.984375 5.27649 0.984375C6.31552 0.984375 7.26707 1.31287 8.10464 1.96065C8.52734 2.28763 8.91049 2.68781 9.24805 3.15459C9.58574 2.68781 9.96875 2.28763 10.3916 1.96065C11.2292 1.31287 12.1807 0.984375 13.2197 0.984375C14.6098 0.984375 15.8885 1.54097 16.8202 2.55157C17.741 3.55037 18.248 4.91487 18.248 6.39391C18.248 7.9162 17.6809 9.30968 16.4629 10.7792C15.3733 12.094 13.8075 13.4285 11.9944 14.9737C11.3747 15.5016 10.6726 16.1001 9.94376 16.7374C9.75136 16.9058 9.50417 16.9986 9.24805 16.9986ZM5.27649 2.03879C4.18431 2.03879 3.18098 2.47467 2.45108 3.26624C1.71033 4.06975 1.30232 5.18047 1.30232 6.39391C1.30232 7.67422 1.77817 8.81927 2.84508 10.1066C3.87628 11.3509 5.41011 12.658 7.18605 14.1715L7.18935 14.1743C7.81021 14.7034 8.51402 15.3033 9.24654 15.9438C9.98344 15.302 10.6884 14.7012 11.3105 14.1713C13.0863 12.6578 14.6199 11.3509 15.6512 10.1066C16.7179 8.81927 17.1938 7.67422 17.1938 6.39391C17.1938 5.18047 16.7858 4.06975 16.045 3.26624C15.3152 2.47467 14.3118 2.03879 13.2197 2.03879C12.4197 2.03879 11.6851 2.29312 11.0365 2.79465C10.4585 3.24179 10.0558 3.80704 9.81975 4.20255C9.69835 4.40593 9.48466 4.52733 9.24805 4.52733C9.01143 4.52733 8.79774 4.40593 8.67635 4.20255C8.44041 3.80704 8.03777 3.24179 7.45961 2.79465C6.811 2.29312 6.07643 2.03879 5.27649 2.03879Z" fill="black"></path>
                                            </svg>
                                            Add To Wishlist
                                        </Link>
                                    </div>
                                    <div className="dz-info mb-0">
                                        <ul>
                                            <li><strong>Category:</strong></li>
                                            <li><Link href={`/shop?category=${selectedProduct?.category}`}>{selectedProduct?.category}</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ProductSection;