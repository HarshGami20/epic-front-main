"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import IMAGES from "@/constant/theme";
import ProductDefaultSlider from "@/elements/Shop/ProductDefaultSlider";
import ThumbnailRightProductDetail from "@/elements/Shop/ThumbnailRightProductDetail";
import ProductTabStyleOne from "@/elements/Shop/ProductTabStyleOne";
import { getPublicApiUrl } from "@/lib/env";

export default function ProductDetailClient({ slug }: { slug: string }) {
    const [productData, setProductData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const url = getPublicApiUrl();
                const res = await fetch(`${url}/public/products?limit=2000`);
                const json = await res.json();

                let matches = [];
                if (json && Array.isArray(json.data)) matches = json.data;
                else if (Array.isArray(json)) matches = json;

                const match = matches.find((p: any) => p.slug === slug);
                if (match) {
                    setProductData(match);
                }

            } catch (err) {
                console.error("Failed to load product", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

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
                                <ProductDefaultSlider productData={productData} />
                            </div>
                        </div>
                        <div className="col-xl-6 col-md-6 col-sm-12 mb-4">
                            <div className="dz-product-detail style-2 p-t20 ps-0">
                                <ThumbnailRightProductDetail productData={productData} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="content-inner-3 pb-6 border-top">
                <div className="container">
                    <ProductTabStyleOne productData={productData} />
                </div>
            </section>
        </div>
    );
}
