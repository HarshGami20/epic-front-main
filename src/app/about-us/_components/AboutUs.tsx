"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TeamCreators from "@/elements/About/TeamCreators";
import UniqueFashionBlog from "@/elements/About/UniqueFashionBlog";
import { fetchPublicAboutUsPage, fetchPublicCmsPageBySlug } from "@/lib/publicCmsApi";
import { resolvePublicMediaUrl } from "@/lib/imageUtils";

type AboutStatItem = { value: string; label: string };

type FashionCms = {
    title?: string;
    p1?: string;
    p2?: string;
    mainImage?: string;
    quoteName?: string;
    quoteRole?: string;
    quoteImage?: string;
};

type TeamMemberCms = { image?: string; name?: string; post?: string };

type TeamCms = {
    title?: string;
    subtext?: string;
    joinText?: string;
    joinHref?: string;
    members?: TeamMemberCms[];
};

const ABOUT_PAGE_SLUGS = ["epiclance-about-us", "startupkit-about-us", "about-us", "radeon-about-us"];

const DEFAULT_HEADING = "Your Fashion Journey Starts Here Discover Style at Pixio";
const DEFAULT_BREADCRUMB = "About us";
const DEFAULT_STATS: AboutStatItem[] = [
    { value: "50+", label: "Items Sale" },
    { value: "400%", label: "Return on investment" },
];
const DEFAULT_BANNER_LINK = "/about-me";
const DEFAULT_INTRO_TITLE = "why Pixio ?";
const DEFAULT_BANNER_TEXT =
    "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use";
const DEFAULT_CTA_TITLE = "Questions ?";
const DEFAULT_CTA_SUB = "Our experts will help find the grar that's right for you";
const DEFAULT_CTA_BTN = "Get In Touch";
const DEFAULT_CTA_LINK = "/contact-us-1";
const DEFAULT_BANNER_VIDEO = "/assets/images/background/bg-video.mp4";

function videoMimeType(url: string): string {
    const path = url.split("?")[0].toLowerCase();
    if (path.endsWith(".webm")) return "video/webm";
    if (path.endsWith(".ogg") || path.endsWith(".ogv")) return "video/ogg";
    return "video/mp4";
}

function parseCounterStat(value: string): { counter: string; suffix: string } | null {
    const m = String(value || "").trim().match(/^(\d+)(.*)$/);
    if (!m) return null;
    return { counter: m[1], suffix: m[2] || "" };
}

function pickString(v: unknown, fallback: string): string {
    const s = typeof v === "string" ? v.trim() : "";
    return s || fallback;
}

function pickStats(raw: unknown): AboutStatItem[] {
    if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_STATS;
    const out: AboutStatItem[] = [];
    for (const row of raw.slice(0, 2)) {
        if (!row || typeof row !== "object") continue;
        const r = row as Record<string, unknown>;
        const value = String(r.value ?? "").trim();
        const label = String(r.label ?? "").trim();
        if (value || label) out.push({ value: value || "—", label: label || "" });
    }
    return out.length >= 2 ? out : DEFAULT_STATS;
}

function buildFashionCms(content: Record<string, unknown>): FashionCms | undefined {
    const f = content.fashion;
    if (f && typeof f === "object") {
        const o = f as Record<string, unknown>;
        const out: FashionCms = {
            title: pickString(o.title, ""),
            p1: pickString(o.p1, ""),
            p2: pickString(o.p2, ""),
            mainImage: pickString(o.mainImage, ""),
            quoteName: pickString(o.quoteName, ""),
            quoteRole: pickString(o.quoteRole, ""),
            quoteImage: pickString(o.quoteImage, ""),
        };
        const meaningful = Object.values(out).some((v) => v.trim());
        return meaningful ? out : undefined;
    }
    return undefined;
}

function buildTeamCms(content: Record<string, unknown>): TeamCms | undefined {
    const t = content.team;
    if (t && typeof t === "object") {
        const o = t as Record<string, unknown>;
        const members = Array.isArray(o.members)
            ? (o.members as TeamMemberCms[]).map((m) => ({
                  image: pickString(m?.image, ""),
                  name: pickString(m?.name, ""),
                  post: pickString(m?.post, ""),
              }))
            : undefined;
        const out: TeamCms = {
            title: pickString(o.title, ""),
            subtext: pickString(o.subtext, ""),
            joinText: pickString(o.joinText, ""),
            joinHref: pickString(o.joinHref, ""),
            members,
        };
        const memberHit =
            Array.isArray(out.members) &&
            out.members.some((m) => m.image?.trim() || m.name?.trim() || m.post?.trim());
        const metaHit =
            out.title?.trim() ||
            out.subtext?.trim() ||
            out.joinText?.trim() ||
            out.joinHref?.trim();
        if (memberHit || metaHit) return out;
    }
    return undefined;
}

