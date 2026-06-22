import Link from "next/link";
import { SOCIAL_LINKS } from "@/constant/socialLinks";

export default function SocialIcon(){
    return(
        <ul>
            <li className="me-1">
                <Link href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-facebook-f"/>
                </Link>
            </li>
            <li className="me-1">
                <Link href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-twitter"/>
                </Link>
            </li>
            <li>
                <Link href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-instagram"/>
                </Link>
            </li>
        </ul>
    )
}
