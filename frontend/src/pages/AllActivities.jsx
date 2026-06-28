import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { DOMAIN_NAV_ITEMS, getDomainTheme } from "@/lib/domainThemes";
import { useActivitySort } from "@/contexts/ActivitySortContext";
import aiPracticeIllustration from "@/assets/domain-ai-practice.png";
import auditoryComprehensionIllustration from "@/assets/domain-auditory-comprehension.png";
import cognitiveCommunicationIllustration from "@/assets/domain-cognitive-communication.png";
import dysphagiaIllustration from "@/assets/domain-dysphagia.png";
import functionalCommunicationIllustration from "@/assets/domain-functional-communication.png";
import gamesIllustration from "@/assets/domain-games.png";
import motorSpeechIllustration from "@/assets/domain-motor-speech.png";
import readingIllustration from "@/assets/domain-reading.png";
import voiceIllustration from "@/assets/domain-voice.png";
import wordFindingIllustration from "@/assets/domain-word-finding.png";
import writingIllustration from "@/assets/domain-writing.png";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Search,
  Type,
} from "lucide-react";
import { buildActivityIndex, getActivityHref, normalizeSearchQuery, searchActivityIndex } from "@/lib/activityIndex";
import { getActivitySortCapabilities, getActivitySortOptions, sortActivities } from "@/lib/activitySort";

const GRADIENTS = {
  reading: "linear-gradient(135deg,#0EA5E9 0%,#6366F1 60%,#8B5CF6 100%)",
  writing: "linear-gradient(135deg,#FB923C 0%,#F43F5E 100%)",
  "word-finding": "linear-gradient(135deg,#10B981 0%,#06B6D4 100%)",
  "auditory-comprehension": "linear-gradient(135deg,#A78BFA 0%,#EC4899 100%)",
  "functional-communication": "linear-gradient(135deg,#FBBF24 0%,#F97316 100%)",
  "sfa-therapy": "linear-gradient(135deg,#F43F5E 0%,#A855F7 100%)",
  "all-activities": "linear-gradient(135deg,#6366F1 0%,#06B6D4 100%)",
};

const DEFAULT_CARD_ICON = Type;

const DOMAIN_CARD_ILLUSTRATIONS = {
  "ai-practice": aiPracticeIllustration,
  "auditory-comprehension": auditoryComprehensionIllustration,
  "cognitive-communication": cognitiveCommunicationIllustration,
  dysphagia: dysphagiaIllustration,
  "functional-communication": functionalCommunicationIllustration,
  games: gamesIllustration,
  "motor-speech": motorSpeechIllustration,
  reading: readingIllustration,
  voice: voiceIllustration,
  "word-finding": wordFindingIllustration,
  writing: writingIllustration,
};

const DOMAIN_CARD_DESCRIPTIONS = {
  "ai-practice": "AI-powered activities",
  "auditory-comprehension": "Instructions and spoken information",
  "cognitive-communication": "Memory, attention, and planning",
  dysphagia: "Swallowing support resources",
  "functional-communication": "Real-world communication practice",
  games: "Playful clinical practice",
  "motor-speech": "Speech clarity and control",
  reading: "Functional reading practice",
  voice: "Voice and resonance practice",
  "word-finding": "Naming, cueing, and associations",
  writing: "Messages, forms, and sentences",
};

const ACTIVITY_LIBRARY_TIPS = [
  "Tip: Click a domain once to filter, then click it again to reset.",
  "Tip: Use Sort by to quickly organise your session options.",
  "Tip: Search by activity, goal, or skill.",
  "Tip: Sort activities A–Z or by duration.",
  "Tip: Use domains to narrow your session plan.",
  "Tip: Favourite activities you use often.",
];

const DOMAIN_CARD_LABELS = {
  "auditory-comprehension": "Listening",
};

const EXTRA_HUB_CATEGORIES = [
  {
    slug: "ai-practice",
    name: "AI Practice",
    route: "/activity/reading/ai-scenario",
    fallback: "AI-powered activities",
  },
];

const HUB_CATEGORIES = [...DOMAIN_NAV_ITEMS, ...EXTRA_HUB_CATEGORIES].map((category) => {
  const theme = getDomainTheme(category.slug);
  return {
    slug: category.slug,
    label: category.name,
    href: category.route,
    icon: category.hubCardIcon || DEFAULT_CARD_ICON,
    accent: theme.accent,
    hoverGlow: theme.hoverGlow || theme.accent,
    tint: theme.iconTint,
    blob: theme.blobGradient || theme.bannerGradient,
    illustration: DOMAIN_CARD_ILLUSTRATIONS[category.slug],
    fallback: category.fallback,
  };
});

