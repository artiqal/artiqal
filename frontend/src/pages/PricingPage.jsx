import React from "react";
import { Sparkles } from "lucide-react";

import { PublicFooter, PublicNav } from "@/components/marketing/MarketingChrome";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import "./PricingPage.css";

export default function PricingPage() {
  return (
    <div className="artiqal-pricing-page artiqal-marketing-page" data-testid="pricing-page">
      <main>
        <section className="pricing-hero">
          <PublicNav />
          <div className="pricing-hero-copy">
            <span>Pricing <Sparkles size={12} aria-hidden="true" /></span>
            <h1>Simple plans for focused clinical work</h1>
            <p>Choose straightforward monthly access to practical adult SLP activities and tools.</p>
          </div>
        </section>

        <PricingPlans surface="page" />
      </main>

      <PublicFooter />
    </div>
  );
}
