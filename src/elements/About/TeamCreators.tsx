import Link from "next/link";

import IMAGES from "../../constant/theme";
import TeamImageCard from "./TeamImageCard";
import { getImageUrl } from "@/lib/imageUtils";

export type TeamCreatorsCmsMember = { image?: string; name?: string; post?: string };

export type TeamCreatorsCms = {
    title?: string;
    subtext?: string;
    joinText?: string;
    joinHref?: string;
    members?: TeamCreatorsCmsMember[];
};

const allteamDataItem = [
    { image: IMAGES.Teampic1, name: "John Doe", post: "CEO & Founder" },
    { image: IMAGES.Teampic2, name: "Ivan Mathews", post: "iOS Developer" },
    { image: IMAGES.Teampic3, name: "Macauley Herring", post: "Customer Success" },
    { image: IMAGES.Teampic4, name: "Alya Levine", post: "CTO" },
    { image: IMAGES.Teampic5, name: "Rose Hernandez", post: "Backend Developer" },
    { image: IMAGES.Teampic6, name: "Elen Benitez", post: "Designer" },
];

const DEFAULT_TITLE = "Meet our team of creators, designers, and world-class problem solvers";
const DEFAULT_SUB =
    "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.";
const DEFAULT_JOIN = "Join Our Team";
const DEFAULT_JOIN_HREF = "/shop-registration";

const TeamCreators = ({ cms }: { cms?: TeamCreatorsCms }) => {
    const title = cms?.title?.trim() || DEFAULT_TITLE;
    const sub = cms?.subtext?.trim() || DEFAULT_SUB;
    const joinText = cms?.joinText?.trim() || DEFAULT_JOIN;
    const joinHref = cms?.joinHref?.trim() || DEFAULT_JOIN_HREF;

    const cmsMembers = Array.isArray(cms?.members) ? cms.members : [];
    const hasAnyCmsMember = cmsMembers.some((m) => m?.image?.trim() || m?.name?.trim() || m?.post?.trim());
    const members = allteamDataItem.map((fallback, idx) => {
        const m = cmsMembers[idx];
        if (!hasAnyCmsMember || !m) return fallback;
        const img = m?.image?.trim() ? getImageUrl(m.image) : fallback.image;
        const name = m?.name?.trim() || fallback.name;
        const post = m?.post?.trim() || fallback.post;
        return { image: img, name, post };
    });

    return (
        <div className="row g-3 g-xl-4">
            <div className="col-xl-6 col-lg-8 col-md-12 col-sm-12 wow fadeInUp" data-wow-delay="0.1s">
                <div className="section-head ">
                    <h2 className="title">{title}</h2>
                    <p>{sub}</p>
                    <Link className="btn btn-secondary me-3" href={joinHref}>
                        {joinText}
                    </Link>
                </div>
            </div>
            {members.map((item, ind) => (
                <div className="col-xl-3 col-lg-4 col-md-4 col-sm-4 col-6" key={ind}>
                    <TeamImageCard image={item.image} name={item.name} post={item.post} />
                </div>
            ))}
        </div>
    );
};

export default TeamCreators;
