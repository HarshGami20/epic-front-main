"use client";

import Link from "next/link";
import IMAGES from "@/constant/theme";
import PasswordInputBox from "@/components/PasswordInputBox";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { registerUser } from "@/lib/authApi";

export default function Registration() {
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await registerUser({ firstName, email, password });
            if (data?.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            toast.success("Registration successful! You can now log in.");
            
            setTimeout(() => {
                router.push("/account-dashboard");
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
                        <div className="registration-media">
                            <Image src={IMAGES.RegistrationPng3} alt="/" />
                        </div>
                    </div>
                    <div className="col-xxl-6 col-xl-6 col-lg-6 end-side-content justify-content-center">
                        <div className="login-area">
                            <h2 className="text-secondary text-center">Registration Now</h2>
                            <p className="text-center m-b30">Welcome please registration to your account</p>
                            <form onSubmit={handleRegister}>
                                <div className="m-b25">
                                    <label className="label-title">Username</label>
                                    <input 
                                        name="dzName" 
                                        required 
                                        className="form-control" 
                                        placeholder="Username" 
                                        type="text" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
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