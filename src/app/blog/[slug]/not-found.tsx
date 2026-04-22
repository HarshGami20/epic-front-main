import Link from "next/link";
import CommanLayout from "@/components/CommanLayout";

export default function BlogNotFound() {
    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <section className="content-inner">
                    <div className="container text-center py-5">
                        <h1 className="mb-3">Post not found</h1>
                        <p className="text-muted mb-4">This blog post does not exist or is not published.</p>
                        <Link href="/blog" className="btn btn-secondary">
                            Back to blog
                        </Link>
                    </div>
                </section>
            </div>
        </CommanLayout>
    );
}
