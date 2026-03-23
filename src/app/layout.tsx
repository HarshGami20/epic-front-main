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


export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  
  
  
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
