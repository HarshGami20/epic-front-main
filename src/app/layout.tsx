"use client"

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-autoplay.css";
import "lightgallery/css/lg-fullscreen.css";
import "lightgallery/css/lg-share.css";
import "lightgallery/css/lg-zoom.css";

import '../../public/assets/icons/iconly/index.min.css';
import '../../public/assets/vendor/swiper/swiper-bundle.min.css'
import '../../public/assets/vendor/animate/animate.css'
import '../../public/assets/css/style.css'
import '../../public/assets/css/skin/skin-1.css'
import './pixel-editor.css'
import '../../public/assets/css/header-mobile-fix.css'


import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).__fetch_patched) {
      (window as any).__fetch_patched = true;
      const originalFetch = window.fetch;
      window.fetch = async function (...args) {
        const response = await originalFetch(...args);
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("checkout_item");

          window.dispatchEvent(new CustomEvent("epiclance-user-logout"));
          window.dispatchEvent(new CustomEvent("epiclance-user-updated", { detail: null }));

          const currentPath = window.location.pathname;
          if (!["/login", "/registration", "/forget-password"].includes(currentPath)) {
            window.location.href = `/login?expired=true&redirect=${encodeURIComponent(currentPath + window.location.search)}`;
          }
        }
        return response;
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && pathname && !["/login", "/registration", "/forget-password"].includes(pathname)) {
      sessionStorage.setItem("last_non_auth_page", pathname + window.location.search);
    }
  }, [pathname]);
  
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Roboto:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head> 
      <body>
        {children}        
      </body>
    </html>
  );
}
