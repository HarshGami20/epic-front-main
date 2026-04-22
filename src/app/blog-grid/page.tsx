import { redirect } from "next/navigation";

/** @deprecated Use `/blog` — kept for old bookmarks */
export default function BlogGridRedirect() {
    redirect("/blog");
}
