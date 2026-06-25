import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { CategoryIcon } from "@/components/CategoryIcon";
import { HubShell } from "@/components/HubShell";
import HubDashboard from "@/pages/Dashboard";
import { Logo } from "@/components/Logo";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Heart,
  Home,
  Library,
  LockKeyhole,
  MessageCircle,
  Mic2,
  Pencil,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import "./LandingPage.css";

const categories = [
  { title: "Speech", text: "Improve clarity and pronunciation", count: "12 activities", icon: Mic2, color: "pink" },
  { title: "Language", text: "Build vocabulary and expression", count: "18 activities", icon: BookOpen, color: "gold" },
  { title: "Memory", text: "Strengthen recall and retention", count: "14 activities", icon: Brain, color: "blue" },
  { title: "Word Finding", text: "Find the right words faster", count: "16 activities", icon: Search, color: "violet" },
  { title: "Conversation", text: "Practise real-life communication", count: "10 activities", icon: MessageCircle, color: "green" },
  { title: "Reading & Writing", text: "Support everyday literacy goals", count: "12 activities", icon: Pencil, color: "orange" },
];

const heroEndings = [
  "adult aphasia therapy.",
  "real-world practice.",
  "session-ready activities.",
  "meaningful participation.",
  "everyday communication.",
];

const hubPreviewGradients = {
  reading: { gradient: "linear-gradient(135deg,#0EA5E9 0%,#6366F1 60%,#8B5CF6 100%)", fg: "#0369A1" },
  writing: { gradient: "linear-gradient(135deg,#FB923C 0%,#F43F5E 100%)", fg: "#C2410C" },
  "word-finding": { gradient: "linear-gradient(135deg,#10B981 0%,#06B6D4 100%)", fg: "#047857" },
  "auditory-comprehension": { gradient: "linear-gradient(135deg,#A78BFA 0%,#EC4899 100%)", fg: "#6D28D9" },
  "functional-communication": { gradient: "linear-gradient(135deg,#FBBF24 0%,#F97316 100%)", fg: "#B45309" },
  "sfa-therapy": { gradient: "linear-gradient(135deg,#F43F5E 0%,#A855F7 100%)", fg: "#9F1239" },
  "all-activities": { gradient: "linear-gradient(135deg,#6366F1 0%,#06B6D4 100%)", fg: "#3730A3" },
};

