import Link from "next/link";

export default function PaginationBlog({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <>
            {currentPage > 1 && (
                <li className="page-item">
                    <Link href={"#"} className="page-link prev" onClick={(e) => { e.preventDefault(); onPageChange(currentPage - 1); }}>Prev</Link>
                </li>
            )}
            
            {pages.map((p) => (
                <li className="page-item" key={p}>
                    <Link href={"#"} className={`page-link ${currentPage === p ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onPageChange(p); }}>
                        {p}
                    </Link>
                </li>
            ))}

            {currentPage < totalPages && (
                <li className="page-item">
                    <Link href={"#"} className="page-link next" onClick={(e) => { e.preventDefault(); onPageChange(currentPage + 1); }}>Next</Link>
                </li>
            )}
        </>
    )
}