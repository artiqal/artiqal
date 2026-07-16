import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { matchesAnswer } from "@/lib/answerMatch";
import { useSmartBack } from "@/lib/navigationHistory";
import { useSession } from "@/contexts/SessionContext";
import { getActivitySetupConfig } from "@/lib/activitySetupConfig";
import { applyVoicemailActivityOverrides } from "@/lib/voicemailSetup";
import { AudioControls } from "@/components/AudioControls";
import { VoicemailActivity } from "@/components/activities/VoicemailActivity";
import { CrosswordActivity } from "@/components/activities/CrosswordActivity";
import {
  LEGACY_LEVEL_THEME,
  LegacyLeveledReadingActivity,
  LegacyLeveledReadingCompletionScreen,
} from "@/components/activities/LegacyLeveledReadingActivity";
import { LetterheadView } from "@/components/Letterheads";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flag,
  Lightbulb,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

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
            levelThemes={LEGACY_LEVEL_THEME}
            sharedComponents={{
              BreadcrumbHeader,
              CompletionScreen: LegacyLeveledReadingCompletionScreen,
              ComplexityDots,
              ReadingExercise,
            }}
          />
        );
      }
      return (
        <LegacyLeveledReadingActivity
          activity={a}
          BreadcrumbHeader={BreadcrumbHeader}
          ComplexityDots={ComplexityDots}
          ReadingExercise={ReadingExercise}
          formatCategoryTitle={slugToTitle}
        />
      );
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
