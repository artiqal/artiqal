import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { matchesAnswer } from "@/lib/answerMatch";
import { useSmartBack } from "@/lib/navigationHistory";
import { useSession } from "@/contexts/SessionContext";
import { getActivitySetupConfig } from "@/lib/activitySetupConfig";
import { applyVoicemailActivityOverrides } from "@/lib/voicemailSetup";
import { AudioControls } from "@/components/AudioControls";
import { VoicemailActivity } from "@/components/activities/VoicemailActivity";
import { CrosswordActivity } from "@/components/activities/CrosswordActivity";
import { LetterheadView } from "@/components/Letterheads";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Flag,
  Layers3,
  Leaf,
  Lightbulb,
  Loader2,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  Star,
  RefreshCw,
  SlidersHorizontal,
  Tag,
  XCircle,
} from "lucide-react";

const EMPTY_LEVELS = Object.freeze({});

function normalizeActivityDetail(data, category) {
  return applyVoicemailActivityOverrides(
    data,
    category,
    getActivitySetupConfig(data.slug),
  );
}

export default function ActivityPage() {
  const { category, slug } = useParams();
  const [pageSearchParams] = useSearchParams();
  const smartBack = useSmartBack();
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const { logActivity } = useSession();

  useEffect(() => {
    api
      .get(`/activities/${category}/${slug}`)
      .then(({ data }) => {
        setActivity(normalizeActivityDetail(data, category));
        // For leveled-reading activities, the level child component logs the
        // level-specific activity once the user picks a difficulty.
        if (data.type !== "reading-leveled") {
          logActivity({ category, activity_slug: slug, activity_title: data.title });
        }
      })
      .catch(() => setError("Activity not found."));
  }, [category, slug, logActivity]);

  if (error)
    return (
      <div className="min-h-screen">
        <main className="clinician-page">
        <div className="max-w-3xl mx-auto py-16 text-center text-rose-600" data-testid="activity-error">
          {error}
        </div>
        </main>
      </div>
    );

  if (!activity)
    return (
      <div className="min-h-screen">
        <main className="clinician-page">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-zinc-500">Loading…</div>
        </main>
      </div>
    );

  const isLeveled = activity.type === "reading-leveled";
  const isCrosswordSettings = category === "games" && activity.slug === "crossword";
  const isVoicemailDifficultyPicker =
    isLeveled &&
    activity.slug === "voicemails" &&
    !pageSearchParams.has("level");

  return (
    <div
      className={isVoicemailDifficultyPicker ? "activity-page-fit-content" : "min-h-screen"}
      data-testid="activity-page"
    >
      <main
        className={`clinician-page ${isLeveled || isCrosswordSettings ? "is-wide is-compact" : "is-narrow"}`}
      >
        {isLeveled ? (
          <div className="fade-up">{renderActivity(activity)}</div>
        ) : isCrosswordSettings ? (
          <CrosswordActivity
            activity={activity}
            category={category}
            BreadcrumbHeader={BreadcrumbHeader}
            formatSlugTitle={slugToTitle}
          />
        ) : (
          <>
            <button
              type="button"
              onClick={smartBack}
              className="inline-flex items-center text-sm text-zinc-500 hover:text-indigo-600"
              data-testid="back-to-category"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>

            <div className="mt-6 fade-up">
              <h1 className="font-display text-4xl font-bold tracking-tight" data-testid="activity-title">
                {activity.title}
              </h1>
              <p className="mt-2 text-zinc-600">{activity.summary}</p>
            </div>

            <div className="mt-8 fade-up delay-1">{renderActivity(activity)}</div>
          </>
        )}
      </main>
    </div>
  );
}