function AboutUsSkeleton() {
    const sk = "about-us-sk-line rounded-2 d-block";
    return (
        <>
            <style>{`
                .about-us-sk .about-us-sk-line {
                    height: 0.75rem;
                    max-width: 100%;
                    background: linear-gradient(90deg, #e8ecf3 0%, #f4f6fa 40%, #e8ecf3 80%);
                    background-size: 220% 100%;
                    animation: aboutUsSkShimmer 1.35s ease-in-out infinite;
                    border: 1px solid rgba(255, 255, 255, 0.65);
                }
                @keyframes aboutUsSkShimmer {
                    0% { background-position: 120% 0; }
                    100% { background-position: -120% 0; }
                }
                .about-us-sk .about-us-sk-video {
                    min-height: 450px;
                    background: linear-gradient(165deg, #f4f6fa 0%, #e9edf5 45%, #e2e7f0 100%);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
                }
                @media (max-width: 991px) {
                    .about-us-sk .about-us-sk-video { min-height: 400px; }
                }
                @media (max-width: 575px) {
                    .about-us-sk .about-us-sk-video { min-height: 350px; }
                }
                .about-us-sk .about-us-sk-card {
                    background: #fff;
                    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }
                .about-us-sk .about-us-sk-thumb {
                    min-height: 320px;
                    border-radius: 0.5rem;
                    background: linear-gradient(180deg, #eef1f7 0%, #e4e9f2 100%);
                    border: 1px solid rgba(0, 0, 0, 0.04);
                }
                .about-us-sk .about-us-sk-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    background: linear-gradient(90deg, #e6eaf2 0%, #f0f3f9 50%, #e6eaf2 100%);
                    background-size: 200% 100%;
                    animation: aboutUsSkShimmer 1.35s ease-in-out infinite;
                    border: 1px solid rgba(255, 255, 255, 0.7);
                }
                .about-us-sk .about-us-sk-team-tile {
                    aspect-ratio: 1;
                    border-radius: 0.35rem;
                    background: linear-gradient(145deg, #eceff6 0%, #e2e7f0 100%);
                    border: 1px solid rgba(0, 0, 0, 0.04);
                }
                @media (max-width: 991px) {
                    .about-us-sk .about-us-sk-card {
                        position: relative !important;
                        right: auto !important;
                        bottom: auto !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: -48px auto 0 !important;
                    }
                }
            `}</style>
            <div
                className="page-content bg-light about-us-sk"
                aria-busy="true"
                aria-label="Loading about page"
            >
                <section className="dz-bnr-inr dz-bnr-inr-sm bg-light">
                    <div className="container">
                        <div className="dz-bnr-inr-entry">
                            <div className="row align-items-center">
                                <div className="col-lg-7 col-md-7">
                                    <div className="text-start mb-xl-0 mb-4">
                                        <span className={sk} style={{ height: "2.25rem", width: "92%", maxWidth: "520px" }} />
                                        <span className={`${sk} mt-3`} style={{ height: "0.85rem", width: "200px" }} />
                                    </div>
                                </div>
                                <div className="col-lg-5 col-md-5">
                                    <div className="about-sale text-start">
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <span className={sk} style={{ height: "2.5rem", width: "72px" }} />
                                                <span className={`${sk} mt-2`} style={{ width: "88%" }} />
                                            </div>
                                            <div className="col-6">
                                                <span className={sk} style={{ height: "2.5rem", width: "72px" }} />
                                                <span className={`${sk} mt-2`} style={{ width: "88%" }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="about-banner overflow-visible position-relative">
                    <div className="about-us-sk-video w-100" />
                    <div
                        className="about-us-sk-card position-absolute p-4 p-md-4"
                        style={{
                            maxWidth: 520,
                            width: "calc(100% - 32px)",
                            bottom: "-72px",
                            right: "8%",
                            zIndex: 2,
                        }}
                    >
                        <span className={sk} style={{ height: "1.35rem", width: "48%", marginBottom: "1rem" }} />
                        <span className={`${sk} mb-2`} style={{ width: "100%" }} />
                        <span className={`${sk} mb-2`} style={{ width: "96%" }} />
                        <span className={sk} style={{ width: "78%" }} />
                    </div>
                </section>
                <div className="m-b30" style={{ minHeight: "clamp(72px, 12vw, 120px)" }} aria-hidden />
                <section className="content-inner pt-4">
                    <div className="container">
                        <div className="row about-style2 align-items-xl-center align-items-start">
                            <div className="col-lg-6 col-lg-5 col-sm-5 m-b30">
                                <div className="about-thumb">
                                    <div className="about-us-sk-thumb w-100" />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-7 col-sm-7">
                                <span className={sk} style={{ height: "1.65rem", width: "100%", marginBottom: "1rem" }} />
                                <span className={`${sk} mb-2`} style={{ width: "100%" }} />
                                <span className={`${sk} mb-2`} style={{ width: "100%" }} />
                                <span className={`${sk} mb-4`} style={{ width: "85%" }} />
                                <div className="d-flex align-items-center gap-3">
                                    <div className="about-us-sk-avatar" />
                                    <div className="flex-grow-1">
                                        <span className={`${sk} mb-2`} style={{ width: "140px" }} />
                                        <span className={sk} style={{ width: "100px" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="get-in-touch bg-light d-flex flex-column flex-md-row align-items-center justify-content-center gap-3 flex-wrap">
                    <div className="m-r100 m-md-r0 m-sm-r0 text-md-start text-center">
                        <span
                            className={`${sk} d-block mx-md-0`}
                            style={{ height: "1.35rem", width: "min(420px, 100%)", margin: "0 auto 0.5rem" }}
                        />
                        <span
                            className={`${sk} d-block mx-md-0`}
                            style={{ height: "1rem", width: "min(360px, 100%)", margin: "0 auto" }}
                        />
                    </div>
                    <span
                        className="about-us-sk-line rounded-2 d-inline-block flex-shrink-0"
                        style={{
                            height: "2.5rem",
                            width: "140px",
                            background: "linear-gradient(90deg, #e4e9f2 0%, #f0f3f9 50%, #e4e9f2 100%)",
                            backgroundSize: "220% 100%",
                            animation: "aboutUsSkShimmer 1.35s ease-in-out infinite",
                            border: "1px solid rgba(255,255,255,0.65)",
                        }}
                    />
                </section>
                <section className="content-inner">
                    <div className="container">
                        <div className="row g-3 g-xl-4">
                            <div className="col-xl-6 col-lg-8 col-md-12">
                                <span className={sk} style={{ height: "1.85rem", width: "100%", marginBottom: "1rem" }} />
                                <span className={`${sk} mb-2`} style={{ width: "100%" }} />
                                <span className={`${sk} mb-2`} style={{ width: "95%" }} />
                                <span className={sk} style={{ height: "2.35rem", width: "160px", marginTop: "0.5rem" }} />
                            </div>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="col-xl-3 col-lg-4 col-md-4 col-sm-4 col-6 text-center">
                                    <div className="about-us-sk-team-tile w-100 mb-2" />
                                    <span className={`${sk} mb-1 d-block mx-auto`} style={{ width: "72%" }} />
                                    <span className={`${sk} d-block mx-auto`} style={{ width: "55%" }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

const AboutUs = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [heading, setHeading] = useState(DEFAULT_HEADING);
    const [breadcrumbLabel, setBreadcrumbLabel] = useState(DEFAULT_BREADCRUMB);
    const [stats, setStats] = useState<AboutStatItem[]>(DEFAULT_STATS);
    const [bannerLinkHref, setBannerLinkHref] = useState(DEFAULT_BANNER_LINK);
    const [introTitle, setIntroTitle] = useState(DEFAULT_INTRO_TITLE);
    const [bannerText, setBannerText] = useState(DEFAULT_BANNER_TEXT);
    const [bannerVideo, setBannerVideo] = useState(DEFAULT_BANNER_VIDEO);
    const [ctaTitle, setCtaTitle] = useState(DEFAULT_CTA_TITLE);
    const [ctaSubtitle, setCtaSubtitle] = useState(DEFAULT_CTA_SUB);
    const [ctaButtonText, setCtaButtonText] = useState(DEFAULT_CTA_BTN);
    const [ctaButtonLink, setCtaButtonLink] = useState(DEFAULT_CTA_LINK);
    const [fashionCms, setFashionCms] = useState<FashionCms | undefined>(undefined);
    const [teamCms, setTeamCms] = useState<TeamCms | undefined>(undefined);

    useEffect(() => {
        const applyContent = (content: Record<string, unknown>) => {
            setHeading(pickString(content.heading ?? content.title, DEFAULT_HEADING));
            setBreadcrumbLabel(pickString(content.breadcrumbLabel, DEFAULT_BREADCRUMB));
            setStats(pickStats(content.stats));
            setBannerLinkHref(pickString(content.bannerLinkHref, DEFAULT_BANNER_LINK));
            setIntroTitle(pickString(content.introTitle, DEFAULT_INTRO_TITLE));
            const desc = pickString(content.bannerText ?? content.description, "");
            setBannerText(desc || DEFAULT_BANNER_TEXT);
            setCtaTitle(pickString(content.ctaTitle, DEFAULT_CTA_TITLE));
            setCtaSubtitle(pickString(content.ctaSubtitle, DEFAULT_CTA_SUB));
            setCtaButtonText(pickString(content.ctaButtonText, DEFAULT_CTA_BTN));
            setCtaButtonLink(pickString(content.ctaButtonLink, DEFAULT_CTA_LINK));
            setBannerVideo(
                pickString(content.bannerVideo ?? content.bannerVideoSrc, DEFAULT_BANNER_VIDEO)
            );
            setFashionCms(buildFashionCms(content));
            setTeamCms(buildTeamCms(content));
        };

        let cancelled = false;

        (async () => {
            try {
                const aboutPage = await fetchPublicAboutUsPage();
                if (cancelled) return;
                if (aboutPage?.content && typeof aboutPage.content === "object") {
                    applyContent(aboutPage.content as Record<string, unknown>);
                    return;
                }

                for (const slug of ABOUT_PAGE_SLUGS) {
                    const page = await fetchPublicCmsPageBySlug(slug);
                    if (cancelled) return;
                    const content = page?.content;
                    if (!content || typeof content !== "object") continue;
                    applyContent(content as Record<string, unknown>);
                    return;
                }
            } catch {
                /* keep theme defaults */
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const hasHtmlBanner = useMemo(() => /<\/?[a-z][\s\S]*>/i.test(bannerText), [bannerText]);

    const bannerVideoResolved = useMemo(() => {
        const raw = bannerVideo.trim() || DEFAULT_BANNER_VIDEO;
        return resolvePublicMediaUrl(raw) || raw;
    }, [bannerVideo]);

    const bannerVideoMime = useMemo(() => videoMimeType(bannerVideoResolved), [bannerVideoResolved]);

    const stat0 = stats[0] ?? DEFAULT_STATS[0];
    const stat1 = stats[1] ?? DEFAULT_STATS[1];
    const stat0Parsed = parseCounterStat(stat0.value);

    if (isLoading) {
        return <AboutUsSkeleton />;
    }

    return (
        <div className="page-content bg-light">
            <section className="dz-bnr-inr dz-bnr-inr-sm bg-light">
                <div className="container">
                    <div className="dz-bnr-inr-entry ">
                        <div className="row align-items-center">
                            <div className="col-lg-7 col-md-7">
                                <div className="text-start mb-xl-0 mb-4">
                                    <h1>{heading}</h1>
                                    <nav aria-label="breadcrumb" className="breadcrumb-row">
                                        <ul className="breadcrumb">
                                            <li className="breadcrumb-item">
                                                <Link href="/"> Home</Link>
                                            </li>
                                            <li className="breadcrumb-item">{breadcrumbLabel}</li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            <div className="col-lg-5 col-md-5 ">
                                <div className="about-sale  text-start">
                                    <div className="row">
                                        <div className="col-lg-5 col-md-6 col-6">
                                            <div className="about-content">
                                                <h2 className="title">
                                                    {stat0Parsed ? (
                                                        <>
                                                            <span className="counter">{stat0Parsed.counter}</span>
                                                            {stat0Parsed.suffix}
                                                        </>
                                                    ) : (
                                                        stat0.value
                                                    )}
                                                </h2>
                                                <p className="text">{stat0.label}</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-5 col-md-6 col-6">
                                            <div className="about-content">
                                                <h2 className="title">{stat1.value}</h2>
                                                <p className="text">{stat1.label}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="about-banner overflow-visible">
                <video
                    key={bannerVideoResolved}
                    autoPlay
                    loop
                    muted
                    id="video-background"
                    playsInline
                >
                    <source src={bannerVideoResolved} type={bannerVideoMime} />
                </video>
                <div className="about-info">
                    <h3 className="dz-title">
                        <Link href={bannerLinkHref || DEFAULT_BANNER_LINK}>{introTitle}</Link>
                    </h3>
                    {hasHtmlBanner ? (
                        <div className="text mb-0" dangerouslySetInnerHTML={{ __html: bannerText }} />
                    ) : (
                        <p className="text mb-0">{bannerText}</p>
                    )}
                </div>
            </section>
            <section className="content-inner">
                <UniqueFashionBlog cms={fashionCms} />
            </section>
            <section className="get-in-touch">
                <div className="m-r100 m-md-r0 m-sm-r0">
                    <h3 className="dz-title mb-lg-0 mb-3">
                        {ctaTitle}
                        <span>{ctaSubtitle}</span>
                    </h3>
                </div>
                <Link href={ctaButtonLink || DEFAULT_CTA_LINK} className="btn btn-light">
                    {ctaButtonText}
                </Link>
            </section>
            <section className="content-inner">
                <div className="container">
                    <TeamCreators cms={teamCms} />
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
