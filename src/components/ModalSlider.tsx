"use client"
import { Swiper, SwiperSlide } from "swiper/react";
import IMAGES from "../constant/theme";
import { FreeMode, Thumbs } from "swiper/modules";
import { useState } from "react";
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from '@/lib/imageUtils';

export default function ModalSlider({ productData }: { productData?: any }) {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    function hoverEffect(e: any) {
        const targetRect = e.target.getBoundingClientRect();

        let xValue = ((e.clientX - targetRect.left) / targetRect.width) * 50;
        let yValue = ((e.clientY - targetRect.top) / targetRect.height) * 50;

        e.target.style.cursor = 'pointer';
        e.target.style.transition = '0.1s';
        e.target.style.transform = 'scale(1.5)';
        e.target.style.transformOrigin = `${xValue}% ${yValue}%`;
    }
    function removeHover(e: any) {
        e.target.style.cursor = 'pointer';
        e.target.style.transition = '0.1s';
        e.target.style.transform = 'scale(1)';
        e.target.style.transformOrigin = '0% 0%';
    }

    let sliderImages: any[] = [];
    if (productData?.thumbImage?.length > 0) {
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
        // Fallback or masonry data default
        sliderImages = [
            { url: IMAGES.productlady1.src, thumbUrl: IMAGES.thumbproductlady1.src, isStatic: true, staticObj: IMAGES.productlady1, thumbObj: IMAGES.thumbproductlady1 },
            { url: IMAGES.productlady2.src, thumbUrl: IMAGES.thumbproductlady2.src, isStatic: true, staticObj: IMAGES.productlady2, thumbObj: IMAGES.thumbproductlady2 },
            { url: IMAGES.productlady3.src, thumbUrl: IMAGES.thumbproductlady3.src, isStatic: true, staticObj: IMAGES.productlady3, thumbObj: IMAGES.thumbproductlady3 },
        ];
    }

    return (
        <>
            <LightGallery
                plugins={[lgThumbnail, lgZoom]}
                selector={'.DZoomImage'}
                elementClassNames="h-100 w-100 d-flex flex-column"
            >
                <Swiper className="quick-modal-swiper2"
                    spaceBetween={0}
                    updateOnWindowResize={true}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[Thumbs]}
                    style={{ height: '100%', width: '100%' }}
                >
                    {sliderImages.map((item, ind) => (
                        <SwiperSlide id="lightgallery" key={ind} style={{ height: '100%', objectFit: 'cover' }} >
                            <div className="dz-media" style={{ height: '100%', objectFit: 'cover' }} >
                                <Link className="mfp-link lg-item DZoomImage" style={{ display: 'block', height: '100%', width: '100%', objectFit: 'cover' }} href={item.url} data-src={item.url}>
                                    <i className="feather icon-maximize dz-maximize top-right z-1" />
                                    {item.isStatic ? (
                                        <Image src={item.staticObj} alt="slider"
                                            onMouseEnter={hoverEffect}
                                            onMouseLeave={removeHover}
                                            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <img src={item.url} alt="slider"
                                            onMouseEnter={hoverEffect}
                                            onMouseLeave={removeHover}
                                            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                                        />
                                    )}
                                </Link>

                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </LightGallery>
            <Swiper className="quick-modal-swiper thumb-swiper-lg thumb-sm swiper-vertical"
                spaceBetween={15}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                // @ts-ignore
                onSwiper={setThumbsSwiper}
                modules={[FreeMode, Thumbs]}
            >
                {sliderImages.map((item, ind) => (
                    <SwiperSlide key={ind}>
                        {item.isStatic ? (
                            <Image src={item.thumbObj || item.staticObj} alt="thumb" style={{ height: '50px', width: '50px', objectFit: 'cover', overflow: 'hidden' }} />
                        ) : (
                            <img src={item.thumbUrl} alt="thumb" style={{ height: '50px', width: '50px', objectFit: 'cover', overflow: 'hidden' }} />
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    )
}