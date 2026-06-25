import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { getActivityHref } from "@/lib/activityIndex";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import { SessionBanner } from "@/components/SessionBanner";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ArrowUpRight, ArrowRight, Play, Sparkles, Timer } from "lucide-react";

// Vibrant gradient + foreground icon color per category
const GRADIENTS = {
  reading: { gradient: "linear-gradient(135deg,#2563EB 0%,#38BDF8 100%)", fg: "#2563EB", soft: "rgba(37,99,235,.34)" },
  writing: { gradient: "linear-gradient(135deg,#F97316 0%,#FB7185 100%)", fg: "#EA580C", soft: "rgba(249,115,22,.36)" },
  "word-finding": { gradient: "linear-gradient(135deg,#7C3AED 0%,#38BDF8 100%)", fg: "#6D28D9", soft: "rgba(124,58,237,.35)" },
  "auditory-comprehension": { gradient: "linear-gradient(135deg,#06B6D4 0%,#3B82F6 100%)", fg: "#0891B2", soft: "rgba(6,182,212,.35)" },
  "functional-communication": { gradient: "linear-gradient(135deg,#F59E0B 0%,#EF4444 100%)", fg: "#D97706", soft: "rgba(245,158,11,.38)" },
  "sfa-therapy": { gradient: "linear-gradient(135deg,#EC4899 0%,#8B5CF6 100%)", fg: "#DB2777", soft: "rgba(236,72,153,.35)" },
  games: { gradient: "linear-gradient(135deg,#22C55E 0%,#14B8A6 100%)", fg: "#059669", soft: "rgba(34,197,94,.34)" },
  dysphagia: { gradient: "linear-gradient(135deg,#0F766E 0%,#84CC16 100%)", fg: "#0F766E", soft: "rgba(15,118,110,.34)" },
  "motor-speech": { gradient: "linear-gradient(135deg,#6366F1 0%,#A855F7 100%)", fg: "#4F46E5", soft: "rgba(99,102,241,.35)" },
  voice: { gradient: "linear-gradient(135deg,#E11D48 0%,#F97316 100%)", fg: "#BE123C", soft: "rgba(225,29,72,.34)" },
  favourites: { gradient: "linear-gradient(135deg,#F43F5E 0%,#EC4899 100%)", fg: "#E11D48", soft: "rgba(244,63,94,.35)" },
  "ai-practice": { gradient: "linear-gradient(135deg,#4F46E5 0%,#06B6D4 100%)", fg: "#4338CA", soft: "rgba(79,70,229,.35)" },
  "all-activities": { gradient: "linear-gradient(135deg,#635BFF 0%,#00D4FF 100%)", fg: "#4F46E5", soft: "rgba(99,91,255,.35)" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: "Good evening", emoji: "🌙" };
  if (h < 12) return { text: "Good morning", emoji: "👋" };
  if (h < 17) return { text: "Good afternoon", emoji: "👋" };
  if (h < 22) return { text: "Good evening", emoji: "👋" };
  return { text: "Good night", emoji: "🌙" };
}

