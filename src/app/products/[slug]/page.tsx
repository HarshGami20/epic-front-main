import CommanLayout from "@/components/CommanLayout";
import ProductDetailClient from "./_components/ProductDetailClient";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    return (
        <CommanLayout>
            <ProductDetailClient slug={params.slug} />
        </CommanLayout>
    );
}
