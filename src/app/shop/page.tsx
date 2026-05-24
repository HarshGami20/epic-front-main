import { Suspense } from "react";
import CommanLayout from "@/components/CommanLayout";
import ShopStandard from "./_components/ShopStandard";

function ShopStandardPage() {
    return (
        <CommanLayout>
            <Suspense fallback={<div className="container py-5 text-center">Loading shop...</div>}>
                <ShopStandard />
            </Suspense>
        </CommanLayout>
    )
}
export default ShopStandardPage;