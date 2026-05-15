import Link from "next/link";

export default function PaginationBlog({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const delta = 1; // Number of pages to show before and after current
        const range = [];
        
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            range.unshift("...");
        }
        if (currentPage + delta < totalPages - 1) {
            range.push("...");
        }

        range.unshift(1);
        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    const pages = getPageNumbers();

    return (
        <>
            {currentPage > 1 && (
                <li className="page-item">
                    <Link href={"#"} className="page-link prev" onClick={(e) => { e.preventDefault(); onPageChange(currentPage - 1); }}>Prev</Link>
                </li>
            )}
            
            {pages.map((p, index) => (
                p === "..." ? (
                    <li className="page-item disabled" key={`ellipsis-${index}`}>
                        <span className="page-link">...</span>
                    </li>
                ) : (
                    <li className="page-item" key={p}>
                        <Link href={"#"} className={`page-link ${currentPage === p ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onPageChange(p as number); }}>
                            {p}
                        </Link>
                    </li>
                )
            ))}

            {currentPage < totalPages && (
                <li className="page-item">
                    <Link href={"#"} className="page-link next" onClick={(e) => { e.preventDefault(); onPageChange(currentPage + 1); }}>Next</Link>
                </li>
            )}
        </>
    )
}