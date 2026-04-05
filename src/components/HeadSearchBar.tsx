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
            >
                <ul className="recent-tag">
                    <li className="pe-0"><span>Quick Search :</span></li>
                    <li><Link href="/shop?search=Clothes">Clothes</Link></li>
                    <li><Link href="/shop?search=UrbanSkirt">UrbanSkirt</Link></li>
                    <li><Link href="/shop?search=VelvetGown">VelvetGown</Link></li>
                    <li><Link href="/shop?search=LushShorts">LushShorts</Link></li>
                </ul>
            </HeaderShopSearchForm>
            <div className="row">
                <div className="col-xl-12">
                    <h5 className="mb-3">You May Also Like</h5>
                    <SearchCategorySlider />
                </div>
            </div>
        </div>
    );
}
