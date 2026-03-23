"use client"

import { useState, useEffect } from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

export default function ShopSidebarPriceSlider({ priceRange, setPriceRange, maxPrice = 1000 }: any) {
    const [priceValue, setPriceValue] = useState({ min: priceRange?.[0] || 0, max: priceRange?.[1] || maxPrice });

    useEffect(() => {
        if (priceRange) {
            setPriceValue({ min: priceRange[0], max: priceRange[1] });
        }
    }, [priceRange]);

    function handleChangeVale(values: any[]) {
        const minVal = parseFloat(String(values[0]).replace(/[^0-9.]/g, '')) || 0;
        const maxVal = parseFloat(String(values[1]).replace(/[^0-9.]/g, '')) || maxPrice;
        setPriceValue({ min: minVal, max: maxVal });
        if (setPriceRange) setPriceRange([minVal, maxVal]);
    }

    return (
        <div className="range-slider style-1">
            <div id="slider-tooltips2" className="mb-3">
                {maxPrice > 0 && (
                    <Nouislider range={{ min: 0, max: maxPrice }} start={[priceValue.min, priceValue.max]} connect
                        format={{
                            to: (value: number) => `₹${value.toFixed(0)}`,
                            from: (value: string) => parseFloat(value.replace('₹', ''))
                        }}
                        onChange={handleChangeVale}
                    />
                )}
            </div>
            <span className="example-val" id="slider-margin-value-min2">Min Price: ₹{priceValue.min}</span>
            <span className="example-val" id="slider-margin-value-max2">Max Price: ₹{priceValue.max}</span>
        </div>
    )
}

