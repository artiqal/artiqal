import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleAlert,
  Play,
  SlidersHorizontal,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PublicFooter, PublicNav } from "@/components/marketing/MarketingChrome";
import { RotatingHeadline } from "@/components/ui/rotating-headline";
import cloudscapeHero from "@/assets/landing-cloudscape-hero.jpg";
import activitiesPreview from "@/assets/landing-activities-preview.jpg";
import "./LandingPage.css";

const workflowSteps = [
  {
    title: "Choose a goal",
    description: "Select the communication area you’re targeting for your client.",
    illustration: "goal",
  },
  {
    title: "Tailor the activity",
    description: "Adjust difficulty and session options to fit your client’s needs and goals.",
    illustration: "tailor",
  },
  {
    title: "Run & adjust",
    description: "Use the activity and in-session feedback to support the best outcomes.",
    illustration: "run",
  },
];

const headlinePhrases = [
  "real-world communication.",
  "cognitive rehabilitation.",
  "dysphagia management.",
  "motor speech therapy.",
  "voice therapy.",
  "evidence-informed practice.",
];

export default function LandingPage() {
  return (
    <div className="artiqal-landing artiqal-marketing-page" data-testid="landing-page">
      <main>
        <section
          className="landing-hero"
          id="home"
          style={{ "--landing-cloudscape": `url(${cloudscapeHero})` }}
        >
          <PublicNav />

          <div className="landing-hero-copy">
            <span className="landing-hero-badge">Built for adult speech therapy <Sparkles size={12} /></span>
            <h1>
              <RotatingHeadline
                fixedLine={(
                  <>
                    <span className="rotating-headline-fixed-line">The modern workspace</span>
                    <span className="rotating-headline-fixed-line">for adult SLP.</span>
                  </>
                )}
                phrases={headlinePhrases}
              />
            </h1>
            <p>
              Session-ready activities and evidence-informed tools built exclusively for adult speech-language pathologists.
            </p>
          </div>
        </section>

        <WorkflowSection />
        <CoreFeaturesSection />
        <FinalCta />
      </main>

      <PublicFooter />
    </div>
  );
}

function WorkflowSection() {
  return (
    <section className="landing-workflow landing-section" id="clinicians">
      <div className="landing-section-heading landing-section-heading-left">
        <span>3 steps to a session-ready plan</span>
        <h2>Turn your clinical goals into standout sessions</h2>
        <p>From goal to growth: three guided steps to a focused, effective session in no time.</p>
      </div>

      <div className="landing-workflow-grid">
        {workflowSteps.map((step) => (
          <article className="landing-workflow-card" key={step.title}>
            <WorkflowIllustration type={step.illustration} />
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowIllustration({ type }) {
  if (type === "goal") {
    return (
      <div className="landing-step-art landing-step-goal" aria-hidden="true">
        <div className="landing-mini-window-bar"><i /><i /><i /></div>
        <span className="landing-step-target"><Target size={18} /></span>
        <div className="landing-step-lines"><i /><i /><i /></div>
        <ChevronDown size={18} />
      </div>
    );
  }

  if (type === "tailor") {
    return (
      <div className="landing-step-art landing-step-tailor" aria-hidden="true">
        <WandSparkles size={24} />
        <span><i /></span>
        <SlidersHorizontal size={22} />
      </div>
    );
  }

  return (
    <div className="landing-step-art landing-step-run" aria-hidden="true">
      <div className="landing-mini-window-bar"><i /><i /><i /></div>
      <div className="landing-step-menu"><i /><i /><i /></div>
      <span><Play size={17} fill="currentColor" /><i /></span>
    </div>
  );
}

function CoreFeaturesSection() {
  return (
    <section className="landing-features landing-section" id="features">
      <div className="landing-section-heading landing-section-heading-centred">
        <span>Core features</span>
        <h2>Everything you need to run<br />better adult SLP sessions</h2>
        <p>From clear planning to ready-to-run activities, every tool helps you save time and support your clients.</p>
      </div>

      <div className="landing-feature-grid">
        <article className="landing-feature-card landing-feature-recommendations">
          <div className="landing-feature-ui">
            <div className="landing-feature-brand"><Logo size={20} /><b>artiqal</b><span>Goal-oriented</span></div>
            <h3>Expressive Language</h3>
            <p>Recommended activities to improve word retrieval, formulation, and structured conversations.</p>
            <Link to="/all-activities">View recommended activities <ArrowRight size={14} /></Link>
          </div>
          <h3>Smart goal matching</h3>
          <p>Get focused activity suggestions that align tightly with communication goals.</p>
        </article>

        <article className="landing-feature-card landing-feature-clinical">
          <div className="landing-clinical-list">
            <FeaturePoint icon={Check} tone="green" title="Strong clinical fit" text="Grounded in functional, adult-focused practice." />
            <FeaturePoint icon={CircleAlert} tone="orange" title="Adjust complexity" text="Tailor the challenge for the person in front of you." />
            <FeaturePoint icon={BrainCircuit} tone="pink" title="Clear clinical guidance" text="Helpful prompts support confident in-session decisions." />
          </div>
          <h3>Clinician-first controls</h3>
          <p>Choose the focus, difficulty, and content while keeping the session moving.</p>
        </article>

        <article className="landing-feature-card landing-feature-planner">
          <div className="landing-planner-list">
            {["Warm-up", "Word Finding", "Functional Phrases", "Real Talk"].map((label, index) => (
              <div key={label}><span>{index + 1}</span><b>{label}</b><small>{index === 0 ? "5 min" : "10 min"}</small><ChevronDown size={14} /></div>
            ))}
            <button type="button"><span>+</span> Add activity</button>
          </div>
          <h3>Build-session planner</h3>
          <p>Organise activities into a focused flow, then keep it ready for the session.</p>
        </article>

        <article className="landing-feature-card landing-feature-library" id="activities">
          <div className="landing-library-crop">
            <img src={activitiesPreview} alt="Current artiqal Activities Library interface" />
          </div>
          <h3>Ready-to-run activity library</h3>
          <p>Access a growing library of practical activities designed for adult communication goals.</p>
        </article>
      </div>
    </section>
  );
}

function FeaturePoint({ icon: Icon, tone, title, text }) {
  return (
    <div className={`landing-feature-point landing-feature-point-${tone}`}>
      <span><Icon size={16} /></span>
      <div><b>{title}</b><p>{text}</p></div>
    </div>
  );
}

function FinalCta() {
  return (
    <section className="landing-final-cta" id="pricing">
      <span>Ready when you are</span>
      <h2>Spend less time preparing.<br />Make more time for therapy.</h2>
      <p>Explore the current activity library and build calmer, more purposeful adult SLP sessions.</p>
      <div>
        <Link to="/register">Start free trial <ArrowRight size={17} /></Link>
        <Link to="/all-activities">Explore activities</Link>
      </div>
    </section>
  );
}
