import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useSmartBack } from "@/lib/navigationHistory";
import { ArrowLeft, ArrowUpRight, ChevronRight, Clock, FileText, Loader2, User } from "lucide-react";
import { formatElapsed } from "@/contexts/SessionContext";

export default function SessionsList() {
  const smartBack = useSmartBack("/dashboard");
  const [items, setItems] = useState(null);

  useEffect(() => {
    api
      .get("/sessions")
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="min-h-screen" data-testid="sessions-list-page">
      <main className="clinician-page">
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
          <nav className="flex items-center gap-1.5 text-sm text-zinc-500 flex-wrap" aria-label="Breadcrumb">
            <Link to="/dashboard" className="hover:text-indigo-600 hover:underline underline-offset-2 transition" data-testid="breadcrumb-crumb-0">
              Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-900 font-display font-semibold" data-testid="breadcrumb-crumb-1">
              Session history
            </span>
          </nav>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs text-indigo-600 font-semibold tracking-[0.18em] uppercase">
              Clinician
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">
              Session history
            </h1>
            <p className="text-zinc-600 mt-1">
              Saved sessions with SOAP-ready objective summaries.
            </p>
          </div>
        </div>

        {items === null ? (
          <div className="mt-12 inline-flex items-center gap-2 text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading sessions…
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-10 text-center" data-testid="sessions-empty">
            <div className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="mt-3 font-display font-bold text-lg">No saved sessions yet</div>
            <p className="mt-1 text-zinc-500">
              Start a session from the hub to capture activities, cues, and a SOAP objective.
            </p>
            <Link
              to="/dashboard"
              className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-indigo-600 text-white font-display font-semibold hover:bg-indigo-700 transition"
            >
              Go to hub <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3" data-testid="sessions-list">
            {items.map((s) => {
              const acc = s.summary?.totals?.accuracy_pct;
              return (
                <li key={s.session_id}>
                  <Link
                    to={`/sessions/${s.session_id}`}
                    className="block rounded-2xl border border-zinc-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
                    data-testid={`session-row-${s.session_id}`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">
                          {new Date(s.created_at).toLocaleString()}
                        </div>
                        <div className="font-display font-bold text-xl mt-1">{s.name}</div>
                      </div>
                      <div className="text-sm text-zinc-600 flex items-center gap-3">
                        {s.patient_label ? (
                          <span className="inline-flex items-center gap-1.5">
                            <User className="w-4 h-4" /> {s.patient_label}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> {formatElapsed(s.duration_sec || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <Pill>
                        {s.summary?.totals?.activities_count ?? 0} activities
                      </Pill>
                      <Pill tone="ok">
                        {s.summary?.totals?.attempts_correct ?? 0}/
                        {s.summary?.totals?.attempts_total ?? 0} correct
                      </Pill>
                      {acc != null ? <Pill>{acc}% accuracy</Pill> : null}
                      <Pill tone="warn">{s.summary?.totals?.cues_used ?? 0} cues</Pill>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

function Pill({ children, tone }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-indigo-50 text-indigo-700 border-indigo-200";
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}