export default function LandingPage() {
  const [heroEndingIndex, setHeroEndingIndex] = useState(0);
  const [hubPreviewNotice, setHubPreviewNotice] = useState("");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setHeroEndingIndex((currentIndex) => (currentIndex + 1) % heroEndings.length);
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, []);

  const heroEnding = heroEndings[heroEndingIndex];

  return (
    <div className="artiqal-public" data-testid="landing-page">
      <PublicNav />

      <main>
        <section className="ap-hero">
          <div className="ap-hero-inner">
            <div className="ap-hero-copy">
              <span className="ap-eyebrow"><Sparkles size={13} /> Virtual adult SLP activity library</span>
              <h1>
                A virtual SLP library for
                <br />
                <em className="ap-rotating-ending" key={heroEnding}>{heroEnding}</em>
              </h1>
              <p>
                Artiqal is a calm, clinician-built library of interactive speech and language therapy
                activities for adults — designed for sessions, teletherapy, and homework.
                {/*
                Read, listen, speak, and write — at your own pace, with your own voice.
                */}
              </p>
              <div className="ap-hero-actions">
                <Link className="ap-button ap-button-dark" to="/all-activities">Explore the library <ArrowRight size={17} /></Link>
                <a className="ap-button ap-button-light" href="#product">View sample activities</a>
              </div>
              <div className="ap-benefits">
                <Benefit icon={Users} title="Clinician built" text="" tone="pink" />
                <Benefit icon={LockKeyhole} title="Private & secure" text="" tone="orange" />
                <Benefit icon={Heart} title="Loved by SLPs" text="" tone="violet" />
              </div>
            </div>

            <div className="ap-dashboard-wrap ap-real-hub-preview" data-testid="landing-real-hub-preview">
              <HubShell previewMode onPreviewAction={setHubPreviewNotice}>
                <HubDashboard previewMode onPreviewAction={setHubPreviewNotice} />
              </HubShell>
            </div>
          </div>
        </section>

        <TrustStrip />

        <section className="ap-categories" id="product">
          <div className="ap-section-intro">
            <span className="ap-kicker">Inside Artiqal</span>
            <h2>Six categories.<br />One calm hub.</h2>
            <p>Every tile is a real moment from real life — the kind of thing therapists actually use.</p>
            <Link to="/all-activities">Explore all activities <ArrowRight size={16} /></Link>
          </div>
          <div className="ap-category-grid">
            {categories.map(({ title, text, count, icon: Icon, color }) => (
              <article className={`ap-category-card ap-${color}`} key={title}>
                <span className="ap-category-icon"><Icon size={24} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <small>{count}</small>
                </div>
                <i />
              </article>
            ))}
          </div>
        </section>

        <section className="ap-cta" id="demo">
          <CtaRibbon />
          <div className="ap-cta-copy">
            <h2>Ready to elevate<br />your practice?</h2>
            <p>Join clinicians using Artiqal to create meaningful practice and stronger connections.</p>
          </div>
          <div className="ap-cta-actions">
            <div>
              <Link className="ap-button ap-button-dark" to="/register">Start free trial <ArrowRight size={17} /></Link>
              <a className="ap-button ap-button-white" href="mailto:hello@artiqal.com">Book a demo</a>
            </div>
            <ul>
              <li><CheckCircle2 size={15} /> 14-day free trial</li>
              <li><CheckCircle2 size={15} /> No credit card required</li>
              <li><CheckCircle2 size={15} /> Cancel anytime</li>
            </ul>
          </div>
        </section>
      </main>

      {hubPreviewNotice ? (
        <div className="ap-preview-modal" role="dialog" aria-modal="true" aria-label="Preview only">
          <div>
            <button type="button" aria-label="Close preview notice" onClick={() => setHubPreviewNotice("")}>×</button>
            <span className="ap-mini-kicker">Preview only</span>
            <h4>Explore Artiqal</h4>
            <p>{hubPreviewNotice}</p>
            <Link className="ap-button ap-button-dark" to="/register">Create a free account <ArrowRight size={16} /></Link>
          </div>
        </div>
      ) : null}

      <PublicFooter />
    </div>
  );
}

function PublicNav() {
  return (
    <header className="ap-nav">
      <Link className="ap-logo" to="/"><Logo size={37} /><b>artiqal</b></Link>
      <nav>
        <a href="#product">Product <ChevronDown size={13} /></a>
        <a href="#clinicians">For Clinicians <ChevronDown size={13} /></a>
        <a href="#pricing">Pricing</a>
        <a href="#resources">Resources <ChevronDown size={13} /></a>
        <a href="#about">About</a>
      </nav>
      <div className="ap-nav-actions">
        <Link to="/login">Log in</Link>
        <Link className="ap-button ap-button-dark" to="/register">Start free trial <ArrowRight size={16} /></Link>
      </div>
    </header>
  );
}

function Benefit({ icon: Icon, title, text, tone }) {
  return (
    <div className="ap-benefit">
      <span className={`ap-benefit-icon ap-${tone}`}><Icon size={20} /></span>
      <div><b>{title}</b><small>{text}</small></div>
    </div>
  );
}

