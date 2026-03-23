import Image, { StaticImageData } from "next/image";

interface ProductTabtype {
    productData?: any;
}
export default function ProductTabStyleOne(props: ProductTabtype) {
    const product = props.productData || {};
    const title = product.name || "Product Description";
    const descriptionHTML = product.description || "No description provided.";

    return (
        <>
            <div className="detail-bx text-left" style={{ overflow: "hidden", wordWrap: "break-word", overflowWrap: "break-word", maxWidth: "100%" }}>
                <h5 className="title mb-4">{title}</h5>
                <div
                    className="para-text"
                    dangerouslySetInnerHTML={{ __html: descriptionHTML }}
                    style={{ wordBreak: 'break-word', width: '100%', overflowX: 'hidden' }}
                />
            </div>
        </>
    )
}