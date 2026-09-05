import React from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import "./PricingPlans.css";

const pricingPlans = [
  {
    name: "Standard",
    price: "10",
    description: "A focused toolkit for practical, ready-to-run adult SLP sessions.",
    features: [
      "Core adult SLP activity library",
      "Foundational, Intermediate, and Complex levels",
      "Favourites and quick activity access",
      "Session completion summaries",
    ],
  },
  {
    name: "Pro",
    price: "25",
    description: "The complete workspace for clinicians who want the most flexibility.",
    featured: true,
    features: [
      "Everything included in Standard",
      "Extended activity modes",
      "Advanced setup and configuration controls",
      "Printable activity materials and reports",
    ],
  },
];

export function PricingPlans({ surface = "landing" }) {
  const isLandingSection = surface === "landing";

  return (
    <section
      className={`marketing-pricing marketing-pricing-${surface}`}
      id={isLandingSection ? "pricing" : undefined}
      aria-labelledby="marketing-pricing-heading"
    >
      <div className="marketing-pricing-heading">
        <span>Simple monthly pricing</span>
        <h2 id="marketing-pricing-heading">Choose the workspace that fits your practice</h2>
        <p>Start with the essentials or choose the complete clinical toolkit. Both plans are designed for adult SLP practice.</p>
      </div>

      <div className="marketing-pricing-grid">
        {pricingPlans.map((plan) => (
          <article
            className={`marketing-pricing-card${plan.featured ? " is-featured" : ""}`}
            key={plan.name}
          >
            <div className="marketing-pricing-card-header">
              <div>
                <span>{plan.name}</span>
                {plan.featured && <small><Sparkles size={13} aria-hidden="true" /> Most flexible</small>}
              </div>
              <p>{plan.description}</p>
            </div>

            <div className="marketing-pricing-price" aria-label={`$${plan.price} per month`}>
              <span>$</span>
              <strong>{plan.price}</strong>
              <small>/ month</small>
            </div>

            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span><Check size={15} strokeWidth={2.4} aria-hidden="true" /></span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              className="marketing-pricing-cta"
              to="/register"
              aria-label={`Start a free trial of the ${plan.name} plan`}
            >
              Start free trial <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

      <p className="marketing-pricing-note">
        Monthly subscription. Start with a free trial.
      </p>
    </section>
  );
}
