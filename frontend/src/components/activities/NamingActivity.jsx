import React, { useState } from "react";

import { AudioControls } from "@/components/AudioControls";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";

export function NamingActivity({ activity }) {
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
    const nextShowAnswer = !showAnswer;
    setShowAnswer(nextShowAnswer);
    if (nextShowAnswer) {
      logCue({
        activity_slug: activity.slug,
        activity_title: activity.title,
        category: activity.category,
        cue_type: "show_answer",
        detail: it.answer,
      });
    }
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