function slugToTitle(slug) {
  return (slug || "")
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function BreadcrumbHeader({ crumbs, onBack, backLabel = "Back", className = "" }) {
  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`.trim()} data-testid="breadcrumb-header">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center text-sm text-zinc-600 hover:text-indigo-600 font-display font-medium"
        data-testid="breadcrumb-back"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> {backLabel}
      </button>
      <span className="hidden sm:inline-block w-px h-4 bg-zinc-300" />
      <nav
        className="flex items-center gap-1.5 text-sm text-zinc-500 flex-wrap"
        aria-label="Breadcrumb"
      >
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          const obj = typeof c === "string" ? { label: c } : c;
          const clickable = !isLast && typeof obj.onClick === "function";
          return (
            <React.Fragment key={i}>
              {i > 0 ? <ChevronRight className="w-3.5 h-3.5 text-zinc-400" /> : null}
              {clickable ? (
                <button
                  type="button"
                  onClick={obj.onClick}
                  className="hover:text-indigo-600 hover:underline underline-offset-2 transition"
                  data-testid={`breadcrumb-crumb-${i}`}
                >
                  {obj.label}
                </button>
              ) : (
                <span
                  className={isLast ? "text-zinc-900 font-display font-semibold" : ""}
                  data-testid={`breadcrumb-crumb-${i}`}
                >
                  {obj.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}

function ComplexityDots({ level, color, neon = false }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label={`Complexity ${level} of 3`}
      data-testid={`complexity-dots-${level}`}
    >
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={
            i <= level
              ? {
                  background: color,
                  boxShadow: neon
                    ? `0 0 6px ${color}, 0 0 12px ${color}aa`
                    : undefined,
                }
              : { background: "#D4D4D8" }
          }
        />
      ))}
    </span>
  );
}

function renderActivity(a) {
  switch (a.type) {
    case "reading":
      return <ReadingExercise activity={a} />;
    case "reading-leveled":
      if (a.slug === "voicemails") {
        return (
          <VoicemailActivity
            activity={a}
            levelThemes={LEVEL_THEME}
            sharedComponents={{
              BreadcrumbHeader,
              CompletionScreen,
              ComplexityDots,
              ReadingExercise,
            }}
          />
        );
      }
      return <LeveledReadingExercise activity={a} />;
    case "ai-reading":
      return <AIReadingExercise activity={a} />;
    case "writing":
      return <WritingExercise activity={a} />;
    case "naming":
      return <NamingExercise activity={a} />;
    case "list":
      return <ListExercise activity={a} />;
    case "mcq":
      return <MCQExercise activity={a} />;
    case "yesno":
      return <YesNoExercise activity={a} />;
    case "dialogue":
      return <DialogueExercise activity={a} />;
    case "sfa":
      return <Navigate to="/sfa" replace />;
    default:
      return <ActivityPlaceholder activity={a} />;
  }
}

function ActivityPlaceholder({ activity }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-[0_20px_60px_rgba(49,46,129,0.10)]">
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 px-8 py-10 text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" /> Guided practice
        </span>
        <h2 className="mt-5 font-display text-3xl font-bold">{activity.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          {activity.summary || activity.description || "A guided communication activity designed for focused practice."}
        </p>
      </div>
      <div className="flex flex-col gap-5 px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-zinc-900">This activity is being prepared</h3>
          <p className="mt-1 text-sm text-zinc-500">The polished interactive practice screen will be available here soon.</p>
        </div>
        <Link to={`/category/${activity.category}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-700">
          Browse category <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function ReadingExercise({ activity, onChangeLevel, levelLabel, onNext, nextLabel, fullscreen, onToggleFullscreen, onAttempt, onHint, onEnd, layout = "split" }) {
  const { text, questions, letterhead } = activity.content;
  const isPhoneMenu = letterhead?.format === "phone-menu";
  const isVoicemail = letterhead?.format === "voicemail";
  const [values, setValues] = useState({});
  const [replayNonce, setReplayNonce] = useState(0);
  const triggerReplay = () => setReplayNonce((n) => n + 1);
  // Reset replay counter when the audio source changes (next item)
  useEffect(() => {
    setReplayNonce(0);
  }, [letterhead?.audio_url]);
  const [submitted, setSubmitted] = useState({});
  const [hints, setHints] = useState({});
  const { logAttempt, logCue } = useSession();

  const onSubmit = (i, value) => {
    if (submitted[i] != null) return;
    const trimmed = (value || "").trim();
    if (!trimmed) return;
    const q = questions[i];
    const expected = q.options[q.answer];
    const correct = matchesAnswer(trimmed, expected);
    const usedHint = !!hints[i];
    setSubmitted((s) => ({ ...s, [i]: { correct, picked: trimmed } }));
    logAttempt({
      activity_slug: activity.slug,
      activity_title: activity.title,
      category: activity.category,
      qid: `q${i}`,
      correct,
      picked: trimmed,
      expected,
    });
    if (typeof onAttempt === "function") {
      onAttempt({ qid: `q${i}`, correct, usedHint });
    }
  };

  const onShowHint = (i) => {
    if (hints[i]) return;
    setHints((h) => ({ ...h, [i]: true }));
    logCue({
      activity_slug: activity.slug,
      activity_title: activity.title,
      category: activity.category,
      cue_type: "hint",
      detail: `q${i}`,
    });
    if (typeof onHint === "function") {
      onHint({ qid: `q${i}` });
    }
  };

  return (
    <div>
      {onChangeLevel ? (
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2" data-testid="leveled-reading-toolbar">
          {levelLabel ? (
            <span
              className="inline-flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white text-xs sm:text-[13px] font-display font-extrabold uppercase tracking-[0.18em]"
              style={{
                color: levelLabel.color,
                border: `1px solid ${levelLabel.border}`,
                boxShadow: `0 10px 24px -14px ${levelLabel.shadow}, 0 1px 0 rgba(255,255,255,0.7) inset`,
              }}
              data-testid="level-pill"
            >
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center gap-1 rounded-full px-1.5 py-1"
                style={{ background: levelLabel.dotsBg }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{
                      background:
                        i < (levelLabel.complexity || 1)
                          ? levelLabel.dot
                          : levelLabel.dotMuted,
                    }}
                  />
                ))}
              </span>
              {levelLabel.text}
            </span>
          ) : <span />}
          <div className="flex items-center gap-2 flex-wrap">
            {onToggleFullscreen ? (
              <Button
                type="button"
                variant="outline"
                onClick={onToggleFullscreen}
                className="rounded-full font-display h-10 px-4"
                data-testid="fullscreen-toggle-btn"
              >
                {fullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
                {fullscreen ? "Exit full screen" : "Full screen"}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={onChangeLevel}
              className="rounded-full font-display h-10 px-4"
              data-testid="change-difficulty-btn"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Change difficulty
            </Button>
          </div>
        </div>
      ) : null}
      {letterhead || text ? (
        isPhoneMenu ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start" data-testid="reading-phone-menu">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight inline-flex items-center gap-2">
                Questions
                <Sparkles className="w-4 h-4 text-indigo-500" aria-hidden="true" />
              </h2>
              <div className="mt-4 space-y-4" data-testid="reading-questions">
                {questions.map((q, i) => (
                  <PhoneKeypadCard
                    key={i}
                    qid={i}
                    q={q}
                    value={values[i] || ""}
                    onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                    onSubmit={(v) => onSubmit(i, v)}
                    onReplay={triggerReplay}
                    result={submitted[i]}
                  />
                ))}
              </div>
              {onNext || onEnd ? (
                <div className="mt-5 flex flex-wrap justify-start gap-3" data-testid="next-letter-cta">
                  {onNext ? (
                    <Button
                      type="button"
                      onClick={onNext}
                      className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-11 px-5"
                      data-testid="next-letter-btn"
                    >
                      {nextLabel || "Next letter"} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : null}
                  {onEnd ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onEnd}
                      className="rounded-full font-display h-11 px-5 border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                      data-testid="end-activity-btn"
                    >
                      <Flag className="w-4 h-4 mr-2" /> End activity
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2 lg:sticky lg:top-20">
              <LetterheadView letterhead={letterhead} replayNonce={replayNonce} />
            </div>
          </div>
        ) : layout === "stacked" ? (
          <div className="space-y-6 max-w-3xl mx-auto" data-testid="reading-stacked">
            <div>
              {letterhead ? (
                <LetterheadView letterhead={letterhead} />
              ) : (
                <div className="reading-block" data-testid="reading-text">{text}</div>
              )}
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight inline-flex items-center gap-2">
                Questions
                <Sparkles className="w-4 h-4 text-indigo-500" aria-hidden="true" />
              </h2>
              <div className="mt-4 space-y-4" data-testid="reading-questions">
                {questions.map((q, i) => (
                  isPhoneMenu ? (
                    <PhoneKeypadCard
                      key={i}
                      qid={i}
                      q={q}
                      value={values[i] || ""}
                      onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                      onSubmit={(v) => onSubmit(i, v)}
                      onReplay={triggerReplay}
                      result={submitted[i]}
                    />
                  ) : (
                    <TextAnswerCard
                      key={i}
                      qid={i}
                      q={q}
                      value={values[i] || ""}
                      onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                      onSubmit={(v) => onSubmit(i, v)}
                      onShowHint={() => onShowHint(i)}
                      hintShown={!!hints[i]}
                      result={submitted[i]}
                    />
                  )
                ))}
              </div>
              {onNext || onEnd ? (
                <div className="mt-5 flex flex-wrap justify-start gap-3" data-testid="next-letter-cta">
                  {onNext ? (
                    <Button
                      type="button"
                      onClick={onNext}
                      className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-11 px-5"
                      data-testid="next-letter-btn"
                    >
                      {nextLabel || "Next letter"} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : null}
                  {onEnd ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onEnd}
                      className="rounded-full font-display h-11 px-5 border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                      data-testid="end-activity-btn"
                    >
                      <Flag className="w-4 h-4 mr-2" /> End activity
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className={isVoicemail ? "lg:col-span-2" : "lg:col-span-3"}>
            {letterhead ? (
              <LetterheadView letterhead={letterhead} />
            ) : (
              <div className="reading-block" data-testid="reading-text">{text}</div>
            )}
          </div>
          <div className={`${isVoicemail ? "lg:col-span-3" : "lg:col-span-2"} lg:sticky lg:top-20`}>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight inline-flex items-center gap-2">
              Questions
              <Sparkles className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            </h2>
            <div className="mt-4 space-y-4" data-testid="reading-questions">
              {questions.map((q, i) => (
                isPhoneMenu ? (
                  <PhoneKeypadCard
                    key={i}
                    qid={i}
                    q={q}
                    value={values[i] || ""}
                    onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                    onSubmit={(v) => onSubmit(i, v)}
                    onReplay={triggerReplay}
                    result={submitted[i]}
                  />
                ) : (
                  <TextAnswerCard
                    key={i}
                    qid={i}
                    q={q}
                    value={values[i] || ""}
                    onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                    onSubmit={(v) => onSubmit(i, v)}
                    onShowHint={() => onShowHint(i)}
                    hintShown={!!hints[i]}
                    result={submitted[i]}
                  />
                )
              ))}
            </div>

            {onNext || onEnd ? (
              <div className="mt-5 flex flex-wrap justify-start gap-3" data-testid="next-letter-cta">
                {onNext ? (
                  <Button
                    type="button"
                    onClick={onNext}
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-11 px-5"
                    data-testid="next-letter-btn"
                  >
                    {nextLabel || "Next letter"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : null}
                {onEnd ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onEnd}
                    className="rounded-full font-display h-11 px-5 border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    data-testid="end-activity-btn"
                  >
                    <Flag className="w-4 h-4 mr-2" /> End activity
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        )
      ) : null}
    </div>
  );
}

function PhoneKeypadCard({ qid, q, value, onChange, onSubmit, onReplay, result }) {
  const locked = !!result;
  const status = result ? (result.correct ? "correct" : "incorrect") : null;
  const opts = q.options || [];
  const replayKey = q.replay_key ? String(q.replay_key) : null;

  // Match an option string by canonical key (e.g. "Press 1" -> "1", "Stay on the line" -> "stay").
  const canonical = (s) => {
    const t = String(s || "").trim().toLowerCase();
    const m = t.match(/press\s*([0-9*#])/);
    if (m) return m[1];
    if (t.includes("stay")) return "stay";
    if (t.includes("hang")) return "hang";
    return t;
  };
  const optionForKey = (key) => opts.find((o) => canonical(o) === key);
  const correctOpt = opts[q.answer];
  const correctKey = canonical(correctOpt);
  const pickedKey = result ? canonical(result.picked) : null;

  const pressed = (key, label) => {
    if (locked) return;
    // Replay key — restart the audio instead of submitting an answer.
    if (replayKey && key === replayKey) {
      if (onReplay) onReplay();
      return;
    }
    const opt = optionForKey(key) || label;
    onChange(opt);
    onSubmit(opt);
  };

  const KEYS = [
    { k: "1", letters: " " },
    { k: "2", letters: "ABC" },
    { k: "3", letters: "DEF" },
    { k: "4", letters: "GHI" },
    { k: "5", letters: "JKL" },
    { k: "6", letters: "MNO" },
    { k: "7", letters: "PQRS" },
    { k: "8", letters: "TUV" },
    { k: "9", letters: "WXYZ" },
    { k: "*", letters: " " },
    { k: "0", letters: "+" },
    { k: "#", letters: " " },
  ];

  const renderKey = ({ k, letters }) => {
    const isCorrect = locked && k === correctKey;
    const isWrongPick = locked && k === pickedKey && k !== correctKey;
    return (
      <button
        key={k}
        type="button"
        disabled={locked}
        onClick={() => pressed(k, `Press ${k}`)}
        data-testid={`question-${qid}-keypad-${k}`}
        className="rounded-full grid place-items-center transition active:scale-95 hover:bg-zinc-50 disabled:cursor-not-allowed select-none"
        style={{
          aspectRatio: "1 / 1",
          background: isCorrect ? "#DCFCE7" : isWrongPick ? "#FEE2E2" : "#FFFFFF",
          color: isCorrect ? "#065F46" : isWrongPick ? "#9F1239" : "#0F172A",
          border: isCorrect
            ? "2px solid #10B981"
            : isWrongPick
            ? "2px solid #F43F5E"
            : "1px solid #E4E4E7",
          boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 2px 4px rgba(15,23,42,0.04)",
        }}
      >
        <div className="flex flex-col items-center leading-none">
          <span className="font-display font-extrabold" style={{ fontSize: 24 }}>
            {k}
          </span>
          <span className="text-[9px] font-bold tracking-[0.18em] text-zinc-500 mt-0.5 min-h-[10px]">
            {letters.trim() ? letters : "\u00A0"}
          </span>
        </div>
      </button>
    );
  };

  const stayOpt = optionForKey("stay");
  const hangOpt = optionForKey("hang");

  return (
    <div
      className="rounded-3xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(180deg,#FDF2F8 0%,#FFFFFF 60%)",
        border: "1px solid #FBCFE8",
        boxShadow: "0 10px 28px -16px rgba(236,72,153,0.35)",
      }}
      data-testid={`question-${qid}`}
    >
      <div className="text-[11px] uppercase tracking-[0.18em] font-display font-bold text-pink-700">
        Scenario
      </div>
      <div
        className="font-display font-bold text-zinc-900 mt-1 leading-snug"
        style={{ fontSize: 18 }}
        data-testid={`question-${qid}-prompt`}
      >
        {q.q}
      </div>

      <div className="mt-5 mx-auto grid grid-cols-3 gap-2.5" style={{ maxWidth: 280 }}>
        {KEYS.map(renderKey)}
      </div>

      {(stayOpt || hangOpt) && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto">
          {stayOpt ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => pressed("stay", stayOpt)}
              data-testid={`question-${qid}-keypad-stay`}
              className="flex-1 h-12 rounded-full font-display font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
              style={{
                background:
                  locked && pickedKey === "stay"
                    ? correctKey === "stay"
                      ? "#10B981"
                      : "#F43F5E"
                    : correctKey === "stay" && locked
                    ? "#10B981"
                    : "#FFFFFF",
                color:
                  locked && (pickedKey === "stay" || correctKey === "stay") ? "#FFFFFF" : "#065F46",
                border: "1.5px solid #10B981",
              }}
            >
              Stay on the line
            </button>
          ) : null}
          {hangOpt ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => pressed("hang", hangOpt)}
              data-testid={`question-${qid}-keypad-hang`}
              className="flex-1 h-12 rounded-full font-display font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
              style={{
                background:
                  locked && pickedKey === "hang"
                    ? correctKey === "hang"
                      ? "#10B981"
                      : "#F43F5E"
                    : "#FFFFFF",
                color: locked && pickedKey === "hang" ? "#FFFFFF" : "#9F1239",
                border: "1.5px solid #F43F5E",
              }}
            >
              Hang up
            </button>
          ) : null}
        </div>
      )}

      {locked ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-display font-semibold">
          {status === "correct" ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Correct — {correctOpt}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-700">
              <XCircle className="w-4 h-4" /> The correct answer was {correctOpt}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function TextAnswerCard({ qid, q, value, onChange, onSubmit, onShowHint, hintShown, result }) {
  const locked = !!result;
  const status = result ? (result.correct ? "correct" : "incorrect") : null;

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(value);
    }
  };

  const inputStyle = (() => {
    if (status === "correct") return { borderColor: "#10B981", background: "#ECFDF5" };
    if (status === "incorrect") return { borderColor: "#F43F5E", background: "#FFF1F2" };
    return undefined;
  })();

  const canSubmit = !locked && value && value.trim().length > 0;

  return (
    <div className="border border-zinc-200 rounded-2xl p-4 sm:p-5 bg-white" data-testid={`question-${qid}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span
            aria-hidden="true"
            className="shrink-0 inline-grid place-items-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-display font-bold text-sm"
          >
            {qid + 1}
          </span>
          <div
            className="font-display font-semibold text-base sm:text-lg leading-snug pt-1"
            data-testid={`question-${qid}-prompt`}
          >
            {q.q}
          </div>
        </div>
        {!hintShown && !locked ? (
          <button
            type="button"
            onClick={onShowHint}
            data-testid={`question-${qid}-show-hint`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display shrink-0 pt-1.5 group"
          >
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-indigo-600">Hint:</span>
            <span className="font-medium text-zinc-400 group-hover:text-zinc-600 transition">
              show multiple choices
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={locked}
          placeholder="Type your answer and press Enter"
          data-testid={`question-${qid}-input`}
          className="h-12 rounded-xl pr-14"
          style={inputStyle}
        />
        {status ? (
          <span className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
            {status === "correct" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500" />
            )}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => onSubmit(value)}
          disabled={!canSubmit}
          aria-label="Submit answer"
          data-testid={`question-${qid}-submit`}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-grid place-items-center w-9 h-9 rounded-full bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:bg-indigo-100 disabled:text-indigo-300 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {hintShown ? (
        <div className="mt-3" data-testid={`question-${qid}-hints`}>
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-bold mb-1.5">
            Hint — possible answers
          </div>
          <div className="flex flex-wrap gap-1.5">
            {q.options.map((opt, idx) => {
              const isPicked =
                result && matchesAnswer(opt, result.picked);
              const optStyle = isPicked
                ? status === "correct"
                  ? {
                      borderColor: "#10B981",
                      background: "#ECFDF5",
                      color: "#065F46",
                    }
                  : {
                      borderColor: "#F43F5E",
                      background: "#FFF1F2",
                      color: "#9F1239",
                    }
                : undefined;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    onChange(opt);
                    onSubmit(opt);
                  }}
                  data-testid={`question-${qid}-option-${idx}`}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium border bg-white border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 transition disabled:opacity-100 disabled:cursor-not-allowed"
                  style={optStyle}
                >
                  {isPicked && status === "correct" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : null}
                  {isPicked && status === "incorrect" ? (
                    <XCircle className="w-4 h-4" />
                  ) : null}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {locked && status === "incorrect" ? (
        <div className="mt-2.5 text-xs text-zinc-600">
          Correct answer:{" "}
          <span className="font-semibold text-zinc-900">{q.options[q.answer]}</span>
        </div>
      ) : null}
    </div>
  );
}

function LetterheadView_DEPRECATED() { return null; }


const LEVEL_THEME = {
  green: {
    title: "Foundational",
    pillBg: "#ECFDF5",
    pillFg: "#065F46",
    pillBorder: "#A7F3D0",
    cardBg: "#F3FAF6",
    cardBorder: "#A7F3D0",
    cardGradient: "linear-gradient(135deg,#10B981 0%,#22C55E 100%)",
    cardCta: "#059669",
    glow: "rgba(16, 185, 129, 0.22)",
    dot: "#10B981",
    complexity: 1,
    questionsPerLetter: 3,
  },
  amber: {
    title: "Intermediate",
    pillBg: "#FFFBEB",
    pillFg: "#92400E",
    pillBorder: "#FDE68A",
    cardBg: "#FBF7EF",
    cardBorder: "#FED7AA",
    cardGradient: "linear-gradient(135deg,#F59E0B 0%,#F97316 100%)",
    cardCta: "#D97706",
    glow: "rgba(245, 158, 11, 0.22)",
    dot: "#F59E0B",
    complexity: 2,
    questionsPerLetter: 4,
  },
  red: {
    title: "Complex",
    pillBg: "#FFF1F2",
    pillFg: "#9F1239",
    pillBorder: "#FECDD3",
    cardBg: "#FCF5F6",
    cardBorder: "#FECDD3",
    cardGradient: "linear-gradient(135deg,#F43F5E 0%,#E11D48 100%)",
    cardCta: "#E11D48",
    glow: "rgba(244, 63, 94, 0.22)",
    dot: "#F43F5E",
    complexity: 3,
    questionsPerLetter: 5,
  },
  pink: {
    title: "Bonus",
    pillBg: "#FDF2F8",
    pillFg: "#BE185D",
    pillBorder: "#FBCFE8",
    cardBg: "#FDF4FA",
    cardBorder: "#F9A8D4",
    cardGradient: "linear-gradient(135deg,#F472B6 0%,#EC4899 100%)",
    cardCta: "#DB2777",
    glow: "rgba(236, 72, 153, 0.32)",
    dot: "#FF36B0",
    complexity: 3,
    questionsPerLetter: 4,
    neon: true,
  },
};

const LEVEL_ICON = {
  green: Leaf,
  amber: CalendarDays,
  red: Layers3,
  pink: Star,
};

function LeveledReadingExercise({ activity }) {
  const navigate = useNavigate();
  const smartBack = useSmartBack();
  const [searchParams, setSearchParams] = useSearchParams();
  const level = searchParams.get("level");
  const letterId = searchParams.get("letter");
  const isDone = searchParams.get("done") === "1";
  const levels = activity.content.levels || EMPTY_LEVELS;
  const { logActivity } = useSession();

  // Per-run stats accumulator: keyed by `${level}:${letterId}:${qid}` for dedupe.
  const statsRef = useRef({
    startedAt: null,
    levelKey: null,
    letters: new Set(), // letter ids attempted this run
    attempts: new Map(), // key -> { correct, usedHint }
    hintsBeforeAttempt: new Set(), // keys where hint was shown before answer
  });
  const [, forceTick] = useState(0);
  const bumpStats = () => forceTick((t) => t + 1);

  const ensureRunForLevel = (key) => {
    const s = statsRef.current;
    if (s.levelKey !== key) {
      s.startedAt = new Date();
      s.levelKey = key;
      s.letters = new Set();
      s.attempts = new Map();
      s.hintsBeforeAttempt = new Set();
    } else if (!s.startedAt) {
      s.startedAt = new Date();
    }
  };

  const handleAttempt = (info) => {
    const s = statsRef.current;
    if (!letter || !lv) return;
    const k = `${lv.key}:${letter.id}:${info.qid}`;
    const usedHint = info.usedHint || s.hintsBeforeAttempt.has(k);
    s.attempts.set(k, { correct: info.correct, usedHint });
    s.letters.add(letter.id);
    bumpStats();
  };
  const handleHint = (info) => {
    const s = statsRef.current;
    if (!letter || !lv) return;
    const k = `${lv.key}:${letter.id}:${info.qid}`;
    if (!s.attempts.has(k)) s.hintsBeforeAttempt.add(k);
    bumpStats();
  };
  const resetStats = () => {
    statsRef.current = {
      startedAt: null,
      levelKey: null,
      letters: new Set(),
      attempts: new Map(),
      hintsBeforeAttempt: new Set(),
    };
    bumpStats();
  };

  const [fullscreen, setFullscreen] = useState(() => {
    try { return sessionStorage.getItem("soniva.reading.fullscreen") === "1"; } catch { return false; }
  });
  const toggleFullscreen = () => {
    setFullscreen((v) => {
      const nv = !v;
      try { sessionStorage.setItem("soniva.reading.fullscreen", nv ? "1" : "0"); } catch { /* ignore */ }
      return nv;
    });
  };
  // Lock body scroll while fullscreen so the overlay owns scrolling
  useEffect(() => {
    if (fullscreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [fullscreen]);

  const lv = level && levels[level] ? levels[level] : null;
  const letters = lv?.letters || [];
  const letter = lv ? letters.find((l) => String(l.id) === String(letterId)) : null;
  const currentIdx = letter ? letters.findIndex((l) => String(l.id) === String(letterId)) : -1;
  const hasNext = currentIdx >= 0 && currentIdx < letters.length - 1;

  // Log this as a distinct activity entry once both level and letter are chosen
  useEffect(() => {
    if (lv && letter) {
      logActivity({
        category: activity.category,
        activity_slug: `${activity.slug}-${lv.key}-${letter.id}`,
        activity_title: `${activity.title} — ${lv.title} · ${letter.title || `Letter ${letter.id}`}`,
      });
      ensureRunForLevel(lv.key);
    }
  }, [lv, letter, activity, logActivity]);

  const categoryName = slugToTitle(activity.category);

  const itemLabelSingular = (lv && lv.item_label_singular) || "Letter";
  const itemLabelPlural = (lv && lv.item_label_plural) || "letters";

  const computeSummary = () => {
    const s = statsRef.current;
    const totalLetters = letters.length;
    const lettersAttempted = s.letters.size;
    const totalQuestions = s.attempts.size;
    const correctCount = Array.from(s.attempts.values()).filter((a) => a.correct).length;
    const hintsUsed = Array.from(s.attempts.values()).filter((a) => a.usedHint).length;
    const startedAt = s.startedAt ? new Date(s.startedAt) : new Date();
    const endedAt = new Date();
    const durationSec = Math.max(0, Math.round((endedAt - startedAt) / 1000));
    const accuracyPct = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const hintPct = totalQuestions ? Math.round((hintsUsed / totalQuestions) * 100) : 0;
    return {
      taskName: activity.title,
      levelTitle: (lv && lv.title) || "",
      startedAt,
      endedAt,
      durationSec,
      lettersAttempted,
      totalLetters,
      itemLabelSingular,
      itemLabelPlural,
      totalQuestions,
      correctCount,
      accuracyPct,
      hintsUsed,
      hintPct,
    };
  };

  const goHub = () => navigate("/dashboard");
  const goCategory = () => navigate(`/category/${activity.category}`);
  const goDifficulty = () => setSearchParams({});
  const goLevelOverview = (key) => setSearchParams({ level: key });
  const hubCrumb = { label: "Hub", onClick: goHub };
  const categoryCrumb = { label: categoryName, onClick: goCategory };
  const activityCrumb = { label: activity.title, onClick: goDifficulty };
  const levelCrumb = lv ? { label: lv.title, onClick: () => goLevelOverview(lv.key) } : null;

  // Compute breadcrumb crumbs + back behaviour for the current step
  let crumbs;
  let onBack;
  if (!lv) {
    crumbs = [hubCrumb, categoryCrumb, activityCrumb, "Choose difficulty level"];
    onBack = smartBack;
  } else if (isDone) {
    crumbs = [hubCrumb, categoryCrumb, activityCrumb, levelCrumb, "Complete"];
    onBack = () => setSearchParams({ level: lv.key });
  } else if (!letter) {
    crumbs = [hubCrumb, categoryCrumb, activityCrumb, lv.title];
    onBack = () => setSearchParams({});
  } else {
    crumbs = [hubCrumb, categoryCrumb, activityCrumb, levelCrumb, `${itemLabelSingular} ${letter.id}`];
    onBack = () => setSearchParams({ level: lv.key });
  }

  const top = <BreadcrumbHeader crumbs={crumbs} onBack={onBack} />;

  if (!lv) {
    return (
      <>
        {top}
        <div className="mt-5">
          <DifficultyPicker
            activity={activity}
            onSelect={(key) => setSearchParams({ level: key })}
          />
        </div>
      </>
    );
  }

  if (isDone) {
    return (
      <>
        {top}
        <div className="mt-5">
          <CompletionScreen
            level={lv}
            summary={computeSummary()}
            onChangeLevel={() => { resetStats(); setSearchParams({}); }}
            onReplay={() => {
              resetStats();
              const first = letters[0];
              if (first) setSearchParams({ level: lv.key, letter: String(first.id) });
            }}
          />
        </div>
      </>
    );
  }

  if (!letter) {
    return (
      <>
        {top}
        <div className="mt-5">
          <LetterPicker
            activity={activity}
            level={lv}
            onPickLetter={(id) => setSearchParams({ level: lv.key, letter: String(id) })}
            onChangeLevel={() => setSearchParams({})}
          />
        </div>
      </>
    );
  }

  const theme = LEVEL_THEME[lv.key];
  const innerActivity = {
    ...activity,
    slug: `${activity.slug}-${lv.key}-${letter.id}`,
    title: `${activity.title} — ${lv.title} · ${letter.title || `Letter ${letter.id}`}`,
    content: {
      text: letter.text,
      letterhead: letter.letterhead,
      questions: letter.questions,
    },
  };

  const onNext = () => {
    if (hasNext) {
      setSearchParams({ level: lv.key, letter: String(letters[currentIdx + 1].id) });
    } else {
      setSearchParams({ level: lv.key, done: "1" });
    }
  };

  const letterView = (
    <ReadingExercise
      key={`${lv.key}-${letter.id}`}
      activity={innerActivity}
      onChangeLevel={() => { resetStats(); setSearchParams({}); }}
      levelLabel={
        theme
          ? {
              text: `${lv.title} · ${itemLabelSingular} ${letter.id} of ${letters.length}`,
              color: theme.pillFg,
              border: theme.pillBorder,
              shadow: theme.glow,
              dotsBg: theme.pillBg,
              dot: theme.dot,
              dotMuted: theme.pillBorder,
              complexity: theme.complexity || 1,
            }
          : null
      }
      onNext={onNext}
      nextLabel={hasNext ? `Next ${itemLabelPlural.replace(/s$/, "")}` : "Finish"}
      fullscreen={fullscreen}
      onToggleFullscreen={toggleFullscreen}
      onAttempt={handleAttempt}
      onHint={handleHint}
      onEnd={() => setSearchParams({ level: lv.key, done: "1" })}
      layout={
        activity.slug === "prescription-medication-labels"
          ? "stacked"
          : "split"
      }
    />
  );

  if (fullscreen) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] bg-white overflow-auto px-6 sm:px-10 py-5"
        data-testid="reading-fullscreen"
      >
        <div className="max-w-[1400px] mx-auto">{letterView}</div>
      </div>,
      document.body
    );
  }

  return (
    <>
      {top}
      <div className="mt-5">{letterView}</div>
    </>
  );
}

function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function fmtDateTime(d) {
  if (!d) return "";
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function downloadSummaryPdf(summary) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  const dateStr = fmtDateTime(summary.startedAt);
  const html = `<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>Artiqal — Session Summary</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181B; margin: 0; padding: 24px; }
  .wrap { max-width: 720px; margin: 0 auto; }
  .head { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 2px solid #4F46E5; }
  .logo-img { width: 40px; height: 40px; display: inline-block; object-fit: contain; border-radius: 12px; vertical-align: middle; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
  .doctype { margin-left: auto; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #71717A; font-weight: 700; }
  h1 { font-size: 22px; margin: 22px 0 4px; font-weight: 800; letter-spacing: -0.01em; }
  .sub { color: #52525B; font-size: 13px; margin-bottom: 18px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; padding: 14px 18px; background: #F4F4F5; border-radius: 10px; border: 1px solid #E4E4E7; }
  .row { display: flex; justify-content: space-between; gap: 16px; padding: 4px 0; }
  .k { color: #52525B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
  .v { font-weight: 700; font-size: 14px; }
  .stats { margin-top: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .stat { padding: 14px; border-radius: 10px; border: 1px solid #E4E4E7; }
  .stat .num { font-size: 26px; font-weight: 800; letter-spacing: -0.01em; }
  .stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #52525B; font-weight: 700; margin-top: 2px; }
  .notes { margin-top: 22px; padding-top: 14px; border-top: 1px dashed #D4D4D8; font-size: 12px; color: #52525B; }
  .foot { margin-top: 28px; padding-top: 12px; border-top: 1px solid #E4E4E7; font-size: 11px; color: #71717A; display: flex; justify-content: space-between; }
  @media print { body { padding: 0; } .noprint { display: none; } }
  .actions { margin-top: 22px; display: flex; gap: 10px; justify-content: flex-end; }
  .btn { background: #4F46E5; color: white; border: none; border-radius: 999px; padding: 10px 18px; font-weight: 700; cursor: pointer; font-size: 13px; }
  .btn.secondary { background: white; color: #18181B; border: 1px solid #D4D4D8; }
</style>
</head><body><div class="wrap">
  <div class="head">
    <img class="logo-img" src="/brand/artiqal-logo-v2.png" alt="Artiqal logo" />
    <span class="brand">Artiqal</span>
    <span class="doctype">Session Summary</span>
  </div>
  <h1>${summary.taskName}</h1>
  <div class="sub">Difficulty: <strong>${summary.levelTitle}</strong></div>
  <div class="grid">
    <div class="row"><span class="k">Date &amp; Time</span><span class="v">${dateStr}</span></div>
    <div class="row"><span class="k">Duration</span><span class="v">${fmtDuration(summary.durationSec)}</span></div>
    <div class="row"><span class="k">Task</span><span class="v">${summary.taskName}</span></div>
    <div class="row"><span class="k">Difficulty</span><span class="v">${summary.levelTitle}</span></div>
  </div>
  <div class="stats">
    <div class="stat"><div class="num">${summary.lettersAttempted} of ${summary.totalLetters}</div><div class="lbl">${(summary.itemLabelPlural || "Letters")} completed</div></div>
    <div class="stat"><div class="num">${summary.correctCount} / ${summary.totalQuestions}</div><div class="lbl">Correct answers (${summary.accuracyPct}%)</div></div>
    <div class="stat"><div class="num">${summary.hintPct}%</div><div class="lbl">Hint used on questions</div></div>
  </div>
  <div class="foot"><span>Artiqal — functional communication practice</span><span>Generated ${fmtDateTime(summary.endedAt)}</span></div>
  <div class="actions noprint">
    <button class="btn secondary" onclick="window.close()">Close</button>
    <button class="btn" onclick="window.print()">Save as PDF</button>
  </div>
</div>
<script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 250); });</script>
</body></html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printAllLabels({ activity, level }) {
  const letters = level.letters || [];
  if (!letters.length) return;
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  const itemSing = level.item_label_singular || "Letter";
  const accentByKey = { green: "#059669", amber: "#D97706", red: "#DC2626", pink: "#DB2777" };
  const accent = accentByKey[level.key] || "#4F46E5";

  const renderLetter = (l, idx) => {
    const lh = l.letterhead || {};
    const med = lh.medication || {};
    const recipients = lh.recipient_lines || [];
    const addr = lh.address_lines || [];
    const brand = lh.brand_color || accent;
    const isLabel = lh.format === "label";
    return `
      <section class="page" data-testid="print-label-${idx + 1}">
        <header class="ph">
          <div class="ph-l">
            <div class="brand" style="color:${escapeHtml(brand)}">${escapeHtml(lh.clinic_name || "")}</div>
            <div class="addr">
              ${addr.map((a) => `<div>${escapeHtml(a)}</div>`).join("")}
              ${lh.phone ? `<div>Tel: ${escapeHtml(lh.phone)}</div>` : ""}
            </div>
          </div>
          <div class="ph-r">
            <div class="rx">R<sub>x</sub></div>
          </div>
        </header>
        ${isLabel ? `
          <div class="label-card" style="border-color:${escapeHtml(brand)}">
            ${med.rx_number ? `<div class="row"><span class="k">Rx No:</span> ${escapeHtml(med.rx_number)}</div>` : ""}
            ${recipients.length ? `<div class="row"><span class="k">Patient:</span> ${recipients.map(escapeHtml).join("<br/>")}</div>` : ""}
            ${med.name ? `<div class="med-name">${escapeHtml(med.name).toUpperCase()}</div>` : ""}
            ${med.instruction ? `<div class="med-instr ${med.instruction_uppercase ? "upper" : ""}">${escapeHtml(med.instruction)}</div>` : ""}
            <div class="meta">
              ${med.quantity ? `<div><span class="k">Quantity:</span> ${escapeHtml(med.quantity)}</div>` : ""}
              ${med.prescriber ? `<div><span class="k">Prescriber:</span> ${escapeHtml(med.prescriber)}</div>` : ""}
              ${med.date_dispensed ? `<div><span class="k">Date dispensed:</span> ${escapeHtml(med.date_dispensed)}</div>` : ""}
            </div>
            ${med.warning ? `<div class="warn"><span class="warn-i">&#9888;</span> <span><strong>Warning:</strong> ${escapeHtml(med.warning)}</span></div>` : ""}
          </div>
        ` : `
          <div class="letter-body">
            ${recipients.length ? `<div class="recipients">${recipients.map(escapeHtml).join("<br/>")}</div>` : ""}
            <div class="letter-text">${escapeHtml(l.text || "").replace(/\n/g, "<br/>")}</div>
          </div>
        `}
        <h3 class="qh">Questions</h3>
        <ol class="qs">
          ${(l.questions || [])
            .map(
              (q) => `<li>
                <div class="q">${escapeHtml(q.q || "")}</div>
                <div class="answer-line"></div>
              </li>`
            )
            .join("")}
        </ol>
        <div class="footnote">${escapeHtml(activity.title)} — ${escapeHtml(level.title)} · ${escapeHtml(itemSing)} ${idx + 1} of ${letters.length}</div>
      </section>
    `;
  };

  const html = `<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>${escapeHtml(activity.title)} — ${escapeHtml(level.title)}</title>
<style>
  @page { size: A4; margin: 14mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181B; margin: 0; padding: 0; }
  .cover { padding: 32px 28px 24px; border-bottom: 2px solid ${escapeHtml(accent)}; page-break-after: always; }
  .cover .logo { display: flex; align-items: center; gap: 10px; }
  .cover .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
  .cover h1 { font-size: 26px; margin: 18px 0 6px; font-weight: 800; letter-spacing: -0.01em; }
  .cover .sub { color: #52525B; font-size: 13px; }
  .cover .pill { display: inline-block; padding: 4px 10px; border-radius: 999px; border: 1.5px solid ${escapeHtml(accent)}; color: ${escapeHtml(accent)}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; margin-top: 14px; }
  .cover .meta { margin-top: 18px; font-size: 12px; color: #52525B; }
  .page { padding: 24px 4px; page-break-after: always; }
  .page:last-of-type { page-break-after: auto; }
  .ph { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 10px; border-bottom: 1px dashed #D4D4D8; }
  .ph .brand { font-size: 16px; font-weight: 800; letter-spacing: -0.01em; }
  .ph .addr { font-size: 11px; color: #52525B; margin-top: 2px; line-height: 1.45; }
  .ph .rx { font-family: Georgia, serif; font-size: 28px; font-weight: 800; color: #A1A1AA; line-height: 1; }
  .ph .rx sub { font-size: 16px; }
  .label-card { margin-top: 14px; border: 1.5px solid #4F46E5; border-radius: 12px; padding: 16px 18px; background: #FAFAF9; }
  .label-card .row { font-size: 12px; line-height: 1.6; color: #18181B; }
  .label-card .k { color: #52525B; font-weight: 600; }
  .label-card .med-name { margin-top: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.02em; }
  .label-card .med-instr { font-size: 13px; margin-top: 4px; line-height: 1.55; }
  .label-card .med-instr.upper { text-transform: uppercase; font-weight: 700; }
  .label-card .meta { margin-top: 10px; display: flex; gap: 18px; flex-wrap: wrap; font-size: 12px; }
  .label-card .warn { margin-top: 10px; padding: 8px 10px; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; font-size: 12px; display: flex; gap: 8px; align-items: flex-start; }
  .label-card .warn-i { color: #B45309; font-size: 14px; line-height: 1; }
  .letter-body { margin-top: 14px; }
  .letter-body .recipients { font-size: 12px; color: #52525B; margin-bottom: 10px; line-height: 1.5; }
  .letter-body .letter-text { font-size: 13px; line-height: 1.65; white-space: pre-wrap; }
  .qh { margin: 18px 0 8px; font-size: 14px; font-weight: 800; letter-spacing: -0.01em; }
  .qs { margin: 0; padding: 0 0 0 20px; }
  .qs li { margin-bottom: 14px; font-size: 12.5px; line-height: 1.5; }
  .qs .q { font-weight: 600; color: #18181B; }
  .answer-line { margin-top: 10px; border-bottom: 1px solid #A1A1AA; height: 22px; }
  .footnote { margin-top: 16px; font-size: 10px; color: #A1A1AA; text-align: right; letter-spacing: 0.05em; }
  @media print { .noprint { display: none; } }
  .actions { position: fixed; top: 14px; right: 14px; display: flex; gap: 8px; }
  .btn { background: ${escapeHtml(accent)}; color: white; border: none; border-radius: 999px; padding: 10px 16px; font-weight: 700; cursor: pointer; font-size: 12px; }
  .btn.secondary { background: white; color: #18181B; border: 1px solid #D4D4D8; }
</style>
</head><body>
  <div class="actions noprint">
    <button class="btn secondary" onclick="window.close()">Close</button>
    <button class="btn" onclick="window.print()">Save as PDF</button>
  </div>
  <section class="cover">
    <div class="logo">
      <img src="/brand/artiqal-logo-v2.png" width="36" height="36" alt="Artiqal" style="border-radius: 11px; object-fit: contain;" />
      <span class="brand">Artiqal</span>
    </div>
    <div class="pill">${escapeHtml(level.title)} · ${escapeHtml(level.key.toUpperCase())}</div>
    <h1>${escapeHtml(activity.title)}</h1>
    <div class="sub">${escapeHtml(level.blurb || "")}</div>
    <div class="meta">${letters.length} ${escapeHtml(letters.length === 1 ? itemSing.toLowerCase() : (level.item_label_plural || "items").toLowerCase())} · printed ${escapeHtml(fmtDateTime(new Date()))}</div>
  </section>
  ${letters.map(renderLetter).join("")}
<script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 350); });</script>
</body></html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function CompletionScreen({ level, summary, onChangeLevel, onReplay }) {
  const theme = LEVEL_THEME[level.key];
  const stats = summary || {
    lettersAttempted: 0,
    totalLetters: (level.letters || []).length,
    correctCount: 0,
    totalQuestions: 0,
    accuracyPct: 0,
    hintPct: 0,
    durationSec: 0,
    startedAt: new Date(),
    endedAt: new Date(),
    levelTitle: level.title,
    taskName: "Reading an Appointment Letter",
  };
  return (
    <div
      className="rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto"
      style={{ background: theme.cardBg, border: `1.5px solid ${theme.cardBorder}` }}
      data-testid="completion-screen"
    >
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full text-white mb-4"
          style={{ background: theme.dot }}
        >
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Well done!
        </div>
        <p className="mt-2 text-zinc-700 max-w-md mx-auto text-sm">
          You've finished this {level.title} session.
        </p>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-3" data-testid="completion-stats">
        <div className="rounded-2xl bg-white p-4 border border-zinc-200">
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 font-bold">{(stats.itemLabelPlural || "Letters")} completed</div>
          <div className="mt-1 font-display text-2xl font-extrabold">
            {stats.lettersAttempted} <span className="text-zinc-400 text-base font-bold">of {stats.totalLetters}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-zinc-200">
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 font-bold">Correct answers</div>
          <div className="mt-1 font-display text-2xl font-extrabold">
            {stats.correctCount} / {stats.totalQuestions} <span className="text-zinc-400 text-base font-bold">({stats.accuracyPct}%)</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-zinc-200">
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 font-bold">Hint used</div>
          <div className="mt-1 font-display text-2xl font-extrabold">
            {stats.hintPct}% <span className="text-zinc-400 text-base font-bold">of questions</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white/70 px-4 py-2.5 border border-zinc-200/70">
          <span className="text-zinc-500">Duration: </span>
          <span className="font-semibold">{fmtDuration(stats.durationSec)}</span>
        </div>
        <div className="rounded-xl bg-white/70 px-4 py-2.5 border border-zinc-200/70">
          <span className="text-zinc-500">Started: </span>
          <span className="font-semibold">{fmtDateTime(stats.startedAt)}</span>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-3 justify-center">
        <Button
          onClick={() => downloadSummaryPdf(stats)}
          className="rounded-full font-display bg-indigo-600 hover:bg-indigo-700 h-11 px-5"
          data-testid="completion-download-pdf"
        >
          <Download className="w-4 h-4 mr-2" /> Download PDF
        </Button>
        <Button
          variant="outline"
          onClick={onChangeLevel}
          className="rounded-full font-display h-11 px-5"
          data-testid="completion-change-difficulty"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Change difficulty
        </Button>
        <Button
          variant="outline"
          onClick={onReplay}
          className="rounded-full font-display h-11 px-5"
          data-testid="completion-replay"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Restart from Letter 1
        </Button>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-zinc-300 bg-white font-display font-semibold hover:bg-zinc-50"
          data-testid="completion-back-hub"
        >
          Back to hub
        </Link>
      </div>
    </div>
  );
}

function DifficultyPicker({ activity, onSelect }) {
  const levels = activity.content.levels || {};
  const order = ["green", "amber", "red", "pink"];
  // Item label is shared across levels for an activity; default to "letter".
  const firstLevel = order.map((k) => levels[k]).find(Boolean) || {};
  const itemSing = (firstLevel.item_label_singular || "Letter").toLowerCase();
  const itemPlur = (firstLevel.item_label_plural || "letters").toLowerCase();
  const visibleLevels = order.filter((k) => levels[k]);
  const gridCols =
    visibleLevels.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-3";

  return (
    <div data-testid="difficulty-picker">
      <div className="mb-5" data-testid="difficulty-section-header">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          {activity.title}
        </h2>
        <p className="voicemail-difficulty-level-label mt-1.5 text-sm font-display font-semibold text-zinc-600">
          Choose difficulty level:
        </p>
      </div>

      <div className={`grid ${gridCols} gap-4 items-stretch`}>
        {visibleLevels
          .map((k) => {
            const lv = levels[k];
            const theme = LEVEL_THEME[k];
            const LevelIcon = LEVEL_ICON[k] || Tag;
            return (
              <div
                key={k}
                className="diff-card rounded-2xl flex flex-col h-full p-5"
                style={{
                  background: theme.cardBg,
                  border: `1.5px solid ${theme.cardBorder}`,
                  "--glow": theme.glow,
                  "--level-accent": theme.dot,
                  "--level-border": theme.cardBorder,
                  "--level-pill-bg": theme.pillBg,
                  "--level-pill-border": theme.pillBorder,
                }}
                data-testid={`difficulty-card-${k}`}
              >
                <div className="flex-1 flex flex-col">
                  <div className="difficulty-card-top-row flex items-center justify-between gap-2">
                    <div className="difficulty-card-badge-row flex items-center gap-2.5">
                      <span
                        className="difficulty-icon-ring"
                        style={{
                          color: theme.dot,
                          borderColor: theme.pillBorder,
                          "--level-accent": theme.dot,
                          "--level-pill-bg": theme.pillBg,
                        }}
                        aria-hidden="true"
                      >
                        <LevelIcon className="difficulty-icon" />
                      </span>
                      <div
                        className="difficulty-card-title font-display font-bold tracking-tight text-zinc-900"
                        style={{ fontSize: "26px", lineHeight: 1.05 }}
                      >
                        {lv.title}
                      </div>
                    </div>
                    <div className="difficulty-card-top-actions flex items-center">
                      <ComplexityDots level={theme.complexity} color={theme.dot} neon={theme.neon} />
                    </div>
                  </div>

                  <div className="difficulty-card-copy mt-3 space-y-2.5 text-sm">
                    <div className="difficulty-card-section difficulty-card-section-content">
                      <div className="difficulty-card-eyebrow text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-bold">
                        Content:
                      </div>
                      <p className="mt-0.5 text-zinc-700 leading-relaxed">{lv.blurb}</p>
                    </div>
                    <div className="difficulty-card-section difficulty-card-section-suited">
                      <div className="difficulty-card-eyebrow text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-bold">
                        Suited to:
                      </div>
                      <p className="mt-0.5 text-zinc-700 leading-relaxed">{lv.best_for}</p>
                    </div>
                    {lv.est_minutes ? (
                      <div className="difficulty-time-pill inline-flex items-center gap-1.5 text-[11px] font-display font-semibold text-zinc-700 mt-1 rounded-full bg-white/70 px-2.5 py-1" style={{ border: `1px solid ${theme.cardBorder}` }} data-testid={`est-minutes-${k}`}>
                        <Clock className="w-3 h-3" />
                        {lv.est_minutes}
                      </div>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(k)}
                  data-testid={`difficulty-${k}`}
                  className="difficulty-start-btn mt-5 inline-flex items-center justify-center gap-2 h-11 rounded-full font-display font-semibold text-white transition hover:brightness-110"
                  style={{ background: theme.cardCta }}
                >
                  Start {lv.title} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => printAllLabels({ activity, level: lv })}
                  disabled={!(lv.letters || []).length}
                  data-testid={`print-pdf-${k}`}
                  className="difficulty-print-btn mt-2 inline-flex items-center justify-center gap-2 h-10 rounded-full font-display font-semibold text-zinc-800 bg-white/70 hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ border: `1.5px solid ${theme.cardBorder}` }}
                  title={(lv.letters || []).length
                    ? `Print all ${(lv.letters || []).length} ${itemPlur} as a PDF handout`
                    : `No ${itemPlur} available yet`}
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}


function LetterPicker({ level, onPickLetter, onChangeLevel }) {
  const theme = LEVEL_THEME[level.key];
  const target = level.target_letter_count || (level.letters || []).length || 0;
  const ready = (level.letters || []).length;
  const itemSing = level.item_label_singular || "Letter";
  const itemPlur = level.item_label_plural || "letters";
  const subtitleText = `${level.questions_per_letter} questions per ${itemSing.toLowerCase()}.`;

  return (
    <div data-testid="letter-picker">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-[0.18em]"
            style={{
              background: theme.pillBg,
              color: theme.pillFg,
              border: `1.5px solid ${theme.pillBorder}`,
            }}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: theme.dot }}
            />
            {level.key.toUpperCase()}
          </span>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {level.title} · {ready} of {target} {itemPlur}
          </h2>
          <p className="text-zinc-600 mt-1 max-w-2xl">{subtitleText}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onChangeLevel}
          className="rounded-full font-display h-10 px-4"
          data-testid="change-difficulty-btn"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Change difficulty
        </Button>
      </div>

      {ready === 0 ? (
        <div
          className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center"
          data-testid="letter-picker-empty"
        >
          <div className="font-display font-bold text-lg">{itemPlur.charAt(0).toUpperCase() + itemPlur.slice(1)} coming soon</div>
          <p className="mt-1 text-zinc-600 max-w-md mx-auto">
            We’re writing the {target} {level.title.toLowerCase()} {itemPlur} together.
            They’ll appear here as soon as each one is added.
          </p>
        </div>
      ) : (
        <ul className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(level.letters || []).map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onPickLetter(l.id)}
                data-testid={`letter-${l.id}`}
                className="w-full text-left rounded-2xl border border-zinc-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: theme.pillFg }}>
                  {itemSing} {l.id}
                </div>
                <div className="font-display font-bold text-lg mt-1">{l.title}</div>
                {l.summary ? (
                  <div className="text-sm text-zinc-600 mt-1 leading-relaxed">{l.summary}</div>
                ) : null}
                <div className="mt-3 text-xs text-zinc-500 font-semibold">
                  {(l.questions || []).length} questions
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


function QuestionCard({ q, picked, onPick, qid }) {
  return (
    <div className="border border-zinc-200 rounded-2xl p-5 bg-white">
      <div className="font-display font-semibold text-lg">{q.q}</div>
      <div className="mt-3 grid sm:grid-cols-3 gap-2">
        {q.options.map((opt, idx) => {
          const correct = picked != null && idx === q.answer;
          const wrong = picked != null && picked === idx && idx !== q.answer;
          const chosen = picked === idx;
          return (
            <button
              key={idx}
              data-testid={`question-${qid}-option-${idx}`}
              onClick={() => onPick(idx)}
              className="text-left h-12 px-4 rounded-xl border transition font-medium"
              style={{
                borderColor: correct ? "#10B981" : wrong ? "#F43F5E" : chosen ? "#4F46E5" : "#E5E7EB",
                background: correct ? "#ECFDF5" : wrong ? "#FFF1F2" : chosen ? "#EEF2FF" : "white",
                color: correct ? "#065F46" : wrong ? "#9F1239" : "#0A0A0A",
              }}
            >
              {opt} {correct ? <CheckCircle2 className="inline w-4 h-4 ml-1" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AIReadingExercise({ activity }) {
  const [scenarioType, setScenarioType] = useState(activity.content.options[0].key);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/generate-scenario", { scenario_type: scenarioType });
      setText(data.text || "");
    } catch {
      setText("Could not generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" data-testid="ai-scenario-types">
        {activity.content.options.map((o) => (
          <button
            key={o.key}
            onClick={() => setScenarioType(o.key)}
            data-testid={`ai-scenario-type-${o.key}`}
            className="px-4 h-11 rounded-full text-sm font-display font-semibold border"
            style={
              scenarioType === o.key
                ? { background: "#4F46E5", color: "white", borderColor: "#4F46E5" }
                : { background: "white", color: "#0A0A0A", borderColor: "#E5E7EB" }
            }
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <Button
          onClick={generate}
          disabled={loading}
          className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-12 px-5"
          data-testid="ai-generate-btn"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate
        </Button>
        {text ? (
          <Button
            variant="outline"
            onClick={generate}
            disabled={loading}
            className="rounded-full font-display h-12 px-5"
            data-testid="ai-regenerate-btn"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> New one
          </Button>
        ) : null}
      </div>

      {text ? (
        <div className="reading-block mt-6" data-testid="ai-scenario-text">{text}</div>
      ) : null}
    </div>
  );
}

function WritingExercise({ activity }) {
  const c = activity.content;
  if (c.fields) {
    return (
      <div className="space-y-4" data-testid="writing-form">
        {c.fields.map((f, i) => (
          <div key={i}>
            <label className="font-display font-semibold">{f.label}</label>
            <Input className="h-12 rounded-xl mt-1" data-testid={`writing-field-${i}`} />
          </div>
        ))}
        <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-12 px-5">
          Save practice
        </Button>
      </div>
    );
  }
  if (c.items) {
    return (
      <div className="space-y-5" data-testid="writing-items">
        {c.items.map((p, i) => (
          <div key={i} className="border border-zinc-200 rounded-2xl p-5 bg-white">
            <div className="font-display font-semibold text-lg">{p}</div>
            <Textarea className="mt-3 rounded-xl" rows={3} data-testid={`writing-input-${i}`} />
          </div>
        ))}
      </div>
    );
  }
  // single prompt
  return (
    <div data-testid="writing-prompt">
      <div className="reading-block">{c.prompt}</div>
      <Textarea
        className="mt-4 rounded-xl"
        rows={6}
        defaultValue={c.starter || ""}
        data-testid="writing-input-0"
      />
      <div className="mt-4">
        <AudioControls text={c.prompt} />
      </div>
    </div>
  );
}

function NamingExercise({ activity }) {
  const items = activity.content.items;
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [transcript, setTranscript] = useState("");
  const it = items[idx];
  const { logCue } = useSession();

  const next = () => {
    setShowAnswer(false);
    setTranscript("");
    setIdx((idx + 1) % items.length);
  };

  const reveal = () => {
    setShowAnswer((v) => {
      const nv = !v;
      if (nv) {
        logCue({
          activity_slug: activity.slug,
          activity_title: activity.title,
          category: activity.category,
          cue_type: "show_answer",
          detail: it.answer,
        });
      }
      return nv;
    });
  };

  return (
    <div data-testid="naming-exercise">
      <div className="text-sm text-zinc-500">
        {idx + 1} of {items.length}
      </div>
      <div className="reading-block mt-3 text-2xl font-display font-bold">{it.clue}</div>
      <div className="mt-5">
        <AudioControls
          text={it.clue}
          audioSrc={idx === 0 ? "/audio/G01_GP_Appointment_Reminder.mp3" : undefined}
          onTranscript={(t) => setTranscript(t)}
        />
      </div>

      {transcript ? (
        <div className="mt-4 text-sm text-zinc-600" data-testid="naming-transcript">
          You said: <strong>{transcript}</strong>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="rounded-full font-display h-12 px-5"
          onClick={reveal}
          data-testid="naming-reveal-btn"
        >
          {showAnswer ? "Hide answer" : "Show answer"}
        </Button>
        <Button
          onClick={next}
          className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-12 px-5"
          data-testid="naming-next-btn"
        >
          Next
        </Button>
      </div>

      {showAnswer ? (
        <div className="mt-4 inline-flex items-center px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 font-display font-semibold">
          Answer: {it.answer}
        </div>
      ) : null}
    </div>
  );
}

function ListExercise({ activity }) {
  return (
    <ul className="space-y-3" data-testid="list-exercise">
      {activity.content.categories.map((c, i) => (
        <li key={i} className="border border-zinc-200 rounded-2xl p-5 bg-white flex items-center justify-between">
          <span className="font-display font-semibold text-lg">{c}</span>
          <AudioControls text={`Name three things. ${c}`} />
        </li>
      ))}
    </ul>
  );
}

function MCQExercise({ activity }) {
  const [answers, setAnswers] = useState({});
  const { logAttempt } = useSession();
  const onPick = (i, idx) => {
    if (answers[i] != null) return;
    setAnswers({ ...answers, [i]: idx });
    const q = activity.content.items[i];
    logAttempt({
      activity_slug: activity.slug,
      activity_title: activity.title,
      category: activity.category,
      qid: `q${i}`,
      correct: idx === q.answer,
      picked: q.options[idx],
      expected: q.options[q.answer],
    });
  };
  return (
    <div className="space-y-5" data-testid="mcq-exercise">
      {activity.content.items.map((q, i) => (
        <div key={i}>
          <div className="flex gap-3 items-center">
            <AudioControls text={q.q} />
          </div>
          <QuestionCard
            q={q}
            picked={answers[i]}
            onPick={(idx) => onPick(i, idx)}
            qid={i}
          />
        </div>
      ))}
    </div>
  );
}

function YesNoExercise({ activity }) {
  const [answers, setAnswers] = useState({});
  const { logAttempt } = useSession();
  const onPick = (i, idx) => {
    if (answers[i] != null) return;
    setAnswers({ ...answers, [i]: idx });
    const q = activity.content.items[i];
    const isYes = idx === 0;
    logAttempt({
      activity_slug: activity.slug,
      activity_title: activity.title,
      category: activity.category,
      qid: `q${i}`,
      correct: isYes === q.answer,
      picked: isYes ? "Yes" : "No",
      expected: q.answer ? "Yes" : "No",
    });
  };
  return (
    <div className="space-y-5" data-testid="yesno-exercise">
      {activity.content.items.map((q, i) => (
        <div key={i} className="border border-zinc-200 rounded-2xl p-5 bg-white">
          <div className="font-display font-semibold text-lg">{q.q}</div>
          <div className="mt-4 flex gap-3">
            <AudioControls text={q.q} />
          </div>
          <div className="mt-3 flex gap-2">
            {["Yes", "No"].map((label, idx) => {
              const isYes = idx === 0;
              const correct = answers[i] != null && (isYes === q.answer);
              const wrong = answers[i] === idx && !correct;
              const chosen = answers[i] === idx;
              return (
                <button
                  key={idx}
                  data-testid={`yesno-${i}-${label.toLowerCase()}`}
                  onClick={() => onPick(i, idx)}
                  className="h-12 px-6 rounded-full font-display font-semibold border transition"
                  style={{
                    borderColor: correct ? "#10B981" : wrong ? "#F43F5E" : chosen ? "#4F46E5" : "#E5E7EB",
                    background: correct ? "#ECFDF5" : wrong ? "#FFF1F2" : chosen ? "#EEF2FF" : "white",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DialogueExercise({ activity }) {
  const c = activity.content;
  return (
    <div data-testid="dialogue-exercise">
      <div className="reading-block">
        <div className="font-display font-semibold mb-2">Scene</div>
        {c.scene}
      </div>
      <ul className="mt-6 space-y-3">
        {c.lines.map((line, i) => {
          const isYou = line.speaker === "You";
          return (
            <li
              key={i}
              className="rounded-2xl p-4 border"
              style={{
                background: isYou ? "#EEF2FF" : "white",
                borderColor: isYou ? "#C7D2FE" : "#E5E7EB",
              }}
              data-testid={`dialogue-line-${i}`}
            >
              <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">{line.speaker}</div>
              <div className="font-display text-lg mt-1">{line.text}</div>
              <div className="mt-3">
                <AudioControls text={line.text} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
