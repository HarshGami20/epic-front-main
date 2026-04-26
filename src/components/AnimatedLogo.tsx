"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import IMAGES from "../constant/theme";

interface AnimatedLogoProps {
  className?: string;
  width?: number;
  height?: number;
  white?: boolean;
  animationType?: number; // 1 to 10
}

const AnimatedLogo = ({
  className,
  width = 150,
  height = 40,
  white = false,
  animationType = 3
}: AnimatedLogoProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const logos = white
    ? [IMAGES.LogoWhite, IMAGES.LogoWhite]
    : [IMAGES.logopng, IMAGES.logodpng];

  // Animation variants library
  const getVariants = (type: number) => {
    switch (type) {
      case 1: // Classic Fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.8 }
        };
      case 2: // Vertical 3D Flip
        return {
          initial: { opacity: 0, rotateX: -90, y: 20 },
          animate: { opacity: 1, rotateX: 0, y: 0 },
          exit: { opacity: 0, rotateX: 90, y: -20 },
          transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
        };
      case 3: // Horizontal 3D Flip (Spatial)
        return {
          initial: { opacity: 0, rotateY: 90, z: -100 },
          animate: { opacity: 1, rotateY: 0, z: 0 },
          exit: { opacity: 0, rotateY: -90, z: -100 },
          transition: { duration: 0.6, ease: "circOut" }
        };
      case 4: // Cinematic Zoom Blur
        return {
          initial: { opacity: 0, scale: 1.5, filter: "blur(10px)" },
          animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
          exit: { opacity: 0, scale: 0.5, filter: "blur(10px)" },
          transition: { duration: 0.7 }
        };
      case 5: // Slide Up Reveal
        return {
          initial: { y: "100%", opacity: 0 },
          animate: { y: "0%", opacity: 1 },
          exit: { y: "-100%", opacity: 0 },
          transition: { duration: 0.5, ease: "backOut" }
        };
      case 6: // Slide Right Reveal
        return {
          initial: { x: "-100%", opacity: 0 },
          animate: { x: "0%", opacity: 1 },
          exit: { x: "100%", opacity: 0 },
          transition: { duration: 0.5, ease: "anticipate" }
        };
      case 7: // Elastic Scale
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0, opacity: 0 },
          transition: { type: "spring", stiffness: 260, damping: 20 }
        };
      case 8: // Modern Skew Slide
        return {
          initial: { x: 50, skewX: -20, opacity: 0 },
          animate: { x: 0, skewX: 0, opacity: 1 },
          exit: { x: -50, skewX: 20, opacity: 0 },
          transition: { duration: 0.5, ease: "power4.out" }
        };
      case 9: // Perspective Swing
        return {
          initial: { rotateY: -45, originX: 0, opacity: 0 },
          animate: { rotateY: 0, opacity: 1 },
          exit: { rotateY: 45, originX: 1, opacity: 0 },
          transition: { duration: 0.6 }
        };
      case 10: // Glitch Pulse
        return {
          initial: { opacity: 0, scale: 0.9, x: 5 },
          animate: { opacity: 1, scale: 1, x: 0 },
          exit: { opacity: 0, scale: 1.1, x: -5 },
          transition: { duration: 0.2, repeat: 1, repeatType: "reverse" as const }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.5 }
        };
    }
  };

  const variants = getVariants(animationType);

  return (
    <div
      className={`logo-animated-wrapper ${className}`}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        perspective: '1000px'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          {...variants}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Image
            src={logos[index]}
            alt="Logo"
            width={width}
            height={height}
            priority
            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedLogo;
