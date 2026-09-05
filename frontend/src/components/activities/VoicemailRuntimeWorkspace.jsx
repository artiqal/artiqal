import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import "./VoicemailRuntime.css";

export function VoicemailRuntimeWorkspace({
  activityKey,
  player,
  questions,
  values,
  submitted,
  hints,
  levelLabel,
  nextLabel,
  fullscreen,
  onValueChange,
  onSubmit,
  onShowHint,
  onNext,
  onEnd,
  onChangeLevel,
  onToggleFullscreen,
}) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    setActiveQuestionIndex(0);
  }, [activityKey]);

  useEffect(() => {
    if (activeQuestionIndex > 0) inputRef.current?.focus();
  }, [activeQuestionIndex]);

  const questionCount = questions.length;
  const questionIndex = Math.min(activeQuestionIndex, Math.max(0, questionCount - 1));
  const question = questions[questionIndex];
  const result = submitted[questionIndex];
  const value = values[questionIndex] || "";
  const hintShown = Boolean(hints[questionIndex]);
  const status = result ? (result.correct ? "correct" : "incorrect") : null;
  const isLastQuestion = questionIndex === questionCount - 1;
  const canSubmit = !result && value.trim().length > 0;
  const primaryActionLabel = result
    ? (isLastQuestion ? (nextLabel || "Continue") : "Next question")
    : "Submit answer";

  const advance = () => {
    if (!result) {
      onSubmit(questionIndex, value);
      return;
    }
    if (!isLastQuestion) {
      setActiveQuestionIndex((current) => Math.min(current + 1, questionCount - 1));
      return;
    }
    onNext?.();
  };

  const onKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (result || canSubmit) advance();
  };

  const themeStyle = {
    "--voicemail-runtime-accent": levelLabel?.dot || "#4F46E5",
    "--voicemail-runtime-accent-soft": levelLabel?.dotsBg || "#EEF2FF",
    "--voicemail-runtime-accent-border": levelLabel?.border || "#C7D2FE",
    "--voicemail-runtime-accent-text": levelLabel?.color || "#3730A3",
    "--voicemail-runtime-accent-shadow": levelLabel?.shadow || "rgba(79, 70, 229, 0.22)",
  };

  if (!question) return null;

  return (
    <section
      className="voicemail-runtime"
      style={themeStyle}
      aria-label="Listening to a Voicemail workspace"
      data-testid="voicemail-runtime-workspace"
    >
      <div className="voicemail-runtime-toolbar" data-testid="leveled-reading-toolbar">
        <span className="voicemail-runtime-session-chip" data-testid="level-pill">
          {levelLabel?.showComplexity !== false ? (
            <span className="voicemail-runtime-chip-dots" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={index < (levelLabel?.complexity || 1) ? "is-active" : ""}
                />
              ))}
            </span>
          ) : null}
          {levelLabel?.text}
        </span>

        <div className="voicemail-runtime-toolbar-actions">
          {onToggleFullscreen ? (
            <Button
              type="button"
              variant="outline"
              onClick={onToggleFullscreen}
              className="voicemail-runtime-toolbar-button"
              data-testid="fullscreen-toggle-btn"
            >
              {fullscreen ? (
                <Minimize2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
              )}
              {fullscreen ? "Exit full screen" : "Full screen"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={onChangeLevel}
            className="voicemail-runtime-toolbar-button"
            data-testid="change-difficulty-btn"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Change difficulty
          </Button>
        </div>
      </div>

      <div className="voicemail-runtime-grid">
        <div className="voicemail-runtime-player-panel">{player}</div>

        <section
          className="voicemail-runtime-question-panel"
          aria-labelledby={`voicemail-question-${questionIndex}-title`}
        >
          <header className="voicemail-runtime-question-header">
            <p>
              Question {questionIndex + 1} of {questionCount}
            </p>
            <div
              className="voicemail-runtime-question-progress"
              role="img"
              aria-label={`${questionIndex + 1} of ${questionCount} questions`}
              data-testid="voicemail-question-progress"
            >
              {questions.map((_, index) => (
                <span
                  key={index}
                  className={[
                    index === questionIndex ? "is-current" : "",
                    submitted[index] ? "is-complete" : "",
                  ].filter(Boolean).join(" ")}
                />
              ))}
            </div>
          </header>

          <div className="voicemail-runtime-question-divider" />

          <div
            className="voicemail-runtime-question-content"
            data-testid="reading-questions"
          >
            <article
              className="voicemail-runtime-question"
              data-testid={`question-${questionIndex}`}
            >
              <div className="voicemail-runtime-question-title-row">
                <span className="voicemail-runtime-question-number" aria-hidden="true">
                  {questionIndex + 1}
                </span>
                <h2
                  id={`voicemail-question-${questionIndex}-title`}
                  data-testid={`question-${questionIndex}-prompt`}
                >
                  {question.q}
                </h2>
                {!hintShown && !result ? (
                  <button
                    type="button"
                    onClick={() => onShowHint(questionIndex)}
                    className="voicemail-runtime-hint-button"
                    data-testid={`question-${questionIndex}-show-hint`}
                  >
                    <Lightbulb className="w-4 h-4" aria-hidden="true" />
                    Hint
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div className="voicemail-runtime-answer-field">
                <Input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(event) => onValueChange(questionIndex, event.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={Boolean(result)}
                  placeholder="Type your answer and press Enter"
                  data-testid={`question-${questionIndex}-input`}
                  className={status ? `is-${status}` : ""}
                  aria-describedby={`voicemail-question-${questionIndex}-helper`}
                />
                {status ? (
                  <span className="voicemail-runtime-answer-status" aria-hidden="true">
                    {status === "correct" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={advance}
                  disabled={!result && !canSubmit}
                  aria-label={primaryActionLabel}
                  data-testid={`question-${questionIndex}-submit`}
                  className="voicemail-runtime-answer-action"
                >
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {hintShown ? (
                <div
                  className="voicemail-runtime-hints"
                  data-testid={`question-${questionIndex}-hints`}
                >
                  <p>Hint — possible answers</p>
                  <div>
                    {question.options.map((option, optionIndex) => {
                      const isPicked = result && matchesAnswer(option, result.picked);
                      const optionStatus = isPicked ? status : null;
                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          disabled={Boolean(result)}
                          onClick={() => {
                            onValueChange(questionIndex, option);
                            onSubmit(questionIndex, option);
                          }}
                          className={optionStatus ? `is-${optionStatus}` : ""}
                          data-testid={`question-${questionIndex}-option-${optionIndex}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {result ? (
                <div
                  className={`voicemail-runtime-feedback is-${status}`}
                  role="status"
                  data-testid={`question-${questionIndex}-feedback`}
                >
                  {status === "correct" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      Correct answer: {question.options[question.answer]}
                    </>
                  )}
                </div>
              ) : null}

              <p
                id={`voicemail-question-${questionIndex}-helper`}
                className="voicemail-runtime-helper"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                {result
                  ? (isLastQuestion
                    ? `Continue to ${nextLabel?.toLowerCase() || "the next step"}.`
                    : "Continue to the next question.")
                  : "Answer to see the next question."}
              </p>
            </article>
          </div>

          {onEnd ? (
            <button
              type="button"
              onClick={onEnd}
              className="voicemail-runtime-end-button"
              data-testid="end-activity-btn"
            >
              <Flag className="w-4 h-4" aria-hidden="true" />
              End activity
            </button>
          ) : null}
        </section>
      </div>
    </section>
  );
}
