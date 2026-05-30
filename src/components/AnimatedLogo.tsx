"use client";
import React from "react";
import Image from "next/image";

interface AnimatedLogoProps {
  className?: string;
  width?: number;
  height?: number;
  white?: boolean;
  animationType?: number;
}

const AnimatedLogo = ({
  className,
  width = 150,
  height = 40,
}: AnimatedLogoProps) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src="/logo.svg"
        alt="Epiclance"
        width={width}
        height={height}
        priority
        style={{ objectFit: "contain", width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default AnimatedLogo;
