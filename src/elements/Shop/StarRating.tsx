export default function StarRating({ rating = 3 }: { rating?: number }) {
    const roundedRating = Math.round(rating);
    return (
        <>
            {[1, 2, 3, 4, 5].map((star) => (
                <li key={star} className={star <= roundedRating ? "star-fill" : ""}>
                    <i className="flaticon-star-1" />
                </li>
            ))}
        </>
    )
}