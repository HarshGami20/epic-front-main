"use client";

function HomeSkeleton() {
    const line = "home-sk-line rounded-2 d-block";

    return (
        <>
            <style>{`
                .home-sk .home-sk-line,
                .home-sk .home-sk-block {
                    background: linear-gradient(90deg, #e8ecf3 0%, #f4f6fa 40%, #e8ecf3 80%);
                    background-size: 220% 100%;
                    animation: homeSkShimmer 1.35s ease-in-out infinite;
                    border: 1px solid rgba(255, 255, 255, 0.65);
                }
                @keyframes homeSkShimmer {
                    0% { background-position: 120% 0; }
                    100% { background-position: -120% 0; }
                }
                .home-sk .home-sk-hero-media {
                    min-height: clamp(290px, 42vh, 650px);
                    border-radius: 40px;
                    background: linear-gradient(165deg, #eef1f7 0%, #e4e9f2 45%, #dce2ec 100%);
                    border: 1px solid rgba(0, 0, 0, 0.04);
                }
                .home-sk .home-sk-card {
                    aspect-ratio: 3 / 4;
                    border-radius: 0.75rem;
                    background: linear-gradient(145deg, #eceff6 0%, #e2e7f0 100%);
                    border: 1px solid rgba(0, 0, 0, 0.04);
                }
                .home-sk .home-sk-banner {
                    min-height: 180px;
                    border-radius: 0.75rem;
                    background: linear-gradient(120deg, #e9edf5 0%, #dfe5ef 100%);
                    border: 1px solid rgba(0, 0, 0, 0.04);
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
                        <div className="row main-slide g-4 align-items-center">
                            <div className="col-lg-6">
                                <span className={line} style={{ height: "0.85rem", width: "140px" }} />
                                <span className={`${line} mt-3`} style={{ height: "2.75rem", width: "92%", maxWidth: "420px" }} />
                                <span className={`${line} mt-2`} style={{ height: "2.75rem", width: "72%", maxWidth: "320px" }} />
                                <span className={`${line} mt-4`} style={{ height: "1rem", width: "100px" }} />
                                <span className={`${line} mt-2`} style={{ height: "1.5rem", width: "160px" }} />
                                <div className="d-flex gap-3 mt-4 flex-wrap">
                                    <span className={`${line} home-sk-pill`} />
                                    <span className={`${line} home-sk-pill`} style={{ width: "8.5rem" }} />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="home-sk-hero-media home-sk-block" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured strip */}
                <section className="shop-section overflow-hidden py-4">
                    <div className="container-fluid px-3 px-lg-4">
                        <div className="row g-3">
                            {[0, 1, 2, 3].map((i) => (
                                <div className="col-6 col-md-3" key={i}>
                                    <div className="home-sk-banner home-sk-block" />
                                </div>
                            ))}
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
