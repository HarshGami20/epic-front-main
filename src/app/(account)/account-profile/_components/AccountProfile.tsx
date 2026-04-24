"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";

export default function AccountProfile() {
    const [file, setFile] = useState<File | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/login");
        }
    }, [router]);

    const fileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileSelect = e.target.files ? e.target.files[0] : null;
        setFile(fileSelect);
    }

    if (!user) return null;

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1.src} mainText="Profile" parentText="Home" currentText="Account Profile" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="account-card">
                                <div className="profile-edit">
                                    <div className="avatar-upload d-flex align-items-center">
                                        <div className=" position-relative ">
                                            <div className="avatar-preview thumb">
                                                <div id="imagePreview"
                                                    style={{ backgroundImage: file ? "url(" + URL.createObjectURL(file) + ")" : "url(" + IMAGES.ProfilePic3.src + ")" }}
                                                >
                                                </div>
                                            </div>
                                            <div className="change-btn  thumb-edit d-flex align-items-center flex-wrap">
                                                <input type='file' className="form-control d-none" onChange={fileHandler} id="imageUpload" accept=".png, .jpg, .jpeg" />
                                                <label htmlFor="imageUpload" className="btn btn-light ms-0"><i className="fa-solid fa-camera" /></label>
                                            </div>
                                        </div>.
                                    </div>
                                    <div className="clearfix">
                                        <h2 className="title mb-0">{user.firstName || "User"} {user.lastName || ""}</h2>
                                        <span className="text text-primary">{user.email || ""}</span>
                                    </div>
                                </div>
                                <form className="row">
                                    <div className="col-lg-6">
                                        <div className="form-group m-b25">
                                            <label className="label-title">First Name</label>
                                            <input name="dzName" defaultValue={user.firstName} required className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group m-b25">
                                            <label className="label-title">Last Name</label>
                                            <input name="dzName" defaultValue={user.lastName} className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group m-b25">
                                            <label className="label-title">Email address</label>
                                            <input type="email" name="dzEmail" defaultValue={user.email} readOnly required className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group m-b25">
                                            <label className="label-title">Phone</label>
                                            <input type="text" name="dzPhone" defaultValue={user.phone} className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group m-b25">
                                            <label className="label-title">New password (leave blank to leave unchanged)</label>
                                            <input type="password" name="dzOldPassword" required className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group m-b25">
                                            <label className="label-title">Confirm new password</label>
                                            <input type="password" name="dzNewPassword" required className="form-control" />
                                        </div>
                                    </div>
                                </form>
                                <div className="d-flex flex-wrap justify-content-between align-items-center">
                                    <div className="form-group">
                                        <div className="custom-control custom-checkbox text-black">
                                            <input type="checkbox" className="form-check-input" id="basic_checkbox_1" />
                                            <label className="form-check-label" htmlFor="basic_checkbox_1">Subscribe me to Newsletter</label>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary mt-3 mt-sm-0" type="button">Update profile</button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}