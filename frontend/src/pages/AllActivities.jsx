import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { ActivityCard } from "@/components/ActivityCard";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  Type,
} from "lucide-react";
import {
  activityBelongsToCategory,
  buildActivityIndex,
  filterRetiredActivities,
  normalizeSearchQuery,
  searchActivityIndex,
} from "@/lib/activityIndex";
import { getActivitySortCapabilities, getActivitySortOptions, sortActivities } from "@/lib/activitySort";

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
  "ai-practice": "AI-powered practice activities",
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

const DOMAIN_CARD_LABELS = {
  "auditory-comprehension": "Listening",
};

const HUB_CATEGORIES = DOMAIN_NAV_ITEMS.map((category) => {
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
  const [sortMode, setSortMode] = useState("az");
  const categoryRowRef = useRef(null);
  const preservedScrollYRef = useRef(null);
  const sortMenuRef = useRef(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [isDomainExpanded, setIsDomainExpanded] = useState(true);
  const { registerActivitySortControls } = useActivitySort();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/activities"), api.get("/categories")]).then(([a, c]) => {
      setItems(filterRetiredActivities(a.data || []));
      setCategories(c.data.filter((x) => x.slug !== "all-activities"));
    });
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
    if (filter !== "all" && !activityBelongsToCategory(activity, filter)) return false;
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
  const selectedSortLabel = sortOptions.find((option) => option.value === sortMode)?.label || "A–Z";

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
          </div>

          <section className="activities-hub-top-grid" aria-label="Activities Hub overview">
            <section className={`activities-hub-panel ${isDomainExpanded ? "is-expanded" : "is-collapsed"}`} aria-labelledby="activities-domain-title">
              <div className="activities-domain-head">
                <h2 id="activities-domain-title">Explore by Domain</h2>
                <button
                  type="button"
                  className="activities-domain-toggle"
                  onClick={() => setIsDomainExpanded((expanded) => !expanded)}
                  aria-expanded={isDomainExpanded}
                  aria-controls="activities-domain-carousel"
                  aria-label={isDomainExpanded ? "Collapse Explore by Domain" : "Expand Explore by Domain"}
                >
                  {isDomainExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              <div
                id="activities-domain-carousel"
                className="activities-domain-collapse"
                aria-hidden={!isDomainExpanded}
                inert={!isDomainExpanded ? true : undefined}
              >
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
                          <img
                            className="activities-hub-domain-illustration"
                            src={illustration}
                            alt=""
                            loading="eager"
                            decoding="async"
                            draggable="false"
                          />
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
              </div>
            </section>
          </section>

          <div className="activities-library-results">
          {visible.length ? (
            <ul className="activities-card-grid mt-3">
              {visible.map((a, idx) => (
                <li key={`${a.category}-${a.slug}`}>
                  <ActivityCard activity={a} delayIndex={idx} />
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
