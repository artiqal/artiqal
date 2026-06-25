import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession, formatElapsed } from "@/contexts/SessionContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CircleCheck,
  CircleX,
  Layers,
  Lightbulb,
  Loader2,
  Pause,
  Play,
  Square,
  Timer,
} from "lucide-react";

export function SessionBanner({ onStartedClick }) {
  const { isActive, elapsedSec, stats, start, end } = useSession();
  const navigate = useNavigate();
  const [endOpen, setEndOpen] = useState(false);
  const [name, setName] = useState("");
  const [patientLabel, setPatientLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  if (!isActive) {
    return (
      <section
        className="mt-8 fade-up delay-1 relative overflow-hidden rounded-3xl"
        data-testid="session-banner-idle"
        style={{ background: "linear-gradient(135deg,#4F46E5 0%,#6366F1 45%,#7C3AED 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
          aria-hidden
        />
        <div className="relative grid sm:grid-cols-5 gap-6 p-6 sm:p-9">
          <div className="sm:col-span-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white/95 text-xs font-display font-semibold tracking-[0.18em] uppercase">
              <Timer className="w-3.5 h-3.5" /> Clinician mode
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Start a tracked session
            </h2>
            <p className="mt-3 text-white/85 max-w-lg leading-relaxed">
              Live timer, automatic scoring of attempts, and a SOAP-ready summary you can save and
              export as a PDF.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  start();
                  if (onStartedClick) onStartedClick();
                }}
                data-testid="start-session-btn"
                className="inline-flex items-center gap-2 h-12 px-5 rounded-full bg-white text-indigo-700 font-display font-semibold hover:bg-indigo-50 transition"
              >
                <Play className="w-4 h-4 fill-indigo-700" /> Start session
              </button>
              <Link
                to="/sessions"
                data-testid="sessions-history-link"
                className="inline-flex items-center gap-2 h-12 px-5 rounded-full border border-white/40 text-white font-display font-semibold hover:bg-white/10 transition"
              >
                Session history
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex sm:col-span-2 items-center justify-end">
            <div className="grid grid-cols-3 gap-2 text-white">
              <Stat label="Live timer" icon={<Timer className="w-4 h-4" />} hint />
              <Stat label="Auto-score" icon={<CircleCheck className="w-4 h-4" />} hint />
              <Stat label="SOAP draft" icon={<Lightbulb className="w-4 h-4" />} hint />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Active state
  const onEnd = async () => {
    setErr("");
    setSaving(true);
    try {
      const ended = end();
      const finalName = (name || `Session ${new Date().toLocaleString()}`).trim();
      const payload = {
        name: finalName,
        patient_label: patientLabel.trim() || null,
        notes: notes.trim() || null,
        started_at: ended.started_at,
        ended_at: ended.ended_at,
        duration_sec: Math.max(
          1,
          Math.floor((new Date(ended.ended_at).getTime() - new Date(ended.started_at).getTime()) / 1000),
        ),
        activities: ended.activities,
        attempts: ended.attempts,
        cues: ended.cues,
      };
      const { data } = await api.post("/sessions", payload);
      setEndOpen(false);
      navigate(`/sessions/${data.session_id}`);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Could not save session.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section
        className="mt-8 fade-up delay-1 relative overflow-hidden rounded-3xl"
        data-testid="session-banner-active"
        style={{ background: "linear-gradient(135deg,#10B981 0%,#06B6D4 60%,#6366F1 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
          aria-hidden
        />

        <div className="relative grid sm:grid-cols-5 gap-6 p-6 sm:p-9">
          <div className="sm:col-span-3 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-display font-semibold tracking-[0.18em] uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-70 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Session in progress
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <div
                className="font-display font-extrabold tracking-tight tabular-nums leading-none"
                style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
                data-testid="session-timer"
              >
                {formatElapsed(elapsedSec)}
              </div>
              <div className="text-white/85 text-sm font-display font-medium">elapsed</div>
            </div>
            <p className="mt-3 text-white/85 leading-relaxed max-w-lg">
              Open any activity — every response, cue, and hint is being captured.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => setEndOpen(true)}
                className="rounded-full bg-white text-emerald-700 hover:bg-emerald-50 font-display h-12 px-5"
                data-testid="end-session-btn"
              >
                <Square className="w-4 h-4 mr-2 fill-emerald-700" /> End & save
              </Button>
              <Link
                to="/all-activities"
                className="inline-flex items-center gap-2 h-12 px-5 rounded-full border border-white/40 text-white font-display font-semibold hover:bg-white/10 transition"
                data-testid="session-browse-link"
              >
                Browse activities
              </Link>
            </div>
          </div>

          <div className="sm:col-span-2 grid grid-cols-2 gap-2.5">
            <Stat
              label="Activities"
              value={stats?.activities ?? 0}
              icon={<Layers className="w-4 h-4" />}
            />
            <Stat
              label="Cues"
              value={stats?.cues ?? 0}
              icon={<Lightbulb className="w-4 h-4" />}
            />
            <Stat
              label="Correct"
              value={stats?.correct ?? 0}
              icon={<CircleCheck className="w-4 h-4" />}
              tone="ok"
            />
            <Stat
              label="Incorrect"
              value={stats?.incorrect ?? 0}
              icon={<CircleX className="w-4 h-4" />}
              tone="warn"
            />
          </div>
        </div>
      </section>

      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent data-testid="end-session-dialog" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">End session</DialogTitle>
            <DialogDescription>
              Save this session to your history. We’ll generate a SOAP-style objective summary.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-2">
              <BadgeStat label="Time" value={formatElapsed(elapsedSec)} />
              <BadgeStat
                label="Accuracy"
                value={
                  stats && stats.total
                    ? `${Math.round((100 * stats.correct) / stats.total)}%`
                    : "—"
                }
              />
              <BadgeStat label="Cues" value={stats?.cues ?? 0} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="session-name">Session name</Label>
              <Input
                id="session-name"
                placeholder="e.g. Friday — J.D. — Reading & Naming"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="end-session-name-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="patient">Patient initials (optional)</Label>
              <Input
                id="patient"
                placeholder="e.g. J.D."
                value={patientLabel}
                onChange={(e) => setPatientLabel(e.target.value)}
                data-testid="end-session-patient-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Clinician notes (optional)</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Anything to remember about today’s session…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="end-session-notes-input"
              />
            </div>

            {err ? <div className="text-sm text-rose-600">{err}</div> : null}
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setEndOpen(false)}
              disabled={saving}
              className="rounded-full font-display"
              data-testid="end-session-cancel"
            >
              Keep going
            </Button>
            <Button
              onClick={onEnd}
              disabled={saving}
              className="rounded-full font-display bg-indigo-600 hover:bg-indigo-700"
              data-testid="end-session-save"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                </>
              ) : (
                <>Save & summary</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stat({ label, value, icon, tone, hint }) {
  const bg =
    tone === "ok"
      ? "bg-white text-emerald-700"
      : tone === "warn"
      ? "bg-white text-rose-600"
      : "bg-white/15 text-white border border-white/25 backdrop-blur";
  return (
    <div className={`rounded-2xl p-3 ${bg}`}>
      <div className="flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-wider opacity-80">
        {icon} {label}
      </div>
      <div className={`mt-1 font-display font-extrabold tabular-nums ${hint ? "text-sm" : "text-2xl"}`}>
        {hint ? "Live" : value}
      </div>
    </div>
  );
}

function BadgeStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-3 bg-zinc-50">
      <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">{label}</div>
      <div className="font-display font-extrabold text-lg tabular-nums">{value}</div>
    </div>
  );
}

/** Compact pill banner for non-dashboard pages while a session is active. */
export function SessionPill() {
  const { isActive, elapsedSec, stats } = useSession();
  if (!isActive) return null;
  return (
    <Link
      to="/dashboard"
      data-testid="session-pill"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 px-4 h-12 rounded-full text-white shadow-lg"
      style={{ background: "linear-gradient(135deg,#10B981,#06B6D4)" }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-70 animate-ping" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
      </span>
      <span className="font-display font-semibold tabular-nums">{formatElapsed(elapsedSec)}</span>
      <span className="text-white/85 text-sm">
        {stats?.correct ?? 0}/{stats?.total ?? 0} correct
      </span>
    </Link>
  );
}
