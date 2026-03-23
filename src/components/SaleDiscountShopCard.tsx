import Link from "next/link";
import IMAGES from "../constant/theme";
import Image, { StaticImageData } from "next/image";

interface Props {
    name: string;
    image: string | StaticImageData;
    /** Small label above title (e.g. category · brand) */
    subtitle?: string;
    /** Legacy CMS: shown as small label if no subtitle */
    description?: string;
    link?: string;
    star?: string;
    price?: number;
    originPrice?: number;
    /** When false, hides price row (e.g. blog cards) */
    showPrice?: boolean;
    /** Blog cards: category only (single line + ellipsis), title clamped to 3 lines */
    isBlogCard?: boolean;
}

const SaleDiscountShopCard = ({
    name,
    image,
    subtitle,
    description,
    link,
    star,
    price,
    originPrice,
    showPrice = true,
    isBlogCard = false,
}: Props) => {
    const label = isBlogCard
        ? (subtitle || "").trim()
        : subtitle || description || "up to 79% off";
    const imgSrc = typeof image === "string" ? image : (image as StaticImageData).src;
    const sale = price;
    const orig = originPrice;
    const hasDiscount =
        orig != null && sale != null && orig > sale && orig > 0;

    return (
        <div className="shop-card style-3">
            <div className="dz-media">
                <Link href={link || "/shop-list"}>
                    <Image
                        src={imgSrc}
                        alt={name}
                        width={500}
                        height={500}
                        style={{ width: "100%", height: "auto" }}
                    />
                </Link>
            </div>
            <div className="dz-content">
                <div>
                    {isBlogCard ? (
                        label ? (
                            <span
                                className="sale-title d-block text-truncate"
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                }}
                                title={label}
                            >
                                {label}
                            </span>
                        ) : null
                    ) : (
                        <span className="sale-title">{label}</span>
                    )}
                    <h6 className="title m-b0">
                        <Link
                            href={link || "/shop-list"}
                            className="text-inherit"
                            title={name}
                            style={
                                isBlogCard
                                    ? {
                                          display: "-webkit-box",
                                          WebkitLineClamp: 3,
                                          WebkitBoxOrient: "vertical" as const,
                                          overflow: "hidden",
                                          wordBreak: "break-word",
                                          lineHeight: 1.35,
                                          maxHeight: "4.05em",
                                          textOverflow: "ellipsis",
                                      }
                                    : {
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical" as const,
                                          overflow: "hidden",
                                          wordBreak: "break-word",
                                          lineHeight: 1.35,
                                          maxHeight: "2.7em",
                                      }
                            }
                        >
                            {name}
                        </Link>
                    </h6>
                </div>
                {showPrice ? (
                    <h6 className="price d-flex flex-wrap align-items-baseline gap-2">
                        {hasDiscount && sale != null ? (
                            <>
                                <span className="text-primary fw-semibold">${sale.toFixed(2)}</span>
                                <del className="text-muted font-14 fw-normal">${orig!.toFixed(2)}</del>
                            </>
                        ) : sale != null && sale > 0 ? (
                            `$${sale.toFixed(2)}`
                        ) : (
                            <>
                                $80
                                <del>$95</del>
                            </>
                        )}
                    </h6>
                ) : null}
            </div>
            {star === "star" ? (
                <span className="sale-badge">
                    50%
                    <br />
                    Sale <Image src={IMAGES.starpng} alt="" />
                </span>
            ) : (
                ""
            )}
        </div>
    );
};

export default SaleDiscountShopCard;
