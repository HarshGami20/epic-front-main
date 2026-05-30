"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import CommanBanner from "@/components/CommanBanner";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import CommanLayout from "@/components/CommanLayout";
import { fetchUserReturnRequests } from "@/lib/returnsApi";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-warning text-dark",
  APPROVED: "bg-success text-white",
  REJECTED: "bg-danger text-white",
  COMPLETED: "bg-secondary text-white",
};

export default function AccountReturnRequest() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/account-return-request");
      return;
    }

    const load = async () => {
      try {
        const data = await fetchUserReturnRequests(token, pagination.page);
        setRequests(data.requests || []);
        setPagination(data.pagination || { page: 1, pages: 1 });
      } catch (err: any) {
        toast.error(err.message || "Failed to load return requests.");
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
          mainText="Return Requests"
          parentText="Home"
          currentText="Return Requests"
        />
        <div className="content-inner-1">
          <div className="container">
            <div className="row">
              <CommanSidebar />
              <section className="col-xl-9 account-wrapper">
                <div className="account-card">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">
                      Return Requests{" "}
                      {!loading && (
                        <span className="badge bg-secondary ms-2">
                          {requests.length}
                        </span>
                      )}
                    </h4>
                    <Link href="/account-orders" className="btn btn-outline-secondary btn-sm">
                      <i className="fa-solid fa-arrow-left me-2" />
                      Back to Orders
                    </Link>
                  </div>

                  {loading ? (
                    <div className="py-5 text-center text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status" />
                      Loading return requests...
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="py-5 text-center">
                      <i className="fa-solid fa-rotate-left fa-3x text-muted mb-3 d-block" />
                      <p className="text-muted mb-3">No return requests found.</p>
                      <Link href="/account-orders" className="btn btn-secondary px-4">
                        View Orders
                      </Link>
                    </div>
                  ) : (
                    <div className="row">
                      {requests.map((req) => {
                        const orderItem = req.order?.orderItems?.[0];
                        const productName = orderItem?.product?.name || "Order Item";
                        const thumbImages = orderItem?.product?.thumbImage;
                        const thumb = Array.isArray(thumbImages)
                          ? thumbImages[0]
                          : thumbImages || null;
                        const dateStr = new Date(req.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });

                        return (
                          <div className="col-lg-6 m-b30" key={req.id}>
                            <div className="order-cancel-card">
                              <div className="order-head">
                                <h6 className="mb-0">
                                  Request:{" "}
                                  <span className="text-primary">
                                    {req.order?.orderNumber || "—"}
                                  </span>
                                </h6>
                                <span
                                  className={`badge ${STATUS_BADGE[req.status] || "badge-secondary"}`}
                                >
                                  {req.status}
                                </span>
                              </div>

                              <div className="order-cancel-box">
                                {thumb && (
                                  <div className="cancel-media">
                                    <img
                                      src={thumb}
                                      alt={productName}
                                      className="img-fluid rounded"
                                      style={{ width: 60, height: 60, objectFit: "cover" }}
                                    />
                                  </div>
                                )}
                                <div className="order-cancel-content">
                                  <span className="text-muted" style={{ fontSize: 12 }}>
                                    {dateStr}
                                  </span>
                                  <h5 className="title mb-1">{productName}</h5>
                                  <p className="mb-1 text-muted" style={{ fontSize: 13 }}>
                                    <strong>Reason:</strong> {req.reason}
                                  </p>
                                  {req.adminNote && (
                                    <p className="mb-0 text-info" style={{ fontSize: 12 }}>
                                      <strong>Admin Note:</strong> {req.adminNote}
                                    </p>
                                  )}
                                  <p className="mb-0 mt-1">
                                    <strong>Order Total:</strong>{" "}
                                    ₹{Number(req.order?.total || 0).toFixed(2)}
                                  </p>
                                </div>
                              </div>
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