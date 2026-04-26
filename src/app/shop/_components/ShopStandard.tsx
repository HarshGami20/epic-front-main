"use client"
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { Modal } from "react-bootstrap";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import ShopSidebar from "@/elements/Shop/ShopSidebar";
import ShopListCard from "@/elements/Shop/ShopListCard";
import ShopGridCard from "@/elements/Shop/ShopGridCard";

import PaginationBlog from "@/elements/Shop/PaginationBlog";
import ProductInputButton from "@/elements/Shop/ProductInputButton";
import ModalSlider from "@/components/ModalSlider";
import BasicModalData from "@/components/BasicModalData";
import { getImageUrl } from '@/lib/imageUtils';
import { getPublicApiUrl } from '@/lib/env';
import { normalizePublicProductRecord } from "@/lib/publicProductNormalize";
import { useCartWishlistStore } from "@/stores/useCartWishlistStore";
import { toast } from "react-toastify";

function findCategoryBySlugOrName(nodes: any[], match: string): any | null {
    const m = match.trim();
    if (!m) return null;
    for (const n of nodes) {
        if (!n) continue;
        if (n.slug === m || n.name === m) return n;
        if (n.children?.length) {
            const found = findCategoryBySlugOrName(n.children, m);
            if (found) return found;
        }
    }
    return null;
}

