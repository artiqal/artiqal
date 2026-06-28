import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { getActivityHref } from "@/lib/activityIndex";
import { DOMAIN_NAV_ITEMS, getDomainTheme } from "@/lib/domainThemes";
import { Header } from "@/components/Header";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  ChevronDown,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  MapPin,
  MessageCircle,
  MessageSquare,
  Mic,
  Pill,
  Stethoscope,
  Target,
  Voicemail,
  Mail,
} from "lucide-react";

// Per-category visual details that sit on top of shared domain colour themes.
const CATEGORY_VISUALS = {
  reading: {
    icon: MessageSquare,
  },
  writing: {
    icon: Mail,
  },
  "word-finding": {
    icon: WordFindingBannerIcon,
    bannerClassName: "word-finding-hero",
    iconStyle: "whiteTile",
    description: "Find the right word with cueing, naming, and association exercises.",
  },
  "auditory-comprehension": {
    icon: Mic,
  },
  "functional-communication": {
    icon: MessageCircle,
  },
  "cognitive-communication": {
    icon: Brain,
  },
  "sfa-therapy": {
    icon: Target,
  },
  "all-activities": {
    icon: Compass,
  },
};

// Per-activity icon + pastel tile colour
const ACTIVITY_ICONS = {
  "appointment-letter": { icon: Mail, color: "#F97316", bg: "#FFEDD5" },
  "prescription-medication-labels": { icon: Pill, color: "#D97706", bg: "#FEF3C7" },
  voicemails: { icon: Voicemail, color: "#7C3AED", bg: "#EDE9FE" },
  "ordering-coffee": { icon: Coffee, color: "#16A34A", bg: "#DCFCE7" },
  "doctor-visit": { icon: Stethoscope, color: "#2563EB", bg: "#DBEAFE" },
  "asking-directions": { icon: MapPin, color: "#DB2777", bg: "#FCE7F3" },
};

const FALLBACK_ICON = { icon: MessageCircle, color: "#6366F1", bg: "#E0E7FF" };
const WORD_FINDING_ICON_TILE_STYLE = {
  border: "1px solid rgba(255,255,255,.72)",
  background: "rgba(255,255,255,.96)",
  boxShadow:
    "0 18px 34px -18px rgba(35,67,160,.34), inset 0 1px 0 rgba(255,255,255,.86)",
};

