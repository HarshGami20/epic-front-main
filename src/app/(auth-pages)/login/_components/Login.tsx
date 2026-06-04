"use client";

import Link from "next/link";
import IMAGES from "@/constant/theme";
import PasswordInputBox from "@/components/PasswordInputBox";
import AuthSlider from "@/components/AuthSlider";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import { loginUser } from "@/lib/authApi";
import { persistUser } from "@/lib/userUtils";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || (typeof window !== "undefined" && sessionStorage.getItem("last_non_auth_page")) || "/account-orders";

    useEffect(() => {
        if (searchParams.get("expired") === "true") {
            const timer = setTimeout(() => {
                toast.error("Your session has expired. Please log in again.", {
                    id: "session-expired-toast"
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginUser({ email, password });
            if (data?.token) {
                localStorage.setItem("token", data.token);
                persistUser(data.user);
            }
            toast.success("Login successful!");
            
            // Wait for a short duration, then redirect
            setTimeout(() => {
                router.push(redirectUrl);
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || "Failed to login. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };    
    return(
        <div className="page-content bg-light">
            <section className="px-3">
                <div className="row">
                    <div className="col-xxl-6 col-xl-6 col-lg-6 start-side-content">
                        <div className="dz-bnr-inr-entry">
                            <h1>Login</h1>
                            <nav aria-label="breadcrumb text-align-start" className="breadcrumb-row">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><Link href="/"> Home</Link></li>
                                    <li className="breadcrumb-item">Login</li>
                                </ul>
                            </nav>	
                        </div>
                        <AuthSlider />
                    </div>
                    <div className="col-xxl-6 col-xl-6 col-lg-6 end-side-content justify-content-center">
                        <div className="login-area">
                            <h2 className="text-secondary text-center">Login</h2>
                            <p className="text-center m-b25">welcome please login to your account</p>
                            <form onSubmit={handleLogin}>
                                <div className="m-b30">
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
                                <div className="m-b15">
                                    <label className="label-title">Password</label>
                                    <div className="secure-input ">
                                        <PasswordInputBox 
                                            placeholder="Password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row d-flex justify-content-between m-b30">
                                    <div className="form-group">
                                    <div className="custom-control custom-checkbox">
                                            <input type="checkbox" className="form-check-input" id="basic_checkbox_1" />
                                            <label className="form-check-label" htmlFor="basic_checkbox_1">Remember Me</label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <Link className="text-primary" href="/forget-password">Forgot Password</Link>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <button type="submit" disabled={loading} className="btn btn-secondary btnhover text-uppercase me-2 sign-btn">
                                        {loading ? "Signing in..." : "Sign In"}
                                    </button>
                                    <Link href={`/registration${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`} className="btn btn-outline-secondary btnhover text-uppercase">Register</Link>
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