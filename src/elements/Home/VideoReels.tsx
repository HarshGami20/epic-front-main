"use client"

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { Modal } from 'react-bootstrap';
import { getImageUrl } from '@/lib/imageUtils';
import { getPublicApiUrl } from '@/lib/env';

import 'swiper/css';
import 'swiper/css/navigation';



const ActiveVideoPlayer = ({ isActive, item, openReels }: { isActive: boolean; item: any; openReels: boolean }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [expanded, setExpanded] = useState(false);

    React.useEffect(() => {
        if (openReels && isActive && videoRef.current) {
            videoRef.current.currentTime = 0; // Restart from start
            videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
    }, [isActive, openReels]);

    return (
        <div className="w-100 h-100 position-relative bg-black">
            <video
                ref={videoRef}
                src={getImageUrl(item.videoUrl)}
                loop
                muted={false}
                playsInline
                controls={false}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
                onClick={(e) => {
                    const video = e.target as HTMLVideoElement;
                    if (video.paused) video.play();
                    else video.pause();
                }}
            />
            <div className="position-absolute bottom-0 start-0 w-100 p-4 pb-4 text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)', zIndex: 10 }}>
                <div onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
                    <h4 className={`text-white fw-bold mb-2 ${expanded ? '' : 'text-truncate'}`}>{item.title}</h4>
                    <div
                        className="text-light mb-3"
                        dangerouslySetInnerHTML={{ __html: item.description || '' }}
                        style={{
                            fontSize: '15px',
                            ...(expanded
                                ? { maxHeight: '30vh', overflowY: 'auto' }
                                : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' })
                        }}
                    />
                </div>

                <div className="d-flex align-items-center justify-content-between mt-3">
                    {item.price && <h5 className="text-white m-0">${item.price}</h5>}
                    {item.productUrl && (
                        <Link href={item.productUrl} className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-bold">
                            View Product
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

const VideoReels = ({ data }: { data?: any }) => {
    const [openReels, setOpenReels] = useState(false);
    const [initialSlide, setInitialSlide] = useState(0);
    const [allProducts, setAllProducts] = useState<any[]>([]);

    const rawItems = data?.items?.length ? data.items : [];

    React.useEffect(() => {
        if (!rawItems?.some((i: any) => i?.productSlug)) return;
        const load = async () => {
            try {
                const url = getPublicApiUrl();
                const res = await fetch(`${url}/products?limit=500`);
                const json = await res.json();
                const list = json?.data ?? (Array.isArray(json) ? json : []);
                setAllProducts(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error("VideoReels: failed to load products", e);
            }
        };
        load();
    }, [rawItems]);

    const items = React.useMemo(() => {
        if (!rawItems.length) return [];
        const bySlug = Object.fromEntries(
            allProducts.filter((p) => p?.slug).map((p) => [p.slug, p])
        );

        return rawItems.map((item: any) => {
            if (item.productSlug && bySlug[item.productSlug]) {
                const p = bySlug[item.productSlug];
                const thumb = (p.thumbImage && p.thumbImage.length > 0) ? p.thumbImage[0] : (p.images && p.images.length > 0) ? p.images[0] : item.thumbnail;
                return {
                    ...item,
                    title: p.name,
                    description: p.description,
                    price: p.basePrice || p.price || 0,
                    productUrl: `/products/${p.slug}`,
                    thumbnail: thumb
                };
            }
            return item;
        });
    }, [rawItems, allProducts]);

    const handleReelClick = (index: number) => {
        setInitialSlide(index);
        setOpenReels(true);
    };

    if (!items.length) return null;

    return (
        <>
            <div className="section-head style-1 wow fadeInUp d-flex justify-content-between m-b30" data-wow-delay="0.2s">
                <div className="left-content">
                    <h2 className="title">{data?.title || "Reels"}</h2>
                </div>
            </div>

            <Swiper
                slidesPerView={4}
                spaceBetween={15}
                breakpoints={{
                    240: { slidesPerView: 2 },
                    575: { slidesPerView: 3 },
                    991: { slidesPerView: 4 },
                    1200: { slidesPerView: 5 },
                }}
                className="swiper-reels"
            >
                {items.map((item: any, ind: number) => (
                    <SwiperSlide key={ind}>
                        <div
                            className="reel-card position-relative overflow-hidden rounded cursor-pointer border"
                            style={{ aspectRatio: '9/16', cursor: 'pointer', borderRadius: '15px' }}
                            onClick={() => handleReelClick(ind)}
                        >

                            <video
                                src={getImageUrl(item.videoUrl)}
                                poster={item.thumbnail ? getImageUrl(item.thumbnail) : '/assets/images/placeholder.jpg'}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-100 h-100"
                                style={{ objectFit: 'cover' }}
                            />
                            <div className="position-absolute bottom-0 start-0 w-100 p-3 pt-5 text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <i className="fa-brands fa-youtube" style={{ fontSize: '24px' }}></i>
                                    <h6 className="text-white m-0 text-truncate" style={{ fontSize: '15px', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                        {item.title}
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <Modal
                show={openReels}
                onHide={() => setOpenReels(false)}
                centered
                fullscreen
                className="reels-modal"
                contentClassName="bg-black border-0 rounded-0"
                style={{ zIndex: 99999 }}
            >
                <button
                    type="button"
                    className="btn-close btn-close-white position-absolute top-0 end-0 m-4"
                    style={{ zIndex: 1050 }}
                    onClick={() => setOpenReels(false)}
                >
                </button>
                <div className="modal-body p-0 d-flex justify-content-center h-100 align-items-center bg-dark">
                    <div style={{ width: '100%', maxWidth: '450px', height: '100%', maxHeight: '100dvh', position: 'relative' }}>
                        {openReels && (
                            <Swiper
                                direction="vertical"
                                initialSlide={initialSlide}
                                slidesPerView={1}
                                style={{ width: '100%', height: '100%' }}
                                modules={[Navigation]}
                            >
                                {items.map((item: any, ind: number) => (
                                    <SwiperSlide key={ind} style={{ height: '100%' }}>
                                        {({ isActive }) => (
                                            <ActiveVideoPlayer isActive={isActive} item={item} openReels={openReels} />
                                        )}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default VideoReels;