export default function Dashboard({ previewMode = false, onPreviewAction }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/categories"), api.get("/activities")])
      .then(([c, a]) => {
        setCategories(c.data);
        setActivities(a.data);
      })
      .catch(() => {});
  }, []);

  const linkFor = (slug) =>
    slug === "all-activities" ? "/all-activities" : slug === "sfa-therapy" ? "/sfa" : `/category/${slug}`;

  const greeting = useMemo(getGreeting, []);
  const firstName = user?.name ? user.name.split(" ")[0] : "Guest";

  // Daily rotating "Today's pick" — deterministic by day of year so it feels intentional
  const pick = useMemo(() => {
    if (!activities.length) return null;
    const browseable = activities.filter((a) => a.category !== "all-activities");
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return browseable[day % browseable.length] || null;
  }, [activities]);

  const pickHref = pick ? getActivityHref(pick) : "/all-activities";
  const activityCounts = useMemo(() => {
    return activities.reduce((counts, activity) => {
      counts[activity.category] = (counts[activity.category] || 0) + 1;
      return counts;
    }, {});
  }, [activities]);

  const { isActive, start: startSession } = useSession();
  const showPreviewNotice = (message = "This is a preview of the Artiqal hub. Create a free account to start activities.") => {
    onPreviewAction?.(message);
  };

  if (!previewMode) {
    return (
      <div className="min-h-screen" data-testid="dashboard-page">
        <main className="hub-dashboard-main hub-home-main clinician-page is-compact">
          <section className="hub-home-hero fade-up" data-testid="greeting-section">
            <div className="hub-home-intro">
              <span className="hub-home-eyebrow">Artiqal hub</span>
              <h1>
                {greeting.text}
                {firstName ? `, ${firstName}` : ""} <span aria-hidden>{greeting.emoji}</span>
              </h1>
              <p>Choose a functional activity, continue a session, or browse the library by clinical goal.</p>
              <div className="hub-home-actions">
                <Link to="/all-activities" className="hub-home-primary" data-testid="browse-all-link">
                  Explore activities <ArrowRight className="w-4 h-4" />
                </Link>
                <button type="button" onClick={startSession} className="hub-home-secondary" data-testid="start-session-btn">
                  <Timer className="w-4 h-4" /> Start session
                </button>
              </div>
            </div>

            <aside className="hub-home-pick" data-testid="welcome-block">
              <div className="hub-home-pick-glow" aria-hidden />
              <div className="hub-home-pick-topline">
                <span><Sparkles className="w-3.5 h-3.5" /> Today’s pick</span>
                <small>Recommended</small>
              </div>
              <h2>{pick ? pick.title : "Choose a category to begin"}</h2>
              <p>{pick ? (pick.summary || "A short guided activity is ready when you are.") : "Pick a category and dive in. Every activity is built for calm, practical communication practice."}</p>
              <div className="hub-home-pick-actions">
                <Link to={pickHref} className="hub-home-primary compact" data-testid="welcome-cta-primary">
                  <Play className="w-4 h-4" /> {pick ? "Open pick" : "Pick a category"}
                </Link>
                <Link to="/sessions" className="hub-home-text-link" data-testid="welcome-cta-secondary">
                  Session history <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </section>

          {isActive ? (
            <div className="mt-6">
              <SessionBanner />
            </div>
          ) : null}

          <section className="hub-home-library">
            <div className="hub-home-library-head">
              <div>
                <span className="hub-home-eyebrow">Activity library</span>
                <h2>Choose a category</h2>
                <p>Session-ready practice organized by real clinical goals.</p>
              </div>
              <Link to="/all-activities" className="hub-home-text-link strong">
                Browse all <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="hub-home-category-grid" data-testid="category-grid">
              {categories.map((c, idx) => {
                const g = GRADIENTS[c.slug] || GRADIENTS["all-activities"];
                const count = activityCounts[c.slug] || 0;

                return (
                  <Link
                    key={c.slug}
                    to={linkFor(c.slug)}
                    className={`hub-home-category-card fade-up delay-${(idx % 4) + 1} group`}
                    style={{ "--category-gradient": g.gradient, "--category-color": g.fg, "--category-soft": g.soft }}
                    data-testid={`category-tile-${c.slug}`}
                  >
                    <div className="cat-art-icon hub-home-category-icon" style={{ "--cat-gradient": g.gradient, "--cat-fg": g.fg }}>
                      <CategoryIcon name={c.icon} className="w-5 h-5" />
                    </div>
                    <div className="hub-home-category-copy">
                      <h3>{c.name}</h3>
                      <p>{c.tagline}</p>
                      <small>{count ? `${count} activities` : "Browse activities"}</small>
                    </div>
                    <span className="hub-home-category-arrow" aria-hidden>
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen"
      data-testid="dashboard-page"
      onClickCapture={
        previewMode
          ? (event) => {
              if (event.target.closest("a, button")) {
                event.preventDefault();
                event.stopPropagation();
                showPreviewNotice();
              }
            }
          : undefined
      }
    >
      <main className={`hub-dashboard-main max-w-[1640px] px-8 lg:px-20 ${previewMode ? "py-10" : "py-8"}`}>
        {/* Greeting */}
        <section className="fade-up" data-testid="greeting-section">
          <h1 className={`font-display font-extrabold tracking-tight ${previewMode ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}>
            {greeting.text}
            {firstName ? `, ${firstName}` : ""} <span aria-hidden>{greeting.emoji}</span>
          </h1>
          <p className={`${previewMode ? "mt-3 text-lg" : "mt-2 text-base"} text-zinc-600 max-w-xl`}>
            {previewMode
              ? "Practice communication, one calm step at a time."
              : "Choose an activity or continue where you left off."}
          </p>
        </section>

        {isActive ? (
          <SessionBanner />
        ) : previewMode ? (
          <>
            {/* Welcome / Today's pick block */}
            <section
              className="mt-8 fade-up delay-1 relative overflow-hidden rounded-3xl"
              data-testid="welcome-block"
              style={{
                background: "var(--brand-gradient)",
              }}
            >
              <div
                className="absolute inset-0 opacity-50 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
                aria-hidden
              />
              <div
                className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(236,72,153,0.35)" }}
                aria-hidden
              />
              <div
                className="absolute -left-24 -bottom-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(59,130,246,0.35)" }}
                aria-hidden
              />

              <div className="relative grid sm:grid-cols-5 gap-6 p-6 sm:p-9">
                <div className="sm:col-span-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white/95 text-xs font-display font-semibold tracking-[0.18em] uppercase">
                    <Sparkles className="w-3.5 h-3.5" /> Today’s pick
                  </div>
                  <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Ready to practise today?
                  </h2>
                  <p className="mt-3 text-white/85 max-w-lg leading-relaxed">
                    {pick
                      ? <>A short session is ready for you: <span className="font-semibold text-white">{pick.title}</span>. Take your time — every prompt can be read aloud.</>
                      : "Pick a category and dive in. Take your time — every prompt can be read aloud."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={startSession}
                      data-testid="start-session-btn"
                      className="inline-flex items-center gap-2 h-12 px-5 rounded-full bg-white text-indigo-700 font-display font-semibold hover:bg-indigo-50 transition"
                    >
                      <Timer className="w-4 h-4" /> Start session
                    </button>
                    <Link
                      to={pickHref}
                      data-testid="welcome-cta-primary"
                      className="inline-flex items-center gap-2 h-12 px-5 rounded-full border border-white/40 text-white font-display font-semibold hover:bg-white/10 transition"
                    >
                      <Play className="w-4 h-4" /> {pick ? "Today’s pick" : "Pick a category"}
                    </Link>
                    <Link
                      to="/sessions"
                      data-testid="welcome-cta-secondary"
                      className="inline-flex items-center gap-2 h-12 px-5 rounded-full border border-white/40 text-white font-display font-semibold hover:bg-white/10 transition"
                    >
                      Session history <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Decorative right card preview */}
                <div className="hidden sm:block sm:col-span-2">
                  <div className="relative h-full min-h-[200px] rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-5 flex flex-col justify-end">
                    <div className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 text-indigo-700">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div className="text-white/70 text-xs font-display font-semibold tracking-[0.18em] uppercase">
                      Featured
                    </div>
                    <div className="font-display text-xl font-bold text-white mt-1">
                      {pick ? pick.title : "Choose a category to begin"}
                    </div>
                    {pick ? (
                      <div className="mt-1 text-white/80 text-sm">{pick.summary}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            {/* Always-visible secondary clinician banner so they can start tracking */}
          </>
        ) : (
          <>
            {/* Compact today's pick block */}
            <section
              className="mt-6 fade-up delay-1 relative overflow-hidden rounded-[28px] border border-indigo-100/80 bg-white/85 shadow-[0_18px_55px_rgba(79,70,229,0.09)]"
              data-testid="welcome-block"
            >
              <div
                className="absolute inset-y-0 left-0 w-1.5 pointer-events-none"
                style={{
                  background: "var(--brand-gradient)",
                }}
                aria-hidden
              />
              <div
                className="absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(99,102,241,0.13)" }}
                aria-hidden
              />

              <div className="relative grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-display font-semibold tracking-[0.16em] uppercase text-indigo-600">
                    <Sparkles className="w-3.5 h-3.5" /> Today’s pick
                  </div>
                  <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                    {pick ? pick.title : "Choose a category to begin"}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-zinc-600 max-w-2xl leading-relaxed">
                    {pick
                      ? (pick.summary || "A short guided activity is ready when you are.")
                      : "Pick a category and dive in. Take your time — every prompt can be read aloud."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={startSession}
                    data-testid="start-session-btn"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-zinc-950 text-white font-display font-semibold hover:bg-zinc-800 transition"
                  >
                    <Timer className="w-4 h-4" /> Start session
                  </button>
                  <Link
                    to={pickHref}
                    data-testid="welcome-cta-primary"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-zinc-200 bg-white text-zinc-900 font-display font-semibold hover:border-indigo-200 hover:text-indigo-700 transition"
                  >
                    <Play className="w-4 h-4" /> {pick ? "Open pick" : "Pick a category"}
                  </Link>
                  <Link
                    to="/sessions"
                    data-testid="welcome-cta-secondary"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-zinc-200 bg-white text-zinc-700 font-display font-semibold hover:border-indigo-200 hover:text-indigo-700 transition"
                  >
                    Session history <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Library header */}
        <section className={`${previewMode ? "mt-12" : "mt-8"} flex items-end justify-between gap-4`}>
          <div>
            <div className="text-xs text-indigo-600 font-semibold tracking-[0.18em] uppercase">
              Library
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Choose a category
            </h3>
          </div>
          <Link
            to="/all-activities"
            data-testid="browse-all-link"
            className="inline-flex items-center gap-1 text-indigo-600 font-display font-semibold hover:text-indigo-700"
          >
            Browse all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Categories grid */}
        <div
          className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-testid="category-grid"
        >
          {categories.map((c, idx) => {
            const g = GRADIENTS[c.slug] || GRADIENTS["all-activities"];
            return (
              <Link
                key={c.slug}
                to={linkFor(c.slug)}
                className={`cat-card fade-up delay-${(idx % 4) + 1} group`}
                data-testid={`category-tile-${c.slug}`}
              >
                <div
                  className="cat-art"
                  style={{ "--cat-gradient": g.gradient, "--cat-fg": g.fg }}
                >
                  <span className="cat-art-icon">
                    <CategoryIcon name={c.icon} className="w-6 h-6" />
                  </span>
                  <span
                    className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/85 text-zinc-700 group-hover:bg-white transition"
                    aria-hidden
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="cat-card-body">
                  <div className="cat-card-title">{c.name}</div>
                  <div className="cat-card-tag">{c.tagline}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
