import { StaticImageData } from "next/image";
import Link from "next/link";

interface texttype {
    image?: string | StaticImageData | null,
    mainText : string
    parentText : string
    currentText : string
}

const CommanBanner = ({image,mainText,parentText,currentText} : texttype) => {
    const hasImage = !!image && (typeof image === 'string' ? image.trim() !== "" : !!image.src);
    const bgUrl = hasImage ? (typeof image === 'string' ? image : image.src) : "";

    return (
        <div 
            className={`dz-bnr-inr ${hasImage ? 'overlay-black-light' : 'bnr-no-img'}`} 
            style={
                hasImage
                    ? { backgroundImage: `url(${bgUrl})`, backgroundColor: '#aaaaaa' }
                    : { backgroundColor: '#aaaaaa' }
            }
        >
            <div className="container" >
                <div className="dz-bnr-inr-entry">
                    <h1>{mainText}</h1>
                    <nav className="breadcrumb-row">
                        <ul className="breadcrumb">
                            <li className="breadcrumb-item"><Link href="#"> {parentText}</Link></li>
                            <li className="breadcrumb-item">{currentText}</li>
                        </ul>
                    </nav>
                </div>
            </div>	
        </div>
    );
};

export default CommanBanner;