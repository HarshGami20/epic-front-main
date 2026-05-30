"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import CommanBanner from "@/components/CommanBanner";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import CommanLayout from "@/components/CommanLayout";
import { fetchUserOrders } from "@/lib/ordersApi";

export default function AccountOrder() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<any>({ page: 1, pages: 1 });

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("/login?redirect=/account-orders");
            return;
        }

        const getOrders = async () => {
            try {
                const data = await fetchUserOrders(storedToken, pagination.page);
                setOrders(data.orders || []);
                setPagination(data.pagination || { page: 1, pages: 1 });
            } catch (err: any) {
                console.error(err);
                toast.error(err.message || "Failed to load orders.");
            } finally {
                setLoading(false);
            }
        };

        getOrders();
    }, [router, pagination.page]);

    const handlePageChange = (pageNum: number) => {
        if (pageNum < 1 || pageNum > pagination.pages) return;
        setPagination((prev: any) => ({ ...prev, page: pageNum }));
    };

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner mainText="Orders" parentText="Home" currentText="Orders" />
                <div className="content-inner-1">
                    <div className="container">
                        <div className="row">
                            <CommanSidebar />
                            <div className="col-xl-9 account-wrapper">
                                <div className="account-card">
                                    <div className="table-responsive table-style-1">
                                        {loading ? (
                                            <div className="py-8 text-center font-semibold text-slate-500 text-sm">
                                                Loading your orders...
                                            </div>
                                        ) : orders.length === 0 ? (
                                            <div className="py-8 text-center text-slate-500 text-sm">
                                                <p className="font-semibold mb-3">No orders found.</p>
                                                <Link href="/shop" className="btn btn-secondary btn-sm px-4">Start Shopping</Link>
                                            </div>
                                        ) : (
                                            <table className="table check-tbl table-hover mb-3">
                                                <thead>
                                                    <tr>
                                                        <th>Order #</th>
                                                        <th>Date Purchased</th>
                                                        <th>Status</th>
                                                        <th>Total</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map((order) => {
                                                        const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        });
                                                        
                                                        // Badge style mapping
                                                        let badgeClass = "badge-secondary";
                                                        if (order.status === "PAID" || order.status === "DELIVERED") {
                                                            badgeClass = "bg-success text-white";
                                                        } else if (order.status === "PENDING") {
                                                            badgeClass = "bg-warning text-dark";
                                                        } else if (order.status === "CANCELLED") {
                                                            badgeClass = "bg-danger text-white";
                                                        } else if (order.status === "PROCESSING" || order.status === "SHIPPED") {
                                                            badgeClass = "bg-info text-white";
                                                        }

                                                        return (
                                                            <tr key={order.id}>
                                                                <td>
                                                                    <Link href={`/account-order-details?orderId=${order.id}`} className="fw-bold text-slate-900 hover:text-blue-600 transition-colors">
                                                                        {order.orderNumber}
                                                                    </Link>
                                                                </td>
                                                                <td>{dateStr}</td>
                                                                <td>
                                                                    <span className={`badge m-0 uppercase text-[10px] tracking-wider px-2.5 py-1 font-black ${badgeClass}`}>
                                                                        {order.status}
                                                                    </span>
                                                                </td>
                                                                <td className="fw-black text-slate-900">₹ {Number(order.total).toFixed(2)}</td>
                                                                <td>
                                                                    <Link href={`/account-order-details?orderId=${order.id}`} className="btn-link text-underline p-0 fw-bold">
                                                                        View Details
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                    
                                    {pagination.pages > 1 && (
                                        <div className="d-flex justify-content-center mt-4">
                                            <nav aria-label="Table Pagination">
                                                <ul className="pagination style-1">
                                                    <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                                                        <button 
                                                            className="page-link" 
                                                            onClick={() => handlePageChange(pagination.page - 1)}
                                                        >
                                                            Prev
                                                        </button>
                                                    </li>
                                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                                                        <li key={pageNum} className={`page-item ${pagination.page === pageNum ? "active" : ""}`}>
                                                            <button 
                                                                className="page-link" 
                                                                onClick={() => handlePageChange(pageNum)}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-center" richColors closeButton />
        </CommanLayout>
    );
}