export default function AllActivities() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("relevance");
  const [activityLibraryTipIndex, setActivityLibraryTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const categoryRowRef = useRef(null);
  const preservedScrollYRef = useRef(null);
  const sortMenuRef = useRef(null);
  const tipSwapTimeoutRef = useRef(null);
  const [sortOpen, setSortOpen] = useState(false);
  const { registerActivitySortControls } = useActivitySort();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/activities"), api.get("/categories")]).then(([a, c]) => {
      setItems(a.data);
      setCategories(c.data.filter((x) => x.slug !== "all-activities"));
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipVisible(false);
      tipSwapTimeoutRef.current = window.setTimeout(() => {
        setActivityLibraryTipIndex((index) => (index + 1) % ACTIVITY_LIBRARY_TIPS.length);
        setTipVisible(true);
      }, 180);
    }, 2800);

    return () => {
      window.clearInterval(interval);
      if (tipSwapTimeoutRef.current) {
        window.clearTimeout(tipSwapTimeoutRef.current);
      }
    };
  }, []);

  const updateCarouselControls = useCallback(() => {
    const row = categoryRowRef.current;
    if (!row) return;
    const maxScrollLeft = row.scrollWidth - row.clientWidth;
    setCanScrollLeft(row.scrollLeft > 2);
    setCanScrollRight(row.scrollLeft < maxScrollLeft - 2);
  }, []);

  useEffect(() => {
    updateCarouselControls();
    window.addEventListener("resize", updateCarouselControls);
    return () => window.removeEventListener("resize", updateCarouselControls);
  }, [items.length, categories.length, updateCarouselControls]);

  const scrollCategoryRow = (direction) => {
    const row = categoryRowRef.current;
    if (!row) return;
    const scrollAmount = Math.max(row.clientWidth * 0.72, 280);
    row.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    window.setTimeout(updateCarouselControls, 360);
  };

  const preserveScrollForUpdate = useCallback((update) => {
    preservedScrollYRef.current = window.scrollY;
    update();
  }, []);

  useLayoutEffect(() => {
    if (preservedScrollYRef.current === null) return;
    const targetScrollY = preservedScrollYRef.current;
    preservedScrollYRef.current = null;

    const restoreScroll = () => {
      const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: Math.min(targetScrollY, maxScrollY), behavior: "auto" });
    };

    restoreScroll();
    window.requestAnimationFrame(restoreScroll);
  }, [searchQuery, filter, sortMode]);

  useEffect(() => {
    if (!sortOpen) return;

    const closeSortMenu = (event) => {
      if (sortMenuRef.current?.contains(event.target)) return;
      setSortOpen(false);
    };

    document.addEventListener("pointerdown", closeSortMenu);
    return () => document.removeEventListener("pointerdown", closeSortMenu);
  }, [sortOpen]);

  const colorFor = (slug) => categories.find((c) => c.slug === slug)?.color || "#4F46E5";
  const nameFor = (slug) => categories.find((c) => c.slug === slug)?.name || slug;
  const iconFor = (slug) => HUB_CATEGORIES.find((category) => category.slug === slug)?.icon || DEFAULT_CARD_ICON;

  const indexedActivities = useMemo(
    () => buildActivityIndex(items, categories),
    [items, categories],
  );
  const normalizedSearch = normalizeSearchQuery(searchQuery);
  const sortCapabilities = useMemo(() => getActivitySortCapabilities(items), [items]);
  const sortOptions = useMemo(() => getActivitySortOptions(sortCapabilities), [sortCapabilities]);
  const selectedDomainId = filter === "all" ? null : filter;
  const filteredActivities = indexedActivities.filter((activity) => {
    if (filter !== "all" && activity.category !== filter) return false;
    return true;
  });
  const searchedActivities = normalizedSearch
    ? searchActivityIndex(filteredActivities, normalizedSearch)
    : filteredActivities;
  const visible = sortActivities(searchedActivities, sortMode, {
    normalizedSearch,
    capabilities: sortCapabilities,
  });

  const hubCards = HUB_CATEGORIES.map((category) => {
    const meta = categories.find((item) => item.slug === category.slug);
    const descriptionOverride = DOMAIN_CARD_DESCRIPTIONS[category.slug];
    return {
      ...category,
      label: DOMAIN_CARD_LABELS[category.slug] || meta?.name || category.label,
      description: descriptionOverride || category.fallback || meta?.description || "Clinical practice activities",
    };
  });
  const selectSortMode = useCallback(
    (value) => preserveScrollForUpdate(() => setSortMode(value)),
    [preserveScrollForUpdate],
  );
  const selectedSortLabel = sortOptions.find((option) => option.value === sortMode)?.label || "Recommended";

  useEffect(
    () =>
      registerActivitySortControls({
        searchQuery,
        sortMode,
        sortOptions,
        setSearchQuery: (value) => preserveScrollForUpdate(() => setSearchQuery(value)),
        setSortMode: selectSortMode,
      }),
    [preserveScrollForUpdate, registerActivitySortControls, searchQuery, selectSortMode, sortMode, sortOptions],
  );

  return (
    <div className="min-h-screen" data-testid="all-activities-page">
      <Header />
      <main className="clinician-page is-compact activities-hub-page">
        <section id="activity-library" aria-label="Activities Library">
          <div className="activities-library-tools" aria-label="Activity library controls">
            <label className="activities-library-search" aria-label="Search activities">
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={(event) => preserveScrollForUpdate(() => setSearchQuery(event.target.value))}
                placeholder="What are we working on today?"
              />
            </label>
            <div className="activities-library-sort" ref={sortMenuRef}>
              <button
                type="button"
                className="activities-library-sort-button"
                onClick={() => setSortOpen((open) => !open)}
                aria-label="Sort activities"
                aria-expanded={sortOpen}
              >
                <span className="activities-library-sort-label">Sort by:</span>
                <span className="activities-library-sort-value">{selectedSortLabel}</span>
                <ChevronDown size={15} />
              </button>
              {sortOpen ? (
                <div className="activities-library-sort-menu" role="menu" aria-label="Sort activities">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={sortMode === option.value ? "is-active" : ""}
                      disabled={option.disabled}
                      role="menuitem"
                      onClick={() => {
                        if (option.disabled) return;
                        selectSortMode(option.value);
                        setSortOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {option.disabled ? <small>Coming later</small> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <p className={`activities-library-tip ${tipVisible ? "is-visible" : "is-hidden"}`} aria-live="polite">
              <Lightbulb size={15} aria-hidden="true" />
              <span>{ACTIVITY_LIBRARY_TIPS[activityLibraryTipIndex]}</span>
            </p>
          </div>

          <section className="activities-hub-top-grid" aria-label="Activities Hub overview">
            <section className="activities-hub-panel" aria-labelledby="activities-domain-title">
              <div className="activities-domain-head">
                <h2 id="activities-domain-title">Explore by Domain</h2>
              </div>

              <div className="activities-hub-carousel">
                <button
                  type="button"
                  className="activities-hub-carousel-arrow is-left"
                  onClick={() => scrollCategoryRow("left")}
                  disabled={!canScrollLeft}
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft size={18} />
                </button>

                <div
                  ref={categoryRowRef}
                  className="activities-hub-category-row"
                  aria-label="Activity domains"
                  onScroll={updateCarouselControls}
                >
                  {hubCards.map(({ slug, label, accent, hoverGlow, tint, blob, illustration, description }) => {
                    const selected = selectedDomainId === slug;
                    return (
                    <button
                      key={slug}
                      type="button"
                      className={`activities-hub-domain-card domain-${slug} ${illustration ? "has-illustration" : ""} ${selected ? "is-selected" : ""}`}
                      style={{ "--hub-accent": accent, "--hub-glow": hoverGlow, "--hub-tint": tint, "--hub-blob": blob }}
                      aria-pressed={selected}
                      onClick={() => preserveScrollForUpdate(() => setFilter(selected ? "all" : slug))}
                    >
                      <span className="activities-hub-domain-visual" aria-hidden="true">
                        {illustration ? (
                          <img className="activities-hub-domain-illustration" src={illustration} alt="" />
                        ) : (
                          <span className="activities-hub-domain-blob" />
                        )}
                      </span>
                      <span className="activities-hub-domain-copy">
                        <strong>{label}</strong>
                        <small>{description}</small>
                      </span>
                    </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="activities-hub-carousel-arrow is-right"
                  onClick={() => scrollCategoryRow("right")}
                  disabled={!canScrollRight}
                  aria-label="Scroll categories right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </section>
          </section>

          <div className="activities-library-results">
          {visible.length ? (
            <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {visible.map((a, idx) => (
                <li key={`${a.category}-${a.slug}`}>
                  {(() => {
                    const theme = getDomainTheme(a.category);
                    const Icon = iconFor(a.category);
                    const categoryName = nameFor(a.category);
                    return (
                  <Link
                    to={getActivityHref(a)}
                    className={`cat-card activity-card-soft fade-up delay-${(idx % 4) + 1} block group`}
                    data-testid={`activity-card-${a.slug}`}
                    style={{
                      "--cat-gradient": theme.bannerGradient || GRADIENTS[a.category] || GRADIENTS["all-activities"],
                      "--cat-accent": theme.accent || colorFor(a.category),
                      "--cat-soft": theme.softBg || "rgba(99,102,241,0.10)",
                      "--cat-icon-tint": theme.iconTint || theme.softBg || "rgba(99,102,241,0.12)",
                    }}
                  >
                    <div className="cat-card-top">
                      <span className="cat-art-icon" aria-hidden>
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="cat-card-open" aria-hidden>
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="cat-card-domain">{categoryName}</div>
                    <div className="cat-card-title">{a.title}</div>
                    <div className="cat-card-tag">{a.summary}</div>
                  </Link>
                    );
                  })()}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-[28px] border border-zinc-100 bg-white p-10 text-center shadow-[0_18px_55px_rgba(31,28,85,0.07)]">
              <h3 className="font-display text-xl font-bold text-zinc-950">No activities found.</h3>
              <p className="mt-2 text-zinc-500">Try another activity, goal, or skill.</p>
              <button
                type="button"
                onClick={() => {
                  preserveScrollForUpdate(() => {
                    setFilter("all");
                    setSearchQuery("");
                  });
                }}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-5 text-sm font-display font-bold text-white"
              >
                Clear search
              </button>
            </div>
          )}
          </div>
        </section>
      </main>
    </div>
  );
}
