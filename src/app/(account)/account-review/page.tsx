"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import CommanLayout from "@/components/CommanLayout";
import { getPublicApiUrl } from "@/lib/env";
import { getImageUrl } from "@/lib/imageUtils";

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
  } | null;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map((s) => (
      <i
        key={s}
        className={`fa fa-star ${s <= rating ? "text-yellow" : "text-muted"} me-1`}
        style={{ fontSize: 12 }}
      />
    ))}
  </div>
);

export default function AccountReview() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const email = user?.email;

    if (!token) {
      router.push("/login?redirect=/account-review");
      return;
    }

    if (!email) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const base = getPublicApiUrl();
        const res = await fetch(
          `${base}/public/reviews?email=${encodeURIComponent(email)}&page=${pagination.page}&limit=20`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to fetch reviews");
        setReviews(json.data?.reviews || []);
        setPagination(json.data?.pagination || { page: 1, pages: 1 });
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Could not load your reviews.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, pagination.page]);

  const handlePageChange = (p: number) => {
    if (p < 1 || p > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page: p }));
  };

  return (
    <CommanLayout>
      <div className="page-content bg-light">
        <Toaster position="top-center" richColors closeButton />
        <CommanBanner
          image={IMAGES.BackBg1.src}
          mainText="My Reviews"
          parentText="Home"
          currentText="My Reviews"
        />
        <div className="content-inner-1">
          <div className="container">
            <div className="row">
              <CommanSidebar />
              <section className="col-xl-9 account-wrapper">
                <div className="account-card">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">
                      My Reviews
                      {!loading && (
                        <span className="badge bg-secondary ms-2">{reviews.length}</span>
                      )}
                    </h4>
                  </div>

                  {loading ? (
                    <div className="py-5 text-center text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status" />
                      Loading your reviews...
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-5 text-center">
                      <i className="fa-regular fa-star fa-3x text-muted mb-3 d-block" />
                      <p className="text-muted mb-3">You haven't submitted any reviews yet.</p>
                      <Link href="/shop" className="btn btn-secondary px-4">
                        Shop &amp; Review
                      </Link>
                    </div>
                  ) : (
                    <div className="row">
                      {reviews.map((review) => {
                        const dateStr = new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                        return (
                          <div className="col-md-6 m-b30" key={review.id}>
                            <div className="review-card">
                              <div className="review-head">
                                {review.product?.thumbnail && (
                                  <div className="review-media">
                                    <img
                                      src={getImageUrl(review.product.thumbnail)}
                                      alt={review.product?.name || "Product"}
                                      style={{
                                        width: 48,
                                        height: 48,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="clearfix">
                                  <h5 className="mb-0" style={{ fontSize: 14 }}>
                                    {review.product ? (
                                      <Link
                                        href={`/products/${review.product.slug}`}
                                        className="text-slate-900 hover:text-primary"
                                      >
                                        {review.product.name}
                                      </Link>
                                    ) : (
                                      "Product (removed)"
                                    )}
                                  </h5>
                                  <StarRating rating={review.rating} />
                                  {review.verifiedPurchase && (
                                    <small className="text-success fw-bold" style={{ fontSize: 10 }}>
                                      ✓ Verified Purchase
                                    </small>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2">
                                <p className="fw-bold mb-1" style={{ fontSize: 14 }}>
                                  {review.title}
                                </p>
                                <p className="text-muted mb-2" style={{ fontSize: 13, lineHeight: 1.5 }}>
                                  {review.body}
                                </p>
                                <small className="text-muted d-block">{dateStr}</small>
                              </div>

                              {review.images && review.images.length > 0 && (
                                <div className="d-flex gap-2 flex-wrap mt-2">
                                  {review.images.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={getImageUrl(img)}
                                      alt={`Review image ${idx + 1}`}
                                      style={{
                                        width: 52,
                                        height: 52,
                                        objectFit: "cover",
                                        borderRadius: 6,
                                        border: "1px solid #e2e8f0",
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {pagination.pages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <nav>
                        <ul className="pagination style-1">
                          <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pagination.page - 1)}
                            >
                              Prev
                            </button>
                          </li>
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                            <li
                              key={p}
                              className={`page-item ${pagination.page === p ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(p)}
                              >
                                {p}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pagination.page + 1)}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </CommanLayout>
  );
}