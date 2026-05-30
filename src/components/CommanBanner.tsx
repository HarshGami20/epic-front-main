import { StaticImageData } from "next/image";
import Link from "next/link";

/** Same solid tone as shop page breadcrumb (bg-light / shop gradient base). */
export const BANNER_SOLID_BG = "#BABABA";

interface texttype {
  image?: string | StaticImageData | null;
  mainText: string;
  parentText: string;
  currentText: string;
}

const CommanBanner = ({ image, mainText, parentText, currentText }: texttype) => {
  const hasImage =
    !!image && (typeof image === "string" ? image.trim() !== "" : !!image.src);
  const bgUrl = hasImage ? (typeof image === "string" ? image : image.src) : "";

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
