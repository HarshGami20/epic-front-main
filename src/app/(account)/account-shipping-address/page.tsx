"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CommanBanner from "@/components/CommanBanner";
import CommanLayout from "@/components/CommanLayout";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import { toast, Toaster } from "sonner";

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

export default function AccountShippingAddress() {
    const router = useRouter();
    const [formData, setFormData] = useState<AddressDetails>({
        firstName: "",
        lastName: "",
        companyName: "",
        country: "India",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "Gujarat",
        zipCode: "",
        phone: "",
        email: ""
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        let userProfile: any = {};
        if (storedUser) {
            try {
                userProfile = JSON.parse(storedUser);
            } catch (e) {
                console.error(e);
            }
        }

        const storedShipping = localStorage.getItem("user_shipping_address");
        if (storedShipping) {
            try {
                setFormData(JSON.parse(storedShipping));
            } catch (e) {
                console.error(e);
            }
        } else if (userProfile) {
            setFormData(prev => ({
                ...prev,
                firstName: userProfile.firstName || "",
                lastName: userProfile.lastName || "",
                phone: userProfile.phone || "",
                email: userProfile.email || ""
            }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.addressLine1 || !formData.city || !formData.zipCode || !formData.phone || !formData.email) {
            toast.error("Please fill in all required fields.");
            return;
        }
        localStorage.setItem("user_shipping_address", JSON.stringify(formData));
        toast.success("Shipping address saved successfully!");
        setTimeout(() => {
            router.push("/account-address");
        }, 1200);
    };

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner image={IMAGES.BackBg1.src} mainText="Shipping Address" parentText="Home" currentText="Shipping Address" />
                <div className="content-inner-1">
                    <div className="container">
                        <div className="row">
                            <CommanSidebar />
                            <section className="col-xl-9 account-wrapper">
                                <div className="account-card">
                                    <form onSubmit={handleSave} className="row">
                                        <h3 className="m-b30">Shipping address</h3>
                                        <div className="col-md-6">
                                            <div className="form-group m-b25">
                                                <label className="label-title">First Name <span className="text-danger">*</span></label>
                                                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group m-b25">
                                                <label className="label-title">Last Name</label>
                                                <input name="lastName" value={formData.lastName} onChange={handleChange} className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group m-b25">
                                                <label className="label-title">Company name (optional)</label>
                                                <input name="companyName" value={formData.companyName} onChange={handleChange} className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="m-b25">
                                                <label className="label-title">Country / Region <span className="text-danger">*</span></label>
                                                <select name="country" value={formData.country} onChange={handleChange} className="form-control">
                                                    <option value="India">India</option>
                                                    <option value="US">United States</option>
                                                    <option value="UK">United Kingdom</option>
                                                    <option value="Canada">Canada</option>
                                                </select>    
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group m-b25">
                                                <label className="label-title">Street address <span className="text-danger">*</span></label>
                                                <input name="addressLine1" value={formData.addressLine1} onChange={handleChange} required className="form-control m-b15" placeholder="House number and street name" />
                                                <input name="addressLine2" value={formData.addressLine2} onChange={handleChange} className="form-control" placeholder="Apartment, suite, unit, etc. (optional)" />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group m-b25">
                                                <label className="label-title">Town / City <span className="text-danger">*</span></label>
                                                <input name="city" value={formData.city} onChange={handleChange} required className="form-control" placeholder="City" />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group m-b25">
                                                <label className="label-title">State <span className="text-danger">*</span></label>
                                                <input name="state" value={formData.state} onChange={handleChange} required className="form-control" placeholder="State" />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group m-b25">
                                                <label className="label-title">Postcode / ZIP <span className="text-danger">*</span></label>
                                                <input name="zipCode" value={formData.zipCode} onChange={handleChange} required className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group m-b25">
                                                <label className="label-title">Phone <span className="text-danger">*</span></label>
                                                <input name="phone" value={formData.phone} onChange={handleChange} required className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group m-b25">
                                                <label className="label-title">Email address <span className="text-danger">*</span></label>
                                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-12 m-t20">
                                            <button type="submit" className="btn btn-secondary">Save changes</button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-center" richColors closeButton />
        </CommanLayout>
    );
}