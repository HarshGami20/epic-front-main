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
