import Link from "next/link";
import IMAGES from "../../constant/theme";
import { getImageUrl } from "@/lib/imageUtils";

const SummerSaleBlog = ({ data }: { data?: any }) => {
    // We expect exactly 2 items for this layout or we fallback
    const items = data?.items?.length >= 2 ? data.items : [
        { image: IMAGES.ShopLargbnr1.src, title: "Summer", description: "Sale Up to 50% Off", buttonText: "Shop Now" },
        { image: IMAGES.ShopLargbnr2.src, title: "New Summer Collection", description: "Sale Up to 50% Off", buttonText: "Shop Now" }
    ];

    return (
        <div className="row product-style2 g-0">
            <div className="col-lg-6 col-md-12">
                <div className="product-box style-4">
                    <div className="product-media" style={{ backgroundImage: `url(${items[0].image?.src || getImageUrl(items[0].image)})` }}></div>
                    <div className="sale-box">
                        <div className="badge style-1 mb-1">{items[0].description || "Sale Up to 50% Off"}</div>
                        <h2 className="sale-name">{items[0].title || "Summer"}<span>2024</span></h2>
                        <Link href="/shop-list" className="btn btn-outline-secondary btn-lg text-uppercase">{items[0].buttonText || "Shop Now"}</Link>
                    </div>
                </div>
            </div>
            <div className="col-lg-6 col-md-12">
                <div className="product-box style-4">
                    <div className="product-media" style={{ backgroundImage: `url(${items[1].image?.src || getImageUrl(items[1].image)})` }}></div>
                    <div className="product-content">
                        <div className="main-content">
                            <div className="badge style-1 mb-3">{items[1].description || "Sale Up to 50% Off"}</div>
                            <h2 className="product-name">{items[1].title || "New Summer Collection"}</h2>
                        </div>
                        <Link href="/shop-list" className="btn btn-secondary btn-lg text-uppercase">{items[1].buttonText || "Shop Now"}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummerSaleBlog;