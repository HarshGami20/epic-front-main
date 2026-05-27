"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import CommanLayout from "@/components/CommanLayout";

interface AddressDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  companyName?: string;
}

export default function AccountAddress() {
    const [billingAddress, setBillingAddress] = useState<AddressDetails | null>(null);
    const [shippingAddress, setShippingAddress] = useState<AddressDetails | null>(null);

    useEffect(() => {
        const storedBilling = localStorage.getItem("user_billing_address");
        if (storedBilling) {
            try {
                setBillingAddress(JSON.parse(storedBilling));
            } catch (e) {
                console.error("Failed to parse billing address", e);
            }
        }

        const storedShipping = localStorage.getItem("user_shipping_address");
        if (storedShipping) {
            try {
                setShippingAddress(JSON.parse(storedShipping));
            } catch (e) {
                console.error("Failed to parse shipping address", e);
            }
        }
    }, []);

    const removeAddress = (type: "billing" | "shipping") => {
        if (type === "billing") {
            localStorage.removeItem("user_billing_address");
            setBillingAddress(null);
        } else {
            localStorage.removeItem("user_shipping_address");
            setShippingAddress(null);
        }
    };

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner image={IMAGES.BackBg1.src} mainText="Account Address" parentText="Home" currentText="Account Address" />
                <div className="content-inner-1">
                    <div className="container">
                        <div className="row">
                            <CommanSidebar />
                            <section className="col-xl-9 account-wrapper">
                                <div className="row">
                                    <div className="col-12 m-b30">
                                        <p className="m-b0">The following addresses will be used on the checkout page by default.</p>
                                    </div>
                                    <div className="col-md-6 m-b30">
                                        <div className="address-card">
                                            <div className="account-address-box">
                                                <h6 className="mb-3">Billing address</h6>
                                                {billingAddress ? (
                                                    <ul>
                                                        <li><strong>{billingAddress.firstName} {billingAddress.lastName}</strong></li>
                                                        {billingAddress.companyName && <li>{billingAddress.companyName}</li>}
                                                        <li>{billingAddress.addressLine1}</li>
                                                        {billingAddress.addressLine2 && <li>{billingAddress.addressLine2}</li>}
                                                        <li>{billingAddress.city}, {billingAddress.state} - {billingAddress.zipCode}</li>
                                                        <li>{billingAddress.country}</li>
                                                        <li>Mo. {billingAddress.phone}</li>
                                                        <li>{billingAddress.email}</li>
                                                    </ul>
                                                ) : (
                                                    <p className="text-muted">No billing address added yet.</p>
                                                )}
                                            </div>
                                            <div className="account-address-bottom">
                                                <Link href="/account-billing-address" className="d-block me-3">
                                                    <i className="fa-solid fa-pen me-2" />{billingAddress ? "Edit" : "Add"}
                                                </Link>
                                                {billingAddress && (
                                                    <button onClick={() => removeAddress("billing")} className="bg-transparent border-0 text-danger p-0 d-flex align-items-center">
                                                        <i className="fa-solid fa-trash-can me-2" />Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 m-b30">
                                        <div className="address-card">
                                            <div className="account-address-box">
                                                <h6 className="mb-3">Shipping address</h6>
                                                {shippingAddress ? (
                                                    <ul>
                                                        <li><strong>{shippingAddress.firstName} {shippingAddress.lastName}</strong></li>
                                                        {shippingAddress.companyName && <li>{shippingAddress.companyName}</li>}
                                                        <li>{shippingAddress.addressLine1}</li>
                                                        {shippingAddress.addressLine2 && <li>{shippingAddress.addressLine2}</li>}
                                                        <li>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zipCode}</li>
                                                        <li>{shippingAddress.country}</li>
                                                        <li>Mo. {shippingAddress.phone}</li>
                                                        <li>{shippingAddress.email}</li>
                                                    </ul>
                                                ) : (
                                                    <p className="text-muted">No shipping address added yet.</p>
                                                )}
                                            </div>
                                            <div className="account-address-bottom">
                                                <Link href="/account-shipping-address" className="d-block me-3">
                                                    <i className="fa-solid fa-pen me-2" />{shippingAddress ? "Edit" : "Add"}
                                                </Link>
                                                {shippingAddress && (
                                                    <button onClick={() => removeAddress("shipping")} className="bg-transparent border-0 text-danger p-0 d-flex align-items-center">
                                                        <i className="fa-solid fa-trash-can me-2" />Remove
                                                    </button>
                                                )}
                                            </div>
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