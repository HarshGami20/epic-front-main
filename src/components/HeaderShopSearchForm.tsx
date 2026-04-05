"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import Categorydropdown from "./CategoryDropdown";

type Props = {
    onAfterNavigate?: () => void;
    placeholder?: string;
    /** Extra classes on the search icon (e.g. `text-secondary` in header style 2) */
    searchIconClassName?: string;
    children?: ReactNode;
};

function buildShopHref(search: string, categoryName: string): string {
    const params = new URLSearchParams();
    const term = search.trim();
    if (term) {
        params.set("search", term);
        params.set("q", term);
    }
    if (categoryName.trim()) params.set("category", categoryName.trim());
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
}

export default function HeaderShopSearchForm({
    onAfterNavigate,
    placeholder = "Search for products",
    searchIconClassName,
    children,
}: Props) {
    const [q, setQ] = useState("");
    const [category, setCategory] = useState("");
    const router = useRouter();

    const submit = () => {
        router.push(buildShopHref(q, category));
        onAfterNavigate?.();
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        submit();
    };

    const iconClass = ["iconly-Light-Search", searchIconClassName].filter(Boolean).join(" ");

    return (
        <form className="header-item-search" onSubmit={onSubmit}>
            <div className="input-group search-input">
                <Categorydropdown value={category} onChange={setCategory} />
                <input
                    type="search"
                    name="search"
                    className="form-control"
                    placeholder={placeholder}
                    aria-label="Search products"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <button className="btn" type="submit" aria-label="Search">
                    <i className={iconClass} />
                </button>
            </div>
            {children}
        </form>
    );
}
