"use client"

import Link from "next/link";
import { Fragment, useState, useEffect } from "react"
import { Modal } from "react-bootstrap";
import Image from "next/image";

import IMAGES from "@/constant/theme";
import FeaturedBlog from "@/components/FeaturedBlog";
import AboutusBlog from "@/elements/Home/AboutusBlog";
import AllProduction from "@/elements/Home/AllProduction";
import BlockbusterDeal from "@/elements/Home/BlockbusterDeal";
import CollectionBlog from "@/elements/Home/CollectionBlog";
import DzTextSlider from "@/elements/Home/DzTextSlider";
import FeaturedNowSlider from "@/elements/Home/FeaturedNowSlider";
import GreatSaving from "@/elements/Home/GreatSaving";
import HottestBlog from "@/elements/Home/HottestBlog";
import MainBannerSlider2 from "@/elements/Home/MainbannerSlider2";
import OffersectionSlider from "@/elements/Home/OffersectionSlider";
import ProductSection from "@/elements/Home/ProductSection";
import ShortListBlog from "@/elements/Home/ShortListBlog";
import SponsoredSlider from "@/elements/Home/SponsoredSlider";
import SummerSaleBlog from "@/elements/Home/SummerSaleBlog";
import TradingSliderBlog from "@/elements/Home/TradingSliderBlog";
import TrendingBlogCircleCta from "@/elements/Home/TrendingBlogCircleCta";
import MoreCollectionBlog from "@/elements/Home/MoreCollectionBlog";
import VideoReels from "@/elements/Home/VideoReels";
import TrandingSlider from "@/elements/Home2/TrandingSlider";
import VideoSection from "@/elements/Home2/VideoSection";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";

/** CMS explore / modal video URL (string path or `{ url }` from upload). */
function resolveExploreVideoSrc(video: unknown): string {
    if (video == null || video === "") return "";
    if (typeof video === "string") {
        const s = video.trim();
        if (!s) return "";
        const out = getImageUrl(s);
        return typeof out === "string" ? out : "";
    }
    if (typeof video === "object" && video !== null && "url" in video) {
        const u = (video as { url?: string }).url;
        if (typeof u === "string" && u.trim()) {
            const out = getImageUrl(u.trim());
            return typeof out === "string" ? out : "";
        }
    }
    return "";
}

const DEFAULT_LAYOUT = [
    { type: 'mainBannerSlider2', id: '1', enabled: true },
    { type: 'featuredBlog', id: '2', enabled: true },
    { type: 'aboutUsBlog', id: '3', enabled: true },
    { type: 'dzTextSlider', id: '4', enabled: true },
    { type: 'productSection', id: '5', enabled: true },
    { type: 'summerSaleBlog', id: '6', enabled: true },
    { type: 'allProduction', id: '7', enabled: true },
    { type: 'greatSaving', id: '8', enabled: true },
    { type: 'hottestBlog', id: '9', enabled: true },
    { type: 'blockbusterDeal', id: '10', enabled: true },
    { type: 'offerSectionSlider', id: '11', enabled: true },
    { type: 'featuredNowSlider', id: '12', enabled: true },
    { type: 'shortListBlog', id: '13', enabled: true },
    { type: 'sponsoredSlider', id: '14', enabled: true },
    { type: 'tradingSliderBlog', id: '15', enabled: true },
    { type: 'collectionBlog', id: '16', enabled: true },
    { type: 'trendingSlider', id: '17', enabled: true },
    { type: 'videoCarousel', id: '18', enabled: true },
];

