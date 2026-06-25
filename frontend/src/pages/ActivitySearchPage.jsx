import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Clock3, Search, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { buildActivityIndex, searchActivityIndex } from "@/lib/activityIndex";

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
        setActivities(activityResponse.data || []);
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
          <div className="mt-10 grid gap-5 md:grid-cols-2" data-testid="activity-search-results">
            {results.map((activity) => (
              <article key={`${activity.category}/${activity.slug}`} className="flex min-h-[225px] flex-col rounded-3xl border border-zinc-100 bg-white p-7 shadow-[0_16px_45px_rgba(31,28,85,0.07)]">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                    {activity.categoryName}
                  </span>
                  {activity.duration_min ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                      <Clock3 className="h-4 w-4" /> {activity.duration_min} min
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold text-[#11113b]">{activity.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{activity.description}</p>
                <Link to={activity.href} className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-indigo-600 transition hover:text-indigo-800">
                  Start practice <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
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
