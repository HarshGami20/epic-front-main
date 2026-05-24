"use client"
import { useEffect, Suspense } from "react";
import Link from "next/link";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import Image from "next/image";
import CommanLayout from "@/components/CommanLayout";
import { useCartWishlistStore } from "@/stores/useCartWishlistStore";
import { useSearchParams } from "next/navigation";

function AccountOrderConfirmContent() {
    const { clearCart } = useCartWishlistStore();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId") || `ORD-${Date.now().toString().slice(-8)}`;

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner image={IMAGES.BackBg1.src} mainText="Order Confirmation" parentText="Home" currentText="Order Confirmation" />
                <div className="content-inner-1">
                    <div className="container">
                        <div className="row">
                            <CommanSidebar />
                            <section className="col-xl-9 account-wrapper">
                                <div className="confirmation-card account-card">
                                    <div className="thumb">
                                        <Image src={IMAGES.Confirmation} alt="confirm" />
                                    </div>
                                    <div className="text-center mt-4">
                                        <h4 className="mb-3 text-capitalize">Your Order Is Completed !</h4>
                                        <p className="mb-2">You will receive an order confirmation email with details of your order.</p>
                                        <p className="mb-0">Order ID: {orderId}</p>
                                        <div className="mt-4 d-sm-flex gap-3 justify-content-center">
                                            <Link href="/account-orders" className="btn my-1 btn-secondary">View Order </Link>
                                            <Link href="/" className="btn btn-outline-secondary my-1 btnhover20">Back To Home </Link>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </CommanLayout>
    );
}

export default function AccountOrderConfirm() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
                <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                    <p className="text-sm font-semibold text-slate-500">Loading order confirmation...</p>
                </div>
            </div>
        }>
            <AccountOrderConfirmContent />
        </Suspense>
    );
}