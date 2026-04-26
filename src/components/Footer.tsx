"use client";
import IMAGES from "../constant/theme";
import {
    FooterMenu, OurStores,
    UsefulLinks,
    WidgetData
} from "../constant/Alldata";
import SubscribeNewsletter from "./SubscribeNewsletter";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPublicCmsPageBySlug } from "@/lib/publicCmsApi";
import { fetchPublicProducts } from "@/lib/publicProductApi";
import { getImageUrl } from "@/lib/imageUtils";
import AnimatedLogo from "./AnimatedLogo";

interface footertype {
    footerStyle?: string
}

const Footer = (props: footertype) => {
    let year = new Date().getFullYear();
    const [cmsData, setCmsData] = useState<any>(null);
    const [recentProducts, setRecentProducts] = useState<any[]>([]);

    useEffect(() => {
        const loadCms = async () => {
            const data = await fetchPublicCmsPageBySlug("epiclance-footer");
            if (data && data.content) {
                setCmsData(data.content);
            }
        };

        const loadRecentProducts = async () => {
            // Try local storage first
            const localRecent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            if (localRecent.length > 0) {
                setRecentProducts(localRecent.slice(0, 3));
            } else {
                // If not in local, fetch from back (latest products)
                const products = await fetchPublicProducts({ limit: 3 });
                setRecentProducts(products.map(p => ({
                    id: p.id,
                    name: p.name,
                    image: p.thumbImage?.[0] || IMAGES.ProductSmall1,
                    slug: p.slug,
                    price: p.price
                })));
            }
        };

        loadCms();
        loadRecentProducts();
    }, []);

    const footerColumns = cmsData?.columns || [
        { title: "Our Stores", links: OurStores },
        { title: "Useful Links", links: UsefulLinks },
        { title: "Footer Menu", links: FooterMenu }
    ];

    const email = cmsData?.email || "radeonenterprise@gmail.com";
    const phone = cmsData?.phone || "+91 9876543210";
    const address = cmsData?.address || "2, lakshmi Campus, Tulsi Chowk,Katargam, Surat, Gujarat - 395004";
    const copyright = cmsData?.copyright || `© ${year} Epiclance ltd. All Rights Reserved.`;

    return (
        <footer className={`site-footer ${props.footerStyle || "style-1"}`}>
            {/* <!-- Footer Top --> */}
            <div className="footer-top">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-3 col-md-4 col-sm-6"  >
                            <div className="widget widget_about me-2">
                                <div className="footer-logo logo-white">
                                    <Link href={"/"}>
                                        <AnimatedLogo white={props.footerStyle === "footer-dark"} />
                                    </Link>
                                </div>
                                <ul className="widget-address">
                                    <li>
                                        <p><span>Address</span> : {address}</p>
                                    </li>
                                    <li>
                                        <p><span>E-mail</span> : {email}</p>
                                    </li>
                                    <li>
                                        <p><span>Phone</span> : {phone}</p>
                                    </li>
                                </ul>
                                <div className="subscribe_widget">
                                    <h6 className="title fw-medium text-capitalize">subscribe to our newsletter</h6>
                                    <SubscribeNewsletter />
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-4 col-sm-6">
                            <div className="widget widget_post">
                                <h5 className="footer-title">Recent Products</h5>
                                <ul>
                                    {recentProducts.map((item, ind) => (
                                        <li key={ind}>
                                            <div className="dz-media" style={{ width: '60px', height: '60px', position: 'relative' }}>
                                                <Image
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="dz-content">
                                                <h6 className="name"><Link href={`/products/${item.slug}`}>{item.name}</Link></h6>
                                                <span className="price">₹{item.price}</span>
                                            </div>
                                        </li>
                                    ))}
                                    {recentProducts.length === 0 && WidgetData.map((item, ind) => (
                                        <li key={ind}>
                                            <div className="dz-media">
                                                <Image src={item.image} alt="" width={60} height={60} />
                                            </div>
                                            <div className="dz-content">
                                                <h6 className="name"><Link href="#">{item.name}</Link></h6>
                                                <span className="time">Jan 23, 2025</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {footerColumns.map((col: any, colIdx: number) => (
                            <div key={colIdx} className={`col-xl-2 col-md-4 col-sm-4 ${colIdx === 2 ? "" : "col-6"}`}>
                                <div className="widget widget_services">
                                    <h5 className="footer-title">{col.title}</h5>
                                    <ul>
                                        {col.links.map((item: any, ind: number) => (
                                            <li key={ind}><Link href={item.href || "#"}>{item.label || item.name}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/*  Footer Top End  */}

            {/*  Footer Bottom  */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="row fb-inner">
                        <div className="col-lg-6 col-md-12 text-start">
                            <p className="copyright-text">{copyright}</p>
                        </div>
                        <div className="col-lg-6 col-md-12 text-end">
                            <div className="d-flex align-items-center justify-content-center justify-content-md-center justify-content-xl-end">
                                <span className="me-3">We Accept: </span>
                                <Image src={IMAGES.FooterImg} alt="" width={250} height={30} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Footer Bottom End  */}
        </footer>
    );
};

export default Footer;