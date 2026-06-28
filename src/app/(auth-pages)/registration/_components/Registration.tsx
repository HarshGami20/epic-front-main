"use client";

import Link from "next/link";
import IMAGES from "@/constant/theme";
import PasswordInputBox from "@/components/PasswordInputBox";
import AuthSlider from "@/components/AuthSlider";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import { registerUser } from "@/lib/authApi";
import { persistUser } from "@/lib/userUtils";
import { getSafeRedirectUrl } from "@/lib/safeRedirect";

export default function Registration() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = getSafeRedirectUrl(
        searchParams.get("redirect") ||
            (typeof window !== "undefined" ? sessionStorage.getItem("last_non_auth_page") : null)
    );

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await registerUser({ firstName, lastName, email, phone, password });
            if (data?.token) {
                localStorage.setItem("token", data.token);
                persistUser(data.user);
            }
            toast.success("Registration successful! You can now log in.");

            setTimeout(() => {
                router.push(redirectUrl);
            }, 1500);
        } catch (err: any) {
            toast.error(err.message || "Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="page-content bg-light">
            <section className="px-3">
                <div className="row">
                    <div className="col-xxl-6 col-xl-6 col-lg-6 start-side-content">
                        <div className="dz-bnr-inr-entry">
                            <h1>Registration</h1>
                            <nav aria-label="breadcrumb text-align-start" className="breadcrumb-row">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><Link href="/"> Home</Link></li>
                                    <li className="breadcrumb-item">Registration</li>
                                </ul>
                            </nav>
                        </div>
                        <AuthSlider />
                    </div>
                    <div className="col-xxl-6 col-xl-6 col-lg-6 end-side-content justify-content-center">
                        <div className="login-area">
                            <h2 className="text-secondary text-center">Registration Now</h2>
                            <p className="text-center m-b30">Welcome please registration to your account</p>
                            <form onSubmit={handleRegister}>
                                <div className="row">
                                    <div className="col-md-6 m-b25">
                                        <label className="label-title">First Name</label>
                                        <input
                                            name="firstName"
                                            required
                                            className="form-control"
                                            placeholder="First name"
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-6 m-b25">
                                        <label className="label-title">Last Name</label>
                                        <input
                                            name="lastName"
                                            className="form-control"
                                            placeholder="Last name"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="m-b25">
                                    <label className="label-title">Email Address</label>
                                    <input
                                        name="dzEmail"
                                        required
                                        className="form-control"
                                        placeholder="Email Address"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="m-b25">
                                    <label className="label-title">Mobile Number</label>
                                    <input
                                        name="dzPhone"
                                        required
                                        className="form-control"
                                        placeholder="Mobile Number"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <div className="m-b40">
                                    <label className="label-title">Password</label>
                                    <div className="secure-input ">
                                        <PasswordInputBox
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <button type="submit" disabled={loading} className="btn btn-secondary btnhover text-uppercase me-2">
                                        {loading ? "Registering..." : "Register"}
                                    </button>
                                    <Link href="/login" className="btn btn-outline-secondary btnhover text-uppercase">Sign In</Link>
                                </div>
                            </form>
                            <Toaster position="top-center" richColors closeButton />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}