function WordFindingBannerIcon({ className = "w-9 h-9" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="3.2" />
      <path d="M12.2 30.8 6 37" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <rect x="25" y="24" width="15" height="15" rx="3.2" fill="white" stroke="currentColor" strokeWidth="2.7" />
      <path d="M29.4 35.2 32.5 27.8 35.6 35.2M30.7 32.5h3.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Recommended");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/categories").catch(() => ({ data: [] })),
      api.get(`/categories/${slug}/activities`).catch(() => ({ data: [] })),
    ])
      .then(([c, a]) => {
        if (cancelled) return;
        const apiCategory = c.data.find((x) => x.slug === slug) || null;
        const sharedCategory = DOMAIN_NAV_ITEMS.find((x) => x.slug === slug) || null;
        const normalizeCategory = (item) =>
          item
            ? {
                ...item,
                title: item.title || item.name,
                name: item.name || item.title,
                description: item.description || item.fallback,
              }
            : null;
        const fallbackCategory = sharedCategory
          ? {
              ...sharedCategory,
              title: sharedCategory.name,
              description: sharedCategory.description || sharedCategory.fallback,
            }
          : null;
        setCategory(normalizeCategory(apiCategory) || fallbackCategory);
        setActivities(a.data);
      })
      .catch(() => setError("Could not load this category."));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const domainTheme = getDomainTheme(slug);
  const theme = { ...domainTheme, ...(CATEGORY_VISUALS[slug] || CATEGORY_VISUALS["all-activities"]) };
  const HeaderIcon = theme.icon;
  const categoryDescription = theme.description || category?.description;
  const categoryIconStyle =
    theme.iconStyle === "whiteTile"
      ? { ...WORD_FINDING_ICON_TILE_STYLE, color: theme.accent }
      : {
          color: theme.accent,
          border: "1px solid rgba(255,255,255,.42)",
          background: theme.iconTint,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.34), 0 10px 24px rgba(15,23,42,.14)",
        };

  const sortedActivities = useMemo(() => {
    const list = [...activities];
    if (sortBy === "Shortest first") {
      list.sort((a, b) => (a.duration_min || 0) - (b.duration_min || 0));
    } else if (sortBy === "Longest first") {
      list.sort((a, b) => (b.duration_min || 0) - (a.duration_min || 0));
    } else if (sortBy === "A → Z") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [activities, sortBy]);

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-rose-600" data-testid="category-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="category-page">
      <Header />
      <main className="clinician-page">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 flex-wrap" data-testid="breadcrumb-header">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-zinc-600 hover:text-indigo-600 font-display font-medium"
            data-testid="back-to-hub"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <span className="hidden sm:inline-block w-px h-4 bg-zinc-300" />
          <nav
            className="flex items-center gap-1.5 text-sm text-zinc-500 flex-wrap"
            aria-label="Breadcrumb"
          >
            <Link
              to="/dashboard"
              className="hover:text-indigo-600 hover:underline underline-offset-2 transition"
              data-testid="breadcrumb-crumb-0"
            >
              Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span
              className="text-zinc-900 font-display font-semibold"
              data-testid="breadcrumb-crumb-1"
            >
              {category ? category.title : "…"}
            </span>
          </nav>
        </div>

        {/* Hero banner */}
        {category ? (
          <header className="mt-6 fade-up">
            <div
              className={`rounded-[28px] px-6 sm:px-10 py-9 sm:py-11 relative overflow-hidden ${theme.bannerClassName || ""}`}
              style={{ background: theme.bannerGradient }}
              data-testid="category-hero"
            >
              {/* Decorative chat-bubble illustrations on the right (desktop only) */}
              {slug !== "word-finding" ? (
                <div
                  className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                >
                  <ChatBubbleArt />
                </div>
              ) : null}

              <div className="relative flex items-start gap-5">
                <span
                  className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white"
                  style={categoryIconStyle}
                >
                  <HeaderIcon className="w-9 h-9" />
                </span>
                <div className="text-white max-w-2xl">
                  <h1 className="font-display text-3xl sm:text-[40px] font-bold tracking-tight leading-tight">
                    {category.name}
                  </h1>
                  <p className="mt-2 text-white/95 text-base sm:text-lg leading-relaxed">
                    {categoryDescription}
                  </p>
                </div>
              </div>
            </div>
          </header>
        ) : null}

        {/* Section header */}
        <div className="mt-10 flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3.5">
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl shrink-0"
              style={{ background: `${theme.accent}1A`, color: theme.accent }}
            >
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight">
                Conversation Scenarios
              </h2>
              <p className="text-zinc-500 mt-1 text-sm sm:text-[15px]">
                Real-life situations to build your confidence and communication skills.
              </p>
            </div>
          </div>

          {/* Sort by pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              data-testid="sort-by-button"
              className="inline-flex items-center gap-2 pl-4 pr-3.5 py-2.5 rounded-full bg-white text-sm font-display font-medium text-zinc-700 hover:bg-zinc-50 transition"
              style={{
                border: "1px solid #EEE",
                boxShadow: "0 4px 14px -8px rgba(15,23,42,0.10)",
              }}
            >
              <span className="text-zinc-400">Sort by:</span>
              <span className="font-semibold text-zinc-900">{sortBy}</span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition ${
                  sortOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {sortOpen ? (
              <ul
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-white py-1.5 z-10"
                style={{
                  border: "1px solid #EEE",
                  boxShadow: "0 18px 40px -22px rgba(15,23,42,0.22)",
                }}
                data-testid="sort-by-menu"
              >
                {["Recommended", "Shortest first", "Longest first", "A → Z"].map(
                  (opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(opt);
                          setSortOpen(false);
                        }}
                        data-testid={`sort-option-${opt.toLowerCase().replace(/\W+/g, "-")}`}
                        className={`w-full text-left px-4 py-2 text-sm font-display ${
                          sortBy === opt
                            ? "font-bold text-indigo-700 bg-indigo-50"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        {opt}
                      </button>
                    </li>
                  )
                )}
              </ul>
            ) : null}
          </div>
        </div>

        {/* Activity cards */}
        {sortedActivities.length ? (
          <ul
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            data-testid="activity-list"
          >
            {sortedActivities.map((a, idx) => {
            const spec = ACTIVITY_ICONS[a.slug] || FALLBACK_ICON;
            const IconCmp = spec.icon;
            return (
              <li key={a.slug}>
                <Link
                  to={getActivityHref(a)}
                  className={`group block rounded-3xl bg-white p-5 sm:p-6 h-full flex flex-col transition fade-up delay-${(idx % 4) + 1}`}
                  style={{
                    border: "1px solid #F0F0F4",
                    boxShadow: "0 4px 14px -8px rgba(15,23,42,0.08)",
                  }}
                  data-testid={`activity-card-${a.slug}`}
                >
                  {/* Top row: icon tile + duration pill */}
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shrink-0"
                      style={{
                        color: spec.color,
                        background: spec.bg,
                        border: "1px solid rgba(255,255,255,.62)",
                        boxShadow:
                          "0 12px 24px -18px rgba(15,23,42,.26), inset 0 1px 0 rgba(255,255,255,.72)",
                      }}
                      aria-hidden="true"
                    >
                      <IconCmp className="w-7 h-7" />
                    </span>
                    {a.duration_min ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold text-zinc-600 bg-white"
                        style={{
                          border: "1px solid #F0F0F4",
                          boxShadow: "0 2px 8px -4px rgba(15,23,42,0.06)",
                        }}
                      >
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {a.duration_min} min
                      </span>
                    ) : null}
                  </div>

                  {/* Title + summary */}
                  <div className="mt-5">
                    <h3 className="font-display font-bold text-[20px] leading-tight text-zinc-900">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-[14px] text-zinc-500 leading-relaxed line-clamp-4">
                      {a.summary}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="mt-5 pt-4 flex items-center justify-between"
                    style={{ borderTop: "1px solid #F0F0F4" }}
                  >
                    <span
                      className="font-display font-bold text-[15px]"
                      style={{ color: theme.accent }}
                    >
                      Start practice
                    </span>
                    <span
                      className="inline-grid place-items-center w-9 h-9 rounded-full bg-white text-zinc-500 transition group-hover:bg-zinc-50"
                      style={{ border: "1px solid #EAEAEF" }}
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </li>
            );
            })}
          </ul>
        ) : (
          <div
            className="mt-8 rounded-3xl bg-white p-8 sm:p-10 text-center"
            style={{
              border: "1px solid #F0F0F4",
              boxShadow: "0 18px 55px rgba(31,28,85,0.07)",
            }}
            data-testid="category-empty-state"
          >
            <h3 className="font-display text-xl font-bold text-zinc-950">No activities yet.</h3>
            <p className="mt-2 text-sm text-zinc-500">
              New {category?.name || "category"} activities will appear here when they are added.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Small decorative chat-bubble cluster for the hero banner (right side, desktop)
function ChatBubbleArt() {
  return (
    <div className="relative w-[220px] h-[180px] opacity-95">
      {/* Big bubble */}
      <span
        className="absolute right-4 top-3 w-[120px] h-[100px] rounded-[34px] rounded-br-[10px] bg-white grid place-items-center"
        style={{ boxShadow: "0 24px 50px -22px rgba(0,0,0,0.25)" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-400" />
          <span className="w-2 h-2 rounded-full bg-zinc-400" />
          <span className="w-2 h-2 rounded-full bg-zinc-400" />
        </span>
      </span>
      {/* Small bubble */}
      <span
        className="absolute right-0 bottom-2 w-[88px] h-[70px] rounded-[26px] rounded-tl-[8px] grid place-items-center"
        style={{
          background: "#FFE082",
          boxShadow: "0 18px 40px -20px rgba(0,0,0,0.22)",
        }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-7 h-1 rounded-full bg-zinc-700/70" />
        </span>
      </span>
      {/* Tiny spark lines */}
      <span
        className="absolute -top-1 -right-2 w-6 h-6 text-white/90"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M14 4 L18 2" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M16 8 L20 8" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M14 12 L18 14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </svg>
      </span>
    </div>
  );
}
