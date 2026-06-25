import React from "react";

export function Logo({ size = 32, className = "" }) {
  return (
    <img
      src="/brand/artiqal-logo-v2.png"
      alt="Artiqal logo"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, display: "block" }}
      draggable={false}
    />
  );
}
