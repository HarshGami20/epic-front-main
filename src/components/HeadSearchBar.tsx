"use client";

import Link from "next/link";
import SearchCategorySlider from "./SearchCategorySlider";
import HeaderShopSearchForm from "./HeaderShopSearchForm";

type Props = {
    onAfterNavigate?: () => void;
};

export default function HeadSearchBar({ onAfterNavigate }: Props) {
    return (
        <div className="container">
            <HeaderShopSearchForm
                onAfterNavigate={onAfterNavigate}
                placeholder="Search Product"
            />
            <div className="row">
                <div className="col-xl-12">
                    <h5 className="mb-3">You May Also Like</h5>
                    <SearchCategorySlider />
                </div>
            </div>
        </div>
    );
}
