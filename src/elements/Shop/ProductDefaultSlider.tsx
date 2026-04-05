"use client"
import Link from "next/link";
import IMAGES from "../../constant/theme";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import { useState } from "react";
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import Image from "next/image";

import { getImageUrl } from '@/lib/imageUtils';

type VariationGallery = { images?: string[] };

export default function ProductDefaultSlider({
    productData,
    activeVariation,
}: {
    productData?: any;
    /** When the shopper picks a color, show that variation's gallery if present. */
    activeVariation?: VariationGallery | null;
}) {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    let sliderImages: any[] = [];
    const variationImages = activeVariation?.images;
    if (Array.isArray(variationImages) && variationImages.length > 0) {
        sliderImages = variationImages.map((img: string) => ({
            url: getImageUrl(img),
            thumbUrl: getImageUrl(img),
            isStatic: false
        }));
    } else if (productData?.thumbImage?.length > 0) {
        sliderImages = productData.thumbImage.map((img: string) => ({
            url: getImageUrl(img),
            thumbUrl: getImageUrl(img),
            isStatic: false
        }));
    } else if (productData?.image) {
        sliderImages = [{
            url: typeof productData.image === 'string' ? productData.image : productData.image.src,
            thumbUrl: typeof productData.image === 'string' ? productData.image : productData.image.src,
            isStatic: typeof productData.image !== 'string',
            staticObj: typeof productData.image === 'string' ? null : productData.image,
            thumbObj: typeof productData.image === 'string' ? null : productData.image
        }];
    } else {
        sliderImages = [
            { url: IMAGES.productdetail2png1.src, thumbUrl: IMAGES.productdetail2thumbpng1.src, isStatic: true, staticObj: IMAGES.productdetail2png1, thumbObj: IMAGES.productdetail2thumbpng1 },
            { url: IMAGES.productdetail2png2.src, thumbUrl: IMAGES.productdetail2thumbpng2.src, isStatic: true, staticObj: IMAGES.productdetail2png2, thumbObj: IMAGES.productdetail2thumbpng2 },
            { url: IMAGES.productdetail2png3.src, thumbUrl: IMAGES.productdetail2thumbpng3.src, isStatic: true, staticObj: IMAGES.productdetail2png3, thumbObj: IMAGES.productdetail2thumbpng3 },
        ];
    }

    return (
        <div className="swiper-btn-center-lr">
            <LightGallery
                plugins={[lgThumbnail, lgZoom]}
                selector={'.DZoomImage'}
            >
                <Swiper className="product-gallery-swiper2 rounded"
                    spaceBetween={0}
                    updateOnWindowResize={true}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[Thumbs]}
                >
                    {sliderImages.map((item, ind) => (
                        <SwiperSlide key={ind}>
                            <div className="dz-media">
                                <Link className="mfp-link lg-item DZoomImage" href={item.url} data-src={item.url}>
                                    <i className="feather icon-maximize dz-maximize top-left" />
                                    {item.isStatic ? (
                                        <Image src={item.staticObj} alt="slider image" className="d-none" />
                                    ) : (
                                        <img src={item.url} alt="slider image" className="d-none" />
                                    )}
                                </Link>
                                {item.isStatic ? (
                                    <Image src={item.staticObj} alt="slider image" />
                                ) : (
                                    <img src={item.url} alt="slider image" style={{ width: '100%', borderRadius: '15px' }} />
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </LightGallery>
            <Swiper className="product-gallery-swiper thumb-swiper-lg"
                spaceBetween={10}
                slidesPerView={2}
                // @ts-ignore
                onSwiper={setThumbsSwiper}
                modules={[Thumbs]}
            >
                {sliderImages.map((item, ind) => (
                    <SwiperSlide key={ind}>
                        {item.isStatic ? (
                            <Image src={item.thumbObj || item.staticObj} alt="thumb" />
                        ) : (
                            <img src={item.thumbUrl} alt="thumb" style={{ width: '100%', borderRadius: '10px' }} />
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}