function ShopStandardContent() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const initCategory = searchParams.get('category') || "";
    const initSearch = (searchParams.get('search') || searchParams.get('q') || "").trim();

    const [detailModal, setDetailModal] = useState<boolean>(false);
    const [mobileSidebar, setMobileSidebar] = useState<boolean>(false);

    // Dynamic products state
    const [products, setProducts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [backendColors, setBackendColors] = useState<any[]>([]);
    const [backendSizes, setBackendSizes] = useState<any[]>([]);
    const [hierarchicalCategories, setHierarchicalCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [modalQuantity, setModalQuantity] = useState<number>(1);
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [shopCmsData, setShopCmsData] = useState<any>(null);

    const { addToCart, toggleWishlist, isInWishlist } = useCartWishlistStore();

    // Filter states — `debouncedSearch` is what we send to GET /public/products (backend: `search` or `query`)
    const [searchQuery, setSearchQuery] = useState(initSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initSearch);
    const [selectedCategory, setSelectedCategory] = useState<string>(initCategory || "");
    const [selectedBrand, setSelectedBrand] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [priceRange, setPriceRange] = useState<number[] | null>(null);
    const [maxPrice, setMaxPrice] = useState<number>(1000);
    const skipUrlToStateSyncRef = useRef(false);

    const applySearchNow = useCallback(() => {
        setDebouncedSearch(searchQuery.trim());
    }, [searchQuery]);

    useEffect(() => {
        const t = window.setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 400);
        return () => window.clearTimeout(t);
    }, [searchQuery]);

    // Keep filters in sync when the URL changes from outside (header search, browser back).
    const searchParamsKey = searchParams.toString();
    useEffect(() => {
        if (skipUrlToStateSyncRef.current) {
            skipUrlToStateSyncRef.current = false;
            return;
        }
        const s = (searchParams.get('search') || searchParams.get('q') || "").trim();
        const c = (searchParams.get('category') || "").trim();
        setSearchQuery(s);
        setDebouncedSearch(s);
        setSelectedCategory(c);
    }, [searchParamsKey, searchParams]);

    // Reflect current filters in the address bar (shareable links).
    useEffect(() => {
        const next = new URLSearchParams();
        if (debouncedSearch) next.set('search', debouncedSearch);
        if (selectedCategory && selectedCategory !== 'All Categories') next.set('category', selectedCategory);

        const currentQuery = searchParams.toString();
        const nextQuery = next.toString();

        if (currentQuery !== nextQuery) {
            skipUrlToStateSyncRef.current = true;
            router.replace(`${pathname}?${nextQuery}`, { scroll: false });
        }
    }, [debouncedSearch, selectedCategory, pathname, router]);

    // Initial load: Categories, colors, sizes, and max price
    useEffect(() => {
        const loadBasics = async () => {
            try {
                const url = getPublicApiUrl();
                const [catRes, colorRes, sizeRes, priceRes, cmsRes] = await Promise.all([
                    fetch(`${url}/public/categories`),
                    fetch(`${url}/public/colors`),
                    fetch(`${url}/public/sizes`),
                    fetch(`${url}/public/products/max-price`),
                    fetch(`${url}/public/cms/slug/epiclance-shop-banner`)
                ]);
                const [cats, colors, sizes, priceData, cmsData] = await Promise.all([
                    catRes.json(), colorRes.json(), sizeRes.json(), priceRes.json(), cmsRes.json()
                ]);
                setHierarchicalCategories(Array.isArray(cats) ? cats : (cats?.data || []));
                setBackendColors(Array.isArray(colors) ? colors : (colors?.data || []));
                setBackendSizes(Array.isArray(sizes) ? sizes : (sizes?.data || []));

                if (cmsData && (cmsData.data || cmsData.content)) {
                    setShopCmsData(cmsData.data?.content || cmsData.content);
                }

                const max = priceData?.maxPrice || 1000;
                setMaxPrice(max);
                setPriceRange([0, max]);
            } catch (err) {
                console.error("Failed to load shop basics:", err);
            }
        };
        loadBasics();
    }, []);

    // Main product fetching loop
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const url = getPublicApiUrl();

                const queryParams = new URLSearchParams({
                    page: String(page),
                    limit: '12',
                });

                if (debouncedSearch) queryParams.append('search', debouncedSearch);
                if (selectedCategory && selectedCategory !== 'All Categories') queryParams.append('category', selectedCategory);
                if (selectedBrand && selectedBrand !== 'All Brands') queryParams.append('brand', selectedBrand);
                if (selectedColor) queryParams.append('color', selectedColor);
                if (selectedSize) queryParams.append('size', selectedSize);
                if (priceRange) {
                    queryParams.append('minPrice', String(priceRange[0]));
                    queryParams.append('maxPrice', String(priceRange[1]));
                }

                const prodRes = await fetch(`${url}/public/products?${queryParams.toString()}`);
                const prodJson = await prodRes.json();

                let productsData = [];
                if (prodJson && prodJson.data) productsData = prodJson.data;
                else if (Array.isArray(prodJson)) productsData = prodJson;

                setProducts(productsData.map(normalizePublicProductRecord));
                setTotalPages(prodJson.totalPages || 1);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, selectedCategory, selectedBrand, selectedColor, selectedSize, priceRange, debouncedSearch]);

    // Format filters for sidebars properly
    const categories = hierarchicalCategories; // passing the full nested tree
    const brands: string[] = []; // Currently we dropped master brands scraping 
    const colors = Array.isArray(backendColors) ? backendColors : [];
    const sizes = (Array.isArray(backendSizes) ? backendSizes : []).map((s: any) => s.name).filter(Boolean);

    const displayProducts = products;

    const selectedCategoryObj = useMemo(() => {
        const sel = (selectedCategory || "").trim();
        if (!sel || sel === 'All Categories') return null;
        return findCategoryBySlugOrName(hierarchicalCategories, sel);
    }, [hierarchicalCategories, selectedCategory]);

    const shopBannerUrl = useMemo(() => {
        const raw = selectedCategoryObj?.bannerImage?.trim?.() ?? "";
        return raw ? getImageUrl(raw) : "";
    }, [selectedCategoryObj]);

    const renderProducts = (viewType: 'list' | 'grid') => {
        if (loading) return <div className="col-12 text-center py-5">Loading products...</div>;
        if (displayProducts.length === 0) return <div className="col-12 text-center py-5">No products found.</div>;

        return displayProducts.map((p, ind) => {
            if (viewType === 'list') {
                return (
                    <div className="col-md-12 col-sm-12 col-xxxl-6" key={p.id || ind}>
                        <ShopListCard
                            product={p}
                            inputtype={`checkbox-${p.id || ind}`}
                        />
                    </div>
                )
            } else {
                return (
                    <div className="col-6 col-xl-3 col-lg-4 col-md-4 col-sm-6 m-md-b15 m-b30" key={p.id || ind}>
                        <ShopGridCard
                            product={p}
                            showdetailModal={() => {
                                setSelectedProduct({ ...p, isDynamic: true });
                                setDetailModal(true);
                            }}
                        />
                    </div>
                )
            }
        });
    };

    const handleAddToCart = () => {
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

    const handleToggleWishlist = () => {
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
        <div
            className={`page-content position-relative ${shopBannerUrl ? "" : "bg-light"}`}
            style={
                shopBannerUrl
                    ? {
                        backgroundImage: `linear-gradient(rgba(248, 249, 250, 0.9), rgba(248, 249, 250, 0.96)), url(${shopBannerUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center top",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "scroll",
                    }
                    : undefined
            }
        >
            <CommanBanner
                parentText="Home"
                currentText={selectedCategoryObj?.name || shopCmsData?.currentText || shopCmsData?.title || "Shop Standard"}
                mainText={selectedCategoryObj?.name || shopCmsData?.mainText || shopCmsData?.title || "Shop Standard"}
                image={(typeof shopBannerUrl === 'string' && shopBannerUrl) ? shopBannerUrl : (shopCmsData?.image ? getImageUrl(shopCmsData.image) : IMAGES.BackBg1.src)}
            />
            <section className="content-inner-3 pt-3 z-index-unset">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-20 col-xl-3">
                            <div className="sticky-xl-top">
                                <Link href={"#"} className={`panel-close-btn ${mobileSidebar ? "active" : ""}`}
                                    onClick={() => setMobileSidebar(false)}
                                >app
                                    <svg width="35" height="35" viewBox="0 0 51 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M37.748 12.5L12.748 37.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.748 12.5L37.748 37.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                                <div className={`shop-filter mt-xl-2 mt-0 ${mobileSidebar ? "active" : ""}`}>
                                    <aside>
                                        <div className="d-flex align-items-center justify-content-between m-b30">
                                            <h6 className="title mb-0 fw-normal d-flex">
                                                <i className="flaticon-filter me-3" />
                                                Filter
                                            </h6>
                                            <Link href={"#"} className="btn btn-sm font-14 btn-secondary btn-sharp text-nowrap" onClick={(e) => { e.preventDefault(); setSearchQuery(''); setDebouncedSearch(''); setSelectedCategory(''); setSelectedBrand(''); setSelectedColor(''); setSelectedSize(''); setPriceRange([0, maxPrice]); }}>RESET</Link>
                                        </div>
                                        <ShopSidebar
                                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                                            onSearchSubmit={applySearchNow}
                                            categories={categories} selectedCategory={selectedCategory} handleCategoryChange={setSelectedCategory}
                                            brands={brands} selectedBrand={selectedBrand} handleBrandChange={setSelectedBrand}
                                            colors={colors} selectedColor={selectedColor} handleColorChange={setSelectedColor}
                                            sizes={sizes} selectedSize={selectedSize} handleSizeChange={setSelectedSize}
                                            priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice}
                                        />
                                    </aside>
                                </div>
                            </div>
                        </div>
                        <div className="col-80 col-xl-9">
                            <div className="filter-wrapper border-0 bg-transparent ps-0 pe-0 mb-3">
                                <div className="filter-left-area">
                                    <ul className="filter-tag mb-0">
                                        {selectedCategory && selectedCategory !== 'All Categories' && (
                                            <li className="tag-item">{selectedCategory} <Link href={"#"} onClick={(e) => { e.preventDefault(); setSelectedCategory(''); }}><i className="icon feather icon-x" /></Link></li>
                                        )}
                                        {selectedColor && (
                                            <li className="tag-item">{selectedColor} <Link href={"#"} onClick={(e) => { e.preventDefault(); setSelectedColor(''); }}><i className="icon feather icon-x" /></Link></li>
                                        )}
                                        {selectedSize && (
                                            <li className="tag-item">{selectedSize} <Link href={"#"} onClick={(e) => { e.preventDefault(); setSelectedSize(''); }}><i className="icon feather icon-x" /></Link></li>
                                        )}
                                        {(selectedCategory || selectedColor || selectedSize) && (
                                            <li className="tag-item border-0 ps-0">
                                                <Link href={"#"} className="text-primary text-decoration-underline font-14" onClick={(e) => { e.preventDefault(); setSelectedCategory(''); setSelectedColor(''); setSelectedSize(''); setPriceRange([0, maxPrice]); }}>Clear All</Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div className="filter-right-area justify-content-end">
                                    <div className="shop-tab d-flex align-items-center gap-2">
                                        <button
                                            className={`btn btn-sm btn-rounded ${viewType === 'grid' ? 'btn-secondary' : 'btn-light'}`}
                                            onClick={() => setViewType('grid')}
                                            title="Grid View"
                                        >
                                            <i className="flaticon-grid" />
                                        </button>
                                        <button
                                            className={`btn btn-sm btn-rounded ${viewType === 'list' ? 'btn-secondary' : 'btn-light'}`}
                                            onClick={() => setViewType('list')}
                                            title="List View"
                                        >
                                            <i className="flaticon-list" />
                                        </button>
                                    </div>
                                    <button className="btn btn-primary btn-sharp filter-btn ms-3 d-xl-none"
                                        onClick={() => setMobileSidebar(true)}
                                    >
                                        <i className="flaticon-filter me-2" />
                                        Filter
                                    </button>
                                </div>
                            </div>
                            <div className="row gx-xl-4 g-3 mb-4">
                                {renderProducts(viewType)}
                            </div>
                            <div className="row page mt-0">
                                <div className="col-md-6">
                                    <p className="page-text">Showing {displayProducts.length > 0 ? 1 : 0}–{displayProducts.length} of {displayProducts.length} Results</p>
                                </div>
                                <div className="col-md-12">
                                    <nav aria-label="Blog Pagination">
                                        <ul className="pagination style-1">
                                            <PaginationBlog currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal className="quick-view-modal" centered
                show={detailModal} onHide={() => setDetailModal(false)}
            >
                <button type="button" className="btn-close" onClick={() => setDetailModal(false)}>
                    <i className="icon feather icon-x" />
                </button>
                <div className="modal-body">
                    <div className="row g-xl-4 g-3">
                        <div className="col-xl-6 col-md-6">
                            <div className="dz-product-detail mb-0" style={{ height: '70vh', overflowY: 'auto' }}>
                                <div className="swiper-btn-center-lr">
                                    <ModalSlider productData={selectedProduct} />
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 col-md-6">
                            {selectedProduct ? (
                                <div className="dz-product-detail style-2 ps-xl-3 ps-0 pt-2 mb-0" style={{ height: '70vh', overflowY: 'auto', overflowX: "hidden" }}>
                                    <div className="dz-content">
                                        <div className="dz-content-footer">
                                            <div className="dz-content-start">
                                                {selectedProduct?.originPrice && selectedProduct.originPrice > (selectedProduct?.basePrice || selectedProduct?.price || 0) && (
                                                    <span className="badge bg-secondary mb-2">SALE {Math.round(((selectedProduct.originPrice - (selectedProduct?.basePrice || selectedProduct?.price || 0)) / selectedProduct.originPrice) * 100)}% Off</span>
                                                )}
                                                <h4 className="title mb-1"><Link href={`/products/${selectedProduct?.slug || ''}`}>{selectedProduct?.name}</Link></h4>
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
                                                <span className="price">₹{selectedProduct?.basePrice || selectedProduct?.price || 0} {selectedProduct?.originPrice && <del>₹{selectedProduct.originPrice}</del>}</span>
                                            </div>
                                            <div className="btn-quantity light me-0">
                                                <label className="form-label">Quantity</label>
                                                <ProductInputButton value={modalQuantity} onChange={setModalQuantity} />
                                            </div>
                                        </div>
                                        <div className=" cart-btn">
                                            <button
                                                type="button"
                                                onClick={handleAddToCart}
                                                className="btn btn-secondary text-uppercase"
                                            >
                                                Add To Cart
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleToggleWishlist}
                                                className={`btn btn-md btn-icon ${isInWishlist(selectedProduct.id) ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                            >
                                                <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.24805 16.9986C8.99179 16.9986 8.74474 16.9058 8.5522 16.7371C7.82504 16.1013 7.12398 15.5038 6.50545 14.9767L6.50229 14.974C4.68886 13.4286 3.12289 12.094 2.03333 10.7794C0.815353 9.30968 0.248047 7.9162 0.248047 6.39391C0.248047 4.91487 0.755203 3.55037 1.67599 2.55157C2.60777 1.54097 3.88631 0.984375 5.27649 0.984375C6.31552 0.984375 7.26707 1.31287 8.10464 1.96065C8.52734 2.28763 8.91049 2.68781 9.24805 3.15459C9.58574 2.68781 9.96875 2.28763 10.3916 1.96065C11.2292 1.31287 12.1807 0.984375 13.2197 0.984375C14.6098 0.984375 15.8885 1.54097 16.8202 2.55157C17.741 3.55037 18.248 4.91487 18.248 6.39391C18.248 7.9162 17.6809 9.30968 16.4629 10.7792C15.3733 12.094 13.8075 13.4285 11.9944 14.9737C11.3747 15.5016 10.6726 16.1001 9.94376 16.7374C9.75136 16.9058 9.50417 16.9986 9.24805 16.9986ZM5.27649 2.03879C4.18431 2.03879 3.18098 2.47467 2.45108 3.26624C1.71033 4.06975 1.30232 5.18047 1.30232 6.39391C1.30232 7.67422 1.77817 8.81927 2.84508 10.1066C3.87628 11.3509 5.41011 12.658 7.18605 14.1715L7.18935 14.1743C7.81021 14.7034 8.51402 15.3033 9.24654 15.9438C9.98344 15.302 10.6884 14.7012 11.3105 14.1713C13.0863 12.6578 14.6199 11.3509 15.6512 10.1066C16.7179 8.81927 17.1938 7.67422 17.1938 6.39391C17.1938 5.18047 16.7858 4.06975 16.045 3.26624C15.3152 2.47467 14.3118 2.03879 13.2197 2.03879C12.4197 2.03879 11.6851 2.29312 11.0365 2.79465C10.4585 3.24179 10.0558 3.80704 9.81975 4.20255C9.69835 4.40593 9.48466 4.52733 9.24805 4.52733C9.01143 4.52733 8.79774 4.40593 8.67635 4.20255C8.44041 3.80704 8.03777 3.24179 7.45961 2.79465C6.811 2.29312 6.07643 2.03879 5.27649 2.03879Z" fill="currentColor"></path>
                                                </svg>
                                                {isInWishlist(selectedProduct.id) ? 'In Wishlist' : 'Add To Wishlist'}
                                            </button>
                                        </div>
                                        <div className="dz-info mb-0">
                                            <ul>
                                                <li><strong>Category:</strong></li>
                                                <li><Link href={`/shop-list?category=${selectedProduct?.category}`}>{selectedProduct?.category}</Link></li>
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
        </div>
    )
}

export default function ShopStandard() {
    return (
        <Suspense fallback={<div className="text-center py-5">Loading shop...</div>}>
            <ShopStandardContent />
        </Suspense>
    )
}
