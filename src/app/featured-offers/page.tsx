import CommanLayout from "@/components/CommanLayout";
import FeaturedOffersPage from "./_components/FeaturedOffersPage";

export const metadata = {
    title: "Featured Offers | Epiclance",
    description: "Browse current promotions and featured offers.",
};

export default function FeaturedOffersRoute() {
    return (
        <CommanLayout>
            <FeaturedOffersPage />
        </CommanLayout>
    );
}