const SECTION_COMPONENTS: Record<string, React.FC<any>> = {
    mainBannerSlider2: ({ setOpenVideo, data, setExploreModalVideoSrc }) => (
        <div className="main-slider-wrapper">
            <div className="slider-inner">
                <MainBannerSlider2 data={data} />
                <div className="bottom-content align-items-end wow fadeInUp" data-wow-delay="1.0s">
                    <svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76" fill="none">
                        <path d="M52.6617 37.6496L58.7381 40.0325L75.0609 49.0874L66.6016 63.7422L49.9214 54.6872L45.1557 50.7554L46.1088 57.1892V75.18H28.952V57.1892L30.0243 50.5171L24.9011 54.6872L8.45924 63.7422L0 49.0874L16.3228 39.7942L22.3991 37.6496L16.3228 35.1475L0 26.2117L8.45924 11.557L25.1394 20.4928L30.0243 24.6629L28.952 18.3482V0H46.1088V18.3482L45.1557 24.4246L49.9214 20.4928L66.6016 11.557L75.0609 26.2117L58.7381 35.3858L52.6617 37.6496Z" fill="black" />
                    </svg>
                    <div>
                        <span className="sub-title">{data?.subtitle || "Summer Collection"}</span>
                        <h4 className="title" >{data?.heading || "Trendy and Classic for the New Season"}</h4>
                    </div>
                </div>
                <svg className="star-1" xmlns="http://www.w3.org/2000/svg" width="94" height="94" viewBox="0 0 94 94" fill="none">
                    <path d="M47 0L53.8701 30.4141L80.234 13.766L63.5859 40.1299L94 47L63.5859 53.8701L80.234 80.234L53.8701 63.5859L47 94L40.1299 63.5859L13.766 80.234L30.4141 53.8701L0 47L30.4141 40.1299L13.766 13.766L40.1299 30.4141L47 0Z" fill="#FEEB9D" />
                </svg>
                <svg className="star-2" xmlns="http://www.w3.org/2000/svg" width="82" height="94" viewBox="0 0 82 94" fill="none">
                    <path d="M41 0L45.277 39.592L81.7032 23.5L49.554 47L81.7032 70.5L45.277 54.408L41 94L36.723 54.408L0.296806 70.5L32.446 47L0.296806 23.5L36.723 39.592L41 0Z" fill="black" />
                </svg>
                <Link
                    href="#"
                    className="animation-btn popup-youtube"
                    onClick={(e) => {
                        e.preventDefault();
                        const src = resolveExploreVideoSrc(data?.exploreVideo);
                        if (setExploreModalVideoSrc) {
                            setExploreModalVideoSrc(src || "/assets/images/video.mp4");
                        }
                        setOpenVideo(true);
                    }}
                >
                    <div className="text-row word-rotate-box c-black">
                        <MoreCollectionBlog />
                        <i className="fa-solid fa-play text-dark badge__emoji" />
                    </div>
                </Link>
            </div>
        </div>
    ),
    featuredBlog: ({ data }) => (
        <section className="shop-section overflow-hidden">
            <div className="container-fluid p-0">
                <FeaturedBlog data={data} />
            </div>
        </section>
    ),
    aboutUsBlog: ({ data }) => (
        <section className="content-inner overflow-hidden">
            <div className="container">
                <AboutusBlog data={data} />
            </div>
        </section>
    ),
    dzTextSlider: ({ data }) => (
        <section className="content-inner-3 overflow-hidden">
            <div className="dz-features-wrapper overflow-hidden">
                <DzTextSlider data={data} />
            </div>
        </section>
    ),
    productSection: ({ data }) => (
        <section className="content-inner">
            <div className="container">
                <ProductSection data={data} />
            </div>
        </section>
    ),
    summerSaleBlog: ({ data }) => (
        <section className=" adv-area">
            <div className="container-fluid px-0">
                <SummerSaleBlog data={data} />
            </div>
        </section>
    ),
    allProduction: ({ data }) => (
        <section className="content-inner-2 overflow-hidden">
            <div className="container">
                <AllProduction data={data} />
            </div>
        </section>
    ),
    greatSaving: ({ data }) => (
        <section className="content-inner overflow-hidden p-b0">
            <div className="container">
                <GreatSaving data={data} />
            </div>
        </section>
    ),
    hottestBlog: ({ data }) => (
        <section className="content-inner-3 overflow-hidden " id="Maping">
            <div className="container-fluid p-0">
                <HottestBlog data={data} />
            </div>
        </section>
    ),
    blockbusterDeal: ({ data }) => (
        <section className="content-inner-2 blockbuster-deal-section">
            <div className="container blockbuster-deal-container">
                <div className="section-head style-1 wow fadeInUp d-lg-flex justify-content-between align-items-start gap-3 margin-bottom-0" style={{ marginBottom: 0 }} data-wow-delay="0.2s">
                    <div className="left-content min-w-0 flex-grow-1">
                        <h2
                            className="title mb-0 text-truncate blockbuster-deal-section-title"
                            title={data?.title || "Blockbuster Deals"}
                        >
                            {data?.title || "Blockbuster Deals"}
                        </h2>
                    </div>
                    <Link href="/shop-list" className="text-dark font-14 fw-normal d-flex align-items-center gap-1 flex-shrink-0 text-decoration-none">{data?.linkText || "See All Deals"}
                        <i className="icon feather icon-chevron-right font-18" />
                    </Link>
                </div>
                <BlockbusterDeal data={data} />
            </div>
        </section>
    ),
    offerSectionSlider: ({ data }) => (
        <section className="content-inner-2">
            <div className="container">
                <div className="section-head style-1 wow fadeInUp d-flex flex-column flex-sm-row flex-wrap align-items-start align-items-sm-center justify-content-between gap-2 m-b30" data-wow-delay="0.2s">
                    <div className="left-content min-w-0">
                        <h2 className="title mb-0">{typeof data?.title === "string" && data.title.trim() ? data.title : "Featured offer for you"}</h2>
                    </div>
                    <Link href="/featured-offers" className="text-secondary font-14 d-flex align-items-center gap-1 flex-shrink-0 text-decoration-none">
                        {typeof data?.linkText === "string" && data.linkText.trim() ? data.linkText : "See All"}
                        <i className="icon feather icon-chevron-right font-18" />
                    </Link>
                </div>
            </div>
            <div className="container-fluid px-3">
                <OffersectionSlider data={data} />
            </div>
        </section>
    ),
    featuredNowSlider: ({ data }) => (
        <section className="content-inner  overflow-hidden">
            <div className="container">
                <div className="section-head style-1 wow fadeInUp d-flex justify-content-between" data-wow-delay="0.2s">
                    <div className="left-content">
                        <h2 className="title">{typeof data?.title === 'string' ? data.title : "Featured now"} </h2>
                    </div>
                    <Link href="/shop-list" className="text-secondary font-14 d-flex align-items-center gap-1">{typeof data?.linkText === 'string' ? data.linkText : "See All"}
                        <i className="icon feather icon-chevron-right font-18" />
                    </Link>
                </div>
                <FeaturedNowSlider data={data} />
            </div>
        </section>
    ),
    shortListBlog: ({ data }) => (
        <section className="content-inner overflow-hidden p-b0">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 col-md-12 m-b30">
                        <div className="about-box style-1 clearfix h-100">
                            <div className="dz-media h-100">
                                <Image
                                    src={
                                        data?.mainImg
                                            ? (typeof data.mainImg === "string"
                                                ? getImageUrl(data.mainImg)
                                                : data.mainImg)
                                            : IMAGES.AboutPic2
                                    }
                                    alt=""
                                    width={500}
                                    height={500}
                                    className="w-100 h-100 object-cover"
                                />
                                <div className="media-contant">
                                    <h2 className="title">{data?.title || "Recent Additions to Your Shortlist"}</h2>
                                    <Link
                                        href={
                                            typeof data?.buttonLink === "string" && data.buttonLink.trim()
                                                ? data.buttonLink.trim().startsWith("/") ||
                                                    data.buttonLink.trim().startsWith("http")
                                                    ? data.buttonLink.trim()
                                                    : `/${data.buttonLink.trim()}`
                                                : "/blog-grid"
                                        }
                                        className="btn btn-white"
                                    >
                                        {data?.buttonText || "Shop Now"}
                                    </Link>
                                </div>
                                <svg className="title animation-text" viewBox="0 0 1320 300">
                                    <text x="0" y="">{data?.watermark || "Shortlist"}</text>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12 align-self-center">
                        <ShortListBlog data={data} />
                    </div>
                </div>
            </div>
        </section>
    ),
    sponsoredSlider: ({ data }) => (
        <section className="content-inner-2">
            <div className="container">
                <div className="section-head style-1 wow fadeInUp d-flex flex-column flex-sm-row flex-wrap align-items-start align-items-sm-center justify-content-between gap-2" data-wow-delay="0.2s">
                    <div className="left-content min-w-0">
                        <h2 className="title mb-0">{typeof data?.title === "string" && data.title.trim() ? data.title : "Sponsored"}</h2>
                    </div>
                    <Link
                        href={
                            typeof data?.linkUrl === "string" && data.linkUrl.trim()
                                ? data.linkUrl.trim().startsWith("/") || data.linkUrl.trim().startsWith("http")
                                    ? data.linkUrl.trim()
                                    : `/${data.linkUrl.trim()}`
                                : "/shop-list"
                        }
                        className="text-secondary font-14 d-flex align-items-center gap-1 flex-shrink-0 text-decoration-none"
                    >
                        {typeof data?.linkText === "string" && data.linkText.trim() ? data.linkText : "See All"}
                        <i className="icon feather icon-chevron-right font-18" />
                    </Link>
                </div>
                <SponsoredSlider data={data} />
            </div>
        </section>
    ),
    tradingSliderBlog: ({ data }) => {
        const trendingSeeAllHref =
            typeof data?.linkUrl === "string" && data.linkUrl.trim()
                ? data.linkUrl.trim().startsWith("/") || data.linkUrl.trim().startsWith("http")
                    ? data.linkUrl.trim()
                    : `/${data.linkUrl.trim()}`
                : "/blog-grid";
        const trendingLinkLabel =
            typeof data?.linkText === "string" && data.linkText.trim() ? data.linkText.trim() : "See All";
        return (
            <section className="content-inner-3 overflow-hidden p-b0">
                <div className="container">
                    <div className="row justify-content-between align-items-center">
                        <div className="col-lg-6 col-md-8 col-sm-12">
                            <div className="section-head style-2 m-0 wow fadeInUp" data-wow-delay="0.1s">
                                <div className="left-content">
                                    <h2 className="title mb-2">
                                        {typeof data?.title === "string" && data.title.trim()
                                            ? data.title
                                            : "Discover the most trending posts"}
                                    </h2>
                                    {typeof data?.subtitle === "string" && data.subtitle.trim() ? (
                                        <p className="text-muted mb-0 small">{data.subtitle}</p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-lg-6 col-md-4 col-sm-12 text-md-end m-b30 wow fadeInUp"
                            data-wow-delay="0.2s"
                        >
                            <TrendingBlogCircleCta linkUrl={data?.linkUrl} linkText={data?.linkText} />
                            <Link
                                href={trendingSeeAllHref}
                                className="d-md-none text-secondary font-14 d-inline-flex align-items-center gap-1 text-decoration-none mt-2"
                            >
                                {trendingLinkLabel}
                                <i className="icon feather icon-chevron-right font-18" />
                            </Link>
                        </div>
                    </div>
                </div>
                <TradingSliderBlog data={data} />
            </section>
        );
    },
    collectionBlog: ({ data }) => (
        <section className=" collection-bx content-inner-3 overflow-hidden">
            <CollectionBlog data={data} />
        </section>
    ),
    videoReels: ({ data }) => (
        <section className="content-inner overflow-hidden">
            <div className="container">
                <VideoReels data={data} />
            </div>
        </section>
    ),
    trendingSlider: ({ data }) => {
        const title = typeof data?.title === 'string' && data.title.trim() ? data.title : "What's trending now";
        const desc = typeof data?.description === 'string' && data.description.trim() ? data.description : "Discover the most trending products in Pixio.";
        const btnText = typeof data?.buttonText === 'string' && data.buttonText.trim() ? data.buttonText : "View All";
        const btnLink = typeof data?.buttonLink === 'string' && data.buttonLink.trim() ? data.buttonLink : "/shop-cart";

        return (
            <section className="content-inner-1 overflow-hidden pt-0 m-b30">
                <div className="container">
                    <div className="row justify-content-md-between align-items-center">
                        <div className="col-lg-6 col-md-8 col-sm-12">
                            <div className="section-head style-1 m-b30 wow fadeInUp" data-wow-delay="0.2s">
                                <div className="left-content">
                                    <h2 className="title">{title}</h2>
                                    <p>{desc}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-4 col-sm-12 text-md-end">
                            <Link className="btn btn-secondary m-b30" href={btnLink}>{btnText}</Link>
                        </div>
                    </div>
                    <div className="swiper-btn-center-lr">
                        <TrandingSlider data={data} />
                    </div>
                </div>
            </section>
        );
    },
    videoCarousel: ({ data }) => (
        <section className="video-section">
            <VideoSection data={data} />
        </section>
    )
};

const DEFAULT_EXPLORE_VIDEO = "/assets/images/video.mp4";

const MainSection = () => {
    const [openVideo, setOpenVideo] = useState(false);
    const [exploreModalVideoSrc, setExploreModalVideoSrc] = useState<string>(DEFAULT_EXPLORE_VIDEO);
    const [sections, setSections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHomeLayout = async () => {
            try {
                const url = getPublicApiUrl();
                const headers = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
                const timestamp = new Date().getTime();
                const res = await fetch(`${url}/cms/slug/startupkit-home-layout?t=${timestamp}`, { headers, cache: 'no-store' });

                if (res.ok) {
                    const data = await res.json();
                    const fetchedSections = data?.data?.content?.sections || data?.content?.sections;

                    if (fetchedSections && Array.isArray(fetchedSections)) {
                        const populatedSections = await Promise.all(
                            fetchedSections.map(async (sec: any) => {
                                if (!sec.enabled) return sec;
                                try {
                                    const secRes = await fetch(`${url}/cms/slug/${sec.slug}?t=${timestamp}`, { headers, cache: 'no-store' });
                                    if (secRes.ok) {
                                        const secData = await secRes.json();
                                        return { ...sec, data: secData?.data?.content || secData?.content || {} };
                                    }
                                } catch (e) {
                                    console.error(`Failed to fetch section ${sec.slug}`, e);
                                }
                                return { ...sec, data: {} };
                            })
                        );
                        setSections(populatedSections);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch layout:", err);
            }

            // Fallback to DEFAULT_LAYOUT if no sections provided from CMS or error
            setSections(DEFAULT_LAYOUT);
            setIsLoading(false);
        };

        fetchHomeLayout();
    }, []);

    if (isLoading) {
        return (
            <div className="page-content bg-light d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const layout = (sections && sections.length > 0) ? sections : DEFAULT_LAYOUT;

    return (
        <Fragment>
            <div className="page-content bg-light">
                {layout.filter((l: any) => l.enabled !== false).map((section: any, index: number) => {
                    const Component = SECTION_COMPONENTS[section.type];
                    if (!Component) return null;
                    return (
                        <Component
                            key={section.id || index}
                            setOpenVideo={setOpenVideo}
                            data={section.data}
                            setExploreModalVideoSrc={setExploreModalVideoSrc}
                        />
                    );
                })}

                <Modal
                    className="quick-view-modal"
                    show={openVideo}
                    onHide={() => {
                        setOpenVideo(false);
                    }}
                    centered
                >
                    <button type="button" className="btn-close" onClick={() => setOpenVideo(false)}>
                        <i className="icon feather icon-x" />
                    </button>
                    <div className="modal-body">
                        <video
                            key={exploreModalVideoSrc}
                            width="100%"
                            height="100%"
                            controls
                            autoPlay
                            playsInline
                        >
                            <source src={exploreModalVideoSrc || DEFAULT_EXPLORE_VIDEO} type="video/mp4" />
                        </video>
                    </div>
                </Modal>
            </div>
        </Fragment>
    );
}

export default MainSection;