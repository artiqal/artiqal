import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useSmartBack } from "@/lib/navigationHistory";
import { useSession } from "@/contexts/SessionContext";
import { getActivitySetupConfig } from "@/lib/activitySetupConfig";
import { applyVoicemailActivityOverrides } from "@/lib/voicemailSetup";
import { AudioControls } from "@/components/AudioControls";
import { VoicemailActivity } from "@/components/activities/VoicemailActivity";
import { CrosswordActivity } from "@/components/activities/CrosswordActivity";
import { NamingActivity } from "@/components/activities/NamingActivity";
import { ReadingExercise } from "@/components/activities/ReadingExercise";
import {
  LEGACY_LEVEL_THEME,
  LegacyLeveledReadingActivity,
  LegacyLeveledReadingCompletionScreen,
} from "@/components/activities/LegacyLeveledReadingActivity";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  RefreshCw,
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
                    : `0 0 5px ${color}70, 0 0 9px ${color}30`,
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
      return <NamingActivity activity={a} />;
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
