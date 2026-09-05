import React from "react";
import { Link, useLocation } from "react-router-dom";

import { BrandLockup } from "@/components/Logo";
import landingLogoMark from "@/assets/artiqal-logo-mark-white.png";
import "./MarketingChrome.css";

const footerGroups = [
  {
    title: "Product",
    items: [
      { label: "Activities", to: "/all-activities" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "For Clinicians", href: "/#clinicians" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Help Centre" },
      { label: "SLP Blueprint" },
      { label: "Evidence & References" },
      { label: "Contact Support", to: "/contact" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About artiqal", href: "/#about" },
      { label: "Contact", to: "/contact" },
      { label: "Updates" },
      { label: "Accessibility" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy" },
      { label: "Clinical Disclaimer" },
    ],
  },
];

export function PublicNav() {
  const { pathname } = useLocation();
  const landingAnchor = (id) => pathname === "/" ? `#${id}` : `/#${id}`;

  return (
    <header className="landing-nav">
      <Link className="landing-brand" to="/" aria-label="artiqal home">
        <BrandLockup logoSize={37} logoSrc={landingLogoMark} />
      </Link>

      <nav aria-label="Public navigation">
        <a href={landingAnchor("about")}>About</a>
        <a href={landingAnchor("pricing")}>Pricing</a>
        <Link to="/contact" aria-current={pathname === "/contact" ? "page" : undefined}>
          Contact
        </Link>
        <Link to="/access-library">Sign in</Link>
      </nav>

      <div className="landing-nav-actions">
        <Link className="landing-nav-cta" to="/register">Start free trial</Link>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand" id="about">
          <Link className="landing-brand" to="/" aria-label="artiqal home">
            <BrandLockup logoSize={32} />
          </Link>
          <p>A calm clinical workspace for adult speech and language therapy.</p>
          <small>© 2026 artiqal. All rights reserved.</small>
        </div>

        {footerGroups.map((group) => (
          <FooterNav key={group.title} {...group} />
        ))}
      </div>
    </footer>
  );
}

function FooterNav({ title, items }) {
  const headingId = `landing-footer-${title.toLowerCase()}`;

  return (
    <nav className="landing-footer-nav" aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : item.href ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span
                aria-disabled="true"
                aria-label={`${item.label} — page not yet available`}
                title="Page not yet available"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
