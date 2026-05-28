"use client";

import Link from "next/link";
import IMAGES from "../../constant/theme";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = {
    title: string;
    url: string;
  };
  
  const accountMenu: MenuItem[] = [
    { title: "Orders", url: "/account-orders" },
    { title: "Downloads", url: "/account-downloads" },
    { title: "Return request", url: "/account-return-request" },
  ];
  
  const accountSettingsMenu: MenuItem[] = [
    { title: "Profile", url: "/account-profile" },
    { title: "Address", url: "/account-address" },
    { title: "Review", url: "/account-review" },
];

export default function CommanSidebar(){
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return(
        <aside className="col-xl-3">
            <div className="toggle-info">
                <h5 className="title mb-0">Account Navbar</h5>
                <a className="toggle-btn" href="#accountSidebar">Account Menu</a>
            </div>
            <div className="sticky-top account-sidebar-wrapper">
                <div className="account-sidebar" id="accountSidebar">
                    <div className="profile-head">
                        <div className="user-thumb">
                            <Image className="rounded-circle" src={IMAGES.ProfilePic} alt="User Avatar" />
                        </div>
                        <h5 className="title mb-0">{user ? user.firstName + ' ' + (user.lastName || '') : 'User'}</h5>
                        <span className="text text-primary">{user ? user.email : ''}</span>
                    </div>
                    <div className="account-nav">
                        <div className="nav-title bg-light">DASHBOARD</div>
                        <ul>
                            {accountMenu.map((elem, index)=>(
                                <li key={index}><Link href={elem.url}>{elem.title}</Link></li>
                            ))}                            
                        </ul>
                        <div className="nav-title bg-light">ACCOUNT SETTINGS</div>
                        <ul className="account-info-list">
                            {accountSettingsMenu.map((elem, ind)=>(
                                <li key={ind}><Link href={elem.url}>{elem.title}</Link></li>
                            ))}                            
                            <li>
                                <button 
                                    onClick={handleLogout}
                                    className="bg-transparent border-0 text-start w-100 p-0 text-danger hover-logout-btn"
                                    style={{ 
                                        font: 'inherit',
                                        fontSize: '15px',
                                        padding: '12px 20px',
                                        display: 'block',
                                        width: '100%',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <i className="fa-solid fa-right-from-bracket me-2"></i>Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </aside>
    )
} 