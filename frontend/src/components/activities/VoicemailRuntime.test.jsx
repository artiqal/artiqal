import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { ReadingExercise } from "@/components/activities/ReadingExercise";
import { SessionProvider, useSession } from "@/contexts/SessionContext";

const voicemailActivity = {
  slug: "voicemails-green-1",
  title: "Listening to a Voicemail — Foundational · GP reminder",
  category: "functional-communication",
  content: {
    text: "Voicemail from Orion Medical Centre",
    letterhead: {
      format: "voicemail",
      caller_name: "Orion Medical Centre",
      caller_subtitle: "GP appointment reminder",
      phone_number: "01632 960 411",
      time_label: "Monday, 9:14 AM",
      duration: "0:30",
      audio_url: "https://example.test/voicemail.mp3",
      transcript: "This is a reminder that you have a GP appointment on Monday.",
    },
    questions: [
      {
        q: "Who called?",
        options: ["Orion Medical Centre", "Westside Pharmacy"],
        answer: 0,
      },
      {
        q: "What is the message about?",
        options: ["A GP appointment", "A prescription"],
        answer: 0,
      },
      {
        q: "What day is the appointment?",
        options: ["Monday", "Tuesday"],
        answer: 0,
      },
    ],
  },
};

function SessionProbe() {
  const { active } = useSession();
  return <output data-testid="session-state">{JSON.stringify(active)}</output>;
}

describe("Voicemail runtime workspace", () => {
  let container;
  let root;
  let playSpy;
  let pauseSpy;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    playSpy = jest
      .spyOn(window.HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
    pauseSpy = jest
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});
    window.localStorage.clear();
    window.localStorage.setItem(
      "concentric_active_session_v1",
      JSON.stringify({
        started_at: "2026-07-27T12:00:00.000Z",
        activities: [],
        attempts: [],
        cues: [],
      }),
    );
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    playSpy.mockRestore();
    pauseSpy.mockRestore();
  });

  const settle = async () => {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  const click = async (selector) => {
    const element = container.querySelector(selector);
    expect(element).not.toBeNull();
    await act(async () => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await settle();
    return element;
  };

  const enterText = async (selector, value) => {
    const input = container.querySelector(selector);
    expect(input).not.toBeNull();
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    await act(async () => {
      valueSetter.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await settle();
  };

  const renderRuntime = async (props = {}) => {
    await act(async () => {
      root.render(
        <SessionProvider>
          <ReadingExercise
            activity={voicemailActivity}
            levelLabel={{
              text: "Foundational · Voicemail 1 of 4",
              color: "#065F46",
              border: "#A7F3D0",
              shadow: "rgba(16, 185, 129, 0.22)",
              dotsBg: "#ECFDF5",
              dot: "#10B981",
              dotMuted: "#A7F3D0",
              complexity: 1,
            }}
            itemProgress={{ current: 1, total: 4 }}
            nextLabel="Next voicemail"
            onChangeLevel={jest.fn()}
            onNext={jest.fn()}
            onEnd={jest.fn()}
            onPrevious={jest.fn()}
            {...props}
          />
          <SessionProbe />
        </SessionProvider>,
      );
    });
    await settle();
  };

  test("preserves audio, transcript, caller details, hints, logging, and one-question progression", async () => {
    await renderRuntime();

    expect(container.querySelector('[data-testid="voicemail-runtime-workspace"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Foundational · Voicemail 1 of 4");
    expect(container.querySelector('[data-testid="reading-questions"]').children).toHaveLength(1);
    expect(container.querySelector('[data-testid="question-0-prompt"]').textContent)
      .toBe("Who called?");

    const audio = container.querySelector("audio");
    expect(audio.getAttribute("src")).toBe("https://example.test/voicemail.mp3");
    await click('[data-testid="voicemail-play-button"]');
    expect(playSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      audio.dispatchEvent(new Event("play"));
    });
    expect(container.querySelector('[data-testid="voicemail-play-button"]').getAttribute("aria-label"))
      .toBe("Pause voicemail");

    await click('[data-testid="voicemail-transcript-toggle"]');
    expect(container.querySelector('[data-testid="voicemail-transcript"]').textContent)
      .toContain("GP appointment on Monday");

    await click('[data-testid="voicemail-caller-details-toggle"]');
    expect(container.querySelector('[data-testid="voicemail-caller-details"]').textContent)
      .toContain("Caller identity is hidden");

    await click('[data-testid="question-0-show-hint"]');
    await click('[data-testid="question-0-option-0"]');
    expect(container.querySelector('[data-testid="question-0-feedback"]').textContent)
      .toContain("Correct");

    const sessionAfterFirstAnswer = JSON.parse(
      container.querySelector('[data-testid="session-state"]').textContent,
    );
    expect(sessionAfterFirstAnswer.cues).toEqual(expect.arrayContaining([
      expect.objectContaining({ cue_type: "hint", detail: "q0" }),
    ]));
    expect(sessionAfterFirstAnswer.attempts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        activity_slug: "voicemails-green-1",
        qid: "q0",
        correct: true,
        picked: "Orion Medical Centre",
      }),
    ]));

    await click('[data-testid="question-0-submit"]');
    expect(container.querySelector('[data-testid="question-0"]')).toBeNull();
    expect(container.querySelector('[data-testid="question-1-prompt"]').textContent)
      .toBe("What is the message about?");

    await enterText('[data-testid="question-1-input"]', "A GP appointment");
    const input = container.querySelector('[data-testid="question-1-input"]');
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
      }));
    });
    await settle();
    expect(container.querySelector('[data-testid="question-1-feedback"]').textContent)
      .toContain("Correct");
  });

  test("enables previous-item navigation only when a previous voicemail exists", async () => {
    const onPrevious = jest.fn();
    await renderRuntime({
      itemProgress: { current: 2, total: 4 },
      onPrevious,
    });

    const previousButton = container.querySelector('[data-testid="previous-voicemail-button"]');
    expect(previousButton.disabled).toBe(false);
    await click('[data-testid="previous-voicemail-button"]');
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });
});
