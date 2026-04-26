"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductDefaultSlider from "@/elements/Shop/ProductDefaultSlider";
import ThumbnailRightProductDetail from "@/elements/Shop/ThumbnailRightProductDetail";
import ProductDetailPageTabs from "@/elements/Shop/ProductDetailPageTabs";
import { fetchPublicProductBySlug } from "@/lib/publicProductApi";
import { normalizeVariations } from "@/lib/productOptions";

export default function ProductDetailClient({ slug }: { slug: string }) {
    const [productData, setProductData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariationIndex, setSelectedVariationIndex] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchPublicProductBySlug(slug);
                if (data) {
                    setProductData(data);
                    // Add to recently viewed
                    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const productInfo = {
                        id: data.id,
                        name: data.name,
                        image: Array.isArray(data.thumbImage) ? data.thumbImage[0] : data.thumbImage,
                        slug: data.slug,
                        price: data.price
                    };
                    const updated = [productInfo, ...recent.filter((p: any) => p.id !== data.id)].slice(0, 5);
                    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
                }
            } catch (err) {
                console.error("Failed to load product", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slug]);

    const variations = normalizeVariations(productData?.variation);
    const activeVariation =
        selectedVariationIndex === null || variations.length === 0
            ? undefined
            : variations[Math.min(Math.max(0, selectedVariationIndex), variations.length - 1)];

    useEffect(() => {
        setSelectedVariationIndex(null);
    }, [productData?.id, slug]);

    if (loading) {
        return (
            <div className="page-content bg-light">
                <div className="container pt-4 mb-2">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb placeholder-glow">
                            <li className="placeholder col-3 rounded" style={{ height: "20px" }}></li>
                        </ol>
                    </nav>
                </div>
                <section className="content-inner-1 pt-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-6 col-md-6 col-sm-12 mb-4">
                                <div className="dz-product-detail mb-0 placeholder-glow">
                                    <div className="placeholder col-12 rounded" style={{ height: '500px' }}></div>
                                    <div className="d-flex gap-3 mt-3">
                                        <div className="placeholder col-3 rounded" style={{ height: '100px' }}></div>
                                        <div className="placeholder col-3 rounded" style={{ height: '100px' }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-md-6 col-sm-12 mb-4">
                                <div className="dz-product-detail style-2 p-t20 ps-0 placeholder-glow">
                                    <h4 className="title mb-3"><span className="placeholder col-8 rounded" style={{ height: "40px" }}></span></h4>
                                    <div className="placeholder col-2 mb-4 rounded" style={{ height: "20px" }}></div>
                                    <div className="placeholder col-12 mb-2 rounded" style={{ height: "15px" }}></div>
                                    <div className="placeholder col-10 mb-2 rounded" style={{ height: "15px" }}></div>
                                    <div className="placeholder col-11 mb-4 rounded" style={{ height: "15px" }}></div>

                                    <div className="placeholder col-4 mb-3 rounded" style={{ height: '30px' }}></div>
                                    <div className="placeholder col-6 mb-4 rounded" style={{ height: '40px' }}></div>

                                    <div className="placeholder col-5 mt-4 rounded" style={{ height: '50px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="content-inner-3 pb-6 border-top">
                    <div className="container placeholder-glow">
                        <div className="placeholder col-4 mb-3 rounded" style={{ height: "30px" }}></div>
                        <div className="placeholder col-12 mb-2 rounded" style={{ height: "15px" }}></div>
                        <div className="placeholder col-11 mb-2 rounded" style={{ height: "15px" }}></div>
                        <div className="placeholder col-12 mb-2 rounded" style={{ height: "15px" }}></div>
                    </div>
                </section>
            </div>
        );
    }
    if (!productData) return <div className="page-content bg-light"><div className="container py-5 text-center">Product not found.</div></div>;

    return (
        <div className="page-content bg-light">
            <div className="container pt-4 mb-2">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                        <li className="breadcrumb-item"><Link href="/shop">Shop</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">{productData.name || "Details"}</li>
                    </ol>
                </nav>
            </div>
            <section className="content-inner-1 pt-0">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-6 col-md-6 col-sm-12 mb-4">
                            <div className="dz-product-detail mb-0">
                                <ProductDefaultSlider
                                    productData={productData}
                                    activeVariation={activeVariation}
                                />
                            </div>
                        </div>
                        <div className="col-xl-6 col-md-6 col-sm-12 mb-4">
                            <div className="dz-product-detail style-2 p-t20 ps-0">
                                <ThumbnailRightProductDetail
                                    productData={productData}
                                    selectedVariationIndex={selectedVariationIndex}
                                    onVariationChange={setSelectedVariationIndex}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="content-inner-3 pb-6 border-top">
                <div className="container">
                    <ProductDetailPageTabs productData={productData} routeSlug={slug} />
                </div>
            </section>
        </div>
    );
}
