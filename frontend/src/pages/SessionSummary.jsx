import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useSmartBack } from "@/lib/navigationHistory";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  Lightbulb,
  Loader2,
  Printer,
  Trash2,
  User,
} from "lucide-react";
import { formatElapsed } from "@/contexts/SessionContext";

export default function SessionSummary() {
  const { sessionId } = useParams();
  const smartBack = useSmartBack("/sessions");
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get(`/sessions/${sessionId}`)
      .then(({ data }) => setDoc(data))
      .catch(() => setError("Session not found."));
  }, [sessionId]);

  if (error)
    return (
      <div className="min-h-screen">
        <main className="clinician-page">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-rose-600">{error}</div>
        </main>
      </div>
    );

  if (!doc)
    return (
      <div className="min-h-screen">
        <main className="clinician-page">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-zinc-500 inline-flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading session…
        </div>
        </main>
      </div>
    );

  const totals = doc.summary?.totals || {};
  const perAct = doc.summary?.per_activity || [];

  const onPrint = () => window.print();
  const onDelete = async () => {
    if (!window.confirm("Delete this session? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/sessions/${sessionId}`);
      window.location.href = "/sessions";
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen" data-testid="session-summary-page">
      <main className="clinician-page is-narrow">
        <div className="no-print flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap" data-testid="breadcrumb-header">
            <button
              type="button"
              onClick={smartBack}
              className="inline-flex items-center text-sm text-zinc-600 hover:text-indigo-600 font-display font-medium"
              data-testid="back-to-sessions"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <span className="hidden sm:inline-block w-px h-4 bg-zinc-300" />
            <nav className="flex items-center gap-1.5 text-sm text-zinc-500 flex-wrap" aria-label="Breadcrumb">
              <Link to="/dashboard" className="hover:text-indigo-600 hover:underline underline-offset-2 transition" data-testid="breadcrumb-crumb-0">
                Hub
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <Link to="/sessions" className="hover:text-indigo-600 hover:underline underline-offset-2 transition" data-testid="breadcrumb-crumb-1">
                Session history
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-900 font-display font-semibold" data-testid="breadcrumb-crumb-2">
                Session
              </span>
            </nav>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onPrint}
              className="rounded-full font-display bg-indigo-600 hover:bg-indigo-700 h-11"
              data-testid="print-session-btn"
            >
              <Printer className="w-4 h-4 mr-2" /> Print / PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-full font-display h-11"
              data-testid="delete-session-btn"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        <article className="mt-6 print-area">
          {/* Header card */}
          <header
            className="rounded-3xl p-7 sm:p-9 relative overflow-hidden text-white"
            style={{
              background: "var(--brand-gradient)",
            }}
          >
            <div
              className="absolute inset-0 opacity-50 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
                backgroundSize: "8px 8px",
              }}
              aria-hidden
            />
            <div className="relative">
              <div className="text-white/85 text-xs font-display font-semibold tracking-[0.18em] uppercase">
                Session summary
              </div>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight" data-testid="session-name">
                {doc.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-white/90 text-sm">
                {doc.patient_label ? (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-4 h-4" /> {doc.patient_label}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {formatElapsed(doc.duration_sec)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> {new Date(doc.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </header>

          {/* Stats grid */}
          <section className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3" data-testid="session-totals">
            <StatBox label="Activities" value={totals.activities_count ?? 0} />
            <StatBox label="Responses" value={totals.attempts_total ?? 0} />
            <StatBox
              label="Correct"
              value={totals.attempts_correct ?? 0}
              icon={<CircleCheck className="w-4 h-4 text-emerald-500" />}
            />
            <StatBox
              label="Incorrect"
              value={totals.attempts_incorrect ?? 0}
              icon={<CircleX className="w-4 h-4 text-rose-500" />}
            />
            <StatBox
              label="Accuracy"
              value={totals.accuracy_pct != null ? `${totals.accuracy_pct}%` : "—"}
            />
          </section>
          <section className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatBox label="Cues / hints" value={totals.cues_used ?? 0} icon={<Lightbulb className="w-4 h-4 text-amber-500" />} />
          </section>

          {/* SOAP objective */}
          <section className="mt-8" data-testid="soap-objective-section">
            <h2 className="font-display text-2xl font-bold tracking-tight">SOAP — Objective</h2>
            <p className="text-sm text-zinc-500 mt-1">
              AI-drafted from session data. Review and edit before adding to the patient chart.
            </p>
            <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-6 leading-relaxed whitespace-pre-wrap" data-testid="soap-objective-text">
              {doc.soap_objective}
            </div>
          </section>

          {/* Per activity breakdown */}
          <section className="mt-8" data-testid="per-activity-section">
            <h2 className="font-display text-2xl font-bold tracking-tight">Activity breakdown</h2>
            <ul className="mt-3 space-y-3">
              {perAct.map((a) => {
                const acc = a.attempts_total
                  ? Math.round((100 * a.attempts_correct) / a.attempts_total)
                  : null;
                return (
                  <li
                    key={`${a.category}/${a.activity_slug}`}
                    className="rounded-2xl border border-zinc-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">
                          {a.category}
                        </div>
                        <div className="font-display font-bold text-lg">{a.activity_title}</div>
                      </div>
                      <div className="text-sm text-zinc-600">
                        {a.attempts_correct}/{a.attempts_total} correct
                        {acc != null ? ` · ${acc}%` : ""} · {a.cues_used} cues
                      </div>
                    </div>
                    {Object.keys(a.cue_types || {}).length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(a.cue_types).map(([k, v]) => (
                          <span
                            key={k}
                            className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                          >
                            {k.replace("_", " ")}: {v}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </li>
                );
              })}
              {!perAct.length ? (
                <li className="text-sm text-zinc-500">No activities recorded in this session.</li>
              ) : null}
            </ul>
          </section>

          {doc.notes ? (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-bold tracking-tight">Clinician notes</h2>
              <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-6 whitespace-pre-wrap leading-relaxed">
                {doc.notes}
              </div>
            </section>
          ) : null}
        </article>
      </main>
    </div>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className="font-display font-extrabold text-2xl tabular-nums mt-1">{value}</div>
    </div>
  );
}
