import React from 'react';
import IMAGES from '../../constant/theme';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';

const collectionImgData = [
    { image: IMAGES.CollectionPng1, design: 'collection1' },
    { image: IMAGES.CollectionPng2, design: 'collection2' },
    { image: IMAGES.CollectionPng3, design: 'collection3' },
    { image: IMAGES.CollectionPng4, design: 'collection4' },
    { image: IMAGES.CollectionPng5, design: 'collection5' },
]

const CollectionBlog = ({ data }: { data?: any }) => {
    const items = data?.items?.length ? data.items : collectionImgData;

    return (
        <React.Fragment>
            <div className="container">
                <h2 className="title wow fadeInUp" data-wow-delay="0.2s">{data?.title || "Upgrade your style with our  top-notch collection."}</h2>
                <div className="text-center">
                    <Link href="/shop-list" className="btn btn-secondary btn-lg wow fadeInUp m-b30" data-wow-delay="0.4s">{data?.buttonText || "All Collections"}</Link>
                </div>
            </div>
            {items.map((item: any, ind: number) => (
                <div className={item.design || `collection${ind + 1}`} key={ind}>
                    <Image src={item.image ? getImageUrl(item.image) : '/assets/images/placeholder.jpg'} alt="ind" width={100} height={100} className="w-100 object-cover" />
                </div>
            ))}

        </React.Fragment>
    );
};

export default CollectionBlog;