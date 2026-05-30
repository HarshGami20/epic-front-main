"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getUserAvatarUrl,
  getUserDisplayName,
  logoutUser,
  readStoredUser,
  USER_LOGOUT_EVENT,
  USER_UPDATED_EVENT,
  type UserProfile,
} from "@/lib/userUtils";

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

export default function CommanSidebar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const syncUser = () => setUser(readStoredUser());
    syncUser();

    window.addEventListener(USER_UPDATED_EVENT, syncUser);
    window.addEventListener(USER_LOGOUT_EVENT, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, syncUser);
      window.removeEventListener(USER_LOGOUT_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.replace("/login");
  };

  const avatarSrc = getUserAvatarUrl(user);

  return (
    <aside className="col-xl-3">
      <div className="toggle-info d-none">
        <h5 className="title mb-0">Account Navbar</h5>
        <a className="toggle-btn" href="#accountSidebar">
          Account Menu
        </a>
      </div>
      <div className="sticky-top account-sidebar-wrapper">
        <div className="account-sidebar" id="accountSidebar">
          <div className="profile-head text-center">
            <div className="user-thumb mx-auto mb-3">
              <img
                src={avatarSrc}
                alt={getUserDisplayName(user)}
                className="rounded-circle"
                style={{
                  width: 88,
                  height: 88,
                  objectFit: "cover",
                  border: "3px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
            </div>
            <h5 className="title mb-1">{getUserDisplayName(user)}</h5>
            <span className="text text-primary d-block text-break">
              {user?.email || ""}
            </span>
          </div>
          <div className="account-nav">
            <div className="nav-title bg-light">DASHBOARD</div>
            <ul>
              {accountMenu.map((elem, index) => (
                <li key={index}>
                  <Link href={elem.url}>{elem.title}</Link>
                </li>
              ))}
            </ul>
            <div className="nav-title bg-light">ACCOUNT SETTINGS</div>
            <ul className="account-info-list">
              {accountSettingsMenu.map((elem, ind) => (
                <li key={ind}>
                  <Link href={elem.url}>{elem.title}</Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="account-logout-btn"
                >
                  <i className="fa-solid fa-right-from-bracket me-2" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
