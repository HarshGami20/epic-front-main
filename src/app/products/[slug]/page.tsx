import CommanLayout from "@/components/CommanLayout";
import ProductDetailClient from "./_components/ProductDetailClient";

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    return (
        <CommanLayout>
            <ProductDetailClient slug={slug} />
        </CommanLayout>
    );
}
