import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Gamepad2, Heart, Mic2, Speech, UtensilsCrossed } from "lucide-react";
import { api } from "@/lib/api";
import ActivityCard from "@/components/ActivityCard";
import { buildActivityIndex, filterRetiredActivities } from "@/lib/activityIndex";
import {
  FAVOURITES_UPDATED_EVENT,
  getActivityFavouriteKey,
  readStoredFavourites,
} from "@/lib/activityFavourites";
import { getDomainTheme } from "@/lib/domainThemes";
import CategoryPage from "@/pages/CategoryPage";

const pages = {
  games: {
    title: "Games",
    description: "Playful activities that build language, attention, and confidence.",
    icon: Gamepad2,
    links: [],
  },
  dysphagia: {
    title: "Dysphagia",
    description: "A dedicated space for swallowing education and guided practice.",
    icon: UtensilsCrossed,
    links: [],
  },
  "motor-speech": {
    title: "Motor Speech",
    description: "Structured speech practice for clearer, more confident communication.",
    icon: Speech,
    links: [["Open SFA Therapy", "/sfa"]],
  },
  voice: {
    title: "Voice",
    description: "Listening and voice-focused practice for everyday communication.",
    icon: Mic2,
    links: [["Listening to a Voicemail", "/activity/functional-communication/voicemails"]],
  },
  favourites: {
    title: "Favourite Activities",
    description: "Your saved activities will appear here for quick access.",
    icon: Heart,
    links: [],
  },
};

export default function ExplorePage() {
  const { slug } = useParams();
  if (slug === "games") {
    return <CategoryPage />;
  }

  if (slug === "favourites") {
    return <FavouriteActivitiesPage />;
  }

  return <LegacyExplorePage slug={slug} />;
}

function FavouriteActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [favouriteKeys, setFavouriteKeys] = useState(() => readStoredFavourites());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let alive = true;

    Promise.all([
      api.get("/activities"),
      api.get("/categories").catch(() => ({ data: [] })),
    ])
      .then(([activityResponse, categoryResponse]) => {
        if (!alive) return;
        const currentActivities = filterRetiredActivities(activityResponse.data || []);
        setActivities(buildActivityIndex(currentActivities, categoryResponse.data || []));
        setIsLoaded(true);
      })
      .catch(() => {
        if (!alive) return;
        setActivities([]);
        setIsLoaded(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  const syncFavouriteKeys = useCallback(() => {
    setFavouriteKeys(new Set(readStoredFavourites()));
  }, []);

  useEffect(() => {
    syncFavouriteKeys();
    window.addEventListener("storage", syncFavouriteKeys);
    window.addEventListener(FAVOURITES_UPDATED_EVENT, syncFavouriteKeys);

    return () => {
      window.removeEventListener("storage", syncFavouriteKeys);
      window.removeEventListener(FAVOURITES_UPDATED_EVENT, syncFavouriteKeys);
    };
  }, [syncFavouriteKeys]);

  const favouriteActivities = useMemo(() => {
    const seenKeys = new Set();

    return activities.filter((activity) => {
      const favouriteKey = getActivityFavouriteKey(activity);
      if (!favouriteKey || !favouriteKeys.has(favouriteKey) || seenKeys.has(favouriteKey)) {
        return false;
      }

      seenKeys.add(favouriteKey);
      return true;
    });
  }, [activities, favouriteKeys]);

  return (
    <div className="min-h-screen" data-testid="favourite-activities-page">
      <main className="clinician-page is-compact activities-hub-page">
        <section aria-label="Favourite Activities">
          <div className="activities-library-results">
            <div className="favourite-activities-header">
              <h1>Favourite Activities</h1>
              <p>Your saved activities stay here for quick session planning.</p>
            </div>

            {favouriteActivities.length ? (
              <ul className="activities-card-grid mt-3">
                {favouriteActivities.map((activity, index) => (
                  <li key={`${activity.category}-${activity.slug || activity.id || activity.title}`}>
                    <ActivityCard activity={activity} delayIndex={index} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="favourite-activities-empty">
                <h2>{isLoaded ? "No favourite activities yet." : "Loading favourites..."}</h2>
                <p>
                  {isLoaded
                    ? "Tap the heart on an activity card to save it here."
                    : "Your saved activities will appear here in a moment."}
                </p>
                {isLoaded ? (
                  <Link to="/all-activities">Browse Activities Library</Link>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function LegacyExplorePage({ slug }) {
  const page = pages[slug] || pages.games;
  const Icon = page.icon;
  const theme = getDomainTheme(slug);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    let alive = true;

    api
      .get(`/categories/${slug}/activities`)
      .then(({ data }) => {
        if (!alive) return;
        setActivities(filterRetiredActivities(data || []).map((activity) => ({ ...activity, category: slug })));
      })
      .catch(() => {
        if (!alive) return;
        setActivities([]);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  return (
    <div className="min-h-screen">
      <main className="clinician-page">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-indigo-600">
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <section
          className="mt-7 rounded-[30px] border border-zinc-200 p-8 sm:p-11 shadow-sm relative overflow-hidden"
          style={{ background: slug === "favourites" ? "#fff" : theme.bannerGradient }}
        >
          <span
            className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-white/92"
            style={{
              color: theme.accent,
              background: slug === "favourites" ? "#EEF2FF" : "rgba(255,255,255,.9)",
              border: "1px solid rgba(255,255,255,.5)",
              boxShadow: "0 14px 28px -18px rgba(15,23,42,.28)",
            }}
          >
            <Icon size={31} />
          </span>
          <h1 className={`mt-6 font-display text-4xl sm:text-5xl font-bold tracking-tight ${slug === "favourites" ? "text-zinc-950" : "text-white"}`}>
            {page.title}
          </h1>
          <p className={`mt-3 text-lg max-w-2xl ${slug === "favourites" ? "text-zinc-600" : "text-white/90"}`}>
            {page.description}
          </p>

          {activities.length ? (
            <ul className="activities-card-grid mt-9">
              {activities.map((activity, index) => (
                <ActivityCard key={activity.slug} activity={activity} delayIndex={index} />
              ))}
            </ul>
          ) : page.links.length ? (
            <div className="mt-9 grid sm:grid-cols-2 gap-4">
              {page.links.map(([label, href]) => (
                <Link key={href} to={href} className="tile flex items-center justify-between font-display font-semibold">
                  {label} <ArrowRight size={18} style={{ color: theme.accent }} />
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="mt-9 rounded-2xl px-6 py-5"
              style={{ background: slug === "favourites" ? "#EEF2FF" : "rgba(255,255,255,.88)", color: theme.accent }}
            >
              New activities are being prepared for this category.
              <Link to="/all-activities" className="ml-2 font-semibold underline underline-offset-4">Browse current activities</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