function LandingHubPreview({ previewMode = true }) {
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [previewNotice, setPreviewNotice] = useState(null);

  useEffect(() => {
    let alive = true;

    Promise.all([api.get("/categories"), api.get("/activities")])
      .then(([categoryResponse, activityResponse]) => {
        if (!alive) return;

        setCategories((categoryResponse.data || []).filter((category) => category.slug !== "all-activities"));
        setActivities(activityResponse.data || []);
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
        setActivities([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const categoryName = (slug) => categories.find((category) => category.slug === slug)?.name || slug;
  const categoryTone = (slug) => {
    const category = categories.find((item) => item.slug === slug);
    const fallback = hubPreviewGradients[slug] || hubPreviewGradients["all-activities"];

    return {
      color: category?.color || fallback.fg,
      gradient: fallback.gradient,
    };
  };

  const visibleActivities = activities
    .filter((activity) => activeCategory === "all" || activity.category === activeCategory)
    .filter((activity) => {
      const searchTerm = query.trim().toLowerCase();
      if (!searchTerm) return true;

      return [
        activity.title,
        activity.summary,
        activity.description,
        activity.category,
        categoryName(activity.category),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);
    })
    .slice(0, 8);

  const featured = visibleActivities[0] || activities[0];

  const showPreviewNotice = (activity) => {
    if (!previewMode) return;
    setPreviewNotice(activity);
  };

  return (
    <div className="ap-dashboard-wrap ap-live-hub-wrap" data-testid="landing-hub-preview">
      <div className="ap-live-hub">
        <aside className="ap-live-hub-sidebar">
          <span className="ap-mini-logo"><Logo size={32} /></span>
          <button type="button" className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>
            <Library size={14} /> All activities
          </button>
          {categories.slice(0, 9).map((category) => (
            <button
              type="button"
              className={activeCategory === category.slug ? "active" : ""}
              key={category.slug}
              onClick={() => setActiveCategory(category.slug)}
            >
              <CategoryIcon name={category.icon} className="w-3.5 h-3.5" /> {category.name}
            </button>
          ))}
          <div className="ap-mock-user"><i>GC</i><small>Preview account</small></div>
        </aside>

        <div className="ap-live-hub-main">
          <div className="ap-live-hub-head">
            <div>
              <span className="ap-mini-kicker">Live hub preview</span>
              <h3>Explore the Artiqal activity hub</h3>
              <p>Browse real categories and activities from the current app library.</p>
            </div>
            <label className="ap-live-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search activities..."
                aria-label="Search preview activities"
              />
            </label>
          </div>

          <div className="ap-live-category-row" aria-label="Preview categories">
            <button type="button" className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>
              All
            </button>
            {categories.slice(0, 8).map((category) => (
              <button
                type="button"
                className={activeCategory === category.slug ? "active" : ""}
                key={category.slug}
                onClick={() => setActiveCategory(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {featured ? (
            <section className="ap-live-feature">
              <div>
                <span>Today’s pick</span>
                <h4>{featured.title}</h4>
                <p>{featured.summary || featured.description || "A guided communication activity for focused practice."}</p>
                <button type="button" onClick={() => showPreviewNotice(featured)}>
                  Preview only <ArrowRight size={15} />
                </button>
              </div>
              <div className="ap-live-feature-orb" aria-hidden />
            </section>
          ) : null}

          <div className="ap-live-grid">
            {visibleActivities.length ? (
              visibleActivities.map((activity) => {
                const tone = categoryTone(activity.category);

                return (
                  <button
                    type="button"
                    className="ap-live-card"
                    key={`${activity.category}-${activity.slug}`}
                    onClick={() => showPreviewNotice(activity)}
                  >
                    <span className="ap-live-art" style={{ "--cat-gradient": tone.gradient, "--cat-fg": tone.color }}>
                      <span className="cat-art-icon">
                        <CategoryIcon
                          name={categories.find((category) => category.slug === activity.category)?.icon}
                          className="w-5 h-5"
                        />
                      </span>
                    </span>
                    <span className="ap-live-card-copy">
                      <small style={{ color: tone.color }}>{categoryName(activity.category)}</small>
                      <b>{activity.title}</b>
                      <em>{activity.summary || activity.description || "Guided practice activity"}</em>
                    </span>
                    <strong>Sign up to start</strong>
                  </button>
                );
              })
            ) : (
              <div className="ap-live-empty">No activities found in this preview.</div>
            )}
          </div>
        </div>
      </div>

      {previewNotice ? (
        <div className="ap-preview-modal" role="dialog" aria-modal="true" aria-label="Preview only">
          <div>
            <button type="button" aria-label="Close preview notice" onClick={() => setPreviewNotice(null)}>×</button>
            <span className="ap-mini-kicker">Preview only</span>
            <h4>{previewNotice.title}</h4>
            <p>This is a preview of the Artiqal hub. Create a free account to start activities.</p>
            <Link className="ap-button ap-button-dark" to="/register">Create a free account <ArrowRight size={16} /></Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DashboardMockup() {
  const sideLinks = [
    [Home, "Home"], [CalendarDays, "Sessions"], [Library, "Library"], [Wrench, "Tools"],
    [TrendingUp, "Progress"], [Activity, "Activities"], [Heart, "Favourites"],
  ];
  return (
    <div className="ap-dashboard-wrap">
      <div className="ap-dashboard">
        <aside className="ap-mock-sidebar">
          <span className="ap-mini-logo"><Logo size={32} /></span>
          {sideLinks.map(([Icon, label], index) => (
            <span className={index === 0 ? "active" : ""} key={label}><Icon size={14} /> {label}</span>
          ))}
          <div className="ap-mock-user"><i>GC</i><small>Guest Clinician</small></div>
        </aside>
        <div className="ap-mock-main">
          <div className="ap-mock-head">
            <div><h3>Good afternoon, Guest 👋</h3><p>Practise communication, one calm step at a time.</p></div>
            <div className="ap-mock-tools"><Search /><Bell /><CircleHelp /><i>GC</i></div>
          </div>
          <div className="ap-mock-grid">
            <section className="ap-today-card">
              <span className="ap-mini-kicker">✣ Today’s pick</span>
              <h4>Naming Common Objects</h4>
              <p>Strengthen word retrieval by naming everyday items.</p>
              <div className="ap-object-art"><span className="ap-mug" /><span className="ap-apple" /></div>
              <div className="ap-tag-row"><small>10 min</small><small>Easy</small><small>Word Finding</small></div>
              <div className="ap-card-actions"><button>Start Session →</button><a href="#history">Session history →</a></div>
            </section>
            <aside className="ap-insights">
              <div className="ap-insights-title"><b>Session insights</b><small>This week⌄</small></div>
              <div className="ap-stat-grid">
                <MiniStat value="12" label="Sessions" color="violet" />
                <MiniStat value="86%" label="Accuracy" color="orange" />
              </div>
            </aside>
          </div>
          <h5>Continue practising</h5>
          <div className="ap-continue-row">
            <ContinueCard title="Object Naming" value="60%" color="violet" />
            <ContinueCard title="Conversation Builder" value="25%" color="orange" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ value, label, color }) {
  return <div className={`ap-mini-stat ap-${color}`}><strong>{value}</strong><span>{label}</span><i /><small>↑ 8%</small></div>;
}

function ContinueCard({ title, value, color }) {
  return (
    <div className="ap-continue-card">
      <span className={`ap-continue-icon ap-${color}`}><Library size={17} /></span>
      <div><b>{title}</b><small>Started recently</small><i><em style={{ width: value }} /></i></div>
      <strong>{value}</strong>
    </div>
  );
}

function TrustStrip() {
  return (
    <section className="ap-trust" id="clinicians">
      <span>Trusted by clinicians and healthcare organizations</span>
      <div><b>UCLA <i>Health</i></b><b>Stanford <i>Medicine</i></b><b>Mayo Clinic</b><b>Cleveland Clinic</b><b>NYU Langone <i>Health</i></b></div>
    </section>
  );
}

function PublicFooter() {
  const columns = [
    ["Product", "Features", "How it works", "Integrations", "Updates"],
    ["For Clinicians", "Why Artiqal", "Pricing", "Customer stories", "Resources"],
    ["Company", "About us", "Careers", "Blog", "Contact"],
    ["Legal", "Privacy", "Terms", "Security", "HIPAA"],
  ];
  return (
    <footer className="ap-footer" id="about">
      <div className="ap-footer-brand"><Link className="ap-logo" to="/"><Logo size={37} /><b>artiqal</b></Link><small>© 2026 Artiqal, Inc. All rights reserved.</small></div>
      {columns.map(([heading, ...items]) => <div className="ap-footer-col" key={heading}><b>{heading}</b>{items.map((item) => <a href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>{item}</a>)}</div>)}
      <div className="ap-newsletter" id="resources"><b>Stay in the loop</b><p>Helpful resources, straight to your inbox.</p><label><input placeholder="Enter your email" /><button><ArrowRight size={17} /></button></label></div>
    </footer>
  );
}

function CtaRibbon() {
  return (
    <svg className="ap-ribbon ap-ribbon-cta" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="apCtaGradient"><stop stopColor="#ffb15f"/><stop offset=".35" stopColor="#ff567b"/><stop offset=".65" stopColor="#ea3bbb"/><stop offset="1" stopColor="#6545e7"/></linearGradient></defs>
      {[0,1,2,3,4,5].map((n) => <path key={n} d={`M 260 ${360-n*13} C 510 ${205-n*7}, 630 ${40+n*6}, 1240 ${80+n*10}`} fill="none" stroke="url(#apCtaGradient)" strokeWidth={25-n} opacity={.3+n*.1}/>) }
    </svg>
  );
}
