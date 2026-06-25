import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { DOMAIN_NAV_ITEMS, getDomainTheme } from "@/lib/domainThemes";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import { buildActivityIndex, getActivityHref, normalizeSearchQuery, searchActivityIndex } from "@/lib/activityIndex";

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

const HUB_CATEGORIES = DOMAIN_NAV_ITEMS.map((category) => {
  const theme = getDomainTheme(category.slug);
  return {
    slug: category.slug,
    label: category.name,
    href: category.route,
    icon: category.hubCardIcon,
    accent: theme.accent,
    tint: theme.iconTint,
    fallback: category.fallback,
  };
});

const getActivityTitle = (activity) => activity.title || "";

const getActivityDuration = (activity) => {
  const value =
    activity.duration_min ??
    activity.durationMin ??
    activity.estimated_minutes ??
    activity.estimatedMinutes;
  const duration = Number(value);
  return Number.isFinite(duration) ? duration : null;
};

const getActivityDate = (activity) => {
  const value =
    activity.created_at ??
    activity.createdAt ??
    activity.added_at ??
    activity.addedAt;
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const getActivityUsage = (activity) => {
  const value =
    activity.usage_count ??
    activity.usageCount ??
    activity.use_count ??
    activity.useCount ??
    activity.times_used ??
    activity.timesUsed;
  const usage = Number(value);
  return Number.isFinite(usage) ? usage : null;
};

export default function AllActivities() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("relevance");
  const categoryRowRef = useRef(null);
  const preservedScrollYRef = useRef(null);
  const sortMenuRef = useRef(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/activities"), api.get("/categories")]).then(([a, c]) => {
      setItems(a.data);
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

  const preserveScrollForUpdate = (update) => {
    preservedScrollYRef.current = window.scrollY;
    update();
  };

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

  const counts = items.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + 1;
    return acc;
  }, {});

  const indexedActivities = useMemo(
    () => buildActivityIndex(items, categories),
    [items, categories],
  );
  const normalizedSearch = normalizeSearchQuery(searchQuery);
  const hasDateSort = items.some((activity) => getActivityDate(activity) !== null);
  const hasUsageSort = items.some((activity) => getActivityUsage(activity) !== null);
  const hasDurationSort = items.some((activity) => getActivityDuration(activity) !== null);
  const filteredActivities = indexedActivities.filter((activity) => {
    if (filter !== "all" && activity.category !== filter) return false;
    return true;
  });
  const searchedActivities = normalizedSearch
    ? searchActivityIndex(filteredActivities, normalizedSearch)
    : filteredActivities;
  const visible = [...searchedActivities].sort((a, b) => {
    const titleSort = getActivityTitle(a).localeCompare(getActivityTitle(b), undefined, {
      sensitivity: "base",
    });
    if (sortMode === "az") return titleSort;
    if (sortMode === "za") return -titleSort;
    if (sortMode === "recent" && hasDateSort) {
      return (getActivityDate(b) || 0) - (getActivityDate(a) || 0) || titleSort;
    }
    if (sortMode === "used" && hasUsageSort) {
      return (getActivityUsage(b) || 0) - (getActivityUsage(a) || 0) || titleSort;
    }
    if (sortMode === "shortest" && hasDurationSort) {
      return (getActivityDuration(a) || Number.MAX_SAFE_INTEGER) - (getActivityDuration(b) || Number.MAX_SAFE_INTEGER) || titleSort;
    }
    if (sortMode === "longest" && hasDurationSort) {
      return (getActivityDuration(b) || 0) - (getActivityDuration(a) || 0) || titleSort;
    }
    if (normalizedSearch && sortMode === "relevance") return 0;
    return titleSort;
  });

  const hubCards = HUB_CATEGORIES.map((category) => {
    const meta = categories.find((item) => item.slug === category.slug);
    return {
      ...category,
      label: meta?.name || category.label,
      description: counts[category.slug]
        ? `${counts[category.slug]} ${counts[category.slug] === 1 ? "activity" : "activities"}`
        : category.fallback,
    };
  });
  const sortOptions = [
    { value: "az", label: "A-Z", disabled: false },
    { value: "za", label: "Z-A", disabled: false },
    { value: "recent", label: "Recently Added", disabled: !hasDateSort },
    { value: "used", label: "Most Used", disabled: !hasUsageSort },
    { value: "shortest", label: "Shortest Duration", disabled: !hasDurationSort },
    { value: "longest", label: "Longest Duration", disabled: !hasDurationSort },
  ];
  return (
    <div className="min-h-screen" data-testid="all-activities-page">
      <Header />
      <main className="clinician-page is-compact">
        <section className="activities-hub-panel" aria-labelledby="activities-hub-title">
          <div className="activities-hub-head">
            <div>
              <h1 id="activities-hub-title">Activities Hub</h1>
              <p>Discover high-quality, clinician-built activities to support every client and every goal.</p>
            </div>
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
              {hubCards.map(({ slug, label, href, icon: Icon, accent, tint, description }) => (
                <Link
                  key={slug}
                  to={href}
                  className="activities-hub-domain-card"
                  style={{ "--hub-accent": accent, "--hub-tint": tint }}
                >
                  <span className="activities-hub-domain-icon">
                    <Icon className="w-7 h-7" />
                  </span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </Link>
              ))}
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

        <section id="activity-library" className="mt-6" aria-labelledby="activity-library-title">
          <div className="activities-library-head">
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-indigo-600">Activity library</p>
              <h2 id="activity-library-title" className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight">
                Browse every activity
              </h2>
            </div>
            <div className="activities-library-tools">
              <label className="activities-library-search">
                <Search size={17} />
                <input
                  value={searchQuery}
                  onChange={(event) => preserveScrollForUpdate(() => setSearchQuery(event.target.value))}
                  placeholder="Search Activities..."
                  aria-label="Search activities, goals, skills"
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
                  <SlidersHorizontal size={18} />
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
                          preserveScrollForUpdate(() => setSortMode(option.value));
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
          </div>

          <div className="mt-3 flex flex-wrap gap-2" data-testid="all-activities-filter">
              <FilterPill active={filter === "all"} onClick={() => preserveScrollForUpdate(() => setFilter("all"))} color="#4F46E5">
            All
          </FilterPill>
          {categories.map((c) => (
            <FilterPill
              key={c.slug}
              active={filter === c.slug}
              onClick={() => preserveScrollForUpdate(() => setFilter(c.slug))}
              color={c.color}
            >
              {c.name}
            </FilterPill>
          ))}
          </div>

          <div className="activities-library-results">
          {visible.length ? (
            <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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

function FilterPill({ active, onClick, color, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`filter-pill-${String(children).toLowerCase().replace(/\s+/g, "-")}`}
      className="px-4 h-10 rounded-full text-sm font-display font-semibold border transition"
      style={
        active
          ? { background: color, color: "white", borderColor: color }
          : { background: "white", color: "#27272A", borderColor: "#E5E7EB" }
      }
    >
      {children}
    </button>
  );
}
