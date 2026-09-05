import React, { useEffect, useState } from "react";

import { LetterheadView } from "@/components/Letterheads";
import { VoicemailRuntimeWorkspace } from "@/components/activities/VoicemailRuntimeWorkspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/SessionContext";
import { matchesAnswer } from "@/lib/answerMatch";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Flag,
  Lightbulb,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Sparkles,
  XCircle,
} from "lucide-react";

export function ReadingExercise({
  activity,
  onChangeLevel,
  levelLabel,
  onNext,
  onPrevious,
  itemProgress,
  nextLabel,
  fullscreen,
  onToggleFullscreen,
  onAttempt,
  onHint,
  onEnd,
  layout = "split",
}) {
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
      {onChangeLevel && !isVoicemail ? (
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
              {levelLabel.showComplexity !== false ? (
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
              ) : null}
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
        ) : isVoicemail ? (
          <VoicemailRuntimeWorkspace
            activityKey={activity.slug}
            player={(
              <LetterheadView
                letterhead={letterhead}
                replayNonce={replayNonce}
                onPrevious={onPrevious}
                hasPrevious={(itemProgress?.current || 1) > 1}
              />
            )}
            questions={questions}
            values={values}
            submitted={submitted}
            hints={hints}
            levelLabel={levelLabel}
            nextLabel={nextLabel}
            fullscreen={fullscreen}
            onValueChange={(index, value) => {
              setValues((currentValues) => ({ ...currentValues, [index]: value }));
            }}
            onSubmit={onSubmit}
            onShowHint={onShowHint}
            onNext={onNext}
            onEnd={onEnd}
            onChangeLevel={onChangeLevel}
            onToggleFullscreen={onToggleFullscreen}
          />
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
