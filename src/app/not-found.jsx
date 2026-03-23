import Link from "next/link";
import IMAGES from "@/constant/theme";
import SocialIcon from "@/elements/SocialIcon";
import Image from "next/image";

export const metadata = {
    title: "Epiclance Custom Gifts – Personalized Products & Unique Gift Items Online",
    description: "Create memorable moments with Epiclance customized gifts. Design personalized mugs, t-shirts, photo frames, and special gift items for loved ones, events, and corporate gifting.",
};
export default function page() {
    return (
        <div className="page-content">
            <section className="overflow-hidden">
                <div className="row error-page style-2">
                    <div className="col-lg-6 col-md-6 error-start-content">
                        <div className="logo">
                            <Link href={"/"}><Image src={IMAGES.LogoWhite} alt="logo" /></Link>
                        </div>
                        <div className="dz_error">404</div>
                        <div className="dz-social-icon style-2 white">
                            <SocialIcon />
                        </div>
                        <Image src={IMAGES.CircleLine3} className="bg-img" alt="circle" />
                    </div>
                    <div className="col-lg-6 col-md-6 error-end-content">
                        <div className="error-inner">
                            <h1 className="error-head">OOPS!</h1>
                            <p className="error-para">Oh, no! This page does not exist.</p>
                            <Link href={"/"} className="btn btn-secondary text-uppercase">Go to Main Page</Link>
                        </div>
                        <Image src={IMAGES.CircleLine4} className="bg-img2" alt="" />
                    </div>
                </div>
            </section>
        </div>

    );
}
