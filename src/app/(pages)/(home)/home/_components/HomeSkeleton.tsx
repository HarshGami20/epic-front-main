"use client";

function HomeSkeleton() {
    const line = "home-sk-line rounded-2 d-block";

    return (
        <>
            <style>{`
                .home-sk .home-sk-line,
                .home-sk .home-sk-block,
                .home-sk .home-sk-hero-media,
                .home-sk .home-sk-card,
                .home-sk .home-sk-banner,
                .home-sk .home-sk-pill {
                    background-color: currentColor !important;
                    background-image: none !important;
                    opacity: 0.12;
                    animation: placeholder-glow 2s ease-in-out infinite;
                    border: none !important;
                }
                @keyframes placeholder-glow {
                    0%, 100% { opacity: 0.15; }
                    50% { opacity: 0.08; }
                }
                .home-sk .home-sk-hero-media {
                    height: clamp(700px, 71vh, 650px);
                    border-radius: 40px;
                    width: 100%;
                }
                @media only screen and (max-width: 991.98px) {
                    .home-sk .home-sk-hero-media {
                        height: clamp(290px, 42vh, 380px);
                    }
                }
                .home-sk .home-sk-card {
                    aspect-ratio: 3 / 4;
                    border-radius: 0.75rem;
                }
                .home-sk .home-sk-banner {
                    min-height: 180px;
                    border-radius: 0.75rem;
                }
                .home-sk .home-sk-pill {
                    height: 2.25rem;
                    width: 7rem;
                    border-radius: 999px;
                }
            `}</style>
            <div
                className="page-content bg-light home-sk"
                aria-busy="true"
                aria-label="Loading home page"
            >
                {/* Hero */}
                <div className="main-slider-wrapper">
                    <div className="slider-inner">
                        <div className="row main-slide align-items-center">
                            <div className="col-lg-6 slider-main">
                                <span className={line} style={{ height: "0.85rem", width: "140px" }} />
                                <span className={`${line} mt-3`} style={{ height: "2.75rem", width: "92%", maxWidth: "420px" }} />
                                <span className={`${line} mt-2`} style={{ height: "2.75rem", width: "72%", maxWidth: "320px" }} />
                                <span className={`${line} mt-4`} style={{ height: "1rem", width: "100px" }} />
                                <span className={`${line} mt-2`} style={{ height: "1.5rem", width: "160px" }} />
                                <div className="d-flex gap-3 mt-4 flex-wrap">
                                    <span className={`${line} home-sk-pill`} style={{ width: "9rem", height: "3.25rem", borderRadius: "30px" }} />
                                    <span className={`${line} home-sk-pill`} style={{ width: "9.5rem", height: "3.25rem", borderRadius: "30px" }} />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="slider-thumbs py-2 pe-3">
                                    <div className="row g-3 flex-nowrap overflow-hidden">
                                        <div className="col-6">
                                            <div className="home-sk-hero-media home-sk-block" />
                                        </div>
                                        <div className="col-6">
                                            <div className="home-sk-hero-media home-sk-block" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured Categories (featuredBlog) */}
                <section className="shop-section overflow-hidden p-0">
                    <div className="container-fluid p-0">
                        <div className="row g-0">
                            <div className="col-lg-8 left-box d-flex align-items-center">
                                <div className="d-flex gap-4 flex-nowrap overflow-hidden w-100 justify-content-between px-3 px-lg-5">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex-shrink-0 text-center" style={{ width: "160px" }}>
                                            <div className="shop-box style-1 mb-0">
                                                <div className="dz-media" style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
                                                    <div className="home-sk-block" style={{ width: "160px", height: "170px", borderRadius: "20px" }} />
                                                </div>
                                                <div className="product-name" style={{ background: "#fff", border: "1px solid #000" }}>
                                                    <span className={line} style={{ height: "0.85rem", width: "70px", margin: "0 auto" }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-lg-4 right-box text-start px-4 px-lg-5 justify-content-center">
                                <div className="w-100 px-lg-4">
                                    <span className={`${line}`} style={{ height: "2.25rem", width: "80%", maxWidth: "280px", opacity: 0.15 }} />
                                    <span className={`${line} mt-3`} style={{ height: "1rem", width: "90%", maxWidth: "320px", opacity: 0.15 }} />
                                    <span className={`${line} mt-2`} style={{ height: "1rem", width: "60%", maxWidth: "200px", opacity: 0.15 }} />
                                    <div className="d-flex gap-3 mt-4">
                                        <span className={`${line}`} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", opacity: 0.15 }} />
                                        <span className={`${line}`} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", opacity: 0.15 }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* About block */}
                <section className="content-inner overflow-hidden">
                    <div className="container">
                        <div className="row g-4 align-items-center">
                            <div className="col-lg-6">
                                <div className="home-sk-banner home-sk-block" style={{ minHeight: "320px" }} />
                            </div>
                            <div className="col-lg-6">
                                <span className={line} style={{ height: "2rem", width: "70%", maxWidth: "360px" }} />
                                <span className={`${line} mt-3`} style={{ height: "0.85rem", width: "100%" }} />
                                <span className={`${line} mt-2`} style={{ height: "0.85rem", width: "94%" }} />
                                <span className={`${line} mt-2`} style={{ height: "0.85rem", width: "88%" }} />
                                <span className={`${line} mt-4 home-sk-pill`} style={{ width: "9rem" }} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Text slider */}
                <section className="content-inner-3 overflow-hidden py-3">
                    <div className="d-flex gap-4 px-3 flex-nowrap overflow-hidden">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <span key={i} className={`${line} flex-shrink-0`} style={{ height: "1.25rem", width: "160px" }} />
                        ))}
                    </div>
                </section>

                {/* Product grid */}
                <section className="content-inner">
                    <div className="container">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <span className={line} style={{ height: "2rem", width: "220px" }} />
                            <div className="d-flex gap-2">
                                {[0, 1, 2, 3].map((i) => (
                                    <span key={i} className={`${line} home-sk-pill`} style={{ width: "5.5rem" }} />
                                ))}
                            </div>
                        </div>
                        <div className="row g-4">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div className="col-6 col-md-4 col-lg-3" key={i}>
                                    <div className="home-sk-card home-sk-block mb-3" />
                                    <span className={line} style={{ height: "0.85rem", width: "88%" }} />
                                    <span className={`${line} mt-2`} style={{ height: "1rem", width: "55%" }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Promo banner */}
                <section className="content-inner-2 overflow-hidden pb-0">
                    <div className="container">
                        <div className="home-sk-banner home-sk-block" style={{ minHeight: "240px" }} />
                    </div>
                </section>
            </div>
        </>
    );
}

export default HomeSkeleton;
