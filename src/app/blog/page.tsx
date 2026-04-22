import { Suspense } from "react";
import BlogListClient from "./_components/BlogListClient";

export const metadata = {
    title: "Blog | Epiclance",
    description: "Stories, tips, and updates from Epiclance.",
};

function BlogListFallback() {
    return (
        <div className="page-content bg-light min-vh-50 d-flex align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading blog…</span>
            </div>
        </div>
    );
}

export default function BlogPage() {
    return (
        <Suspense fallback={<BlogListFallback />}>
            <BlogListClient />
        </Suspense>
    );
}
