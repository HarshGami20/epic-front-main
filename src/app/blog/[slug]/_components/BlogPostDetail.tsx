import Link from "next/link";
import Image from "next/image";
import CommanLayout from "@/components/CommanLayout";
import "./blog-post-content.css";
import { getImageUrl, rewriteHtmlImageSources } from "@/lib/imageUtils";
import type { PublicBlog } from "@/lib/publicBlogApi";

function stripHtml(html: string) {
    if (!html || typeof html !== "string") return "";
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function BlogPostDetail({ blog }: { blog: PublicBlog }) {
    const heroSrc = blog.coverImg || blog.thumbImg || "";
    const hero = heroSrc ? getImageUrl(heroSrc) : "";
    const subImages = Array.isArray(blog.subImg) ? blog.subImg.filter(Boolean) : [];
    const descriptionHtml = rewriteHtmlImageSources(blog.description || "");
    const belowHtml = rewriteHtmlImageSources(blog.contentBelowImages || "");

    const categoryHref = blog.category
        ? `/blog?category=${encodeURIComponent(blog.category)}`
        : "/blog";
    const tagHref = blog.tag ? `/blog?tag=${encodeURIComponent(blog.tag)}` : "/blog";

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <div className="section-full post-header blog-single style-1 mb-0">
                    <div className="dz-card text-center">
                        <div
                            className="dz-media overlay-black-middle position-relative w-100"
                            style={{ height: "clamp(280px, 42vh, 520px)" }}
                        >
                            {hero ? (
                                <Image
                                    src={hero}
                                    alt={blog.title}
                                    fill
                                    className="object-cover"
                                    sizes="100vw"
                                    priority
                                />
                            ) : (
                                <div
                                    className="w-100 bg-secondary bg-opacity-25"
                                    style={{ minHeight: 320 }}
                                />
                            )}
                        </div>
                        <div className="dz-info blog-detail-hero-copy">
                            <h1 className="text-white mx-auto px-3">{blog.title}</h1>
                            <div className="dz-meta style-1">
                                <ul className="justify-content-center flex-wrap">
                                    <li className="post-date">{blog.date}</li>
                                    {blog.author ? (
                                        <li className="dz-user">
                                            <i className="fa-solid fa-user" /> By{" "}
                                            <span className="text-white">{blog.author}</span>
                                        </li>
                                    ) : null}
                                    {blog.category ? (
                                        <li>
                                            <Link href={categoryHref} className="text-white text-decoration-underline">
                                                {blog.category}
                                            </Link>
                                        </li>
                                    ) : null}
                                    {blog.tag ? (
                                        <li>
                                            <Link href={tagHref} className="text-white-50 small">
                                                #{blog.tag}
                                            </Link>
                                        </li>
                                    ) : null}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="content-inner-3">
                    <div className="min-container blog-detail-article">
                        <div className="dz-blog blog-single style-1 smb-0">
                            <div className="dz-info">
                                {blog.shortDesc ? (
                                    <p className="lead text-muted mb-4">{stripHtml(blog.shortDesc)}</p>
                                ) : null}
                                <div className="dz-post-text">
                                    {descriptionHtml ? (
                                        <div
                                            className="text blog-html-content"
                                            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                                        />
                                    ) : (
                                        <p>No content available for this post.</p>
                                    )}

                                    {subImages.length > 0 ? (
                                        <figure className="blog-detail-sub-gallery m-t40 m-b30">
                                            <div
                                                className={`blog-detail-bento-grid ${subImages.length === 1
                                                    ? "blog-detail-bento-grid--single"
                                                    : subImages.length === 2
                                                        ? "blog-detail-bento-grid--two"
                                                        : ""
                                                    }`}
                                            >
                                                {subImages.map((src, i) => (
                                                    <div key={i} className="blog-detail-bento-grid__item">
                                                        <div className="blog-detail-sub-gallery__frame rounded-3 ">
                                                            <Image
                                                                src={getImageUrl(src)}
                                                                alt=""
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </figure>
                                    ) : null}
                                    {belowHtml ? (
                                        <div
                                            className="text blog-html-content m-t30"
                                            dangerouslySetInnerHTML={{ __html: belowHtml }}
                                        />
                                    ) : null}
                                </div>

                                <div className="dz-share-post meta-bottom d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4 pt-3 border-top">
                                    <div className="post-tags">
                                        <strong className="me-2">More:</strong>
                                        <Link href="/blog" className="me-2">
                                            All posts
                                        </Link>
                                        {blog.category ? (
                                            <Link href={categoryHref} className="me-2">
                                                {blog.category}
                                            </Link>
                                        ) : null}
                                        {blog.tag ? <Link href={tagHref}>{blog.tag}</Link> : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </CommanLayout>
    );
}
