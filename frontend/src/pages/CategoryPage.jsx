import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ActivityCard } from "@/components/ActivityCard";
import { DOMAIN_NAV_ITEMS, getDomainTheme } from "@/lib/domainThemes";
import { activityBelongsToCategory, filterRetiredActivities } from "@/lib/activityIndex";
import { useSmartBack } from "@/lib/navigationHistory";
import aiPracticeArtwork from "@/assets/domain-ai-practice.png";
import wordFindingArtwork from "@/assets/domain-word-finding.png";
import readingArtwork from "@/assets/domain-reading.png";
import writingArtwork from "@/assets/domain-writing.png";
import listeningArtwork from "@/assets/domain-auditory-comprehension.png";
import functionalArtwork from "@/assets/domain-functional-communication.png";
import gamesArtwork from "@/assets/domain-games.png";
import cognitiveArtwork from "@/assets/domain-cognitive-communication.png";
import {
  ArrowLeft,
  Brain,
  ChevronDown,
  ChevronRight,
  Compass,
  MessageCircle,
  MessageSquare,
  Mic,
  Gamepad2,
  Sparkles,
  Target,
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
    iconStyle: "whiteTile",
    description: "Find the right word with cueing, naming, and association exercises.",
    chips: ["Build vocabulary", "Improve expression"],
    artGlow:
      "radial-gradient(ellipse at 50% 44%, rgba(74, 202, 219, 0.42), transparent 54%), radial-gradient(ellipse at 34% 64%, rgba(34, 211, 238, 0.22), transparent 42%)",
  },
  "auditory-comprehension": {
    icon: Mic,
  },
  "functional-communication": {
    icon: MessageCircle,
  },
  games: {
    icon: Gamepad2,
    description: "Playful activities that build language, attention, and confidence.",
    chips: ["Playful practice", "Build attention", "Support language"],
  },
  "cognitive-communication": {
    icon: Brain,
  },
  "ai-practice": {
    icon: Brain,
    description: "AI-powered practice activities",
    chips: ["AI supported", "Session-ready"],
  },
  "all-activities": {
    icon: Compass,
  },
};

const CATEGORY_ARTWORK = {
  reading: readingArtwork,
  writing: writingArtwork,
  "word-finding": wordFindingArtwork,
  "auditory-comprehension": listeningArtwork,
  "functional-communication": functionalArtwork,
  games: gamesArtwork,
  "cognitive-communication": cognitiveArtwork,
  "ai-practice": aiPracticeArtwork,
};

const DEFAULT_CATEGORY_CHIPS = ["Guided practice", "Session-ready"];
const CHIP_ICONS = [Sparkles, MessageSquare];

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
  const smartBack = useSmartBack();
  const [category, setCategory] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Recommended");

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    Promise.all([
      api.get("/categories").catch(() => ({ data: [] })),
      api.get("/activities").catch(() => ({ data: [] })),
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
        setActivities(filterRetiredActivities(a.data || []).filter((activity) => activityBelongsToCategory(activity, slug)));
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load this category.");
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const domainTheme = getDomainTheme(slug);
  const theme = { ...domainTheme, ...(CATEGORY_VISUALS[slug] || CATEGORY_VISUALS["all-activities"]) };
  const HeaderIcon = theme.icon;
  const categoryDescription = theme.description || category?.description;
  const categoryChips = theme.chips || DEFAULT_CATEGORY_CHIPS;
  const categoryArtwork = CATEGORY_ARTWORK[slug];
  const activitySectionTitle =
    slug === "functional-communication" ? "Functional Tasks" : "Conversation Scenarios";
  const activitySectionDescription =
    slug === "functional-communication"
      ? "Real-world activities for everyday communication practice."
      : "Real-life situations to build your confidence and communication skills.";
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
  const categoryBannerStyle = {
    "--category-accent": theme.accent,
    "--category-glow": theme.hoverGlow || theme.accent,
    "--category-soft-bg": theme.softBg,
    "--category-art-gradient": theme.artGlow || theme.blobGradient || theme.bannerGradient,
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
        <main className="clinician-page">
        <div className="max-w-3xl mx-auto py-16 text-center text-rose-600" data-testid="category-error">
          {error}
        </div>
        </main>
      </div>
    );
  }

  if (loaded && !category) {
    return <Navigate to="/all-activities" replace />;
  }

  return (
    <div className="min-h-screen" data-testid="category-page">
      <main className="clinician-page">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 flex-wrap" data-testid="breadcrumb-header">
          <button
            type="button"
            onClick={smartBack}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-indigo-600 font-display font-medium"
            data-testid="back-to-hub"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
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
              className="category-domain-banner"
              style={categoryBannerStyle}
              data-testid="category-hero"
            >
              <div className="category-domain-content">
                <span
                  className="category-domain-icon-tile"
                  style={categoryIconStyle}
                >
                  <HeaderIcon className="category-domain-icon" />
                </span>
                <div className="category-domain-copy">
                  <h1 className="font-display">
                    {category.name}
                  </h1>
                  <p>
                    {categoryDescription}
                  </p>
                  <div className="category-domain-chips" aria-label={`${category.name} focus areas`}>
                    {categoryChips.slice(0, 2).map((chip, index) => {
                      const ChipIcon = CHIP_ICONS[index] || Sparkles;
                      return (
                        <span key={chip} className="category-domain-chip">
                          <ChipIcon className="w-3.5 h-3.5" />
                          {chip}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="category-domain-art" aria-hidden="true">
                <span className="category-domain-art-glow" />
                {categoryArtwork ? (
                  <img className="category-domain-art-image" src={categoryArtwork} alt="" />
                ) : (
                  <span className="category-domain-art-fallback" />
                )}
              </div>
            </div>
          </header>
        ) : null}

        {/* Section header */}
        <div className="mt-8 flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3.5">
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl shrink-0"
              style={{ background: `${theme.accent}1A`, color: theme.accent }}
            >
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight">
                {activitySectionTitle}
              </h2>
              <p className="text-zinc-500 mt-1 text-sm sm:text-[15px]">
                {activitySectionDescription}
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
            className="activities-card-grid mt-8"
            data-testid="activity-list"
          >
            {sortedActivities.map((a, idx) => (
              <li key={a.slug}>
                <ActivityCard activity={a} delayIndex={idx} />
              </li>
            ))}
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

