import React from "react";
import { Link } from "react-router-dom";
import { BrandLockup } from "@/components/Logo";
import whiteLogo from "@/assets/artiqal-logo-mark-white.png";
import loginAtmosphere from "@/assets/login-atmosphere.avif";
import "./AuthenticationShell.css";

export function AuthenticationShell({ children, heading, headingId, introIcon, pageTestId, supportingText }) {
  return (
    <main className="login-page" data-testid={pageTestId}>
      <section className="login-visual" aria-labelledby="login-visual-heading">
        <img className="login-visual-image" src={loginAtmosphere} alt="" aria-hidden="true" />
        <div className="login-visual-overlay" />
        <Link to="/" className="login-visual-brand" aria-label="artiqal home">
          <BrandLockup logoSize={38} logoSrc={whiteLogo} />
        </Link>
        <div className="login-visual-copy">
          <span>BUILT FOR ADULT SPEECH &amp; LANGUAGE THERAPY</span>
          <h2 id="login-visual-heading">Meaningful tools for better communication.</h2>
          <p>
            Access evidence-informed activities and resources designed to support meaningful practice.
          </p>
        </div>
      </section>

      <section className="login-auth-panel" aria-labelledby={headingId}>
        <div className="login-auth-shell">
          <Link to="/" className="login-mobile-brand" aria-label="artiqal home">
            <BrandLockup logoSize={34} />
          </Link>

          <header className="login-auth-intro fade-up">
            {introIcon ? <div className="login-auth-intro-icon">{introIcon}</div> : null}
            <h1 id={headingId}>{heading}</h1>
            <p>{supportingText}</p>
          </header>

          {children}
        </div>
      </section>
    </main>
  );
}
