import { Fragment } from "react/jsx-runtime";
import type { FormEvent } from "react";
import Link from "next/link";
import ShopSidebarPriceSlider from "./ShopSidebarPriceSlider";

export default function ShopSidebar({
    searchQuery = "",
    setSearchQuery = () => {},
    onSearchSubmit,
    categories, selectedCategory, handleCategoryChange,
    brands, selectedBrand, handleBrandChange,
    colors, selectedColor, handleColorChange,
    sizes, selectedSize, handleSizeChange,
    priceRange, setPriceRange, maxPrice
}: any) {
    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        onSearchSubmit?.();
    };

    return (
        <Fragment>
            <div className="widget widget_search">
                <form className="form-group" onSubmit={handleSearch}>
                    <div className="input-group">
                        <input
                            name="dzSearch"
                            type="search"
                            className="form-control"
                            placeholder="Search products"
                            autoComplete="off"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search products"
                        />
                        <div className="input-group-addon">
                            <button type="submit" className="btn" aria-label="Search">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#0D775E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M17.5 17.5L13.875 13.875" stroke="#0D775E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className="widget">
                <h6 className="widget-title">Price</h6>
                <div className="price-slide range-slider">
                    <div className="price">
                        <ShopSidebarPriceSlider priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice} />
                    </div>
                </div>
            </div>

            {colors && colors.length > 0 && (
                <div className="widget">
                    <h6 className="widget-title">Color</h6>
                    <div className="d-flex align-items-center flex-wrap color-filter ps-2">
                        {colors.map((item: any, ind: number) => {
                            const colorVal = item.name || item;
                            const hex = item.hexCode || item;
                            return (
                                <div className="form-check" key={ind}>
                                    <input className="form-check-input" type="radio" name="colorFilter" id={`color-${ind}`} value={colorVal}
                                        checked={selectedColor === colorVal}
                                        onChange={() => handleColorChange(colorVal)}
                                    />
                                    <span style={{ backgroundColor: hex }}></span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {sizes && sizes.length > 0 && (
                <div className="widget">
                    <h6 className="widget-title">Size</h6>
                    <div className="btn-group product-size">
                        {sizes.map((item: any, ind: number) => {
                            const sizeVal = item.name || item;
                            return (
                                <Fragment key={ind}>
                                    <input type="radio" className="btn-check" name="sizeFilter" id={`size-${ind}`}
                                        checked={selectedSize === sizeVal}
                                        onChange={() => handleSizeChange(sizeVal)}
                                    />
                                    <label className="btn" htmlFor={`size-${ind}`}>{sizeVal}</label>
                                </Fragment>
                            )
                        })}
                    </div>
                </div>
            )}

            {categories && categories.length > 0 && (
                <div className="widget widget_categories">
                    <h6 className="widget-title">Category</h6>
                    <ul>
                        <li className="cat-item cat-item-26">
                            <Link href={"#"} onClick={(e) => { e.preventDefault(); handleCategoryChange(''); }} style={{ fontWeight: selectedCategory === '' ? 'bold' : 'normal' }}>All Categories</Link>
                        </li>
                        {categories.map((elem: any, i: number) => {
                            const renderCategory = (cat: any, depth: number) => {
                                const catVal = cat.name || cat;
                                return (
                                    <Fragment key={cat.id || catVal || Math.random()}>
                                        <li className="cat-item cat-item-26" style={{ paddingLeft: `${depth * 15}px`, paddingBottom: '10px' }}>
                                            <Link href={"#"} onClick={(e) => { e.preventDefault(); handleCategoryChange(catVal); }} style={{ fontWeight: selectedCategory === catVal ? 'bold' : 'normal' }}>
                                                {depth > 0 && <span className="me-2">-</span>} {catVal}
                                            </Link>
                                        </li>
                                        {cat.children && cat.children.length > 0 && cat.children.map((child: any) => renderCategory(child, depth + 1))}
                                    </Fragment>
                                );
                            };
                            return renderCategory(elem, 0);
                        })}
                    </ul>
                </div>
            )}

            {brands && brands.length > 0 && (
                <div className="widget widget_tag_cloud">
                    <h6 className="widget-title">Tags (Brands)</h6>
                    <div className="tagcloud">
                        <Link href={"#"} className={selectedBrand === '' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleBrandChange(''); }}>All</Link>
                        {brands.map((item: any, ind: number) => (
                            <Link href={"#"} className={selectedBrand === item ? 'active' : ''} key={ind} onClick={(e) => { e.preventDefault(); handleBrandChange(item); }}>
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </Fragment>
    )
}