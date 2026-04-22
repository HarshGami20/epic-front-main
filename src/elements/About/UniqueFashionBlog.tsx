import Image from "next/image";
import IMAGES from "../../constant/theme";
import { getImageUrl } from "@/lib/imageUtils";

export type UniqueFashionBlogCms = {
    title?: string;
    p1?: string;
    p2?: string;
    mainImage?: string;
    quoteName?: string;
    quoteRole?: string;
    quoteImage?: string;
};

const DEFAULT_TITLE = "Elevate Your Style: A Unique Fashion Experience at Pixio";
const DEFAULT_P1 =
    "At Untouch, we're dedicated to creating an exclusive fashion destination that transcends the ordinary. Our passion for style, quality, and individuality drives our mission. Our collection is a carefully curated blend of timeless classics and the latest trends,";
const DEFAULT_P2 =
    "In addition to our extensive collection, we're equally devoted to ensuring your shopping experience is seamless and enjoyable. Our website is designed with your convenience in mind, offering secure transactions and a responsive customer support team to assist you every step of the way.";
const DEFAULT_QUOTE_NAME = "Kenneth Fong";
const DEFAULT_QUOTE_ROLE = "Ceo and founder";

const UniqueFashionBlog = ({ cms }: { cms?: UniqueFashionBlogCms }) => {
    const title = cms?.title?.trim() || DEFAULT_TITLE;
    const p1 = cms?.p1?.trim() || DEFAULT_P1;
    const p2 = cms?.p2?.trim() || DEFAULT_P2;
    const mainSrc = cms?.mainImage?.trim() ? getImageUrl(cms.mainImage) : IMAGES.MenPng;
    const quoteSrc = cms?.quoteImage?.trim() ? getImageUrl(cms.quoteImage) : IMAGES.testimonial4;
    const quoteName = cms?.quoteName?.trim() || DEFAULT_QUOTE_NAME;
    const quoteRole = cms?.quoteRole?.trim() || DEFAULT_QUOTE_ROLE;

    return (
        <div className="container">
            <div className="row about-style2 align-items-xl-center align-items-start">
                <div className="col-lg-6 col-lg-5 col-sm-5 m-b30 sticky-top">
                    <div className="about-thumb">
                        <Image
                            src={mainSrc}
                            alt="Man"
                            width={800}
                            height={1000}
                            className="w-100 h-auto"
                            sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 40vw"
                        />
                    </div>
                </div>
                <div className="col-lg-6 col-md-7 col-sm-7">
                    <div className="about-content">
                        <div className="section-head style-2 d-block">
                            <h3 className="title w-100">{title}</h3>
                            <p>{p1}</p>
                            <p>{p2}</p>
                        </div>
                        <div className="about-bx-detail">
                            <div className="about-bx-pic radius">
                                <Image
                                    src={quoteSrc}
                                    alt="testimonial"
                                    width={120}
                                    height={120}
                                    className="w-100 h-auto"
                                />
                            </div>
                            <div>
                                <h6 className="name">{quoteName}</h6>
                                <span className="position">{quoteRole}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniqueFashionBlog;
