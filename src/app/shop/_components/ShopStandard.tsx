"use client"
import Link from "next/link";
import { useState, useEffect, useMemo, Suspense } from "react";
import { Modal, Nav, Tab } from "react-bootstrap";
import { useSearchParams } from "next/navigation";
import CommanBanner from "@/components/CommanBanner";
import IMAGES, { SVGICON } from "@/constant/theme";
import ShopSidebar from "@/elements/Shop/ShopSidebar";
import ShopListCard from "@/elements/Shop/ShopListCard";
import ShopGridCard from "@/elements/Shop/ShopGridCard";

import SelectBoxOne from "@/elements/Shop/SelectBoxOne";
import SelectBoxTwo from "@/elements/Shop/SelectBoxTwo";
import PaginationBlog from "@/elements/Shop/PaginationBlog";
import ProductInputButton from "@/elements/Shop/ProductInputButton";
import ModalSlider from "@/components/ModalSlider";
import BasicModalData from "@/components/BasicModalData";
import { getImageUrl } from '@/lib/imageUtils';
import { TabData } from "@/constant/Alldata";

function ShopStandardContent() {
    const searchParams = useSearchParams();
    const initCategory = searchParams.get('category');

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

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>(initCategory || "");
    const [selectedBrand, setSelectedBrand] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [priceRange, setPriceRange] = useState<number[] | null>(null);
    const [maxPrice, setMaxPrice] = useState<number>(1000);

    // Fetch master filter data (Categories, Colors, Sizes) on mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
                const [catRes, colorsRes, sizesRes, pRes] = await Promise.all([
                    fetch(`${url}/public/categories`),
                    fetch(`${url}/colors`),
                    fetch(`${url}/sizes`),
                    fetch(`${url}/public/products?limit=1&sort=priceDesc`) // getting max price roughly
                ]);

                const catJson = await catRes.json();
                const colorsJson = await colorsRes.json();
                const sizesJson = await sizesRes.json();
                const pJson = await pRes.json();

                // Master Price 
                let pData = pJson?.data || [];
                if (!Array.isArray(pData)) pData = [];
                const highestPrice = pData.length > 0 ? parseFloat(pData[0].basePrice || pData[0].price || 0) : 10000;
                const limit = Math.ceil(highestPrice / 100) * 100 || 1000;
                setMaxPrice(limit);
                setPriceRange((prevRange) => prevRange || [0, limit]);

                if (colorsJson.success && colorsJson.data) setBackendColors(colorsJson.data);
                if (sizesJson.success && sizesJson.data) setBackendSizes(sizesJson.data);

                let catData: any[] = [];
                if (catJson && catJson.data) catData = catJson.data;
                else if (Array.isArray(catJson)) catData = catJson;

                // Build hierarchy
                const map = new Map<string, any>();
                catData.forEach(item => map.set(item.id, { ...item, children: [] }));
                const tree: any[] = [];
                map.forEach(item => {
                    if (item.parentId && map.has(item.parentId)) {
                        map.get(item.parentId)!.children.push(item);
                    } else {
                        tree.push(item);
                    }
                });
                setHierarchicalCategories(tree);

            } catch (err) {
                console.error("Failed to fetch shop filters:", err);
            }
        };
        fetchFilters();
    }, []);

    // Fetch filtered paginated products dynamically
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
                
                const queryParams = new URLSearchParams({
                    page: String(page),
                    limit: '12',
                });
                
                if (selectedCategory && selectedCategory !== 'All Categories') queryParams.append('category', selectedCategory);
                if (selectedBrand && selectedBrand !== 'All Brands') queryParams.append('brand', selectedBrand);
                if (selectedColor) queryParams.append('color', selectedColor);
                if (selectedSize) queryParams.append('size', selectedSize);
                if (priceRange) {
                    queryParams.append('minPrice', String(priceRange[0]));
                    queryParams.append('maxPrice', String(priceRange[1]));
                }
                if (searchQuery) queryParams.append('search', searchQuery);

                const prodRes = await fetch(`${url}/public/products?${queryParams.toString()}`);
                const prodJson = await prodRes.json();
                
                let productsData = [];
                if (prodJson && prodJson.data) productsData = prodJson.data;
                else if (Array.isArray(prodJson)) productsData = prodJson;

                setProducts(productsData);

                if (prodJson && prodJson.pagination) {
                    setTotalPages(prodJson.pagination.pages || 1);
                }
            } catch (err) {
                console.error("Failed to fetch products API:", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [page, selectedCategory, selectedBrand, selectedColor, selectedSize, priceRange, searchQuery]);

    // Reset pagination to 1 whenever any filter changes (except page itself)
    useEffect(() => {
        setPage(1);
    }, [selectedCategory, selectedBrand, selectedColor, selectedSize, priceRange, searchQuery]);

    // Format filters for sidebars properly
    const categories = hierarchicalCategories; // passing the full nested tree
    const brands: string[] = []; // Currently we dropped master brands scraping 
    const colors = backendColors;
    const sizes = backendSizes.map((s: any) => s.name).filter(Boolean);

    const displayProducts = products;

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

    return (
        <div className="page-content bg-light">
            <CommanBanner parentText="Home" currentText="Shop Standard" mainText="Shop Standard" image={IMAGES.BackBg1.src} />
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
                                            <Link href={"#"} className="btn btn-sm font-14 btn-secondary btn-sharp text-nowrap" onClick={(e) => { e.preventDefault(); setSearchQuery(''); setSelectedCategory(''); setSelectedBrand(''); setSelectedColor(''); setSelectedSize(''); setPriceRange([0, maxPrice]); }}>RESET</Link>
                                        </div>
                                        <ShopSidebar
                                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
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
                                <div className="filter-wrapper">
                                    <div className="filter-left-area">
                                        <ul className="filter-tag">
                                            {selectedCategory && (
                                                <li>
                                                    <Link href={"#"} onClick={(e) => { e.preventDefault(); setSelectedCategory('') }} className="tag-btn">{selectedCategory}
                                                        <i className="icon feather icon-x tag-close" />
                                                    </Link>
                                                </li>
                                            )}
                                            {selectedBrand && (
                                                <li>
                                                    <Link href={"#"} onClick={(e) => { e.preventDefault(); setSelectedBrand('') }} className="tag-btn">{selectedBrand}
                                                        <i className="icon feather icon-x tag-close" />
                                                    </Link>
                                                </li>
                                            )}
                                        </ul>
                                        <span>Showing {displayProducts.length > 0 ? 1 : 0}–{displayProducts.length} of {displayProducts.length} Results</span>
                                    </div>
                                    <div className="filter-right-area">
                                        <Link href={"#"} className="panel-btn me-2"
                                            onClick={() => setMobileSidebar(true)}
                                        >
                                            <svg className="me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" width="20" height="20"><g id="Layer_28" data-name="Layer 28"><path d="M2.54,5H15v.5A1.5,1.5,0,0,0,16.5,7h2A1.5,1.5,0,0,0,20,5.5V5h2.33a.5.5,0,0,0,0-1H20V3.5A1.5,1.5,0,0,0,18.5,2h-2A1.5,1.5,0,0,0,15,3.5V4H2.54a.5.5,0,0,0,0,1ZM16,3.5a.5.5,0,0,1,.5-.5h2a.5.5,0,0,1,.5.5v2a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5Z"></path><path d="M22.4,20H18v-.5A1.5,1.5,0,0,0,16.5,18h-2A1.5,1.5,0,0,0,13,19.5V20H2.55a.5.5,0,0,0,0,1H13v.5A1.5,1.5,0,0,0,14.5,23h2A1.5,1.5,0,0,0,18,21.5V21h4.4a.5.5,0,0,0,0-1ZM17,21.5a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5v-2a.5.5,0,0,1,.5-.5h2a.5.5,0,0,1,.5.5Z"></path><path d="M8.5,15h2A1.5,1.5,0,0,0,12,13.5V13H22.45a.5.5,0,1,0,0-1H12v-.5A1.5,1.5,0,0,0,10.5,10h-2A1.5,1.5,0,0,0,7,11.5V12H2.6a.5.5,0,1,0,0,1H7v.5A1.5,1.5,0,0,0,8.5,15ZM8,11.5a.5.5,0,0,1,.5-.5h2a.5.5,0,0,1,.5.5v2a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5Z"></path></g></svg>                                            Filter
                                        </Link>
                                    </div>
                                </div>
                                <div className="row gx-xl-4 g-3 mb-4">
                                    {renderProducts('grid')}
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
