import Link from "next/link"
import IMAGES from "@/constant/theme"
import Image from "next/image"
import CommanLayout from "@/components/CommanLayout"

export const metadata = {
    title: "Epiclance Custom Gifts – Personalized Products & Unique Gift Items Online",
    description: "Create memorable moments with Epiclance customized gifts. Design personalized mugs, t-shirts, photo frames, and special gift items for loved ones, events, and corporate gifting.",
};


const ErrorPage1 = () => {
    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <section className="content-inner-1">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-8 col-lg-10 col-md-12">
                                <div className="error-page style-1">
                                    <div className="dz-error-media">
                                        <Image src={IMAGES.ErrorPic4} alt="error" />
                                    </div>
                                    <div className="error-inner">
                                        <h1 className="dz_error">404</h1>
                                        <p className="error-head">Oh, no! This page does not exist.</p>
                                        <Link href="/" className="btn btn-secondary text-uppercase">Go to Main Page</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </CommanLayout>
    )
}
export default ErrorPage1