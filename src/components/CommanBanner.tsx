"use client";

import { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPublicCmsPageBySlug } from "@/lib/publicCmsApi";
import { getImageUrl } from "@/lib/imageUtils";

/** Same solid tone as shop page breadcrumb (bg-light / shop gradient base). */
export const BANNER_SOLID_BG = "#BABABA";

interface texttype {
  image?: string | StaticImageData | null;
  mainText: string;
  parentText: string;
  currentText: string;
}

const CommanBanner = ({ image, mainText, parentText, currentText }: texttype) => {
  const pathname = usePathname();
  const [cmsBanners, setCmsBanners] = useState<{
    shopBanner?: string;
    blogBanner?: string;
    accountBanner?: string;
  } | null>(null);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await fetchPublicCmsPageBySlug("epiclance-banners");
        if (data && data.content) {
          setCmsBanners(data.content as any);
        }
      } catch (err) {
        console.error("Failed to fetch epiclance banners CMS page:", err);
      }
    };
    loadBanners();
  }, []);

  // Determine dynamic bg image based on prop or pathname
  let bgUrl = "";
  
  if (image) {
    bgUrl = typeof image === "string" ? image : image.src;
  } else if (cmsBanners) {
    const path = pathname || "";
    if (path.includes("/shop") || path.includes("/categories") || mainText.toLowerCase().includes("shop")) {
      if (cmsBanners.shopBanner) {
        bgUrl = getImageUrl(cmsBanners.shopBanner);
      }
    } else if (path.includes("/blog") || mainText.toLowerCase().includes("blog")) {
      if (cmsBanners.blogBanner) {
        bgUrl = getImageUrl(cmsBanners.blogBanner);
      }
    } else if (
      path.includes("/account") ||
      path.includes("/checkout") ||
      path.includes("/shop-cart") ||
      path.includes("/returns") ||
      path.includes("/wishlist") ||
      mainText.toLowerCase().includes("account") ||
      mainText.toLowerCase().includes("profile") ||
      mainText.toLowerCase().includes("orders") ||
      mainText.toLowerCase().includes("address") ||
      mainText.toLowerCase().includes("cancellation") ||
      mainText.toLowerCase().includes("downloads") ||
      mainText.toLowerCase().includes("refund") ||
      mainText.toLowerCase().includes("shipping") ||
      mainText.toLowerCase().includes("payment") ||
      mainText.toLowerCase().includes("review") ||
      mainText.toLowerCase().includes("checkout") ||
      mainText.toLowerCase().includes("cart") ||
      mainText.toLowerCase().includes("confirmation")
    ) {
      if (cmsBanners.accountBanner) {
        bgUrl = getImageUrl(cmsBanners.accountBanner);
      }
    }
  }

  const hasImage = !!bgUrl && bgUrl.trim() !== "";

  return (
    <div
      className={
        hasImage
          ? "dz-bnr-inr overlay-black-light"
          : "dz-bnr-inr bnr-no-img banner-solid-bg"
      }
      style={
        hasImage
          ? { backgroundImage: `url(${bgUrl})`, backgroundColor: BANNER_SOLID_BG }
          : { backgroundColor: BANNER_SOLID_BG }
      }
    >
      <div className="container">
        <div className="dz-bnr-inr-entry">
          <h1>{mainText}</h1>
          <nav className="breadcrumb-row">
            <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/">{parentText}</Link>
              </li>
              <li className="breadcrumb-item">{currentText}</li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CommanBanner;
