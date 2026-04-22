import { notFound } from "next/navigation";
import { fetchPublicBlogBySlug } from "@/lib/publicBlogApi";
import BlogPostDetail from "./_components/BlogPostDetail";

function stripHtml(html: string) {
    if (!html || typeof html !== "string") return "";
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const blog = await fetchPublicBlogBySlug(slug);
    if (!blog) {
        return { title: "Blog post | Epiclance" };
    }
    const desc = stripHtml(blog.shortDesc || blog.description || "");
    return {
        title: `${blog.title} | Epiclance`,
        description: desc || "Epiclance blog",
        openGraph: {
            title: blog.title,
            description: desc,
        },
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const blog = await fetchPublicBlogBySlug(slug);
    if (!blog) {
        notFound();
    }
    return <BlogPostDetail blog={blog} />;
}
