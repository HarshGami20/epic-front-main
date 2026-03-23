import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FeaturedNowSliderData } from "../../constant/Alldata";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";

const FeaturedNowSlider = ({ data }: { data?: any }) => {
    const items = data?.items?.length ? data.items : FeaturedNowSliderData;

    return (
        <Swiper
            speed={1000}
            loop={true}
            parallax={true}
            slidesPerView={3}
            spaceBetween={30}
            watchSlidesProgress={true}
            autoplay={{
                delay: 2500,
            }}
            modules={[Autoplay]}
            breakpoints={{
                1400: {
                    slidesPerView: 3,
                },
                1024: {
                    slidesPerView: 2,
                },
                991: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 1.5,
                },
                600: {
                    slidesPerView: 1,
                },
                575: {
                    slidesPerView: 1,
                },
                340: {
                    slidesPerView: 1,
                    centeredSlides: true,
                },
            }}
            className="swiper swiper-product2 swiper-visible"
        >
            {items.map((item: any, ind: number) => (
                <SwiperSlide key={ind}>
                    <div className="shop-card style-4">
                        <div className="dz-media">
                            <Image src={item.image ? getImageUrl(item.image) : '/assets/images/placeholder.jpg'} alt="image" width={300} height={300} className="w-100 object-cover" />
                        </div>
                        <div className="dz-content">
                            <div>
                                <h6 className="title"><Link href="/shop-list">{item.title || item.name}</Link></h6>
                                <span className="sale-title">{item.description || "Up to 40% Off"}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <h6 className="price">{item.price ? `$${item.price}` : "$80"}</h6>
                                <span className="review"><i className="fa-solid fa-star" />(2k Review)</span>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default FeaturedNowSlider;