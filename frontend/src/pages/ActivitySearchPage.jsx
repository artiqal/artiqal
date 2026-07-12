import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { ActivityCard } from "@/components/ActivityCard";
import { buildActivityIndex, filterRetiredActivities, searchActivityIndex } from "@/lib/activityIndex";

export default function ActivitySearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.get("/activities"), api.get("/categories")])
      .then(([activityResponse, categoryResponse]) => {
        if (cancelled) return;
        setActivities(filterRetiredActivities(activityResponse.data || []));
        setCategories(categoryResponse.data || []);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const index = useMemo(
    () => buildActivityIndex(activities, categories),
    [activities, categories],
  );
  const results = useMemo(() => searchActivityIndex(index, query), [index, query]);

  return (
    <main className="clinician-page min-h-screen bg-[#fafafd]" data-testid="activity-search-page">
      <div>
        <div className="flex items-center gap-3 text-indigo-600">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50">
            <Search className="h-5 w-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.18em]">Activity library</span>
        </div>

        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-[#11113b]">Search results</h1>
        <p className="mt-2 text-base text-zinc-500">
          {query ? <>Showing activities for <strong className="font-semibold text-zinc-800">“{query}”</strong></> : "Type in the sidebar to find an activity."}
        </p>

        {loading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-56 animate-pulse rounded-3xl bg-white shadow-sm" />)}
          </div>
        ) : failed ? (
          <EmptyState title="Search is temporarily unavailable." detail="Please try again in a moment." />
        ) : !query || !results.length ? (
          <EmptyState title="No activities found." detail={query ? "Try another activity name, category, or clinical area." : "Enter a search term to explore the activity library."} />
        ) : (
          <ul className="activities-card-grid mt-10" data-testid="activity-search-results">
            {results.map((activity, idx) => (
              <li key={`${activity.category}/${activity.slug}`}>
                <ActivityCard activity={activity} delayIndex={idx} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function EmptyState({ title, detail }) {
  return (
    <div className="mt-10 rounded-3xl border border-dashed border-zinc-200 bg-white px-8 py-16 text-center" data-testid="activity-search-empty">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-500"><Sparkles className="h-6 w-6" /></span>
      <h2 className="mt-5 font-display text-xl font-bold text-[#11113b]">{title}</h2>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}
