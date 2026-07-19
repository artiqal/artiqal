import React from "react";
import "./Logo.css";

export function Logo({ size = 32, className = "", src = "/brand/artiqal-logo-v2.png" }) {
  return (
    <img
      src={src}
      alt="Artiqal logo"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, display: "block" }}
      draggable={false}
    />
  );
}

export function BrandLockup({ logoSize = 32, logoSrc }) {
  return (
    <span className="artiqal-brand-lockup">
      <Logo size={logoSize} src={logoSrc} />
      <b>artiqal</b>
    </span>
  );
}
