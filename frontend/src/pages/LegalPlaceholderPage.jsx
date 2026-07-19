import React from "react";

import { PublicFooter, PublicNav } from "@/components/marketing/MarketingChrome";
import "./LegalPlaceholderPage.css";

export default function LegalPlaceholderPage({ title, intro, notice }) {
  return (
    <div className="artiqal-legal artiqal-marketing-page" data-testid="legal-placeholder-page">
      <main>
        <PublicNav />
        <section className="legal-placeholder" aria-labelledby="legal-placeholder-heading">
          <span>Legal</span>
          <h1 id="legal-placeholder-heading">{title}</h1>
          <p className="legal-placeholder-intro">{intro}</p>
          <div className="legal-placeholder-notice" role="note">{notice}</div>
          <p className="legal-placeholder-updated">Last updated: Draft placeholder</p>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
